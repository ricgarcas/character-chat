<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class DebugLogController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tag' => 'nullable|string|max:64',
            'message' => 'nullable|string|max:200',
            'payload' => 'nullable',
        ]);

        $payload = $data['payload'] ?? null;

        $line = sprintf(
            "[%s] %s | %s\n%s\n%s\n",
            now()->toDateTimeString(),
            $data['tag'] ?? 'frontend',
            $data['message'] ?? '',
            is_array($payload) || is_object($payload)
                ? json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
                : (string) $payload,
            str_repeat('-', 60),
        );

        $path = storage_path('logs/frontend-debug.log');
        File::ensureDirectoryExists(dirname($path));
        File::append($path, $line);

        return response()->json(['ok' => true]);
    }
}
