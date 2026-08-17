<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Esconde herramientas internas fuera de local.
 *
 * Las rutas SIEMPRE se registran (Wayfinder las necesita para generar el
 * cliente en el build de prod); este middleware es el que las apaga.
 */
class EnsureLocalEnvironment
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        return $next($request);
    }
}
