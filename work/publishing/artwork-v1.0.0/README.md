# Paperback artwork candidates

Author approved the existing back-cover wording, 55% wholesale discount, and no returns on 27 October 2026. After reviewing the new wrap, he explicitly approved the Real-ESRGAN upscaled artwork for the final cover.

The original artwork under `assets/illustrations/cover/` is unchanged. The frozen EPUB and reading/interior PDFs are unchanged. All generated artwork here, including `front-print.png` and `back-print.png`, is retained in the release archive and ignored in Git. Restore the two print images with the commands in [the publishing README](../README.md#restore-artwork-and-build-a-proof) before rebuilding the design proof.

## Upscale

- Tool: official [Real-ESRGAN ncnn Vulkan v0.2.0](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan/releases/tag/v0.2.0), downloaded to `/private/tmp/sacred-struggle-upscale/`.
- Model: `realesrgan-x4plus`, from the official [v0.2.5.0 macOS package](https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0).
- Settings: scale 4, tile 128, PNG output, Apple M4 Max GPU. Both processes exited 0.
- Full candidates: back 4096 × 6144; front 6784 × 10112. These and the generated review PDFs are retained in the v1.0.0 publishing release archive, not Git.
- Print candidates: downsampled with ImageMagick to width 2048; back 2048 × 3072, front 2048 × 3053. This is real model inference followed by downsampling, not a DPI metadata change.
- `back-print.png` SHA-256: `81a04d9db2f53cc2d5b5946722bda283ce665cfae68ce47b7c86be2108a17806`.
- `front-print.png` SHA-256: `19eb4575e9f5538cfc416e271d21a69310cd198cef755a170de7348fc2a3936e`.
- A built-in image-generation attempt returned only 1024 × 1536 and was rejected as an upscale; it is not used in this proof.

Command, with source/output path selected for each panel:

```sh
/private/tmp/sacred-struggle-upscale/realesrgan-ncnn-vulkan-v0.2.0-macos/realesrgan-ncnn-vulkan -i assets/illustrations/cover/sacred-struggle-back.png -o work/publishing/artwork-v1.0.0/back-x4.png -m /private/tmp/sacred-struggle-upscale/models -n realesrgan-x4plus -s 4 -t 128
```

## Review proof

`../paperback-v1.0.0.yaml` uses the existing renderer, approved wording, new artwork, and **11.227 mm** spine from IngramSpark's official calculator for 176-page Groundwood / 6 × 9 / perfect-bound / matte / blank inside covers. Calculator also estimates weight 222.256 g.

The printer template request **CBP1575980** arrived 27 October at 20:04 Brussels and was downloaded/inspected on 28 October: `../templates/9789083807805-groundwood-176p.pdf`. It confirms the 176-page Groundwood setup, 0.442 inch spine, and 15 × 12 inch printer sheet. Do not send these RGB review PDFs for production. The production version is now prepared separately in `../production-v1.0.0/`, with template placement, native barcode, CMYK/PDF-X preparation, and ink limiting. Uploaded and submitted to IngramSpark on 28 October; metadata and content validation both passed with no errors. Provider says eproof in 3–5 days. The upscaled appearance is approved; the processed Ingram eproof is not yet available.

Build review: `bun run cover:proof work/publishing/paperback-v1.0.0.yaml`. This regenerates paperback outputs only, not frozen ebook/interior files.
