<?php

namespace App\Services;

use App\Models\Artifact;
use App\Models\Character;
use Illuminate\Support\Facades\DB;

class ArtifactService
{
    /**
     * Persiste como Artifact cada payload de tool_results del último
     * mensaje assistant de la conversación. Devuelve cuántos creó.
     */
    public function persistFromConversation(string $conversationId, int $userId, Character $character): int
    {
        $message = DB::table('agent_conversation_messages')
            ->where('conversation_id', $conversationId)
            ->where('role', 'assistant')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first(['tool_results']);

        if (! $message) {
            return 0;
        }

        $toolResults = json_decode($message->tool_results ?? '[]', true) ?: [];
        $created = 0;

        foreach ($toolResults as $result) {
            if (! is_array($result) || ! isset($result['result'])) {
                continue;
            }

            $decoded = json_decode((string) $result['result'], true);

            if (! is_array($decoded) || ! isset($decoded['artifact_type'], $decoded['data'])) {
                continue;
            }

            if ($decoded['artifact_type'] === 'error') {
                continue;
            }

            $data = $decoded['data'];

            $alreadyExists = Artifact::query()
                ->where('conversation_id', $conversationId)
                ->where('type', $decoded['artifact_type'])
                ->whereRaw('json_extract(data, "$") = ?', [json_encode($data)])
                ->exists();

            if ($alreadyExists) {
                continue;
            }

            Artifact::create([
                'user_id' => $userId,
                'character_id' => $character->id,
                'conversation_id' => $conversationId,
                'type' => $decoded['artifact_type'],
                'title' => is_string($data['title'] ?? null) ? $data['title'] : null,
                'data' => $data,
            ]);

            $created++;
        }

        return $created;
    }
}
