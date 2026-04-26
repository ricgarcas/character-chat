<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ImageReady implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public string $jobId,
        public string $kind,
        public string $title,
        public ?string $imageUrl,
        public ?string $error = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.user.'.$this->userId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'job_id' => $this->jobId,
            'kind' => $this->kind,
            'title' => $this->title,
            'image_url' => $this->imageUrl,
            'error' => $this->error,
        ];
    }
}
