<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DebugLogController;
use App\Http\Controllers\Estudio\AssetCandidateController;
use App\Http\Controllers\Estudio\AssetRequestController;
use App\Http\Controllers\Estudio\EstudioController;
use App\Http\Controllers\PortfolioController;
use App\Http\Middleware\EnsureLocalEnvironment;
use Illuminate\Support\Facades\Route;

// Landing pública pausada — restaurar LandingController@index aquí cuando se reactive.
Route::get('/', fn () => auth()->check() ? redirect()->route('chat.index') : redirect()->route('login'))->name('home');

Route::post('debug/log', [DebugLogController::class, 'store'])->name('debug.log');

Route::middleware(['auth'])->group(function () {
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{character:slug}', [ChatController::class, 'create'])->name('chat.create');
    Route::get('chat/{character:slug}/{conversationId}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/{character:slug}/send', [ChatController::class, 'send'])->name('chat.send');
    Route::delete('chat/{character:slug}/conversation', [ChatController::class, 'clear'])->name('chat.clear');

    Route::get('portafolio', [PortfolioController::class, 'index'])->name('portfolio.index');
});

// Estudio de Assets — herramienta interna. Las rutas SIEMPRE se registran
// (Wayfinder las necesita en el build); el middleware las esconde fuera de local.
Route::middleware([EnsureLocalEnvironment::class])->prefix('estudio')->name('estudio.')->group(function () {
    Route::get('/', [EstudioController::class, 'index'])->name('index');

    Route::post('requests', [AssetRequestController::class, 'store'])->name('requests.store');
    Route::get('requests/{assetRequest}', [AssetRequestController::class, 'show'])->name('requests.show');
    Route::post('requests/{assetRequest}/regenerate', [AssetRequestController::class, 'regenerate'])->name('requests.regenerate');

    Route::post('candidates/{assetCandidate}/approve', [AssetCandidateController::class, 'approve'])->name('candidates.approve');
    Route::post('candidates/{assetCandidate}/reject', [AssetCandidateController::class, 'reject'])->name('candidates.reject');
});

require __DIR__.'/settings.php';
