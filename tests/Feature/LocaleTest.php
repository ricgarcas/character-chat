<?php

use App\Http\Middleware\SetLocale;
use App\Models\User;
use Illuminate\Http\Request;

it('rejects unsupported locales', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from('/chat')
        ->post('/locale', ['locale' => 'fr'])
        ->assertSessionHasErrors('locale');
});

it('persists locale on the user when valid', function (): void {
    $user = User::factory()->create(['locale' => 'en']);

    $this->actingAs($user)
        ->from('/chat')
        ->post('/locale', ['locale' => 'es']);

    expect($user->fresh()->locale)->toBe('es');
});

it('middleware honours the user locale over the cookie', function (): void {
    $user = User::factory()->create(['locale' => 'es']);

    $request = Request::create('/');
    $request->setUserResolver(fn () => $user);
    $request->cookies->set('locale', 'en');

    (new SetLocale)->handle($request, fn () => response('ok'));

    expect(app()->getLocale())->toBe('es');
});

it('middleware falls back to the cookie when there is no user', function (): void {
    $request = Request::create('/');
    $request->cookies->set('locale', 'es');

    (new SetLocale)->handle($request, fn () => response('ok'));

    expect(app()->getLocale())->toBe('es');
});

it('middleware defaults to en when nothing is set', function (): void {
    $request = Request::create('/');

    (new SetLocale)->handle($request, fn () => response('ok'));

    expect(app()->getLocale())->toBe('en');
});

it('middleware ignores unsupported cookie values', function (): void {
    $request = Request::create('/');
    $request->cookies->set('locale', 'fr');

    (new SetLocale)->handle($request, fn () => response('ok'));

    expect(app()->getLocale())->toBe('en');
});
