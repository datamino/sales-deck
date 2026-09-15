# Zydeco — Ideas into Impact

A presentation website with a standalone cover, a phase contents page, and three phase presentations.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Navigation

- `#cover`: full cover, without a sidebar.
- `#phases`: contents for Alpha X, Alpha Y, and Alpha Z.
- `#phase/3/chapter/2`: an example direct chapter link.
- Each phase has eight chapters. Chapters 5–8 repeat chapters 1–4 for scroll testing.
- Four chapter links fit in the sidebar at a time. Scroll with a trackpad, mouse wheel, or touch; the native scrollbar is hidden.
- Hover or hold over the sidebar for two seconds to reveal the hand scroll hint. Keyboard focus also reveals it.
- Every chapter has an All phases link. Browser back/forward and left/right chapter keys work.
- Present mode hides the sidebar. Escape exits presentation mode.

The outer title and subtitle remain fixed. The slide canvas has the same dimensions across chapters at a given viewport; longer content scrolls inside the canvas.

Edit copy in `src/main.jsx` and styling in `src/style.css`. Typography uses Avenir Next where available, followed by Segoe UI and Arial. All artwork is inline SVG. Content and architecture are illustrative.
