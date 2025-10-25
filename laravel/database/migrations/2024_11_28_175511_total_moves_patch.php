<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            // Game total moves
            $table->integer('total_turns_winner')->nullable();
        });

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite: abs(random()) % N yields 0..N-1
            DB::statement(<<<'SQL'
                UPDATE games SET total_turns_winner = CASE
                    WHEN board_id = 1 THEN 6 + (abs(random()) % 13)
                    WHEN board_id = 2 THEN 8 + (abs(random()) % 17)
                    ELSE 18 + (abs(random()) % 55)
                END
                WHERE total_time IS NOT NULL
            SQL);
        } else {
            // MySQL (and other DBs that support RAND())
            DB::statement(<<<'SQL'
                UPDATE games SET total_turns_winner = CASE
                    WHEN board_id = 1 THEN 6 + ROUND(RAND() * 12)
                    WHEN board_id = 2 THEN 8 + ROUND(RAND() * 16)
                    ELSE 18 + ROUND(RAND() * 54)
                END
                WHERE total_time IS NOT NULL
            SQL);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn('total_turns_winner');
        });
    }
};
