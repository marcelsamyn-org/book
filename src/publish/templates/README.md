# Site Templates

This directory contains HTML templates for the published site.

## Template Files

- `template.html` - Default template (used for production builds)

## Customization

To customize the design without modifying the source template:

1. Copy `template.html` to the project root as `template.custom.html`
2. Edit `template.custom.html` to your liking
3. Set environment variable: `PUBLISH_TEMPLATE=template.custom.html`
4. Run `bun run build:site`

The custom template will be used instead of the default.

## Template Placeholders

The template uses these placeholders that get replaced during build:

- `{{LAST_UPDATED}}` - Relative date string (e.g., "13 minutes ago")
- `{{LINE_CHANGES}}` - Git line changes (e.g., "+52 -1")
- `{{COMMITS_HTML}}` - Generated commit timeline HTML
- `{{TOC_HTML}}` - Generated table of contents HTML
- `{{CONTENT_HTML}}` - Generated book content HTML
