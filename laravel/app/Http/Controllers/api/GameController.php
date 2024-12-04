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
            ->with(['board', 'created_user', 'winner_user', 'multiplayer_players'])
            ->orderBy('began_at', 'desc')
            ->get();

        return GameResource::collection($games);
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
