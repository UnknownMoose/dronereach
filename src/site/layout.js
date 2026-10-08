import { renderHeader } from './header.js';
import { renderFooter } from './footer.js';
import { escapeHtml } from './html.js';

export function renderPage({ title, description, headerVariant = 'solid', styles = [], canonical }, content) {
  if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
    throw new Error('Each page needs a non-empty title and description.');
  }
  if (!['hero', 'solid'].includes(headerVariant)) throw new Error('headerVariant must be "hero" or "solid".');
  if (!Array.isArray(styles) || styles.some(path => typeof path !== 'string' || !/^\/src\/[\w/-]+\.css$/.test(path))) {
    throw new Error('Page styles must be local /src/*.css paths.');
  }
  const canonicalLink = canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : "";
  const pageStyles = styles.map(path => `<link rel="stylesheet" href="${escapeHtml(path)}">`).join('');
  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#000000"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/src/theme.css"><link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/refinement.css"><link rel="stylesheet" href="/src/site/header.css"><link rel="stylesheet" href="/src/hero.css">${pageStyles}${canonicalLink}</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${renderHeader(headerVariant)}
<main id="main" tabindex="-1">
${content}
</main>
${renderFooter()}
<script type="module" src="/src/main.js"></script>
</body></html>`;
}
