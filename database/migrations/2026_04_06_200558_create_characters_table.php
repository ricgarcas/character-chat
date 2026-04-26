<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline');
            $table->text('description');
            $table->string('avatar')->nullable();
            $table->string('agent_class'); // e.g. App\Agents\DaliAgent
            $table->string('model')->default('claude-opus-4-7');
            $table->boolean('active')->default(true);
            $table->json('superpowers')->nullable(); // list of available tools/superpowers
            $table->timestamps();
        });

        // Link conversations to characters
        Schema::table('agent_conversations', function (Blueprint $table) {
            $table->string('character_slug')->nullable()->after('user_id');
            $table->index('character_slug');
        });
    }

    public function down(): void
    {
        Schema::table('agent_conversations', function (Blueprint $table) {
            $table->dropIndex(['character_slug']);
            $table->dropColumn('character_slug');
        });

        Schema::dropIfExists('characters');
    }
};
