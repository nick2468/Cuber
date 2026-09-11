/**
 * Origin: written for this app. The part of cubejs 1.3.2 the app uses (spec C5).
 *
 * `cube.js` defines the class; `solve.js` adds `initSolver` and `solve` to it
 * when it is imported. So a module that solves imports both, `cube.js` for
 * the class and `solve.js` for what it adds. Nothing else in the library is
 * declared, so nothing else can be reached by accident.
 */
declare class Cube {
  /** A cube from 54 facelets. Does NOT validate: a bad string makes a broken cube. */
  static fromString(facelets: string): Cube
  /** A random cube that is always solvable. Needs no `initSolver`. */
  static random(): Cube
  /** Builds the solver's tables. About a second on this machine. Added by `solve.js`. */
  static initSolver(): void
  asString(): string
  /** Applies moves written in Singmaster notation, separated by spaces. */
  move(moves: string): Cube
  /** The moves that solve it, separated by spaces, or "" when solved. Added by `solve.js`. */
  solve(maxDepth?: number): string
  isSolved(): boolean
}

export default Cube
