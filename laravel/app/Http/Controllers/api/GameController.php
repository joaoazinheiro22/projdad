<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use Illuminate\Http\Request;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;


class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return GameResource::collection(Game::paginate(50)); // se fizer Game::get() não aguenta
    }

    public function getUserGameHistory()
    {
        $user = Auth::user();

        $games = Game::where('created_user_id', $user->id)
            ->orWhereHas('multiplayer_players', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['board', 'creator', 'winner', 'multiplayer_players'])
            ->orderBy('began_at', 'desc')
            ->get();

        return GameResource::collection($games);
    }

    public function getPersonalScoreboard()
    {
        $user = Auth::user();

        // Single-player best times and minimum turns per board size
        $singlePlayerScores = Game::where('type', 'S')
            ->where('created_user_id', $user->id)
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->select('boards.board_cols', 'boards.board_rows')
            ->selectRaw('MIN(total_time) as best_time')
            ->selectRaw('MIN(total_turns) as min_turns')
            ->groupBy('boards.board_cols', 'boards.board_rows')
            ->get();

        // Multiplayer total victories and losses
        $multiplayerStats = Game::where('type', 'M')
            ->join('multiplayer_games_played', 'games.id', '=', 'multiplayer_games_played.game_id')
            ->where('multiplayer_games_played.user_id', $user->id)
            ->selectRaw('SUM(multiplayer_games_played.player_won) as total_victories')
            ->selectRaw('COUNT(*) - SUM(multiplayer_games_played.player_won) as total_losses')
            ->first();

        return response()->json([
            'single_player_scores' => $singlePlayerScores,
            'multiplayer_stats' => $multiplayerStats
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $game = Game::create($request->validated());
        return new GameResource($game);
    }

    /**
     * Display the specified resource.
     */
    public function show(Game $game)
    {
        return new GameResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameRequest $request, Game $game)
    {
        $game->fill($request->validated());
        $game->save();
        return new GameResource($game);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        $game->delete();
        return response()->json(null, 204);
    }
}
