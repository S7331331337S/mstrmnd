# Design tokens — CANVAS visual spec

Palette (product):
- Obsidian ground `#0a0a0b`
- Platinum type `#e8e2d0`
- Graphite accent `#8a8580`

Type: dark Swiss. Editorial, not decorative. No neon. No gradient-as-decoration.

## BASE image-gen prompt

```
Dark Swiss editorial still. Obsidian ground #0a0a0b, platinum type #e8e2d0,
graphite accent #8a8580. No neon, no decorative gradient, no stock-handshake
cliché. Subject: {{image_brief}}
```

Negative: `neon, rainbow gradient, cluttered UI, watermark, cartoon mascot`

Aspect: `16:9` for press cards; `1:1` for LinkedIn stills.

`draft_visual_spec` fills `{{image_brief}}` from the SCOUT packet. It does not call an image model in this slice. Phase 2 Creative Studio (video / audio) stays deferred.
