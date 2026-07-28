<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DebugLogController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');

Route::post('debug/log', [DebugLogController::class, 'store'])->name('debug.log');

Route::middleware(['auth'])->group(function () {
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{character:slug}', [ChatController::class, 'create'])->name('chat.create');
    Route::get('chat/{character:slug}/{conversationId}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/{character:slug}/send', [ChatController::class, 'send'])->name('chat.send');
    Route::delete('chat/{character:slug}/conversation', [ChatController::class, 'clear'])->name('chat.clear');

    Route::get('portafolio', [PortfolioController::class, 'index'])->name('portfolio.index');
});

require __DIR__.'/settings.php';
