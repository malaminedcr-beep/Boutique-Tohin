# Default Open Graph image

`public/og-default.png` is the image shown when a link to the site is shared
(Facebook, WhatsApp, Messenger). It is **generated**, so never edit it by hand:

```bash
node scripts/og/generate-og.mjs
```

The script edits the layout (texts, colours, products) and then exports:

- 2400×1260 (twice 1200×630), for a sharp image on high-density screens;
- text laid out by `next/og` (satori): glyphs converted to vector paths, then rasterised;
- lossless PNG, or JPEG q90 (4:4:4) if the PNG exceeds 1 MB;
- product photos are only ever scaled down (the script refuses to upscale).

After regenerating, redeploy, then run "Scrape Again" in
https://developers.facebook.com/tools/debug so Facebook refreshes its cache.

## Product image sources

| Brand | File | Origin | Product height (source) |
|---|---|---|---|
| CeraVe | `public/images/cerave-moisturizing-lotion-body.jpg` | site catalogue (CV-011) | 1,030 px |
| Vichy | `public/images/vy-010-1.jpg` | site catalogue (VY-010) | 1,326 px |
| La Roche-Posay | `sources/lrp-effaclar-serum-official.png` | official La Roche-Posay Africa site (L'Oréal), transparent PNG: `africa.laroche-posay.com/-/media/project/loreal/brand-sites/lrp/emea/za/products/effaclar/effaclar-ultra-concentrated-serum/larocheposay-product-effaclar-serum-fss-30ml-1200x1200pxl.png` | 946 px |

The white backgrounds of the two JPEGs are removed by flood fill from the image
borders: only the white connected to the edge goes, never the white of the packaging.

## Fonts

`fonts/`: static TTF instances of Inter and Cormorant Garamond (the site's
fonts), from Google Fonts, under the SIL Open Font License (`OFL-*.txt`).
