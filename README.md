# SpecialEdScreen

A free, browser-based classroom management dashboard built for special education teachers. Runs entirely in the browser — no account, no server, no installation required.

**Live app:** https://justmjz.github.io/specialedscreen/

---

## What it does

SpecialEdScreen gives teachers a single, customizable screen they can project or display during the school day. Everything on it is drag-and-drop and click-to-edit, designed for use during live instruction.

### Widgets

| Widget | What it does |
|---|---|
| **Floor Plan** | Interactive classroom map. Drag stations to reposition, resize them, add furniture/decor boxes. Drag student avatars between stations in real time. |
| **Timer & Controls** | Visual countdown timer with 6 styles (Ring, Sand, Classic, Space, Ocean, Arcade). Auto-rotates students through stations when time is up. |
| **Station Groups** | Live view of which students are at which station, synced with the floor plan. |
| **First / Then Board** | Visual schedule card — "First we do X, then Y." Supports emoji and custom images. |
| **Text Box** | Rich text display for instructions, schedules, or rules. Supports plain text, bullet lists, numbered lists, text highlighting, adjustable font/size, and text-to-speech. Teachers can also print directly from the widget. |
| **Feelings Check-In** | Morning meeting widget where students can indicate how they're feeling. |
| **Voice Level** | Visual noise level indicator (0–5 scale) to display expected volume. |
| **Goal Ladder** | Track class or individual progress toward a goal with editable steps and visual rungs. |
| **Token Board** | Class reward tracker. Award tokens toward a group goal. |
| **Countdown** | Count down to any event (lunch, end of day, special activity). |
| **Banner** | Full-width high-visibility message bar at the top of the screen. |
| **Quick Message** | Prominent one-line message for fast classroom communication. |
| **Clock** | Live digital clock. |
| **Google Slides** | Embed any Google Slides presentation directly on the dashboard. |
| **YouTube Video** | Embed any YouTube video. |

### Layout & customization

- **Multi-layout tabs** — Create separate layouts for different periods, subjects, or groups. Each tab has its own independent data.
- **Drag-and-drop grid** — Resize and reposition any widget freely on a 12-column grid.
- **Widget theming** — Per-widget color controls (fill, border, text) and style presets: Normal, Glass, Neon, Aurora.
- **Welcome template** — New users get a one-click starter layout with essential widgets pre-configured.
- **Kiosk mode** — Hides all teacher controls so the dashboard can be left on a student-facing display without accidental edits.

### Student management

- **Global roster** — Add students once; they're available across all layouts.
- **Student avatars** — Each student gets initials, an emoji, or a photo.
- **Drag to reassign** — In floor plan mode, drag a student avatar onto a different station to reassign them instantly.

### Other features

- **Rotation sounds** — Built-in chimes plus custom audio upload with volume control.
- **Keyboard shortcuts** — Press `?` anywhere in the app for a shortcut reference.
- **Backup & restore** — Export your full setup to a JSON file and import it on any device.
- **Performance mode** — Disables animations for lower-powered devices.
- **Fully offline** — No data ever leaves the browser. Everything saves to localStorage automatically.

---

## Running locally

```bash
git clone https://github.com/JustMJZ/specialedscreen.git
cd specialedscreen
npm install
npm start
```

Opens at `http://localhost:3000/specialedscreen`

```bash
npm run build    # Production build
npm run deploy   # Deploy to GitHub Pages
npm test         # Run test suite (121 tests)
```

---

## Tech stack

- React 18 (Create React App)
- Tailwind CSS v3
- react-grid-layout
- Web Audio API (rotation sounds)
- Web Speech API (text-to-speech)
- Code splitting with React.lazy — loads fast on classroom hardware

---

## License

MIT — free to use, modify, and share.
