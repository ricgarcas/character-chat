<?php

namespace App\Http\Controllers\Estudio;

use App\Actions\Estudio\PublishAssetAction;
use App\Http\Controllers\Controller;
use App\Models\AssetCandidate;
use Illuminate\Http\RedirectResponse;

class AssetCandidateController extends Controller
{
    public function approve(AssetCandidate $assetCandidate, PublishAssetAction $publisher): RedirectResponse
    {
        $publisher->publish($assetCandidate);

        $assetCandidate->update(['status' => 'approved']);

        $assetCandidate->request->candidates()
            ->whereKeyNot($assetCandidate->id)
            ->where('status', 'candidate')
            ->update(['status' => 'rejected']);

        $assetCandidate->request->update(['status' => 'approved']);

        return redirect()->route('estudio.requests.show', $assetCandidate->request);
    }

    public function reject(AssetCandidate $assetCandidate): RedirectResponse
    {
        $assetCandidate->update(['status' => 'rejected']);

        return redirect()->route('estudio.requests.show', $assetCandidate->request);
    }
}
