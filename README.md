# SpecialEdScreen 🎓

A classroom management dashboard designed for special education teachers. Features station rotations with animated transitions, visual timers, and various support tools.

![SpecialEdScreen Dashboard](screenshot.png)

## Features

- **🧩 Multi-Layout Tabs** - Create multiple classroom layouts with separate data per tab
- **🗺️ Interactive Floor Plan** - Drag/resize stations and manage students/stations in one place
- **👥 Global Student Roster** - Manage students once, then add to any layout
- **🔄 Station Groups** - Live groups view synced with the floor plan rotation
- **⏱️ Rotation Timer** - Multiple styles (Ring, Sand, Classic, Space, Ocean, Arcade) with auto-rotation
- **🔊 Rotation Sounds** - Built-in sounds plus custom uploads
- **🎯 Goal Ladder** - Track progress with editable steps and visual rungs
- **📋 First/Then Board** - Visual schedule with emoji picker and comic-style layout
- **⭐ Class Stars** - Reward point tracker
- **⏰ Countdown Widget** - Count down to any event
- **📢 Banner + Quick Messages** - Bold, high-visibility messages for the class
- **🎨 Widget Theming** - Per-widget fill/border/text colors and style presets (Normal, Glass, Neon, Aurora)
- **▶️ Media Widgets** - Embed Google Slides and YouTube videos

## Installation

```bash
# Clone the repository
git clone https://github.com/JustMJZ/specialedscreen.git

# Navigate to project folder
cd specialedscreen

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Usage

### Edit Mode
Click the **✏️ Edit** button to:
- Drag stations to reposition them
- Resize stations by dragging the corner handle
- Add custom boxes (TV, door, furniture, etc.)
- Edit box properties (icon, label, color)

### Timer Controls
- **▶ Start / ⏸ Pause** - Control the timer
- **↺** - Reset timer to selected duration
- **⏭ Next** - Manually trigger rotation
- **🔁** - Toggle auto-repeat (automatically rotates when timer ends)

### Customization
- Click most widgets to edit their content
- Use the 🎨 menu on a widget to set fill, border, text, and style
- Use the timer options to switch styles and sounds

## Live Demo

GitHub Pages: https://justmjz.github.io/specialedscreen/

## Tech Stack

- React 18
- Tailwind CSS
- Web Audio API (for sounds)

## License

MIT License - Feel free to use and modify for your classroom!

## Contributing

Pull requests welcome! Please feel free to submit issues for bugs or feature requests.

---

Made with ❤️ for special education teachers
