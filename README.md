# Neg25 Jewelry — Interactive Prototype

This is a no-build, static prototype. Open `index.html` in a modern browser.

## Features
- Landing screen with animated Morandi palette background
- Three-step selection flow (personality → style → category), each on its own page
- Tag "word cloud" as floating circular chips with subtle motion
- Skip/Next controls and step indicator (1/3, 2/3, 3/3)
- Multilingual toggle (EN / FR / ZH) with instant UI updates
- Simple recommendation screen with animated hero and placeholder Shopify link
- Accessible keyboard focus and ARIA labels
- Morandi brown/blue tones across the UI

## Local Run
No server needed. Double-click `index.html`. For best results, use Chrome, Edge, or Safari.

## Structure
- `index.html`: Single-page app screens
- `css/styles.css`: Styles and animations
- `js/i18n.js`: Language dictionary + switch
- `js/app.js`: App logic and lightweight state
- `assets/`: Logo, background assets
- `assets/products/`: SVG product images (generated in Morandi tones)

## Next Steps (Shopify)
- Replace `#` in the "Buy on Shopify" link with a product URL
- Optionally fetch recommendations from a JSON endpoint or Shopify Storefront API
- Persist user choices and feed them into a recommendation algorithm
