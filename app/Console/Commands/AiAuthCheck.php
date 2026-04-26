<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AiAuthCheck extends Command
{
    protected $signature = 'ai:auth-check {--ping : Send a real test request to verify the token works}';

    protected $description = 'Check Anthropic auth configuration and optionally ping the API';

    public function handle(): int
    {
        $key = config('ai.providers.anthropic.key');

        if (! $key) {
            $this->error('No Anthropic key configured. Set ANTHROPIC_SETUP_TOKEN or ANTHROPIC_API_KEY in .env');

            return 1;
        }

        $isOAuth = str_starts_with($key, 'sk-ant-oat01-');
        $masked = substr($key, 0, 14).'...'.substr($key, -4);

        $this->info('Anthropic Auth');
        $this->table(['Key', 'Value'], [
            ['Type', $isOAuth ? 'OAuth Setup Token' : 'API Key'],
            ['Token', $masked],
            ['Provider', config('ai.default')],
        ]);

        if (! $this->option('ping')) {
            $this->line('Run with --ping to send a test request.');

            return 0;
        }

        $this->info('Pinging Anthropic API...');

        try {
            $response = \Laravel\Ai\agent(
                instructions: 'Respond with exactly: OK',
            )->prompt('Say OK', provider: 'anthropic', model: 'claude-opus-4-7');

            $this->info('✅ Response: '.trim((string) $response));

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed: '.$e->getMessage());

            return 1;
        }
    }
}
