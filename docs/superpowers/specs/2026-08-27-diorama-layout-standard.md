# Diorama Layout Standard

## Character

- Source canvas: `1024×1536` PNG with transparency.
- Rendered canvas height: `72%` of the Phaser scene height by default.
- Visible figure target: approximately `64–70%` of scene height, allowing for transparent padding in the source.
- Foot baseline: `96%` of scene height by default, leaving a small lower safety margin.
- Horizontal anchor: `50%` unless the composition intentionally offsets the figure.
- Ground shadow: centered on the foot baseline and scaled to approximately `55%` of sprite width.

## Perspective

- The character stands on the background's floor plane, never on the lower canvas edge.
- Backgrounds must reserve the central lower third for the character's feet and silhouette.
- Foreground props may overlap the character only when their depth is explicitly positive.
- Large props belong at the sides or behind the character; they must not compete with the face or torso.
- Use background zoom only to correct framing, never to hide a missing floor plane.

## Safe bounds

- Keep the character's visible silhouette inside `10–90%` of scene width.
- Keep the head below the top `8%` and the feet above the bottom `4%`.
- Prefer consistent visible character height over matching raw source-canvas dimensions.
- If a source has unusual transparent padding, adjust that character's `heightRatio` only; do not change the global defaults.
