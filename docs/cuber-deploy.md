# Cuber - putting it on the iPad

Written 2026-09-12 at phase 6. Covers plan boxes 6.5 and 6.6.

Everything here needs Nick's GitHub account, Nick's Cloudflare account or Nick's
iPad, so these are steps for a person, not for Claude. Boxes 6.1 to 6.4 are
already built and tested: the icons, the manifest and the service worker all
work, and the app has solved a cube with the server switched off.

Origin: Conquest `docs/conquest-deploy.md`, adapted for this app's project,
repository, domain and update banner.

---

## It is not live yet

| Thing | Value |
|---|---|
| Cloudflare project | `cuber` |
| Built from | `nick2468/Cuber`, branch `main` |
| Address | `cuber.datacrafter.net` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22.12.0, from `.node-version` and a `NODE_VERSION` variable |

Steps 1 to 3 set that up, once. After them, **every push to `main` rebuilds and
republishes** and there is nothing else to run.

---

## What is already done

| Built | Where |
|---|---|
| The app icon, at four sizes | `public/icon-*.png`, `public/apple-touch-icon.png` |
| The manifest | Written at build time by `vite-plugin-pwa` |
| The service worker | `dist/sw.js`, written at build time |

The icon is one drawing, `public/icon.svg`, made at phase 5. `npm run icons`
resizes it into the four files, and `npx tauri icon` makes the Windows icons
from the same file, so the Home Screen and the Start menu can never show
different cubes.

**Proven offline on 2026-09-12.** The built app was served on `localhost`, the
server was then stopped, and the page was reloaded. It opened, showed the
remembered cube, solved it in nineteen moves and stepped through them, with
nothing answering on the port at all.

---

## 1. Put the repository on GitHub

This repository has no remote yet, so it is created here. Cloudflare Pages
builds from a Git repository, so it needs one it can read.

**Nick's step.** From `C:\Users\nick2\Code\Cuber`:

```bash
gh repo create Cuber --private --source . --remote origin --push
```

Or make an empty repository on github.com and then:

```bash
git remote add origin https://github.com/nick2468/Cuber.git
```

```bash
git push -u origin main
```

Private is fine. Cloudflare can read a private repository once you grant it.

---

## 2. Make the Cloudflare Pages project

**Nick's step.**

1. Open the Cloudflare dashboard, then **Workers & Pages**, then **Create**,
   then **Pages**, then **Connect to Git**.
2. Pick the Cuber repository.
3. Set the build settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | leave blank |

4. Press **Save and Deploy**.

**The Node version matters.** Cloudflare's default is older than Vite 8 accepts,
and the build fails with a version error. The repository holds a `.node-version`
file saying `22.12.0`. Set a `NODE_VERSION` build variable to the same value as
a belt and braces, and check the build log says it installed 22.12.0. Conquest
needed both.

That log also warns that Node 22 is in maintenance mode and nearing the end of
its life. Nothing is broken, but the version is worth raising the next time this
is touched.

The first build takes a couple of minutes. It ends with a URL like
`cuber-abc.pages.dev`. Open it and check the app runs and solves a cube.

---

## 3. Point cuber.datacrafter.net at it

**Nick's step.**

1. In the Pages project, open **Custom domains**, then **Set up a custom
   domain**.
2. Enter `cuber.datacrafter.net`.
3. Cloudflare already runs DNS for `datacrafter.net`, so it offers to add the
   record itself. Accept.

**One thing that looks wrong but is not.** While the domain says "Verifying",
Cloudflare shows a panel headed "Complete DNS setup", telling you to add the
CNAME by hand at your DNS provider. Ignore it. That text appears for everyone,
including people whose DNS Cloudflare already runs. The record has in fact
already been created. Check the DNS records list before adding anything, or you
will end up with two.

The certificate takes a few minutes. **HTTPS is not optional here**: a service
worker only runs on a secure page. Without it the app still loads, but never
works offline. Cloudflare provides the certificate, so there is nothing to do
beyond waiting.

`localhost` is the one exception to that rule, which is why the offline test
worked on this machine with no certificate.

---

## 4. Add it to the iPad Home Screen

**Nick's step.**

1. Open `https://cuber.datacrafter.net` in **Safari**. It must be Safari. Chrome
   on iPadOS cannot add a Home Screen app.
2. Press the Share button.
3. Choose **Add to Home Screen**.
4. The name will already read Cuber. Press **Add**.

The icon appears on the Home Screen: the corner-on cube on its dark ground.
Opening it runs the app full screen, with no address bar and no browser buttons.

---

## 5. Check it really works with no internet

**Nick's step.** This is plan box 6.6, and it is the one that decides whether
phase 6 is done.

1. Open Cuber from the Home Screen once, with Wi-Fi on. This lets the service
   worker store the app.
2. Turn on **Aeroplane Mode**.
3. Close Cuber completely. Swipe up and flick the app away.
4. Open it again from the Home Screen.
5. Enter a real cube's colours, press Solve, and follow the moves.

If the cube comes out solved, phase 6 is finished. Record the date in the plan's
box 6.6 and in `docs/acceptance.md` under "The iPad walk".

---

## Getting a new version onto the iPad

The service worker is set to **wait**, not to update on its own. See the comment
in `vite.config.ts`.

That is deliberate. An automatic update reloads the page the moment a new
version arrives, which would land in the middle of stepping through a solution.

So the app asks instead. Open Cuber, and if a new version is waiting a bar
appears at the bottom:

> **A new version is ready**
> Your cube and settings are remembered, so loading it loses nothing.
> [ Not now ] [ Load it ]

Press **Load it** and the app reloads on the new version. Nothing is lost: the
cube, the theme and the speed are in storage and are read back afterwards (spec
section 10). Press **Not now** and the bar goes until the app is next opened.

The bar can take a moment to appear, because the worker has to fetch the new
version before it can offer it. If it has not appeared, close the app and open
it again.

If a version is truly stubborn, open the site in Safari, then Settings, Safari,
Advanced, Website Data, and remove `cuber.datacrafter.net`. That clears the
stored copy and the next visit fetches everything fresh.

**The Windows app is not updated this way.** It has no service worker at all, on
purpose: it takes a new version from the installer, and a stored old copy inside
its window would make a reinstall look like it had done nothing (spec C21).

---

## If something goes wrong

**The build fails on Cloudflare with a Node error.** See the Node version note
in step 2.

**The app loads but never works offline.** Check the page is on `https`, and
check the service worker registered. The quick test is step 5 above.

**The Home Screen icon is a screenshot of the page rather than the icon.**
Safari did not find `apple-touch-icon.png`. Check it is in `dist` after a build.
It is drawn square on purpose: iPadOS rounds the corners itself, and a rounded
one comes out clipped twice.

**An old version keeps coming back.** See "Getting a new version onto the iPad"
above.

**Solve never becomes ready.** The solver is a separate 17 kB chunk that the
service worker stores with everything else. If it is missing, the app opens but
Solve stays off. Check `dist/sw.js` names an `assets/worker-*.js` file after a
build.
