# SpecialEdScreen 🎓

A classroom management dashboard designed for special education teachers. Features station rotations with animated transitions, visual timers, and various support tools.

![SpecialEdScreen Dashboard](screenshot.png)

## Features

- **🗺️ Interactive Floor Plan** - Drag and resize station areas to match your classroom layout
- **⏱️ Rotation Timer** - Customizable timer with seconds support and auto-rotation
- **🔊 Rotation Sounds** - Choose from 10 distinct sounds (chime, bell, whistle, gong, etc.)
- **👥 Student Management** - Add/edit students and assign them to groups
- **🎲 Random Student Picker** - Randomly select students for participation
- **🚦 Traffic Light** - Visual behavior indicator
- **🔈 Voice Level** - Show expected voice levels (Silent, Whisper, Talk, Loud)
- **📋 First/Then Board** - Visual schedule support
- **⭐ Class Stars** - Reward point tracker
- **⏰ Countdown Widget** - Count down to lunch, recess, or any event
- **📋 Quick Messages** - Display quick reminders to the class

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/specialedscreen.git

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
- Click on most widgets to edit them
- Use the dropdown to change rotation sounds
- Click ✏️ on First/Then to change activities

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
