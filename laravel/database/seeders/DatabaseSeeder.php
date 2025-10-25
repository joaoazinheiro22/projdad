<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    // public static $seedType = "small";
    //public static $seedType = "full";
    //public static $seedLanguage = "pt_PT";
    public static $seedLanguage = "en_US";

    public function run(): void
    {
        $this->command->info("-----------------------------------------------");
        $this->command->info("START of database seeder");
        $this->command->info("-----------------------------------------------");

        //DatabaseSeeder::$seedType = $this->command->choice('What is the size of seed data (choose "full" for publishing)?', ['small', 'full'], 0);

        DatabaseSeeder::$seedLanguage = $this->command->choice('What is the language for users\' names?', ['en_US', 'pt_PT'], 0);

        // Get database driver to use appropriate syntax
        $driver = DB::connection()->getDriverName();

        // Disable foreign key constraints (database agnostic)
        Schema::disableForeignKeyConstraints();

        try {
            // Clear tables
            DB::table('users')->delete();
            DB::table('boards')->delete();
            DB::table('games')->delete();
            DB::table('transactions')->delete();
            DB::table('multiplayer_games_played')->delete();

            // Reset auto-increment based on database driver
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE users AUTO_INCREMENT = 1');
                DB::statement('ALTER TABLE boards AUTO_INCREMENT = 1');
                DB::statement('ALTER TABLE games AUTO_INCREMENT = 1');
                DB::statement('ALTER TABLE transactions AUTO_INCREMENT = 1');
                DB::statement('ALTER TABLE multiplayer_games_played AUTO_INCREMENT = 1');
                
                // Set timezone for MySQL
                DB::statement("SET time_zone = '+00:00'");
            } elseif ($driver === 'sqlite') {
                // SQLite auto-increment resets automatically when table is emptied
                // and uses AUTOINCREMENT keyword in table definition
                DB::statement('DELETE FROM sqlite_sequence WHERE name="users"');
                DB::statement('DELETE FROM sqlite_sequence WHERE name="boards"');
                DB::statement('DELETE FROM sqlite_sequence WHERE name="games"');
                DB::statement('DELETE FROM sqlite_sequence WHERE name="transactions"');
                DB::statement('DELETE FROM sqlite_sequence WHERE name="multiplayer_games_played"');
            }

        } finally {
            // Re-enable foreign key constraints
            Schema::enableForeignKeyConstraints();
        }

        $this->command->info("-----------------------------------------------");

        $this->call(BoardsSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(InitialTransactionsSeeder::class);
        $this->call(GamesSeeder::class);
        $this->call(GamesTransactionsSeeder::class);

        $this->command->info("-----------------------------------------------");
        $this->command->info("END of database seeder");
        $this->command->info("-----------------------------------------------");
    }
}
