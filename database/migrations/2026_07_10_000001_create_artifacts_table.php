<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artifacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('character_id')->constrained()->cascadeOnDelete();
            $table->string('conversation_id', 36)->nullable()->index();
            $table->string('type')->index();
            $table->string('title')->nullable();
            $table->json('data');
            $table->string('status', 10)->default('final'); // draft|final — draft reservado para iteración v2
            $table->foreignId('parent_id')->nullable()->constrained('artifacts')->nullOnDelete(); // cadena de iteraciones v2
            $table->string('taller_key')->nullable(); // camino B (talleres guiados)
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artifacts');
    }
};
