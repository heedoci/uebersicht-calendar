# MyCalendar Übersicht Widget

A lightweight monthly calendar widget for macOS, built for [Übersicht](https://tracesof.net/uebersicht/).

It reads events from the macOS Calendar app through `icalBuddy` and displays them directly on the desktop.

## Features

- Integrates with calendars available in macOS Calendar via `icalBuddy`
- Previous / next month navigation
- One-click return to the current month
- Highlights today's date
- Displays events directly inside each day
- Shows full daily event details on hover
- Distinguishes calendars with different colors
- Opens the Calendar app when an event is clicked
- Draggable widget position
- Remembers the last saved position
- Defaults to the top-right corner of the screen
- Double-click the header to reset the widget to the top-right corner
- No background blur
- Automatically refreshes every 15 minutes

## Requirements

Install Übersicht and `icalBuddy` with Homebrew:

```bash
brew install --cask ubersicht
brew install ical-buddy
```

Then run:

```bash
icalBuddy calendars
```

If macOS asks for Calendar access, allow it.

## Installation

Copy the `MyCalendar.widget` folder into:

```text
~/Library/Application Support/Übersicht/widgets/
```

Then open Übersicht and select **Refresh All Widgets**.

## Project Structure

```text
MyCalendar.widget/
├── index.jsx
├── calendar_data.py
└── VERSION
```

- `index.jsx` — Übersicht UI, month navigation, hover details, and drag behavior
- `calendar_data.py` — reads calendar events through `icalBuddy`, handles settings, and stores widget position
- `VERSION` — current widget version

## Configuration

On first run, the widget creates:

```text
~/Library/Application Support/MyCalendarWidget/config.json
```

Example:

```json
{
  "hiddenCalendars": [
    "Birthdays",
    "Holidays"
  ],
  "maxEventsPerDay": 3
}
```

### `hiddenCalendars`

Add exact calendar names here to hide them from the widget.

You can check the calendar names available to `icalBuddy` with:

```bash
icalBuddy calendars
```

### `maxEventsPerDay`

Controls how many events are shown directly inside each day cell.

Additional events remain available in the hover detail panel.

## Position

Drag the widget by its header to move it.

The saved position is stored in:

```text
~/Library/Application Support/MyCalendarWidget/position.json
```

Double-click the header to reset the widget to the top-right corner.

## Troubleshooting

To verify that `icalBuddy` can access your calendars:

```bash
icalBuddy calendars
```

To test the widget data source directly:

```bash
python3 "$HOME/Library/Application Support/Übersicht/widgets/MyCalendar.widget/calendar_data.py" fetch
```

A successful response should contain:

```json
{
  "ok": true,
  "backend": "icalBuddy"
}
```

## Notes

This repository contains the cleaned-up version of the widget intended for normal use, rather than every intermediate development version.
