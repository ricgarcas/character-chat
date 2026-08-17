<?php

namespace App\Actions\Estudio;

use App\Models\AssetCandidate;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class PublishAssetAction
{
    /**
     * Normaliza el candidato al spec y lo escribe en public/.
     * Devuelve el path publicado relativo a public/.
     */
    public function publish(AssetCandidate $candidate): string
    {
        $request = $candidate->request;
        [$targetWidth, $targetHeight] = $request->targetDimensions();

        $bytes = Storage::disk('public')->get($candidate->path)
            ?? throw new RuntimeException("Candidato sin archivo en staging: {$candidate->path}");

        $source = imagecreatefromstring($bytes);

        if ($source === false) {
            throw new RuntimeException('El candidato no es una imagen válida.');
        }

        [$width, $height] = [imagesx($source), imagesy($source)];

        if ($width !== $targetWidth || $height !== $targetHeight) {
            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));

            // Cover: escala llenando el target y recorta centrado.
            $scale = max($targetWidth / $width, $targetHeight / $height);
            $cropWidth = (int) round($targetWidth / $scale);
            $cropHeight = (int) round($targetHeight / $scale);
            $cropX = (int) (($width - $cropWidth) / 2);
            $cropY = (int) (($height - $cropHeight) / 2);

            imagecopyresampled(
                $canvas, $source,
                0, 0, $cropX, $cropY,
                $targetWidth, $targetHeight, $cropWidth, $cropHeight,
            );

            $source = $canvas;
        } else {
            imagesavealpha($source, true);
        }

        $destination = public_path($request->destinationPath());
        File::ensureDirectoryExists(dirname($destination));
        imagepng($source, $destination);

        return $request->destinationPath();
    }
}
