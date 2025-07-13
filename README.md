# FretForge 🎸

A modern, interactive guitar fretboard visualizer for learning scales and chords with customizable tunings, color-coded visualization, and export functionality.

## ✨ Features

- **Interactive Fretboard**: Visualize scales and chords on a responsive guitar fretboard
- **Customizable Tuning**: Support for 6, 7, and 8-string guitars with custom tunings
- **Scale & Chord Library**: Built-in support for major/minor scales, pentatonic scales, blues scales, and all common chord types
- **Color-Coded Visualization**: Each scale/chord gets its own color with support for overlapping notes
- **Blend & Split Modes**: Choose between blended colors or split visualization for overlapping notes
- **Export Functionality**: Export your fretboard as high-resolution PNG images
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Persistent Settings**: All preferences saved automatically via cookies

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fretforge.git
cd fretforge

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🎵 How to Use

### Adding Scales/Chords

1. Use the **Scale Manager** at the bottom of the page
2. Select a **Root Note** (C, C#, D, etc.)
3. Choose a **Scale Type** (Major, Minor, Pentatonic, etc.) or **Chord Type** (Major, Minor, 7th, etc.)
4. Pick a **Color** for your scale/chord
5. Click **Add**

### Customizing the Fretboard

- **Settings Menu** (gear icon): Adjust number of frets, strings, tuning, and display options
- **Note Display**: Toggle between sharps (♯) and flats (♭)
- **Overlap Mode**: Choose "Blend" or "Split" for overlapping notes
- **Export**: Click "Export PNG" to save your fretboard as an image

### Mobile Usage

- Rotate your device to landscape mode for the best experience
- All features work on mobile devices
- Touch-friendly interface

## 🎸 Supported Musical Elements

### Scales

- **Diatonic**: Major and Minor scales
- **Pentatonic**: Major and Minor pentatonic scales
- **Blues**: Major and Minor blues scales

### Chords

- **Triads**: Major, Minor, Diminished, Augmented
- **7th Chords**: Major 7th, Minor 7th, Dominant 7th, Diminished 7th, Half-diminished 7th

### Tunings

- **Standard**: 6-string (EADGBE), 7-string, 8-string
- **Custom**: Any tuning you want to set

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Export**: html-to-image library
- **Fonts**: Monoton (for branding)

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using [Cursor](https://cursor.sh) - the AI-powered code editor
- This entire project was vibe coded with Cursor's AI assistance
- Inspired by the need for better guitar learning tools

---

**FretForge** - Where music theory meets visual learning 🎸
