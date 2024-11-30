<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;

Route::get('/users/me', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/auth/login', [AuthController::class, "login"]);
Route::post('/auth/register', [AuthController::class, "register"]);



Route::middleware('auth:sanctum')->group(function () {
    Route::put('/users', [AuthController::class, 'updateUser']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/refreshtoken', [AuthController::class, 'refreshToken']);
    Route::get('games/history', [GameController::class, 'getUserGameHistory']);
});
