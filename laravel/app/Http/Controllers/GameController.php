<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\GameResource;


class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
