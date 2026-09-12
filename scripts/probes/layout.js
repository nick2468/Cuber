/**
 * Where everything on the screen is, and whether the page fits (spec 15.3).
 *
 * One expression, no statements at the top level, because it is evaluated
 * through the browser pane's JavaScript tool during development and through
 * `node scripts/packaged-eval.mjs @scripts/probes/layout.js` against the
 * installed app in phase 5. Both of those take an expression and return what
 * it came to, so an arrow function called at once is the whole shape of it.
 *
 * Rounded to whole pixels: the question is whether things fit, and a layout
 * measured to three decimal places reads as precision it does not have.
 *
 * The two numbers of spec C20 are `scrollWidth` against `innerWidth`, which
 * must never be over it, and the scene, which must be square and at least 280.
 * `scrollHeight` against `innerHeight` is the third: the page is allowed to
 * scroll down, but the 800 by 1000 window should not have to (box 4.4).
 */
;(() => {
  const box = (selector) => {
    const found = document.querySelector(selector)
    if (!found) return null
    const { x, y, width, height } = found.getBoundingClientRect()
    return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
  }

  const parts = {}
  for (const selector of ['.app-header', '.picker', '.scene', '.status', '.box']) {
    parts[selector.slice(1)] = box(selector)
  }

  return {
    ...parts,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    sceneSquare: parts.scene !== null && parts.scene.width === parts.scene.height,
  }
})()
