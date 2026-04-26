<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_conversations', function (Blueprint $table) {
            $table->text('situation')->nullable()->after('character_slug');
        });
    }

    public function down(): void
    {
        Schema::table('agent_conversations', function (Blueprint $table) {
            $table->dropColumn('situation');
        });
    }
};
