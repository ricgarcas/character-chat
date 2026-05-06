<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::table('characters')->get(['id', 'tagline', 'description', 'superpowers']);

        foreach ($rows as $row) {
            DB::table('characters')->where('id', $row->id)->update([
                'tagline' => $this->flattenString($row->tagline),
                'description' => $this->flattenString($row->description),
                'superpowers' => $this->flattenSuperpowers($row->superpowers),
            ]);
        }
    }

    public function down(): void
    {
        // Irreversible (English copy is gone). No-op.
    }

    private function flattenString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);

        if (is_array($decoded)) {
            return $decoded['es'] ?? $decoded['en'] ?? reset($decoded) ?: null;
        }

        return $value;
    }

    private function flattenSuperpowers(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $list = json_decode($value, true);

        if (! is_array($list)) {
            return $value;
        }

        $flattened = array_map(function (array $sp): array {
            if (isset($sp['name']) && is_array($sp['name'])) {
                $sp['name'] = $sp['name']['es'] ?? $sp['name']['en'] ?? reset($sp['name']) ?: null;
            }

            return $sp;
        }, $list);

        return json_encode($flattened, JSON_UNESCAPED_UNICODE);
    }
};
