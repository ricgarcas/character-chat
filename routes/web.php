<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DebugLogController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/chat'))->name('home');

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::post('debug/log', [DebugLogController::class, 'store'])->name('debug.log');

Route::middleware(['auth'])->group(function () {
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{character:slug}', [ChatController::class, 'create'])->name('chat.create');
    Route::get('chat/{character:slug}/{conversationId}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/{character:slug}/send', [ChatController::class, 'send'])->name('chat.send');
    Route::delete('chat/{character:slug}/conversation', [ChatController::class, 'clear'])->name('chat.clear');
});

require __DIR__.'/settings.php';
