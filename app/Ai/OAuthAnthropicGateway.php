<?php

namespace App\Ai;

use GuzzleHttp\Psr7\Utils;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Ai\Gateway\Anthropic\AnthropicGateway;
use Laravel\Ai\Providers\Provider;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

/**
 * Extends the default Anthropic gateway to support OAuth tokens (sk-ant-oat01-...).
 *
 * When an OAuth token is detected, it:
 * 1. Swaps x-api-key for Authorization: Bearer
 * 2. Adds Claude Code identity headers
 * 3. Injects billing + identity system prompt blocks via request middleware
 * 4. Fixes rate-limit reset header format via response middleware
 */
class OAuthAnthropicGateway extends AnthropicGateway
{
    private const CC_VERSION = '2.1.92';

    private const OAUTH_BETAS = 'claude-code-20250219,oauth-2025-04-20,interleaved-thinking-2025-05-14,context-management-2025-06-27,prompt-caching-scope-2026-01-05,advanced-tool-use-2025-11-20,effort-2025-11-24';

    private string $sessionId;

    protected function client(Provider $provider, ?int $timeout = null): PendingRequest
    {
        $config = $provider->additionalConfiguration();
        $apiKey = $provider->providerCredentials()['key'];
        $isOAuth = str_starts_with($apiKey, 'sk-ant-oat01-');

        if (! isset($this->sessionId)) {
            $this->sessionId = (string) Str::uuid();
        }

        if (! $isOAuth) {
            return parent::client($provider, $timeout);
        }

        $client = Http::baseUrl(rtrim($config['url'] ?? 'https://api.anthropic.com/v1', '/'))
            ->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'anthropic-version' => $config['version'] ?? '2023-06-01',
                'anthropic-beta' => self::OAUTH_BETAS,
                'anthropic-dangerous-direct-browser-access' => 'true',
                'user-agent' => 'claude-cli/'.self::CC_VERSION.' (external, sdk-cli)',
                'x-app' => 'cli',
                'x-claude-code-session-id' => $this->sessionId,
                'accept' => 'application/json',
            ])
            ->timeout($timeout ?? 60)
            ->throw();

        // Inject billing + identity blocks into system prompt
        $client->withRequestMiddleware(function (RequestInterface $request): RequestInterface {
            $body = (string) $request->getBody();
            $payload = json_decode($body, true);

            if (! is_array($payload)) {
                return $request;
            }

            $request = $request->withHeader('x-client-request-id', (string) Str::uuid());

            $billingBlock = [
                'type' => 'text',
                'text' => 'x-anthropic-billing-header: cc_version='.self::CC_VERSION.'.329; cc_entrypoint=sdk-cli; cch=00000;',
                'cache_control' => ['type' => 'ephemeral'],
            ];

            $identityBlock = [
                'type' => 'text',
                'text' => "You are a Claude agent, built on Anthropic's Claude Agent SDK.",
                'cache_control' => ['type' => 'ephemeral'],
            ];

            if (isset($payload['system']) && is_array($payload['system'])) {
                array_unshift($payload['system'], $identityBlock);
                array_unshift($payload['system'], $billingBlock);
            } elseif (isset($payload['system']) && is_string($payload['system'])) {
                $payload['system'] = [
                    $billingBlock,
                    $identityBlock,
                    ['type' => 'text', 'text' => $payload['system']],
                ];
            } else {
                $payload['system'] = [$billingBlock, $identityBlock];
            }

            $newBody = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $newStream = Utils::streamFor($newBody);

            return $request
                ->withBody($newStream)
                ->withHeader('Content-Length', (string) strlen($newBody));
        });

        // Fix OAuth rate-limit reset from Unix timestamp to ISO 8601
        $client->withResponseMiddleware(function (ResponseInterface $response): ResponseInterface {
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

            return $response;
        });

        return $client;
    }
}
