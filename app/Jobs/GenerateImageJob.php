<?php

namespace App\Jobs;

use App\Events\ImageReady;
use App\Services\ImageGeneration\FalImageService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateImageJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 240;

    public int $tries = 1;

    /**
     * @param  string  $kind  artifact kind ('portrait', 'painting', etc.)
     * @param  string|null  $sourcePhotoPath  if set, runs edit (image-to-image); otherwise runs generate (text-to-image)
     * @param  array<string,mixed>  $opts  fal options (image_size, quality, etc.)
     */
    public function __construct(
        public int $userId,
        public string $jobId,
        public string $kind,
        public string $title,
        public string $prompt,
        public ?string $sourcePhotoPath,
        public string $folder,
        public array $opts = [],
    ) {}

    public function handle(FalImageService $fal): void
    {
        try {
            $opts = array_merge([
                'folder' => $this->folder,
                'image_size' => 'portrait_4_3',
                'quality' => 'high',
            ], $this->opts);

            $result = $this->sourcePhotoPath
                ? $fal->edit(prompt: $this->prompt, sourcePhotoPath: $this->sourcePhotoPath, opts: $opts)
                : $fal->generate(prompt: $this->prompt, opts: $opts);

            $this->persistArtifact([
                'artifact_type' => $this->kind,
                'data' => [
                    'title' => $this->title,
                    'image_url' => $result['url'],
                ],
            ]);

            event(new ImageReady(
                userId: $this->userId,
                jobId: $this->jobId,
                kind: $this->kind,
                title: $this->title,
                imageUrl: $result['url'],
            ));
        } catch (Throwable $e) {
            Log::error('GenerateImageJob failed', [
                'job_id' => $this->jobId,
                'kind' => $this->kind,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
            ]);

            $this->persistArtifact([
                'artifact_type' => 'image_pending',
                'data' => [
                    'job_id' => $this->jobId,
                    'kind' => $this->kind,
                    'title' => $this->title,
                    'error' => $e->getMessage(),
                ],
            ]);

            event(new ImageReady(
                userId: $this->userId,
                jobId: $this->jobId,
                kind: $this->kind,
                title: $this->title,
                imageUrl: null,
                error: $e->getMessage(),
            ));
        }
    }

    /**
     * @param  array<string, mixed>  $artifact
     */
    private function persistArtifact(array $artifact): void
    {
        $rows = DB::table('agent_conversation_messages')
            ->where('user_id', $this->userId)
            ->where('role', 'assistant')
            ->where('tool_results', 'like', '%'.$this->jobId.'%')
            ->get(['id', 'tool_results']);

        foreach ($rows as $row) {
            $toolResults = json_decode($row->tool_results ?? '[]', true);
            if (! is_array($toolResults)) {
                continue;
            }

            $changed = false;
            foreach ($toolResults as $key => $tr) {
                if (! is_array($tr) || ! isset($tr['result'])) {
                    continue;
                }
                $decoded = json_decode((string) $tr['result'], true);
                if (! is_array($decoded) || ! isset($decoded['data']['job_id'])) {
                    continue;
                }
                if ($decoded['data']['job_id'] !== $this->jobId) {
                    continue;
                }
                $toolResults[$key]['result'] = json_encode($artifact);
                $changed = true;
            }

            if ($changed) {
                DB::table('agent_conversation_messages')
                    ->where('id', $row->id)
                    ->update([
                        'tool_results' => json_encode($toolResults),
                        'updated_at' => now(),
                    ]);
            }
        }
    }
}
