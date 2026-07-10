<?php

namespace App\Http\Controllers;

use App\Models\Artifact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $artifacts = Artifact::query()
            ->where('user_id', $request->user()->id)
            ->whereNotIn('type', ['image_pending', 'error'])
            ->with('character:id,slug,name')
            ->latest()
            ->latest('id')
            ->get()
            ->map(fn (Artifact $a) => [
                'id' => $a->id,
                'type' => $a->type,
                'title' => $a->title,
                'data' => $a->data,
                'created_at' => $a->created_at->format('Y-m-d'),
                'character' => [
                    'slug' => $a->character->slug,
                    'name' => $a->character->name,
                ],
            ]);

        return Inertia::render('portfolio/index', [
            'artifacts' => $artifacts,
        ]);
    }
}
