# TerriReplay - Teritorial.io Replay Emulator

A web-based replay emulator for the game Teritorial.io created by Dr.ViktorExe.

## Features

- Paste a Teritorial.io replay link and watch it automatically
- Automatically selects the correct game version for the replay
- Automates the replay playback process
- Minimize/maximize the game view
- Clean and responsive user interface

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/TerriReplay.git
   cd TerriReplay
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## How to Use

1. Paste a valid Teritorial.io replay link in the input field
2. Click "Load Replay" button
3. The emulator will automatically:
   - Select the appropriate game version
   - Open the game menu
   - Click the replay button
   - Paste your replay link
   - Launch the replay
4. Use the minimize/maximize buttons to adjust the view

## Project Structure

```
TerriReplay/
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css       # Stylesheet
│   └── js/
│       └── main.js         # JavaScript for automation
├── templates/
│   └── index.html          # Main HTML template
└── emulated_versions/      # Game version files
    └── version*.html       # Various game versions
```

## Credits

Created by Dr.ViktorExe

