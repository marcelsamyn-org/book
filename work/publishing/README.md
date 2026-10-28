# Publishing records and release files

The [release tracker](ebook-release-tracker.md) records the last verified state at each store. The [v1.0.0 checklist](v1.0.0-release-checklist.md) records the frozen files and completed submission steps. These are dated observations, not live store status.

## v1.0.0

- Manuscript commit/tag: `ecd140a00889aa60867f388221e27ae7bb3f9d81`, `v1.0.0`.
- Reader stamp: **Version 2026-10-27 · 060dd4c**.
- Paperback: ISBN **9789083807805**, 176 pages, 6 × 9 inches, Groundwood, matte, perfect bound, blank inside covers.
- Scheduled store release: **11 November 2026**.
- IngramSpark submission: **28 October 2026**, Creating Title Record. Metadata/content validation had no errors. Digital proof and distribution are still pending.

Download the frozen files from the [v1.0.0 GitHub release](https://github.com/marcelsamyn-org/book/releases/tag/v1.0.0). The release includes the reading PDF, EPUB, print interior, introduction sample, final print cover, ebook cover JPEG, manifest, publishing archive, and SHA-256 checksums. The GitHub download is separate from retailer approval and the scheduled retail release.

## What Git retains

- Store/revision tracker, submission checklist, historical setup log, and unsent support drafts.
- `paperback-v1.0.0.yaml`: approved back copy, artwork paths, and template-confirmed geometry.
- `templates/9789083807805-groundwood-176p.pdf`: final printer template and supplied native ISBN barcode.
- `v1.0.0-manifest.json`: file identity, checksums, and print specification.

The existing `export/paperback/wrap.typ` remains the editable cover renderer. Restore the generated artwork from the release before building the v1.0.0 design proof. The printer template is a source input; it remains in Git.

## What the release archive retains

`sacred-struggle-publishing-v1.0.0.zip` keeps the complete publishing folder snapshot, including the two print PNGs used by the cover renderer, full-resolution AI upscales, approved clean/guided proofs and PNG, production cover, historical preparation scripts, CMYK conversion prefix and ink-limiting profile, and both printer templates. The 172-page template is historical and must not be used for the 176-page edition. Selected submission/preview evidence and the exported ebook cover PNG are retained in the archive too.

Generated artwork, proofs, and one-off preparation recipes are ignored locally. The archive is the original 28 October snapshot; current retrieval instructions and store records live in Git.

## Restore artwork and build a proof

Run these commands from the repository root. They download the frozen publishing archive, verify its SHA-256, and extract only the two print images into the paths used by `paperback-v1.0.0.yaml`. `unzip -n` preserves any local files already present. The PNG hashes and dimensions are recorded in `v1.0.0-manifest.json`.

```sh
gh release download v1.0.0 --repo marcelsamyn-org/book --pattern sacred-struggle-publishing-v1.0.0.zip --skip-existing --dir dist-book/releases/v1.0.0
printf '%s\n' '8bd04bbbfc744ed73d63a6c63ccc00056073e30463242cdedf41cf6bd6063853  dist-book/releases/v1.0.0/sacred-struggle-publishing-v1.0.0.zip' | shasum -a 256 -c -
unzip -n dist-book/releases/v1.0.0/sacred-struggle-publishing-v1.0.0.zip work/publishing/artwork-v1.0.0/front-print.png work/publishing/artwork-v1.0.0/back-print.png
bun run cover:proof work/publishing/paperback-v1.0.0.yaml
```

Stop if the checksum check fails. The resulting RGB design proof is not the CMYK production upload. Retrieve the exact submitted cover from the release when production bytes are needed.

To inspect other archived files, extract into a separate directory first:

```sh
unzip dist-book/releases/v1.0.0/sacred-struggle-publishing-v1.0.0.zip -d /tmp/sacred-struggle-release/restored
```

Copy only the generated files you need. Do not overwrite newer publishing records with the archived snapshot.

## Revision rules

Do not move the `v1.0.0` tag or rebuild its frozen reader files. The cover was prepared after the manuscript tag; its exact submitted bytes are retained as release assets. A new export does not update any store. Record each replacement separately, and obtain a new printer template if page count, paper, binding, or trim changes.

Apple remains on hold. KBR submission completeness remains uncertain. The author declined sending the prepared KBR and Google support requests. Private banking, identity, tax-profile details, credentials, and signed download URLs do not belong in these public records or release assets.
