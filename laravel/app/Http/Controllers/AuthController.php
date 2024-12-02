<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteAccountRequest;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AuthController extends Controller
{
    private function purgeExpiredTokens()
    {
        // Only deletes if token expired 2 hours ago
        $dateTimetoPurge = now()->subHours(2);
        DB::table('personal_access_tokens')->where('expires_at', '<', $dateTimetoPurge)->delete();
    }

    private function revokeCurrentToken(User $user)
    {
        $currentTokenId = $user->currentAccessToken()->id;
        $user->tokens()->where('id', $currentTokenId)->delete();
    }

    public function register(RegisterRequest $request)
    {
        $validatedData = $request->validated();
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'nickname' => $validatedData['nickname'],
            'password' => Hash::make($validatedData['password']),
            'photo' => $validatedData['photo'] ?? null,
            'brain_coins_balance' => 10,
        ]);

        $token = $user->createToken('authToken', ['*'], now()->addHours(2))->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user], 201);
    }


    public function login(LoginRequest $request)
    {
        $this->purgeExpiredTokens();
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $token = $request->user()->createToken('authToken', ['*'], now()->addHours(2))->plainTextToken;
        return response()->json(['token' => $token]);
    }

    public function logout(Request $request)
    {
        $this->purgeExpiredTokens();
        $user = $request->user();
        if ($user) {
            $this->revokeCurrentToken($user);
            return response()->json(null, 204);
        } else {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
    }


    public function deleteAccount(DeleteAccountRequest $request)
    {
        $user = Auth::user();

        // Check if the provided password matches the user's current password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 403);
        }

        // Delete the user's account
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully'], 200);
    }

    public function refreshToken(Request $request)
    {
        // Revokes current token and creates a new token
        $this->purgeExpiredTokens();
        $this->revokeCurrentToken($request->user());
        $token = $request->user()->createToken('authToken', ['*'], now()->addHours(2))->plainTextToken;
        return response()->json(['token' => $token]);
    }

    public function updateUser(Request $request)
    {
        $user = Auth::user();

        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'nickname' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:8|confirmed',
            'photo' => 'sometimes|nullable|string',
        ]);

        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json(['user' => $user], 200);
    }
    /*
    public function deleteUser()
    {
        $user = Auth::user();
        $user->forceDelete();

        return response()->json(null, 204);
    }
        */
}
