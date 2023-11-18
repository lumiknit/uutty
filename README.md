# uutty

(uutty is under development. It's not ready for production use.)

uutty (double-u tty) is a web-based terminal emulator.

## Goal & Progress

- [ ] Emulate a xterm correctly with SolidJS & DOM
- [ ] Better font rendering
  - [x] Ligatures
  - [ ] Powerline symbols
- [ ] Support for proportional font
  - [ ] Switch proportional / monospace font
  - [ ] Elastic tabstop?
- [ ] Some utilities
  - [ ] Switch color scheme
- [ ] Improve BE
  - Support bun-based BE for performance?
  - Support rust-based BE for small-size server?
- [ ] Support for mobile?

### Not a goal

- Use canvas or WebGL for rendering
  - This is already done by xterm.js.
  - And it doesn't support proportional font or ligatures on browsers..

## Dependency

- Node 18.x or later
  - or Bun 1.0.11.. tested

## Build and Run

- Install dependencies each of `front` and `back` using,
  - `[p]npm install` or `bun install`
- Build `front` using
  - `{npm|pnpm|bun} run build`
  - It'll create `/front-dist` directory, which will be statically served.
- Go to `back` and start server!
  - `{npm|pnpm|bun} run start`
