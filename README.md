# MyCalendar Übersicht Widget

A lightweight monthly calendar widget for macOS, built for [Übersicht](https://tracesof.net/uebersicht/).

It reads events from the local macOS Calendar database through `icalBuddy`. Optionally, it can mirror the colors already assigned to calendars in Calendar.app by using `ical-guy` as a local EventKit color provider.

## Features

- Monthly calendar with previous / next month navigation
- One-click return to the current month
- Highlights today's date
- Displays events directly inside each day
- Persistent **Hover ON / OFF** toggle for daily detail popups
- Uses native macOS Calendar colors when available
- Falls back to configurable event / holiday colors when native color lookup is unavailable
- Optional exact per-calendar color overrides
- Removes stray `SECTION`, `:`, and `：` separator artifacts from calendar headings
- Opens Calendar.app when an event is clicked
- Draggable position with persistence
- Defaults to the top-right corner
- Double-click the header to reset its position
- Automatically refreshes every 15 minutes
- No background blur

## Requirements

Install Übersicht and `icalBuddy`:

```bash
brew install --cask ubersicht
brew install ical-buddy
```

To mirror colors from Calendar.app, optionally install `ical-guy`:

```bash
brew install itspriddle/brews/ical-guy
```

The widget still works without `ical-guy`; it uses fallback colors instead.

## Privacy and permissions

This public repository contains **no account credentials, API keys, calendar contents, user-specific calendar names, saved positions, or macOS permission grants**.

Calendar access happens locally on the Mac at runtime. `icalBuddy` and the optional `ical-guy` helper may require macOS Calendar read permission when first run. The widget does not upload calendar data to a remote service.

Runtime settings are stored outside the repository:

```text
~/Library/Application Support/MyCalendarWidget/
```

Those files are local to each Mac and are not committed here.

## Installation

Copy `MyCalendar.widget` to:

```text
~/Library/Application Support/Übersicht/widgets/
```

Then select **Refresh All Widgets** in Übersicht.

## Project structure

```text
MyCalendar.widget/
├── index.jsx
├── calendar_data.py
└── VERSION
```

- `index.jsx` — UI, navigation, colors, hover toggle, and drag behavior
- `calendar_data.py` — local event/color reading plus local preference persistence
- `VERSION` — current widget version

## Configuration

On first run, the widget creates:

```text
~/Library/Application Support/MyCalendarWidget/config.json
```

Default options:

```json
{
  "hiddenCalendars": [],
  "maxEventsPerDay": 3,
  "defaultEventColor": "#5EA7FF",
  "holidayColor": "#FF6464",
  "holidayCalendarKeywords": ["공휴일", "휴일", "holiday"],
  "calendarColors": {},
  "useNativeCalendarColors": true,
  "hoverEnabled": true
}
```

### Color priority

1. Exact manual override from `calendarColors`
2. Native Calendar.app color, when `ical-guy` is available
3. Fallback holiday / default event colors

For normal use, leave `calendarColors` empty and keep `useNativeCalendarColors` set to `true`.

## First run

Check local Calendar access:

```bash
icalBuddy calendars
```

If native Calendar colors are enabled:

```bash
ical-guy events --format json
```

These commands only initialize/check local Calendar access. No credentials or calendar data are stored in this repository.

## Manual data test

```bash
python3 "$HOME/Library/Application Support/Übersicht/widgets/MyCalendar.widget/calendar_data.py" fetch
```

A successful response contains:

```json
{
  "ok": true,
  "backend": "icalBuddy"
}
```

## Version

Current public source: **v1.4 — native Calendar colors + hover toggle**.
