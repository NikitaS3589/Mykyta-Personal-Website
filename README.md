# Mykyta Shyrobokov · Portfolio

A static portfolio for GitHub Pages. The homepage and three case studies work directly from disk and from a repository subpath. All screenshots, artwork, styles, and scripts are local.

## Preview

Open `index.html` in a browser. To preview with a shared theme preference across pages, serve this folder over HTTP.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open [the local portfolio](http://127.0.0.1:8000).

## Publish with GitHub Pages

1. Create a public GitHub repository. Use `<username>.github.io` for a personal site, or another name for a project site.
2. Push the contents of this folder to the root of the repository’s `main` branch. Include `.nojekyll`.
3. In **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/(root)**, then save.
4. When GitHub finishes publishing, open **Visit site** from the Pages settings.

GitHub Free supports Pages for public repositories. [GitHub Pages publishing documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Update the portfolio

Edit the introduction, experience, contacts, and project cards in `index.html`. Each HTML file under `projects/` contains the corresponding case study. Full-size WebP screenshots are in `assets/`. The thumbnails reuse those same captures. Theme colors and responsive layouts live in `assets/portfolio.css`. The home page renders the procedural terrain study with Canvas 2D in `assets/terrain.js`.

The project screens use local sample or sandbox data. Only this portfolio folder is needed for hosting.
