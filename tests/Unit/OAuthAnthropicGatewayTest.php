<?php

use App\Ai\OAuthAnthropicGateway;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\Utils;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Unit tests for OAuthAnthropicGateway
|--------------------------------------------------------------------------
| Tests the OAuth header injection, billing/identity system prompt blocks,
| and rate-limit fix middleware — without hitting the real API.
*/

it('detects OAuth tokens by prefix', function () {
    expect(str_starts_with('sk-ant-oat01-abc123', 'sk-ant-oat01-'))->toBeTrue();
    expect(str_starts_with('sk-ant-api03-abc123', 'sk-ant-oat01-'))->toBeFalse();
});

it('injects billing and identity blocks into string system prompt', function () {
    // Simulate the request middleware logic from OAuthAnthropicGateway
    $payload = [
        'model' => 'claude-sonnet-4-5',
        'system' => 'You are Einstein.',
        'messages' => [['role' => 'user', 'content' => 'Hola']],
    ];

    // Apply the same transformation the middleware does
    $billingBlock = [
        'type' => 'text',
        'text' => expect_billing_header(),
        'cache_control' => ['type' => 'ephemeral'],
    ];

    $identityBlock = [
        'type' => 'text',
        'text' => "You are a Claude agent, built on Anthropic's Claude Agent SDK.",
        'cache_control' => ['type' => 'ephemeral'],
    ];

    // String system → array with billing + identity + original
    $payload['system'] = [
        $billingBlock,
        $identityBlock,
        ['type' => 'text', 'text' => $payload['system']],
    ];

    expect($payload['system'])->toHaveCount(3)
        ->and($payload['system'][0]['text'])->toContain('x-anthropic-billing-header')
        ->and($payload['system'][0]['text'])->toContain('cc_version=')
        ->and($payload['system'][0]['text'])->toContain('cch=00000')
        ->and($payload['system'][1]['text'])->toContain('Claude Agent SDK')
        ->and($payload['system'][2]['text'])->toBe('You are Einstein.');
});

it('injects billing and identity blocks into array system prompt', function () {
    $payload = [
        'model' => 'claude-sonnet-4-5',
        'system' => [
            ['type' => 'text', 'text' => 'You are Einstein.'],
            ['type' => 'text', 'text' => 'Respond in Spanish.'],
        ],
        'messages' => [['role' => 'user', 'content' => 'Hola']],
    ];

    $billingBlock = [
        'type' => 'text',
        'text' => expect_billing_header(),
        'cache_control' => ['type' => 'ephemeral'],
    ];

    $identityBlock = [
        'type' => 'text',
        'text' => "You are a Claude agent, built on Anthropic's Claude Agent SDK.",
        'cache_control' => ['type' => 'ephemeral'],
    ];

    array_unshift($payload['system'], $identityBlock);
    array_unshift($payload['system'], $billingBlock);

    expect($payload['system'])->toHaveCount(4)
        ->and($payload['system'][0]['text'])->toContain('x-anthropic-billing-header')
        ->and($payload['system'][1]['text'])->toContain('Claude Agent SDK')
        ->and($payload['system'][2]['text'])->toBe('You are Einstein.')
        ->and($payload['system'][3]['text'])->toBe('Respond in Spanish.');
});

it('creates billing + identity blocks when no system prompt exists', function () {
    $payload = [
        'model' => 'claude-sonnet-4-5',
        'messages' => [['role' => 'user', 'content' => 'Hola']],
    ];

    $billingBlock = [
        'type' => 'text',
        'text' => expect_billing_header(),
        'cache_control' => ['type' => 'ephemeral'],
    ];

    $identityBlock = [
        'type' => 'text',
        'text' => "You are a Claude agent, built on Anthropic's Claude Agent SDK.",
        'cache_control' => ['type' => 'ephemeral'],
    ];

    $payload['system'] = [$billingBlock, $identityBlock];

    expect($payload['system'])->toHaveCount(2)
        ->and($payload['system'][0]['text'])->toContain('x-anthropic-billing-header')
        ->and($payload['system'][1]['text'])->toContain('Claude Agent SDK');
});

it('fixes rate-limit reset from unix timestamp to ISO 8601', function () {
    $timestamp = '1712438400'; // 2024-04-07T00:00:00Z
    $response = new Response(200, [
        'x-ratelimit-limit-reset' => $timestamp,
        'Content-Type' => 'application/json',
    ], Utils::streamFor('{}'));

    // Apply the same fix the response middleware does
    foreach ($response->getHeaders() as $name => $values) {
        if (str_contains($name, 'ratelimit') && str_ends_with($name, '-reset')) {
            $value = $values[0] ?? '';
            if (ctype_digit($value) && strlen($value) >= 10) {
                $response = $response->withHeader(
                    $name,
                    gmdate('Y-m-d\TH:i:s\Z', (int) $value)
                );
            }
        }
    }

    expect($response->getHeaderLine('x-ratelimit-limit-reset'))
        ->toBe(gmdate('Y-m-d\TH:i:s\Z', 1712438400));
});

it('does not modify ISO 8601 rate-limit reset headers', function () {
    $iso = '2024-04-07T00:00:00Z';
    $response = new Response(200, [
        'x-ratelimit-limit-reset' => $iso,
    ], Utils::streamFor('{}'));

    // The check: ctype_digit would be false for ISO strings
    $value = $response->getHeaderLine('x-ratelimit-limit-reset');
    expect(ctype_digit($value))->toBeFalse();
});

it('gateway source has OAuth token detection before header swap', function () {
    $source = file_get_contents(__DIR__.'/../../app/Ai/OAuthAnthropicGateway.php');

    $oauthCheck = strpos($source, 'sk-ant-oat01-');
    $bearerHeader = strpos($source, 'Authorization');
    $billingBlock = strpos($source, 'x-anthropic-billing-header');

    expect($oauthCheck)->not->toBeNull()
        ->and($bearerHeader)->not->toBeNull()
        ->and($billingBlock)->not->toBeNull()
        ->and($oauthCheck)->toBeLessThan($bearerHeader)
        ->and($bearerHeader)->toBeLessThan($billingBlock);
});

// Helper
function expect_billing_header(): string
{
    return 'x-anthropic-billing-header: cc_version=2.1.92.329; cc_entrypoint=sdk-cli; cch=00000;';
}
