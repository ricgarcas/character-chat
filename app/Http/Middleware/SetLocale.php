<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const SUPPORTED = ['en', 'es'];

    public const DEFAULT = 'en';

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $candidate = $user?->locale ?? $request->cookie('locale') ?? self::DEFAULT;

        $locale = in_array($candidate, self::SUPPORTED, true) ? $candidate : self::DEFAULT;

        app()->setLocale($locale);

        return $next($request);
    }
}
