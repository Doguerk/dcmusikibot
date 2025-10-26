# Color Flow

Fast, accessible, ADHD-friendly, ultra-addictive HTML5 Canvas game. Tap/click or press SPACE to cycle the collector color and catch matching blocks.

- Short in-game hint: “Tap/click or press SPACE to cycle color. Match incoming blocks.”
- Runs as static files. Just open `index.html` or serve with `python -m http.server`.
- PWA basics included (manifest + service worker with offline fallback).
- Accessibility: color-blind mode (patterns), keyboard controls, focus styles, haptics toggle.
- Persistence: best score saved in `localStorage` (in-memory fallback if unavailable).
- Leaderboard: client-only stub with documented API shape.
- Integration: parent can `postMessage({type:"SET_MODE", mode:"pattern"})` to toggle color-blind mode.

## Run locally

- Easiest: double-click `index.html` or `play/index.html`.
- Or serve: `cd color-flow && python -m http.server 8000` then open `http://localhost:8000/color-flow/`.

## Files and structure

```
/color-flow/
  index.html                # Landing
  about.html                # Mechanics + accessibility notes
  leaderboard.html          # Client-only stub leaderboard
  /play/
    index.html              # Game page
    game-loader.js          # Bootstraps modules
  /assets/
    sfx_catch.wav           # Placeholder assets (not required at runtime)
    sfx_combo.wav
    sfx_mult_up.wav
    sfx_gameover.wav
    icon_patterns.png
    logo.svg
  /css/
    styles.css
  /js/
    config.js               # All constants and tuning helpers
    main.js                 # Site shell
    game.js                 # Core game loop and logic
    ui.js                   # HUD and overlay
    audio.js                # WebAudio beeps (fallback-friendly)
    storage.js              # localStorage wrapper
    leaderboard-client.js   # Client-only stub
    tests-runner.js         # Simple harness
  manifest.json
  service-worker.js
  README.md
  DEPLOY.md
  CHANGELOG.md
  /tests/
    test_scoring.js
    test_multiplier.js
    test_spawn_logic.js
```

## Gameplay rules (exact)

- Collector on the left shows one color at a time; blocks spawn right and move left along a single lane.
- Input: tap/click anywhere or press SPACE to cycle collector color (circular order).
- When a block reaches the collector line:
  - If `block.color == collector.color` → catch: remove, award points, increment streak.
  - Else → immediate game over.

## Scoring and combo (exact)

- `basePoints = 10`
- `streak` increments by 1 per consecutive catch; resets on game over.
- `multiplier = min(5, 1 + Math.floor(streak / 3) * 0.5)`
- `pointsForCatch = round(basePoints * multiplier * (1 + min(streak, 100)/100))`
- Displays live Score, Best (persisted), and Current Multiplier.

## Difficulty progression

- Time-based: every `DIFFICULTY_STEP_SECONDS = 10` seconds.
- Linear by default; optional exponential via `DIFFICULTY_MODE = 'exp'` and `DIFFICULTY_EXPONENT`.
- Start/limits:
  - `spawnIntervalStart = 900ms`, `spawnIntervalMin = 250ms`
  - `blockSpeedStart = 200px/s`, `blockSpeedMax = 800px/s`
- Never go below/above min/max. Tunables in `js/config.js`.

## Feedback & Rewards

- On catch: particle burst, score pop, short catch SFX. Multiplier-up (every 3 streaks) uses a special SFX and larger burst.
- On game over: gameOver SFX; overlay shows Score and Best with CTA to Leaderboard.
- Mobile: optional short vibration on catch if permitted.

## Accessibility

- Color-blind mode: patterns replace colors. Toggle via UI or integration message.
- Keyboard: SPACE to cycle, TAB to navigate, ARIA roles are on HUD and overlay.
- Haptics and sound toggles persist.

## Integration via postMessage

The game listens for messages from its parent window:

```js
parent.postMessage({ type: 'SET_MODE', mode: 'pattern' }, '*'); // switches to color-blind patterns
```

- Modes: `pattern` (color-blind ON), anything else (OFF).
- On load, the play page posts `{ type: 'COLOR_FLOW_READY' }` to its parent as a signal.

## Tests

- Node: `node js/tests-runner.js` (requires Node that can require commonjs from these files)
- Browser: Open `play/index.html` (game) or create a simple test page that loads `js/config.js` and `js/tests-runner.js`.
- Covered:
  - scoring calc for streak `0,1,3,10,100`
  - multiplier math and cap
  - spawn interval and speed progression (time-based)

## Deploy

See `DEPLOY.md` for GitHub Pages and Netlify steps.

## Replacing placeholder assets

Place your own audio in `/assets/` and alter `audio.js` to load or decode them if desired. By default, the game uses WebAudio beeps to avoid autoplay/decoding issues.

## Leaderboard API (STUB)

- `POST /leaderboard { name, score }` → use `LeaderboardClient.postScore({name,score})` (client-only storage)
- `GET /leaderboard?top=10` → use `LeaderboardClient.getTop({top})`

To use a real backend, replace calls in `leaderboard.html` and in the post-game flow with your fetch() calls.

## Swapping in another game build

- Replace `js/game.js` with your implementation that keeps the same API surface used by `play/game-loader.js` (expects default export `createGame({ canvas })` returning `{ restart, togglePause }`).
- Keep or adapt the HUD element IDs and the `postMessage` contract.

## Tuning constants

All tunables are in `js/config.js`. See `CHANGELOG.md` for versioned tuning notes.
