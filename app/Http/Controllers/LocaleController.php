<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'locale' => 'required|string|in:'.implode(',', SetLocale::SUPPORTED),
        ]);

        $locale = $data['locale'];

        if ($user = $request->user()) {
            $user->forceFill(['locale' => $locale])->save();
        }

        return back()->withCookie(Cookie::make('locale', $locale, 60 * 24 * 365));
    }
}
