<?php

namespace App\Http\Controllers;

use App\Models\Character;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()) {
            return redirect()->route('chat.index');
        }

        $meta = config('landing.meta');

        return Inertia::render('landing', [
            'featured' => $this->featuredCharacters(),
            'upcoming' => config('landing.upcoming'),
            'showcase' => config('landing.showcase'),
            'pricing' => config('landing.pricing'),
            'meta' => $meta,
        ])->withViewData([
            // Las etiquetas Open Graph se renderizan en servidor: los crawlers no ejecutan JS.
            'ogTitle' => $meta['title'],
            'ogDescription' => $meta['description'],
        ]);
    }

    /**
     * Personajes destacados en el orden declarado en config, omitiendo
     * los slugs que no existan en la base.
     *
     * @return array<int, array<string, mixed>>
     */
    private function featuredCharacters(): array
    {
        $slugs = config('landing.featured', []);

        $characters = Character::query()
            ->whereIn('slug', $slugs)
            ->where('active', true)
            ->get()
            ->keyBy('slug');

        return collect($slugs)
            ->map(fn (string $slug) => $characters->get($slug))
            ->filter()
            ->map(fn (Character $c) => $c->only(['id', 'slug', 'name', 'tagline', 'superpowers']))
            ->values()
            ->all();
    }
}
