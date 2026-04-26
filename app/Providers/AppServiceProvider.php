<?php

namespace App\Providers;

use App\Ai\OAuthAnthropicGateway;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Ai\AiManager;
use Laravel\Ai\Providers\AnthropicProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Override Anthropic driver to support OAuth tokens (sk-ant-oat01-...)
        $this->app->afterResolving(AiManager::class, function (AiManager $manager): void {
            $manager->extend('anthropic', function ($app, array $config) {
                return new AnthropicProvider(
                    new OAuthAnthropicGateway($app['events']),
                    $config,
                    $app['events'],
                );
            });
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
