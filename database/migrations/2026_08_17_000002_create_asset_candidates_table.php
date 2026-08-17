<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_request_id')->constrained()->cascadeOnDelete();
            $table->string('path'); // staging, disco public
            $table->string('status', 12)->default('candidate'); // candidate|approved|rejected
            $table->json('meta')->nullable(); // respuesta cruda de fal
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_candidates');
    }
};
