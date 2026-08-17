<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('character_slug')->index();
            $table->string('type', 12); // sprite|avatar|background
            $table->string('emote', 12)->nullable(); // solo sprite: neutral|happy|thinking|surprised
            $table->text('prompt');
            $table->foreignId('source_candidate_id')->nullable(); // auditoría: de qué candidato deriva un edit
            $table->string('source_path')->nullable(); // path en disco public usado como fuente del edit
            $table->string('status', 20)->default('pending'); // pending|generating|ready_for_review|approved|failed
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['character_slug', 'type', 'emote']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_requests');
    }
};
