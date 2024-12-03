<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\GameController;
use App\Http\Controllers\api\UserController;



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', function (Request $request) {
        return $request->user();
    });

    Route::put('/users', [AuthController::class, 'updateUser']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::delete('auth/delete-account', [AuthController::class, 'deleteAccount']);
    Route::post('auth/refreshtoken', [AuthController::class, 'refreshToken']);

    Route::get('games/history', [GameController::class, 'getUserGameHistory']);
    Route::post('/games', [GameController::class, 'store']);
    Route::put('/games/{game}', [GameController::class, 'update']);
    Route::delete('/games/{game}', [GameController::class, 'destroy']);
    Route::get('/users', [UserController::class, 'index']);
});

Route::post('/auth/login', [AuthController::class, "login"]);
Route::post('/auth/register', [AuthController::class, "register"]);


//Route::apiResource('games', GameController::class);
/*
    GET /games          -> index
    GET /games/{game}   -> show
    POST /games         -> store
    PUT /games/{game}   -> update
    DELETE /games/{game}-> destroy
*/
Route::get('/games', [GameController::class, 'index']);
// Route::get('/users', [UserController::class, 'index'])
//  ->can('viewAny', user::class);
Route::get('/games/{game}', [GameController::class, 'show']);
