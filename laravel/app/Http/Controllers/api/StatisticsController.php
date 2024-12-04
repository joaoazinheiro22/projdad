<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Game;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function getGenericStats()
    {
        try{
        $totalPlayers = User::count();
        $totalGames = Game::count();
        $gamesLastWeek = Game::where('created_at', '>=', Carbon::now()->subWeek())->count();
        $gamesLastMonth = Game::where('created_at', '>=', Carbon::now()->subMonth())->count();

        return response()->json([
            'totalPlayers' => $totalPlayers,
            'totalGames' => $totalGames,
            'gamesLastWeek' => $gamesLastWeek,
            'gamesLastMonth' => $gamesLastMonth,
        ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while fetching the generic stats',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAdminStats()
    {
        try{
        $totalPurchases = Transaction::where('type', 'P')->sum('euros');
        $purchasesByPlayer = Transaction::where('type', 'P')
            ->select('user_id', DB::raw('SUM(euros) as total'))
            ->groupBy('user_id')
            ->get();

        return response()->json([
            'totalPurchases' => $totalPurchases,
            'purchasesByPlayer' => $purchasesByPlayer,
        ]);
    }catch (\Exception $e) {
        return response()->json([
            'error' => 'An error occurred while fetching the admin stats',
            'message' => $e->getMessage(),
        ], 500);
    }
}
}