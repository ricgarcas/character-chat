<?php

namespace App\Http\Controllers;

use App\Models\Character;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Ai\Files\Image as AiImage;

class ChatController extends Controller
{
    public function index()
    {
        return Inertia::render('chat/index', [
            'characters' => Character::where('active', true)
                ->get()
                ->map(fn (Character $c) => $this->serializeCharacter($c)),
        ]);
    }

    public function create(Request $request, Character $character)
    {
        $existing = DB::table('agent_conversations')
            ->where('user_id', $request->user()->id)
            ->where('character_slug', $character->slug)
            ->orderByDesc('updated_at')
            ->first();

        if ($existing) {
            return redirect()->route('chat.show', [
                'character' => $character->slug,
                'conversationId' => $existing->id,
            ]);
        }

        return Inertia::render('chat/show', [
            'character' => $this->serializeCharacter($character),
            'conversation' => null,
            'messages' => [],
        ]);
    }

    public function show(Character $character, string $conversationId)
    {
        $messages = $this->loadMessages($conversationId);

        return Inertia::render('chat/show', [
            'character' => $this->serializeCharacter($character),
            'conversation' => $conversationId,
            'messages' => $messages,
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadMessages(string $conversationId): array
    {
        return DB::table('agent_conversation_messages')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(function ($row) {
                $base = [
                    'id' => $row->id,
                    'role' => $row->role,
                    'content' => (string) $row->content,
                    'created_at' => $row->created_at,
                ];

                if ($row->role === 'user') {
                    $attachments = json_decode($row->attachments ?? '[]', true) ?: [];
                    $first = $attachments[0] ?? null;
                    if (is_array($first) && isset($first['path'])) {
                        $disk = $first['disk'] ?? 'public';
                        $base['image_url'] = Storage::disk($disk)->url($first['path']);
                    }

                    return $base;
                }

                $toolResults = json_decode($row->tool_results ?? '[]', true) ?: [];
                $artifacts = [];
                foreach ($toolResults as $result) {
                    if (! is_array($result) || ! isset($result['result'])) {
                        continue;
                    }
                    $decoded = json_decode((string) $result['result'], true);
                    if (is_array($decoded) && isset($decoded['artifact_type'], $decoded['data'])) {
                        $artifacts[] = $decoded;
                    }
                }

                if ($artifacts !== []) {
                    $base['artifacts'] = $artifacts;
                }

                return $base;
            })
            ->all();
    }

    private function serializeCharacter(Character $character): array
    {
        return $character->only([
            'id', 'slug', 'name', 'tagline', 'description',
            'avatar', 'model', 'active', 'superpowers',
        ]);
    }

    public function clear(Request $request, Character $character)
    {
        DB::table('agent_conversations')
            ->where('user_id', $request->user()->id)
            ->where('character_slug', $character->slug)
            ->delete();

        return redirect()->route('chat.create', ['character' => $character->slug]);
    }

    public function send(Request $request, Character $character)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
            'conversation_id' => 'nullable|string',
            'image' => 'nullable|image|max:8192',
        ]);

        $photoPath = null;
        $attachments = [];

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $photoPath = sprintf('uploads/%d/%s.%s', $request->user()->id, Str::uuid(), $ext);
            Storage::disk('public')->put($photoPath, $file->getContent());
            $attachments[] = AiImage::fromStorage($photoPath, 'public');
        }

        $agent = $character->agent($photoPath);
        $isNewConversation = ! $request->conversation_id;

        if ($request->conversation_id) {
            $agent->continue($request->conversation_id, $request->user());
        } else {
            $agent->forUser($request->user());
        }

        $agentResponse = $agent->stream(
            $request->message,
            attachments: $attachments,
            provider: 'anthropic',
            model: $character->model,
        );

        // Wrap the response to inject conversation_id at the end
        return response()->stream(function () use ($agentResponse, $agent, $isNewConversation, $character) {
            // Disable output buffering for real-time streaming
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            foreach ($agentResponse as $event) {
                echo 'data: '.((string) $event)."\n\n";
                flush();
            }

            // After streaming + .then() callbacks, conversation is created
            $convId = $agent->currentConversation();

            if ($convId) {
                if ($isNewConversation) {
                    DB::table('agent_conversations')
                        ->where('id', $convId)
                        ->whereNull('character_slug')
                        ->update(['character_slug' => $character->slug]);
                }

                echo 'data: '.json_encode(['conversation_id' => $convId])."\n\n";
                flush();
            }

            echo "data: [DONE]\n\n";
            flush();
        }, headers: [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
