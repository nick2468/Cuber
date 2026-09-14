# Cuber - specification

Version 1. Written 2026-09-11 by the orchestrator session from Nick's brief
(`Cuber-brief.txt`), his son's drawing (`layout.jpg`) and Nick's rulings of the same
day (section 2). Status: **agreed, awaiting build.**

This document says what the app does and how it is built. The
[build plan](cuber-build-plan.md) says in what order. Where the two disagree, this
document wins. Where this document and copied code disagree, this document wins and
the code is changed.

Decisions carry a number, C1 upward. A numbered decision has a reason attached. Do
not change one without reading the reason. Every ruling Nick made is in section 2 and
is folded into the body, so a build from this document alone gives the app he asked
for.

---

## 1. Purpose

Cuber solves a Rubik's Cube. A person holds a scrambled cube, copies its colours on
to a cube drawn on the screen, and presses Solve. The app writes the moves in a box
under the cube, one per line, in plain words and in the standard letter notation. The
person steps through the moves, or presses play, and the cube on the screen turns
with each move so the person can follow along on the real cube.

It runs in two places from one code base:

- **Windows**, as an installed desktop app in its own window, the way Simple Chess in
  `../SimpleChess` and the Repertoire Trainer in `../London` do (Tauri 2 over WebView2,
  NSIS installer).
- **iPad**, later, as a Home Screen app, the way Conquest in `../Conquest` does (a PWA
  served from Cloudflare Pages). The code is iPad-ready from the first phase. The
  Cloudflare work waits until Nick asks (C21).

The screen follows the drawing in `layout.jpg` (section 4).

---

## 2. Rulings (Nick, 2026-09-11)

Seventeen questions were put to Nick. Four he answered in his own words. The rest he
left to the orchestrator's recommendations, which are recorded here as taken and
stand until he says otherwise. Every ruling is folded into the body.

| # | Question | Ruling |
|---|---|---|
| Q1 | The drawing | `layout.jpg` in the repository root. Section 4 follows it. |
| Q2 | Name and identifiers | **Cuber.** Tauri identifier `com.nick.cuber`. Browser profile folder `%LOCALAPPDATA%\Cuber Data`. (Taken.) |
| Q3 | Windows and iPad delivery | Windows as an installed app now. The iPad Home Screen app is a final, unticked phase that waits for Nick's word. (Taken.) |
| Q4 | Solving method | **The shortest solution first**: the Kociemba two-phase method through the cubejs library, about 20 moves. A beginner layer-by-layer method is a later phase if wanted (section 16). (Taken.) |
| Q5 | Move notation | Singmaster letters, with a plain sentence beside each move (section 8). (Taken.) |
| Q6 | How to hold the cube | As it was entered: the face entered as the front stays at the front, the top stays on top. The box says so. (Taken.) |
| Q7 | The three hidden faces | **Nick asked whether three faces are enough. They are not** (C2). A "Show the other side" button under the cube shows the bottom, the left and the back. |
| Q7a | The change of view | **Nick, in his words: a slow-motion animation that shows how to orientate the real cube for the other view.** Two movements, one after the other, each with a sentence (C3). |
| Q8 | The centre stickers | Pre-filled with the standard scheme and still editable. The six colours are white, yellow, red, orange, blue, green. (Taken.) |
| Q9 | How validation feels | Counts on the picker, a used-up colour cannot be picked, an impossible piece is marked at once with one sentence, Solve stays off until the cube is complete and possible with the reason beside it. (Taken.) |
| Q10 | Right-click on iPad | A long press opens the same six-colour menu. (Taken.) |
| Q11 | Animation controls | Step back, step forward, play and pause, jump to start and end. Speed: slow, normal, fast, remembered. (Taken.) |
| Q12 | Reset | **Nick, in his words: Reset discards the cube and shows a new uncoloured one.** So Reset is the blank cube with the centres kept. No separate Clear button. Scramble is a dev scene, not a button (section 15). |
| Q13 | The photo feature | Out of version 1. Recorded as a later phase (section 16). (Taken.) |
| Q14 | Look | Dark by default with a light toggle, the trainer's palette. The stickers keep fixed bright colours in both themes. (Taken.) |
| Q15 | Repository | `git init` here. A private GitHub repository `nick2468/Cuber` when Nick wants one. The builder commits on `main` and never pushes. (Taken.) |
| Q16 | The light bulb | **Nick, in his words: it is a Hint button.** Solve was missing from the drawing, so it goes in the header beside Reset cube (section 4). |
| Q17 | Window shape | **Nick, in his words: the shape is not important, do what is natural.** One column as drawn, window 800 by 1000 (section 11). |
| Q18 (2026-09-14) | Solving methods | **Nick asked what the solver follows, after a cube scrambled with a few turns came back with nineteen moves.** It follows Kociemba's two-phase method, which is short but not shortest. Nick ruled: three methods, chosen in the box and remembered. **Quick solve** (today's, named), **Fewest moves** (the same library asked for 1 move, then 2, and so on), and **Beginner method** (layer by layer, the method every guide teaches, so his son can learn it). All three in one phase, phase 7; he reviews at the end. Section 7.3 to 7.5 and 9.5. |

Nick also left to the orchestrator: docs in `docs/`, ports 5190 and 5191, version
0.1.0 during the build and 1.0.0 at acceptance, the two vitest projects and the
screenshot method from Simple Chess, Australian English on screen and in the docs.

---

## 3. Words

One name for one thing. Code, comments, docs and the screen use these exact words.

| Word | Meaning |
|---|---|
| **The user** | The person using the app. |
| **The cube** | The 54 stickers as the user entered them, or as they stand after some steps of the solution. |
| **Sticker** | One coloured square. There are 54. A sticker is filled (has a colour) or blank. |
| **Face** | Nine stickers on one side. Six faces: **Up, Down, Front, Back, Left, Right**, letters U D F B L R. On screen and in sentences they are "the top face", "the bottom face", "the front face", "the back face", "the left face", "the right face". |
| **Centre** | The middle sticker of a face. It never moves on a real cube. |
| **Piece** | A small cube. 8 **corners** with three stickers and 12 **edges** with two. The six centre pieces have one sticker each and are just called centres. |
| **Colour** | One of six: white, yellow, red, orange, blue, green. |
| **The scheme** | Which colour is on which face, read from the six centres. The standard scheme is white up, yellow down, green front, blue back, red right, orange left. |
| **The picker** | The box of six colour swatches at the top right. |
| **The near view** | The cube drawn corner-on showing Up, Front and Right. This is the view in the drawing. |
| **The far view** | The same drawing after the cube has been turned round: Down, Left and Back (C2). |
| **Move** | One turn of one face, written in Singmaster notation: `R`, `R'`, `R2` (section 8). |
| **The solution** | The list of moves from the entered cube to a solved cube. |
| **Step** | A position in the solution. Step 0 is the entered cube. Step N is the cube after N moves. |
| **The box** | The instruction box across the bottom of the screen. |
| **The solver** | The Kociemba two-phase code from the cubejs library, running in a web worker (C5, C10). |
| **The validator** | The code that says whether the 54 stickers make a possible cube (section 6). |
| **Facelets** | The 54-letter string the solver reads, in the library's order (C7). |
| **Desktop** | The app running inside the Tauri window on Windows. `isDesktop()` says so at runtime. |
| **The pane** | The Claude Code browser pane the build session drives. |

---

## 4. The screen

There is one screen. It never navigates anywhere. It follows the drawing:

```
+---------------------------------------------------------------+
| Cuber  v0.1.0      [Reset cube] [Solve]  (bulb)      [Light]  |  header
+---------------------------------------------------------------+
|                                        +--------------------+ |
|                                        |  [r] [g] [y] [w]   | |  the picker
|                                        |  [b] [o]   Colours | |
|                                        +--------------------+ |
|                                                               |
|                    +----------------+                         |
|                   /  top face      /|                         |
|                  /                / |                         |
|                 +----------------+  |        the cube         |
|                 |                |  +                         |
|                 |  front face    | /  right                   |
|                 |                |/   face                    |
|                 +----------------+                            |
|                                                               |
|              [Show the other side]                            |
|      Fill in the stickers. 12 of 48 done.                     |  the status line
+---------------------------------------------------------------+
| [|<] [<] [play] [>] [>|]   Speed: (o) slow ( ) normal ( ) fast |
|                                                               |
|  Hold the cube as you entered it. Clockwise means as you      |  the box
|  look straight at that face.                                  |
|                                                               |
|   1. R'  Turn the right face anticlockwise.        <- current |
|   2. U   Turn the top face clockwise.                         |
|   ...                                                         |
+---------------------------------------------------------------+
```

- **Header**: the app name with the version beside it in the trainer's faint style.
  Then, in the middle, **Reset cube** and **Solve** as ordinary buttons, then the
  **Hint** button drawn as a light bulb (an SVG icon with the accessible name "Hint").
  At the right, the theme toggle styled as the trainer's `theme-toggle` link. The
  drawing has the name, Reset and the bulb. Solve is added beside Reset because it is
  the main action and the drawing had no home for it (Q16).
- **The picker** (`.picker`): a bordered box at the top right, labelled "Colours",
  six swatches in the drawing's order: red, green, yellow, white, blue, orange. Each
  swatch shows a small count of how many stickers carry that colour, "7/9". The
  selected swatch has a ring. A swatch whose colour is used nine times shows its
  count in the faint style and stays selectable: it can still repaint a filled
  sticker, and a blank sticker refuses it (C9, as ruled at gate 3).
- **The cube** (`.scene`): the 3D cube, centred, corner-on, drawn with CSS 3D (C4).
  Under it the **Show the other side** button, which reads **Show the first side**
  while the far view is showing.
- **The status line** (`.status`): one line under the button. While entering: "Fill
  in the stickers. 12 of 48 done." When something is wrong: the validator's sentence
  (section 6.4). When the cube is complete and possible: "Ready. Press Solve." During
  the view change: the orientation sentences (C3). After Solve: "Solved in 19 moves."
- **The box** (`.box`): full width across the bottom. A control row (section 9.2),
  then the fixed holding sentence, then the moves, one per row, the current one
  marked. Before Solve the box says "Press Solve and the steps appear here."

**C1. One screen, one column, as drawn.** The drawing is the design. The header, the
picker, the cube and the box keep those places and that order. Nothing is added
except Solve, the theme toggle and the controls inside the box, each of which the
brief asks for.

### 4.1 Sizes

All in CSS pixels.

| Thing | Size | Why |
|---|---|---|
| The column | up to 720 wide, centred, at every window width; the 24 px padding sits outside the 720 | The drawing is a portrait page. 720 fits the picker beside the cube's top and the box's rows without wrapping a sentence. (Corrected at gate 4: the tall-window rule had made the column 672 above 900 px and 720 below it.) |
| The scene | 400 by 400, or smaller to fit | The square the cube is drawn in. It was 440 until phase 4's layout pass, which had to find 75 pixels to stop the 800 by 1000 window scrolling (the notes say where the rest came from). |
| Cubie | the scene divided by 4.8, rounded down: 83 at 400, 58 at 280 | Measured at phase 2: turned corner-on and seen through a 1200 px perspective, the cube's silhouette is about 1.3 times three cubies wide, so a 400 scene holds an 83 px cubie and no more (a 440 scene held 91, before phase 4 shrank it). Still far more than the 36 px a finger needs. (Version 1 said 120 and a divisor of 3.67, which drew the cube 1.3 times too big and over the view button.) |
| Gap between cubies | 0 | A gap is a hole through the cube, and the page ground shows through it as bright lines in the light theme (found at gate 2). The dark plastic between stickers is each sticker's own 6 px inset on the cube-body colour. |
| Lift | a quarter of a cubie | Corner-on, the silhouette hangs low in its square because the tilt brings the bottom corner forward and the perspective magnifies it. The cube is drawn a quarter of a cubie above the centre so it sits in the middle (measured at phase 2: 22 px at a 91 px cubie). |
| Header | 56 tall | The trainer's header. |
| The box | at least 220 tall, grows with the moves; 265 with a solution in it | The control row, the holding sentence and four moves visible with a fifth part-shown; longer solutions scroll inside the box. (Version 1 said five, and measurement at phase 4 put the list at 4.3 rows. The half row showing is a useful thing to see: it says there is more.) |
| Page padding | 24 | The trainer's `.app`. |

**The fit rule.** The scene is the smaller of 400 and what the viewport leaves after
the header, the picker, the button, the status line, the box's minimum and the
padding. It is never smaller than 280. On the 800 by 1000 window it is 400. On an
iPad held sideways (1180 by 820) it is 280, and the page scrolls a little inside
the shell. The scene is re-measured when the window or the orientation changes.
Every number the rule subtracts is MEASURED by `scripts/probes/layout.js`, not
estimated: `src/ui/fit.ts` names the probe box each one came from. The estimates
were wrong by 75 pixels, which is what phase 4's layout pass found. The cube is drawn to fit the scene: the cubie
size is the scene size divided by 4.8, rounded down (the table above says why).

The page must never scroll sideways at any viewport this app is used at (section
15 measures this). It may scroll down.

### 4.2 iPad specifics

- Safe-area padding on the page, as Conquest's `.board-page` does.
- `viewport-fit=cover`, the two `mobile-web-app-capable` meta tags and the
  `theme-color` meta in `index.html`, copied from Conquest.
- Stickers accept a tap as a click. A long press of 500 ms opens the colour menu
  (section 5.3). `touch-action: manipulation` on the scene so a double tap does not
  zoom.
- Buttons are at least 36 px tall.

### 4.3 Theme

Dark by default, light on the toggle, remembered. The trainer's `index.css` palette
and `theme.ts` are copied, with the storage key renamed (section 10). The cube body
is near-black (`#111`) and the six sticker colours are fixed in both themes:

| Colour | Hex |
|---|---|
| white | `#f5f5f5` |
| yellow | `#ffd500` |
| red | `#c41e3a` |
| orange | `#ff5800` |
| blue | `#0051ba` |
| green | `#009e60` |

A blank sticker is the cube body colour with a faint dotted border, so it reads as
"not filled in" rather than as black.

---

## 5. Entering the cube

### 5.1 The two views

**C2. Three faces are not enough, so there are two views.** A cube has 54 stickers
and a corner-on view shows 27. The hidden 27 are not fixed by the visible ones: an
edge with a white sticker showing could be any of the four white edges, and its
hidden sticker any of four colours. So the user enters the near view, presses "Show
the other side", and enters the far view.

The near view shows **Up at the top, Front at the front-left, Right at the
front-right**. This is the drawing.

The far view shows **Down at the top, Left at the front-left, Back at the
front-right**. Those are the three hidden faces, and they meet at one corner, so one
corner-on view shows all three. The arrangement is fixed by geometry: the three faces
around a corner have a clockwise order, and Down, Back, Left is the clockwise order
around that corner, so with Down at the top, Back must be at the front-right and
Left at the front-left. No other arrangement is a real rotation of the cube.

The far view is what the near view becomes after two movements of the whole cube:

1. **Roll the cube over sideways**, a half turn about the front-back axis. The top
   goes to the bottom, the left and right swap, the front stays at the front.
2. **Turn it a quarter turn** about the vertical axis so the face on the right comes
   to the front.

After these, the face on top is Down, at the front is Left, on the right is Back.
A string test pins this (`viewFaces('far')` returns `['D', 'L', 'B']`).

### 5.2 The view change is a slow animation

**C3. The change of view plays in slow motion and shows the user how to turn the real cube.**
Nick ruled it: the user has to turn the real cube the same way, and a fast spin
teaches nothing. Pressing "Show the other side" plays the two movements of C2 on the
screen cube, one after the other, about 1.2 seconds each with a pause of 0.4 seconds
between them. As each movement plays, the status line says what to do:

1. "Roll your cube over sideways so the top goes to the bottom."
2. "Turn it a quarter turn so the face on your right comes to the front."

Then the status line says "Check the centres: they should match your cube." and,
after two seconds, goes back to the fill-in count. "Show the first side" plays the
two movements in reverse with the reverse sentences ("Turn it back a quarter turn so
the face on your left comes to the front." then "Roll your cube back over so the top
goes to the bottom."). Stickers cannot be clicked while the animation plays. The
button is disabled during the animation and while a solution move is animating.

The screen cube stays in the far view until the button is pressed again. Solve and
Hint work in either view. Solution moves animate in whichever view is showing.

### 5.3 Painting a sticker

- **Left click (or tap)** on a sticker paints it with the picker's selected colour.
  Red is selected when the app opens for the first time. The selection is not
  remembered.
- **Right click** on a sticker opens a small menu at the pointer with the six
  colours as swatches and a seventh item, "Clear". Choosing one paints (or blanks)
  that sticker and closes the menu. Escape or a click anywhere else closes it. A
  **long press** of 500 ms on a touch screen opens the same menu (Q10). The menu is
  one component used by both.
- A colour already on nine stickers cannot be painted on to a BLANK sticker: the
  click does nothing except put "Red is already on nine stickers." in the status
  line. It can be painted over a FILLED sticker, and the count rule then says what
  is off. This is the first validation rule (C9, as ruled at gate 3).
- **Centres** paint like any other sticker. The scheme follows the centres, so a user
  with a non-standard cube can enter it. Two centres with the same colour is a
  validation failure (section 6.4).
- Painting while a solution is showing discards the solution (C12).

### 5.4 Reset cube

**C14. Reset is the blank cube with the standard centres, and it asks once.** Nick
ruled that Reset discards the cube and shows a new uncoloured one (Q12). The 48
non-centre stickers go blank, the six centres go back to the standard scheme, any
solution goes, and the view goes back to the near view without animation. Because 48
clicks are a lot to lose to one slip, the button asks once: the first press changes
its label to "Press again to clear" for three seconds, and the second press within
that time clears. The trainer has no such guard on New game, but a game there is one
click to restart and a cube is not.

---

## 6. The model and the validator

### 6.1 The sticker order

**C7. Stickers are numbered in the library's facelet order.** The solver reads a
54-letter string in the order Up, Right, Front, Down, Left, Back, nine per face,
and one ordering for the whole app is the only way to have one place where "which
sticker is this" is answered. So the model is an array of 54 entries, index
`9 * face + 3 * row + column` with faces in the order U R F D L B (0 to 5), and
each face read as the library's diagram reads it:

```
             +------------+
             | U1  U2  U3 |
             | U4  U5  U6 |
             | U7  U8  U9 |
+------------+------------+------------+------------+
| L1  L2  L3 | F1  F2  F3 | R1  R2  R3 | B1  B2  B3 |
| L4  L5  L6 | F4  F5  F6 | R4  R5  R6 | B4  B5  B6 |
| L7  L8  L9 | F7  F8  F9 | R7  R8  R9 | B7  B8  B9 |
+------------+------------+------------+------------+
             | D1  D2  D3 |
             | D4  D5  D6 |
             | D7  D8  D9 |
             +------------+
```

`U1` is index 0, `R1` is 9, `F1` is 18, `D1` is 27, `L1` is 36, `B1` is 45. The
centres are 4, 13, 22, 31, 40, 49.

In space, with x to the right, y up and z towards the viewer, a cubie sits at
(x, y, z) with each coordinate -1, 0 or 1. The faces read as follows, and
`src/model/geometry.ts` holds this table and nothing else decides it:

| Face | Where | Rows run | Columns run |
|---|---|---|---|
| U | y = 1 | from the back (z = -1) to the front (z = 1) | left to right (x = -1 to 1) |
| R | x = 1 | top to bottom | front (z = 1) to back (z = -1) |
| F | z = 1 | top to bottom | left to right |
| D | y = -1 | from the front (z = 1) to the back (z = -1) | left to right |
| L | x = -1 | top to bottom | back (z = -1) to front (z = 1) |
| B | z = -1 | top to bottom | right (x = 1) to left (x = -1) |

The library's own tables are the proof that the geometry is right. Each corner
position is three facelets in clockwise order, and each edge two, exactly as
`cube.js` lists them (`cornerFacelet` and `edgeFacelet`, reproduced here so the
validator can be written from this document):

| Corner | Facelets | Edge | Facelets |
|---|---|---|---|
| URF | U9, R1, F3 | UR | U6, R2 |
| UFL | U7, F1, L3 | UF | U8, F2 |
| ULB | U1, L1, B3 | UL | U4, L2 |
| UBR | U3, B1, R3 | UB | U2, B2 |
| DFR | D3, F9, R7 | DR | D6, R8 |
| DLF | D1, L9, F7 | DF | D2, F8 |
| DBL | D7, B9, L7 | DL | D4, L8 |
| DRB | D9, R9, B7 | FR | F6, R4 |
| | | FL | F4, L6 |
| | | BL | B6, L4 |
| | | BR | B4, R6 |

A string test checks the geometry table against these: the three stickers the
geometry puts at the corner (1, 1, 1) are U9, R1 and F3, and so on for every piece.

### 6.2 Letters and colours

The solver wants letters, the user paints colours. `toFacelets(cube)` maps each
sticker's colour to the letter of the face whose centre has that colour, and
`fromFacelets(letters, scheme)` maps back. Both live in `src/model/facelets.ts`. A
cube with a blank sticker or a duplicate centre has no facelet string, and the
function says so rather than guessing.

### 6.3 Moves

**C6. The library's `move` is the only implementation of a face turn.** cubejs
already turns a cube. Writing sticker permutation tables by hand would be a second
copy of the same algorithm, and the one place they could disagree is the one place a
test could not see. So `applyMove(cube, move)` in `src/model/moves.ts` converts to
facelets, calls the library, and converts back. It is only ever called on a cube the
validator has passed, because the library assumes a real cube.

The moves are the eighteen face turns: `U D F B L R`, each plain, with `'` or with
`2`. Nothing else: no slice moves, no wide moves, no whole-cube rotations. The solver
never emits any of those and the app never needs them.

### 6.4 The validator

The validator is this app's own code, in `src/model/validate.ts`, because the
library does none (its `fromString` silently makes a broken cube from a bad string).
It answers two questions, at two times.

**While entering** (after every paint), `checkPartial(cube)` returns the first
problem it finds, or null:

1. A colour on more than nine stickers. (The picker prevents this, so this is a
   guard, not a screen message.)
2. Two centres with the same colour: "Two centres have the same colour. Every centre
   is different."
3. A piece with two stickers of the same colour: "A corner (or an edge) cannot have
   two stickers the same colour."
4. A piece with two opposite colours, judged by the centres (Up-Down, Front-Back,
   Left-Right): "A corner (or an edge) cannot have white and yellow: they are on
   opposite sides."
5. A piece with all its stickers filled whose colours are not a real piece: "That
   corner is not a real piece. Check its three colours." A real corner is one of the
   eight clockwise triples of the scheme, in any rotation; a real edge is one of the
   twelve pairs, either way round. A corner whose three colours are right but in the
   mirror order is not a real piece, and this rule catches it.

Each problem names the piece by its stickers, and the screen marks those stickers
with a red outline until the problem is gone.

**At Solve** (and to enable the button), `validate(cube)` runs the partial checks
on a complete cube and then the whole-cube rules, in this order, returning the first
failure:

6. All 54 stickers filled: "Fill in every sticker. 3 to go."
7. Each colour on exactly nine stickers: "There are ten red stickers and eight blue.
   A cube has nine of each."
8. Every corner is a real piece and no two corners are the same piece: "Two corners
   have the same three colours."
9. Every edge is a real piece and no two edges are the same piece: "Two edges have
   the same two colours."
10. The corners' twists add up to a multiple of three, else "One corner is twisted.
    Check the corners' colours." Each corner's twist is how many clockwise steps its
    Up-or-Down sticker sits from the Up-or-Down face.
11. The edges' flips add up to an even number, else "One edge is flipped. Check the
    edges' colours." An edge is flipped when its Up-or-Down sticker is not on the
    Up-or-Down face, or, for the four middle edges, when its Front-or-Back sticker is
    not on the Front-or-Back face.
12. The corners' permutation parity equals the edges', else "Two pieces are swapped.
    A real cube cannot be solved from here."

When every rule passes the result carries the facelet string. Rules 10 to 12 are the
same three rules the library's own `randomize` enforces when it makes a random cube,
which is why a random cube from the library is always valid here.

**The library is the validator's test oracle.** Two property tests bind:

- Every one of 200 cubes from `Cube.random().asString()`, converted to colours,
  passes `validate`.
- For each of 100 random cubes, swapping two non-centre stickers of different
  colours makes a cube that fails `validate`. (A swap inside a piece flips or
  mirrors it; a swap between pieces makes a duplicate or a piece that does not
  exist.)

**C8. Two levels of checking, so the user hears about a mistake while it is still one
click old.** The partial checks fire on the sticker just painted. The whole-cube
rules need all 54 and would only shout "something is wrong somewhere". Both are one
module and share the piece tables.

**C9. The Solve button is off until the cube is complete and possible, and the
reason is beside it.** A Solve that returns "no solution" teaches nothing. The status
line carries the validator's sentence, and a BLANK sticker refuses a tenth sticker of
any colour so the commonest mistake cannot be made at all.

**Painting over a filled sticker is always allowed** (ruled at gate 3, built in
phase 4). Version 1 of this decision refused a tenth sticker of a colour everywhere,
and the build showed the consequence: on a complete cube every colour is already on
nine stickers, so the only paint that could change one was Clear, and a person who
had swapped two colours had to clear both and paint both. So the rule is now about
blank stickers only. A filled sticker takes any colour, the counts go to ten and
eight, and rule 7's sentence says so ("There are ten red stickers and eight blue. A
cube has nine of each.") until the other sticker is fixed. The picker's swatch stays
selectable at nine; its count reads 9/9 in the faint style as information. Painting
a blank sticker with a colour at nine does nothing except put "Red is already on
nine stickers." in the status line until the next paint.

---

## 7. The solver

### 7.1 The library, vendored

**C5. The two solver files from cubejs 1.3.2 are copied into the repository, not
installed from npm.** cubejs is MIT and its `lib/cube.js` (22 KB) and `lib/solve.js`
(29 KB) are the whole solver. The npm package, though, declares `npm` itself as a
runtime dependency, which would pull thousands of files into `node_modules` for
nothing, and both files are CommonJS wrapped in `(function(){...}).call(this)`, which
does not load as an ES module in a Vite worker without help. So they live at
`src/solver/vendor/cube.js` and `src/solver/vendor/solve.js` beside the library's
`LICENSE`, each with an `Origin:` line naming cubejs 1.3.2 and the edit made:

- `cube.js`: the outer wrapper `(function() { ... }).call(this)` is exported,
  `export default (function() {`, and its closing globals block (`if (typeof module
  ...) module.exports = Cube; else this.Cube = Cube;`) becomes `return Cube;`. The
  block sits inside the wrapper, where `Cube` is a local and an `export` would be
  a syntax error, so the wrapper itself is what the module exports. (Corrected at
  gate 1: version 1 of this document said the block was replaced by `export default
  Cube`, which cannot compile.)
- `solve.js`: `import CubeLibrary from './cube.js';` at the top of the file, and
  `Cube = this.Cube || require('./cube');` inside the wrapper becomes `Cube =
  CubeLibrary;`. The import cannot be named `Cube` because the wrapper's own `var`
  list declares a `Cube` that would shadow it.

Nothing else changes. `src/solver/vendor/cube.d.ts` declares the seven members the
app uses: `Cube.fromString`, `Cube.random`, `Cube.initSolver`, and the instance
methods `asString`, `move`, `solve` and `isSolved`. The vendor folder is excluded
from oxlint, and `tsc` parses it without checking it (`allowJs` without `checkJs`).

One test proves the vendored files run: it calls `Cube.initSolver()`, solves one
fixed scrambled cube and one random one, applies each solution to its cube with
`move`, and asserts `isSolved()`. It takes about a second on this machine (measured
at phase 1: 1.1 seconds for the tables and both solves) and is the only test
allowed to call `initSolver`.

### 7.2 The worker

**C10. The solver runs in a web worker and warms up when the app opens.**
`Cube.initSolver()` takes about a second on this machine (measured at phase 1; the
library's README says four to five on the hardware of its day, and an iPad will be
slower) and would freeze the screen for that long if it ran on the main thread. `src/solver/worker.ts` imports the vendored files, runs
`initSolver` on start and posts `{ type: 'ready' }`. On `{ type: 'solve', facelets }`
it posts `{ type: 'solution', moves }` with the moves as an array of strings, or
`{ type: 'failed' }` if the library returns nothing for a cube that is not solved
(which the validator makes unreachable, and which is still handled).

`src/solver/solver.ts` wraps it: `createSolver()` returns `{ ready: Promise<void>,
solve(facelets): Promise<string[]> }`. The provider takes `createSolver` as an
injected option, the way the trainer's provider takes `createEngine`, and tests pass
`fakeSolver` from `src/test/fake-solver.ts`, which answers at once with a fixed
solution. One DOM test installs a throwing `Worker` and asserts it was never
constructed.

A cube that is already solved is not sent to the worker. `solve` returns an empty
list and the status line says "Your cube is already solved."

Before the worker is ready the Solve and Hint buttons are disabled and their title
says "Getting ready...". The wait is about a second after opening, once (measured at
gate 3 on the built app: ready 1.1 seconds after navigation, a solve in 10 ms. A
browser tab in the background throttles the worker's timers and makes both numbers
look five times worse; measure with the tab in front).

Solve and Hint are also off while a move turns or the view changes, with the title
"Wait for the cube to stop turning." (added at phase 3).

The moves come back exactly as the library writes them: face letter, then nothing,
`2` or `'`. The library calls `solve()` with its default depth of 22.

---

### 7.3 Three methods

**C22. The user chooses the method, and the default is the quick one.** Nick ruled it
(Q18). The library's two-phase method stops at the first solution under 22 moves, so a
cube scrambled with four turns comes back with about nineteen, and its moves are a
computer's with no stage a person could name. A learner wants stages. A person with a
lightly scrambled cube wants the undo. So the box offers three methods in a "Method"
fieldset beside Speed, remembered as `cuber.method` (section 10):

| On screen | Value | What it is |
|---|---|---|
| Quick solve | `quick` | Today's solver: the library's `solve()` at its default depth of 22. The default. |
| Fewest moves | `fewest` | 7.4 below. |
| Beginner method | `beginner` | 7.5 below. |

Every method returns the same shape to the provider: the list of moves, and for the
beginner method also its stages and labels (7.5). The controls, the stepping, Hint and
the animation do not know which method made the solution. Changing the method while a
solution is showing discards the solution, the way painting does (C12), because the
solution no longer matches the choice.

### 7.4 Fewest moves

The same library, asked for a solution of at most 1 move, then at most 2, then 3, and
so on: `Cube.fromString(facelets).solve(depth)` for `depth` from 1 upward, stopping at
the first non-empty answer. The library's `solve(maxDepth)` returns an empty string when
nothing fits in that depth. Because each depth is tried before the next, the first
answer is the shortest the two-phase method can find, and for a cube scrambled with a
few turns it is exactly the undo of those turns.

The search gets slow past about 14 moves on a fully scrambled cube, so it is bounded
two ways, both in `src/solver/worker.ts`: a depth limit of 20, and a time budget of 5
seconds of the worker's clock, checked before each depth. When either runs out, the
worker answers with the quick solution instead and says so: the reply carries `note:
'quick'`, and the status line reads "Solved in 19 moves. No shorter answer was found
in five seconds, so this is the quick one." Otherwise "Solved in 4 moves." as today.
The box says "Working it out..." for as long as it takes.

**What this promises and what it does not.** It promises the shortest solution the
two-phase method can find within the budget. It does not promise the true minimum,
which needs a different and much heavier solver (an optimal solver with large tables)
and is out of scope. For the case Nick raised, a few scrambling turns, the two are the
same.

### 7.5 The beginner method

The layer-by-layer method that the official Rubik's guide and nearly every "how to
solve a cube" page teach, in seven stages, with the well-known short sequences by
name. It is this app's own code in `src/solver/beginner.ts`, because the library has
nothing like it. It is long (100 to 150 moves) and that is the point: a person
following it learns the method.

**No whole-cube turns.** The holding rule (C11) stands: the cube is held as it was
entered, and every move is one of the eighteen face turns. Guides build the first
layer on top and then say "turn the cube over"; this method builds the first layer on
the BOTTOM face as entered, so nothing is ever turned over, and the last layer is the
top face as entered. The box's holding line for this method adds one sentence: "Most
guides start with white: hold the cube with white at the bottom before you enter it."
The method itself works with any colour at the bottom; "white" and "yellow" below mean
the bottom centre's colour and the top centre's colour.

**The seven stages, each with its goal, its vocabulary and its sentence.**

| Stage | Name in the box | Goal (a test on the sticker model) | Vocabulary the search uses |
|---|---|---|---|
| 1 | The white cross | The four bottom edges are in place with both stickers matching their centres. | All eighteen face turns, one edge at a time, with the edges already placed kept in place. |
| 2 | The white corners | The four bottom corners are in place, all three stickers matching. | `U`, `U'`, `U2`, and the righty move for each of the four slots (below). One corner at a time, keeping the cross and the corners already placed. |
| 3 | The middle layer | The four middle edges are in place. | `U`, `U'`, `U2`, and the eight insertion moves (below). One edge at a time, keeping the two bottom layers' finished pieces. |
| 4 | The yellow cross | The four top edges show the top colour on top. | `U`, `U'`, `U2`, and `F R U R' U' F'`. |
| 5 | The yellow edges | The four top edges are in place. | `U`, `U'`, `U2`, and `R U R' U R U2 R'`. |
| 6 | The yellow corners in place | Each top corner is in its own slot (any twist). | `U`, `U'`, `U2`, and `U R U' L' U R' U' L`. |
| 7 | The yellow corners turned | The cube is solved. | `U`, `U'`, `U2`, and `R' D' R D` (applied at the front-right top corner; twice or four times turns that corner; `U` brings the next corner there). |

**The named sequences**, each a macro the box labels. The letters are the eighteen
face turns only.

| Name | Letters | Where it acts |
|---|---|---|
| The righty move, front-right | `R U R' U'` | The corner slot at the bottom front-right |
| The righty move, back-right | `B U B' U'` | The bottom back-right slot |
| The righty move, back-left | `L U L' U'` | The bottom back-left slot |
| The righty move, front-left | `F U F' U'` | The bottom front-left slot |
| Insert to the right, from face X | `U Y U' Y' U' X' U X` | An edge sitting on top above face X, whose top-layer sticker matches X's centre, going down to X's right-hand slot. Y is the face clockwise after X seen from above (F, R, B, L, then F). |
| Insert to the left, from face X | `U' Z' U Z U X U' X'` | The same edge going to X's left-hand slot. Z is the face before X in that order. |
| The cross move | `F R U R' U' F'` | The top face |
| The edge move | `R U R' U R U2 R'` | The top face |
| The corner move | `U R U' L' U R' U' L` | The top face |
| The twist move | `R' D' R D` | The corner at the top front-right |

The four righty moves are one shape seen from the four sides, and the eight insertions
are two shapes seen from the four sides. The builder writes each as data (a name, the
letters) and proves each by a test that applies it to a set-up cube and checks the goal
it serves, rather than by trusting the table: the table is the orchestrator's reading
of the guides, and a test is cheaper than an argument.

**How the solver works: one search, seven times.** `solveStage(cube, vocabulary, goal,
limit)` is a breadth-first search over sequences of vocabulary items, up to `limit`
items long, returning the first sequence whose result passes `goal`. A vocabulary item
is a single move or a named macro; the search applies it with `applyMoves`. The
solver runs the stages in order, each stage's goal including every earlier stage's
goal, so nothing already done is undone. Stages 1, 2 and 3 solve one piece at a time,
each piece its own search with the goal "this piece placed and everything placed
before it still placed". Limits: stage 1, six moves per edge; stage 2, eight items
per corner; stage 3, eight items per edge; stages 4 to 7, twelve items. A search that
finds nothing within its limit is a fault, not a case: the solver throws, the worker
answers `failed`, and the test suite is built so that this never happens on 200
random cubes.

**What the solver returns.** `{ moves, stages, labels }`: the flat list of single
moves (what the stepping and the animation use, unchanged); `stages`, one per stage
that needed any moves, `{ name, sentence, from, to }` giving the move indices it
covers; and `labels`, `{ at, text }` naming a macro at the move it starts on, such as
"The righty move, front-right: R U R' U', twice". A stage whose goal already holds is
skipped and listed as done in one line ("The white cross was already there.").

**Stage sentences**, one each, shown under the stage name in the box:

1. "Make a cross on the bottom face: four edges with both colours matching their
   centres."
2. "Put each bottom corner in place. A corner waits above its slot on the top layer,
   then the righty move drops it in; repeat until its colours match."
3. "Fill the middle layer. Find a top edge with no top colour, turn the top until its
   front colour matches a centre, then insert it right or left."
4. "Make a cross on the top face with the cross move. It may take up to three goes."
5. "Turn the top until two edges match their centres, then the edge move puts the
   rest right."
6. "The corner move moves three corners round until each is in its own slot."
7. "The twist move, done in pairs, turns the corner at the front-right until it is
   right. Then turn the top to bring the next corner there. The cube looks broken
   until the last corner; that is normal."

**The tests it must have.** Every macro against a set-up cube; every stage's goal
against hand-made cubes on both sides of it; the whole method on 200 random library
cubes ending solved with `applyMoves`, every stage's goal holding at its `to` index,
and every solution under 250 moves; and the fixed scramble's solution, with its stage
boundaries, pinned in one test so a change to the search shows as a diff.

## 8. The instructions

**C11. Every move is a letter and a sentence, and the box says how to hold the
cube.** The brief asks for a well-known shorthand and for instructions a person can
follow. Singmaster notation is the standard every cube book and website uses, and a
sentence beside each letter means the user does not have to learn it first.

The box starts with one fixed line: "Hold the cube as you entered it: the same face
at the front and the same face on top. Clockwise means as you look straight at that
face."

Then the moves, numbered, one per row: the letter in a fixed-width chip, then the
sentence. `moveSentence(move)` in `src/model/notation.ts` is the one place the words
come from:

| Move | Sentence |
|---|---|
| `R` | Turn the right face clockwise. |
| `R'` | Turn the right face anticlockwise. |
| `R2` | Turn the right face a half turn. |
| `L` `L'` `L2` | ... the left face ... |
| `U` `U'` `U2` | ... the top face ... |
| `D` `D'` `D2` | ... the bottom face ... |
| `F` `F'` `F2` | ... the front face ... |
| `B` `B'` `B2` | ... the back face ... |

A half turn goes either way, so the sentence does not say which. The face names are
the words of section 3, so "the top face" and never "the up face" on screen.

After the last move of the solution has been made, the box ends with "Done. Your
cube is solved."

---

## 9. Solve, Hint and the steps

### 9.1 Solve

Pressing Solve sends the facelets to the worker. The box says "Working it out..."
until the solution arrives, usually well under a second. Then the box lists every
move, the status line says "Solved in 19 moves.", and the current step is 0: the cube
on screen is still the entered cube, and the first move is marked as the next one.

The stickers stay where they are and stay clickable. **C12. Painting a sticker while a
solution is showing discards the solution and keeps the cube as it is on screen.**
The cube at any step is a real cube, so an edit to it is an edit to a real cube. The
solution no longer applies, so it goes, and the user is back to entering with the
cube they see. This is simpler than locking the stickers and it is what a person
expects: I changed the cube, the answer changed.

### 9.2 Stepping and playing

The control row at the top of the box:

- **Jump to start** (`|<`), **Step back** (`<`), **Play** / **Pause**, **Step
  forward** (`>`), **Jump to end** (`>|`).
- **Speed**: three radios, slow, normal, fast, remembered (section 10).

Step forward applies the next move to the cube with an animation (section 9.4) and
marks the move in the box. Step back applies the inverse of the last move (`R`
becomes `R'`, `R2` stays `R2`) with the animation and marks the move before it.
Jump to start and Jump to end set the cube to step 0 or step N with no animation.
Play steps forward at the speed's interval until the end or until Pause. Every
control is disabled while a move animates and while the view change plays. The
keyboard works too: left and right arrows step, space plays or pauses.

The speed sets both the interval and the turn's duration:

| Speed | Interval between moves | Turn duration |
|---|---|---|
| slow | 1600 ms | 900 ms |
| normal | 800 ms | 450 ms |
| fast | 400 ms | 220 ms |

The turn is always shorter than the interval, so a person sees a pause between moves
at every speed.

### 9.3 Hint

**C13. The bulb reveals one move at a time.** Nick ruled the bulb is a hint (Q16).
In a solver, a hint is "just tell me the next move". So:

- If there is no solution yet, Hint solves silently (the same worker call) and
  reveals move 1: the box shows "Hint 1: R' - Turn the right face anticlockwise."
  and the cube animates that move.
- Each further press, standing on the last move shown, reveals the next move, adds
  it to the list, and animates it. Standing further back (after Step back), a press
  makes the next move that is already on the screen, because "just tell me the
  next move" is what the button is for.
- The stepping controls work over the revealed moves only. The count of moves left
  is not shown, so a hint stays a hint, and "Done. Your cube is solved." appears only
  when every move of the solution has been made, never after the last hint shown.
- Pressing Solve at any time reveals the whole solution from the current step.

Solve and Hint share one solution and one step counter. The only difference is how
many moves the box shows.

### 9.5 The method choice

A "Method" fieldset in the control row beside "Speed", three radios in this order:
Quick solve, Fewest moves, Beginner method (spec 7.3). Remembered as `cuber.method`.
Changing it while a solution is showing discards the solution and empties the box back
to "Press Solve and the steps appear here." (C22).

With the beginner method the box changes shape: above the rows, the holding line gains
its extra sentence (7.5); a stage's name and sentence sit as a heading before that
stage's first row; a label row ("The righty move, front-right: R U R' U', twice") sits
before a macro's first move; a stage that was already done is one line ("The white
cross was already there."). The rows themselves, the marked row, the stepping, Play,
Hint and "Done. Your cube is solved." are unchanged: a beginner solution is a longer
list with headings in it.

With fewest moves the status line's sentence is 7.4's, and the box says "Working it
out..." for up to five seconds.

### 9.4 The animation

Each move turns the nine cubies of that face's layer as one, about the axis through
the centre of that face, by 90 or 180 degrees, over the turn duration with an
ease-in-out curve. The cube on screen is drawn from the model: the cubie at each
position shows the model's stickers for that position. So the animation is: rotate
the nine cubies with a web animation (the same thing a CSS transition draws, driven
from script so the snap back to zero is never animated), wait the turn duration, then apply the move
to the model and draw the new state with no rotation. The new drawing shows the same
colours in the same places the rotation left them, so nothing jumps.

`R` turns the right layer clockwise as seen from the right. The direction of every
face is checked in the pane by eye against a real cube once, and recorded in the
plan's phase notes. Tests check the model, not the animation.

---

## 10. What is remembered

Every setting and the entered cube are remembered between sessions the way the
trainer's `prefs.ts` and `theme.ts` remember theirs: in `localStorage`, read once
when the app starts, written on every change, and every read and write wrapped so a
browser that refuses storage still runs the app.

| Key | Values | Default |
|---|---|---|
| `cuber.theme` | `dark`, `light` | `dark` |
| `cuber.speed` | `slow`, `normal`, `fast` | `normal` |
| `cuber.cube` | 54 characters, one per sticker: `w y r o b g` or `-` for blank | the blank cube with standard centres |
| `cuber.method` | `quick`, `fewest`, `beginner` | `quick` (phase 7) |

The cube is written after every paint and every step. On start, a stored value that
is not exactly 54 of those characters is discarded silently and the blank cube is
shown, the rule Conquest's `recallSetup` applies to anything read back from storage.

**C15. The cube is remembered and the solution is not.** A solution takes under a
second to get again and would have to be stored with its step, which is a second
thing to get wrong. The cube is what took the user 48 clicks.

On Windows `localStorage` lives in the WebView2 profile under `%LOCALAPPDATA%\Cuber
Data\WebView2`, which survives an upgrade and goes on a ticked uninstall (section
11.3).

---

## 11. Windows: the installed app

Copied from `../London/src-tauri` with the names changed, as Simple Chess does.
Nothing about the approach changes.

### 11.1 The window

- Title "Cuber". Opens at 800 by 1000, minimum 680 by 800, centred, resizable. 800
  fits the 720 column with the padding; 1000 fits the header, the picker, the 400
  scene, the button, the status line and a box holding a nineteen-move solution,
  with room to spare. Measured at phase 4 in a browser, which gave nine pixels, and
  again at phase 5 in the installed window, which gives fifteen: the window's frame
  takes none of the 1000, so the page gets all of it, and WebView2 draws the picker
  and the box three pixels shorter each than the pane's browser does. The probe's
  numbers from the installed window are in the plan's phase 5 notes.
- Declared in `tauri.conf.json` with `"create": false` and built in `lib.rs` from
  that same declaration, so the WebView2 profile can be pointed at
  `%LOCALAPPDATA%\Cuber Data\WebView2`. The trainer's `lib.rs` says why.
- Release builds open no console window (`main.rs`).

### 11.2 The installer

- Tauri's NSIS bundler, `installMode: currentUser`, as the trainer. Unsigned, so
  SmartScreen warns on first run; accepted, as in the trainer and Simple Chess.
- The version is one number in three files (`package.json`, `tauri.conf.json`,
  `Cargo.toml`), shown in the header as `__APP_VERSION__` from Vite's `define`, and
  held together by the trainer's `version.test.ts`, copied.
- The icon set in `src-tauri/icons/` is generated with `npx tauri icon` from
  `public/icon.svg`: a corner-on cube with nine stickers on each of the three faces
  it shows, white on top, green on the left and red on the right, on the dark
  ground. The same SVG serves the PWA icons later (section 12). `tauri icon` also
  writes `android/` and `ios/` folders; this app builds for neither, so phase 5
  deleted them rather than committing icons nothing reads.

### 11.3 The uninstaller

The trainer's `installer-hooks.nsh` and `scripts/check-uninstall-hook.mjs`, copied,
with one folder: `$LOCALAPPDATA\Cuber Data`. There is no roaming data folder. The
guard (`$DeleteAppDataCheckboxState = 1` and `$UpdateMode <> 1`) is not optional, and
the check script proves all four cases against scratch folders, as the trainer's
does.

### 11.4 Capabilities

`src-tauri/capabilities/default.json` grants `core:default` and nothing else. The app
reads and writes no files. The `dialog` and `fs` plugins are not installed.

---

## 12. iPad: the Home Screen app (later)

**C21. The code is iPad-ready from the start and the Cloudflare work waits.** Nick's
brief says the iPad may come later, and his ruling (Q3) keeps the phase in the plan
unticked. What is done now, because it costs nothing and is hard to retrofit: touch
and long press (section 5.3), safe-area padding and the meta tags (section 4.2), the
fit rule (section 4.1), no Tauri import outside `src/storage` (C18), and no hover-only
control anywhere.

What waits for the phase: `vite-plugin-pwa` in Conquest's shape (`registerType:
'prompt'`, `injectRegister: null`), Conquest's `useUpdate` and `UpdateBanner` called
only when `!isDesktop()`, the manifest (name "Cuber", `display: standalone`, dark
ground `#16181c`), the icons from `tools/make-icons.mjs`, Cloudflare Pages project
`cuber` from `nick2468/Cuber` at `cuber.datacrafter.net`, and `docs/cuber-deploy.md`
adapted from Conquest's. The solver is 51 KB of JavaScript, so Simple Chess's
precache size limit does not apply.

---

## 13. Architecture and folder layout

### 13.1 The stack

React 19, TypeScript, Vite 8, vitest 4, Tauri 2 with no plugins, `oxlint`. The
versions are the trainer's `package.json` as of 2026-09-11. No chess, no engine, no
`ts-fsrs`, no `react-markdown`, no 3D library.

**C4. The cube is CSS 3D, with no library.** Twenty-six cubies as positioned
elements inside one `transform-style: preserve-3d` element, each cubie carrying only
its outside stickers as child elements. A layer turn is a CSS transform with a
transition. This works in WebView2 and Safari, needs no dependency, and jsdom can
find and click every sticker by its `data-sticker` index. A WebGL library would draw
prettier lighting, and the tests could not see any of it.

### 13.2 Folder layout

```
Cuber/
  CLAUDE.md                       house rules for sessions in this folder
  README.md
  Cuber-brief.txt                 Nick's brief, kept for history
  layout.jpg                      the drawing the screen follows
  docs/
    cuber-spec.md                 this file
    cuber-build-plan.md           the phases and their boxes
    testing.md                    the two kinds of test and the rules (phase 0)
    acceptance.md                 the acceptance walk (phase 5)
    cuber-deploy.md               Nick's Cloudflare and iPad steps (phase 6, later)
  chips/                          one prompt per build phase, written by the orchestrator
  public/
    icon.svg                      the corner-on cube icon
  scripts/
    packaged-eval.mjs             London, identical
    check-uninstall-hook.mjs      London, one folder
    probes/layout.js              the layout probe (section 15)
  src/
    main.tsx                      London, identical
    index.css                     London, identical
    globals.d.ts                  London, identical
    version.test.ts               London, identical
    model/
      colours.ts                  the six colours, their hex, their letters, the scheme from centres
      cube.ts                     the 54-sticker array, blank(), standard centres, paint, counts
      geometry.ts                 sticker index <-> (face, row, column) <-> (x, y, z); the piece tables
      facelets.ts                 colours <-> letters
      validate.ts                 checkPartial, validate (section 6.4)
      moves.ts                    the eighteen moves, inverse(), applyMove() through the library
      notation.ts                 moveSentence()
      views.ts                    viewFaces('near' | 'far'), the two movements of C2
      cube-text.ts                the 54-character remembered form (section 10)
    solver/
      vendor/cube.js, solve.js, cube.d.ts, LICENSE    cubejs 1.3.2, adapted per C5
      worker.ts                   initSolver on start, solve on request
      solver.ts                   createSolver(): ready, solve(facelets)
    storage/
      prefs.ts                    London's read, write, readOneOf, useRemembered; this app's keys
      paths.ts                    London, cut to isDesktop and LOCAL_FOLDER
    ui/
      App.tsx                     the shell: header, theme, the one screen
      theme.ts                    London, identical but for the key
      cube-context.tsx            the provider: the cube, the solution, the step, the view, the solver
      Screen.tsx                  the column: picker, scene, button, status, box
      Picker.tsx                  the six swatches with counts
      ColourMenu.tsx              the right-click and long-press menu
      Scene.tsx, scene.css        the CSS 3D cube, the view transforms, the layer animation
      Sticker.tsx                 one sticker: click, contextmenu, long press
      StatusLine.tsx
      Box.tsx, box.css            the controls, the holding line, the moves
      HeaderButtons.tsx           Reset cube (with its guard), Solve, Hint
      fit.ts                      the scene fit rule (section 4.1)
      app.css                     London, cut to what this screen uses
    dev/
      scenes.ts, use-dev-scene.ts   the dev-only scenes (section 15)
    test/
      fake-solver.ts, dom-setup.ts, dom.tsx
  src-tauri/                      London, names changed, no plugins, capabilities cut
  .claude/launch.json             cuber-dev on 5190, cuber-preview on 5191
```

**C16. Copied files are identical where unchanged, with one origin line.** Simple
Chess's rule (its S3), for the same reason: Nick prefers copied code, the three apps
may share a library later, and an `Origin:` line is what lets a reader tell a copy
from an adaptation. A file this app does not change is byte-identical to its origin
plus one `Origin: London src/ui/theme.ts, identical.` line at the top of its header
comment. An adapted file says `Origin: ... adapted: <what changed>`.

**C17. Module boundaries.** `src/model` and `src/solver` import no React and touch no
browser global except the worker in `solver.ts`. `src/ui` holds every component.
`src/storage` is the only place that reads or writes storage. The pure modules are
tested in milliseconds without a browser.

**C18. Tauri is imported lazily.** `@tauri-apps/*` is used only behind `isDesktop()`
and only from `src/storage/paths.ts`, as the trainer does. This app has no Tauri
call at all in version 1, so the rule is kept for when one arrives.

### 13.3 Code quality

These bind from the first line. They are the brief's rules, made specific:

- One implementation per algorithm. The homes: the library's `move` for every face
  turn (C6); `geometry.ts` for every "which sticker is where" (C7); `validate.ts`
  for every rule about a possible cube; `moveSentence` for every sentence; the
  `read`, `write`, `readOneOf` and `useRemembered` helpers in `prefs.ts` for every
  stored setting; `ColourMenu` for both the right-click and the long-press menu; one
  `paint(index, colour)` in the provider for every way a sticker gets a colour. Never
  write a second copy of any of these.
- A snippet that appears twice gets a home the moment it appears twice.
- `main.tsx` stays free of harness code. The dev scenes live in `src/dev/` and are
  reached through one dev-only hook (section 15).
- Every phase closes with a reuse and duplication review of the new code, refactored
  on the spot before the phase commit.
- No em dashes under `src/`. Australian English on screen and in docs. Plain hyphens.
- `tsc -b` clean and the whole suite green before every commit.

---

## 14. Testing

The trainer's two kinds of test, in two vitest projects declared in `vite.config.ts`,
under one `npx vitest run`. `docs/testing.md` is the trainer's, adapted, and its rules
bind here:

- **String tests** (`src/**/*.test.ts`) run in node: the geometry, the facelet
  mapping, the validator with the library as oracle, the moves, the sentences, the
  views, the remembered form, the fit rule, the solver adapter with a fake worker.
- **DOM tests** (`src/**/*.dom.test.tsx`) run in jsdom, mount the real app with the
  real provider and the fake solver, and drive it with `user-event`. Stickers are
  found by `data-sticker`. One DOM test installs a throwing `Worker` and asserts it
  was never constructed.
- No snapshots. No fake timers. No worker in the DOM suite. Animations take their
  duration from the provider, and tests set it to 0 so a step lands at once; `vi.waitFor`
  does the waiting.
- The whole suite under twenty seconds, including the one real-solver test (C5).
- A regression test is shown red first, against the bug, before the fix lands.
- `version.test.ts` holds the version in its three files.

**C19. The tests the app must have before it is done.** Listed here so the plan can
tick them and a review can look for them:

1. The geometry table agrees with the library's piece tables for all 8 corners and
   12 edges (string).
2. Every random library cube validates; every single swap of two differently
   coloured non-centre stickers fails (string, the two property tests of 6.4).
3. Each of rules 2 to 12 of the validator has one hand-made cube that fails it with
   its sentence (string).
4. `applyMove` then the inverse gives the cube back, for all eighteen moves (string).
5. `moveSentence` for all eighteen moves (string).
6. `viewFaces('near')` is U, F, R and `viewFaces('far')` is D, L, B (string).
7. The remembered form round-trips, and a scrambled stored value gives the blank
   cube (string).
8. The vendored solver solves a fixed cube and a random cube, proved with `move`
   and `isSolved` (string, the one slow test).
9. Painting: left click paints the selected colour; the right-click menu paints and
   clears; a colour on nine stickers is refused; the count on the swatch updates
   (DOM).
10. Validation on screen: a mirrored corner marks its three stickers and shows the
    sentence; Solve is disabled with the reason; fixing it enables Solve (DOM).
11. Solve, step and play: with the fake solver, Solve lists the moves, Step forward
    moves the cube (the model's stickers change as `applyMove` says), Step back
    undoes it, Jump to end reaches "Done." (DOM).
12. Hint reveals one move at a time and Solve reveals the rest (DOM).
13. Painting during a solution discards it and keeps the cube on screen (DOM).
14. Reset asks once, then clears to the blank cube with standard centres (DOM).
15. The cube and the speed survive a remount (DOM).
16. The view button changes the three faces shown and is disabled while the
    change plays (DOM, with the duration at 0).

---

## 15. Verification by screenshot

A change a person can see is checked by looking at it, in the same phase: the build
session drives the app in the pane, screenshots it, measures it, and records the
numbers in the plan. The method is Simple Chess's, which is the trainer's.

### 15.1 Scenes

In development builds only, the app reads the address bar for a scene:

```
http://localhost:5190/?scene=scrambled&view=far&theme=light
```

- `scene`: `blank` (the fresh cube), `solved` (every sticker its centre's colour),
  `scrambled` (the solved cube after the fixed scramble `R U R' U' F2 D L' B2 U2 R`
  applied through `applyMove`, so it is always valid), `mirrored` (`scrambled` with
  the URF corner's first two stickers swapped, which is a mirrored corner and no real
  piece, so rule 5's sentence shows with the three stickers outlined; a rotation
  would be a twist, rule 10, with nothing outlined - corrected at gate 4),
  `partial` (`scrambled` with 20 stickers blanked), `solution` (`scrambled` with
  Solve pressed, which waits for the real solver).
- `view`: `near` or `far`. `theme`: `dark` or `light`. `speed`: one of the three.

The scenes live in `src/dev/scenes.ts` and are applied by one hook, `useDevScene`,
that does nothing unless `import.meta.env.DEV` is true and a `scene` is present. The
production bundle carries none of it.

### 15.2 Screenshots

The set a UI-affecting phase captures, and records in the plan's phase notes:

| Viewport | Why |
|---|---|
| 800 by 1000 | The Windows window as it opens |
| 820 by 1180 | An iPad held upright |
| 1180 by 820 | An iPad held sideways: the fit rule shrinks the scene |

Each in both themes where the phase touched the look, and in both views where it
touched the cube.

### 15.3 The layout probe

`scripts/probes/layout.js` is one JavaScript expression that returns, as JSON, the
bounding boxes of `.app-header`, `.picker`, `.scene`, `.status`, `.box` and
`document.documentElement.scrollWidth` beside `window.innerWidth`. It is evaluated
in the pane through the JavaScript tool during development, and against the
installed app through `node scripts/packaged-eval.mjs @scripts/probes/layout.js`
with the window started under
`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS="--remote-debugging-port=9333"`.

**C20. The two numbers that must hold.** `scrollWidth` never exceeds `innerWidth` at
any of the three viewports, and the scene is square and at least 280 px at each.
Every UI-affecting phase records the probe's output in the plan, and a review re-runs
it.

---

## 16. Left out on purpose, and later

Each of these was considered and is deliberately not in version 1, so that "we chose
not to" never gets confused with "we forgot". The first three are planned for later.

| Left out | Why, and when |
|---|---|
| **Entering the cube from a photo** | Nick's brief calls it a possible enhancement. Later phase: one face at a time, a 3 by 3 grid overlay on the camera image, the app reads the nine colours by nearest sticker colour, the user corrects. Needs a design of its own. |
| **The beginner method** | Ruled in on 2026-09-14 (Q18) with the fewest-moves method: section 7.3 to 7.5, phase 7. No longer left out. |
| **The iPad Home Screen app** | Section 12. In the plan as the last phase, unticked, until Nick asks. |
| **A cube with non-standard colours** | Raised by Nick 2026-09-12: his second cube has different colours. Two cases. (a) The same six colours in a different arrangement works TODAY: the centres are editable and the scheme is read from them (5.3, C8). (b) Different colours altogether needs a "Cube colours" setting: six colour inputs (`<input type="color">`, native on WebView2 and iPad) and six short names, one per slot, remembered as `cuber.colours`, with a "Standard colours" button. The model's six colour names become slot identifiers (they already are: `hexOf` is the one home of the hex values and the validator only needs six distinct classes), and the validator's sentences and the stickers' accessible names take the slot's name. Nothing in the solver, the validator, the geometry or the animation changes, which is why it waits until after acceptance: it is a presentation feature that reworks nothing, and doing it before the installer would delay the finished app for a change that costs the same later. Later phase 7. |
| Scramble button | A dev scene does it for testing. A user has a real cube to scramble. |
| Whole-cube rotations in the solution (`x`, `y`, `z`) | The solver never emits them and the holding rule (C11) makes them unnecessary. |
| Timer, move counter, solve history | Not asked for. Not a speed-cubing app. |
| Keyboard colour shortcuts | Not asked for. Cheap to add later. |
| Undo for painting | The right-click menu's Clear and repainting cover it. |
| Sounds | Not asked for. |
| Auto-update on Windows, code signing | Deferred in the trainer's register; unchanged here. |

---

## 17. Acceptance

The app is done when every line below is true, checked and recorded in
`docs/acceptance.md`.

1. **The screen**: one column with the header (name, version, Reset cube, Solve,
   Hint, theme toggle), the picker, the cube, the view button, the status line and
   the box, laid out as section 4 says, in both themes, at the three viewports of
   section 15, with the probe's two numbers holding (C20).
2. **Entering**: every sticker can be painted by left click, by the right-click menu
   and by long press; the swatch counts are right; a tenth sticker of a colour is
   refused on a blank sticker and allowed over a filled one, with the count sentence
   saying what is off (C9 as ruled at gate 3); the centres are pre-filled and
   editable.
3. **The views**: "Show the other side" plays the two slow movements with their
   sentences and shows Down, Left and Back; "Show the first side" plays them back.
4. **Validation**: every rule of section 6.4 fires with its sentence on a hand-made
   cube; the offending stickers are outlined; Solve is disabled with the reason and
   enabled when the cube is fixed.
5. **Solving**: a real scrambled cube entered from a physical cube is solved in 22
   moves or fewer; following the moves on the physical cube solves it. Nick does this
   check with his son's cube.
6. **Steps**: the five controls and the three speeds work as section 9.2; the cube on
   screen turns the right way for every face; the keyboard works.
7. **Hint**: reveals one move at a time; Solve reveals the rest.
8. **Remembered**: the cube, the theme and the speed survive closing and reopening
   the app.
9. **Windows**: the installer builds, installs for the current user, opens an 800 by
   1000 window titled Cuber with the version in the header, and the uninstaller's
   ticked box removes `Cuber Data` and nothing else, proved by the check script's
   four cases.
10. **Tests**: the suite is green under twenty seconds, both projects, with the
    sixteen tests of C19 present; `tsc -b` clean; no em dashes under `src/`; the
    version held in three files.
11. **Docs**: this document, the plan with every box ticked or its gap recorded,
    `testing.md`, `acceptance.md` and `CLAUDE.md` all current.
