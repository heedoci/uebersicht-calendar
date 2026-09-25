#!/usr/bin/env python3
import datetime as dt
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

APP_DIR = Path.home() / "Library" / "Application Support" / "MyCalendarWidget"
CONFIG_FILE = APP_DIR / "config.json"
POSITION_FILE = APP_DIR / "position.json"
DEFAULT_CONFIG = {"hiddenCalendars": [], "maxEventsPerDay": 3}
PLACEMENT_VERSION = 2

def ensure_dir():
    APP_DIR.mkdir(parents=True, exist_ok=True)

def read_json(path, default):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def write_json(path, value):
    ensure_dir()
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
    tmp.replace(path)

def load_config():
    if not CONFIG_FILE.exists():
        write_json(CONFIG_FILE, DEFAULT_CONFIG)
        return dict(DEFAULT_CONFIG)
    value = read_json(CONFIG_FILE, {})
    result = dict(DEFAULT_CONFIG)
    if isinstance(value, dict):
        result.update(value)
    return result

def load_position():
    p = read_json(POSITION_FILE, {})
    try:
        if int(p.get("placementVersion", 0)) != PLACEMENT_VERSION:
            return {"saved": False, "left": 18, "top": 18}
        return {
            "saved": True,
            "left": max(0, int(p.get("left", 18))),
            "top": max(0, int(p.get("top", 18))),
        }
    except Exception:
        return {"saved": False, "left": 18, "top": 18}

def save_position(left, top):
    value = {
        "left": max(0, int(round(float(left)))),
        "top": max(0, int(round(float(top)))),
        "placementVersion": PLACEMENT_VERSION,
    }
    write_json(POSITION_FILE, value)
    return value

def find_icalbuddy():
    for path in (
        shutil.which("icalBuddy"),
        "/opt/homebrew/bin/icalBuddy",
        "/usr/local/bin/icalBuddy",
        "/opt/local/bin/icalBuddy",
    ):
        if path and os.path.isfile(path) and os.access(path, os.X_OK):
            return path
    return None

def month_bounds(year, month):
    start = dt.datetime(year, month, 1)
    end = dt.datetime(year + 1, 1, 1) if month == 12 else dt.datetime(year, month + 1, 1)
    return start, end

def parse_datetime(value):
    value = (value or "").strip()
    dates = re.findall(r"\b(20\d{2}-\d{2}-\d{2})\b", value)
    times = [f"{h}:{m}" for h, m in re.findall(r"\b([01]\d|2[0-3]):([0-5]\d)\b", value)]
    if not dates:
        return None

    start_date = dates[0]
    end_date = dates[-1]
    all_day = not times

    try:
        if all_day:
            start = dt.datetime.fromisoformat(start_date + "T00:00")
            end = dt.datetime.fromisoformat(end_date + "T23:59")
        else:
            start = dt.datetime.fromisoformat(start_date + "T" + times[0])
            end_time = times[1] if len(times) > 1 else times[0]
            end = dt.datetime.fromisoformat(end_date + "T" + end_time)
            if end < start:
                end += dt.timedelta(days=1)
    except Exception:
        return None

    return start, end, all_day

def expand_days(start, end):
    days = []
    cur = start.date()
    while cur <= end.date():
        days.append(cur.isoformat())
        cur += dt.timedelta(days=1)
    return days

def parse_output(output):
    events = []
    calendars = []
    current_calendar = "Calendar"

    for raw in output.splitlines():
        line = raw.strip()
        if not line or line == "__SECTION__":
            continue

        if line.startswith("__EVENT__"):
            parts = line[len("__EVENT__"):].strip().split("\t")
            title = parts[0].strip() if parts else "(제목 없음)"
            datetime_text = parts[1].strip() if len(parts) > 1 else ""
            location = "\t".join(parts[2:]).strip() if len(parts) > 2 else ""
            parsed = parse_datetime(datetime_text)
            if not parsed:
                continue
            start, end, all_day = parsed
            events.append({
                "calendar": current_calendar,
                "title": title or "(제목 없음)",
                "location": location,
                "start": start.isoformat(timespec="minutes"),
                "end": end.isoformat(timespec="minutes"),
                "allDay": all_day,
                "days": expand_days(start, end),
            })
        else:
            current_calendar = line
            if line not in calendars:
                calendars.append(line)

    events.sort(key=lambda e: (e["start"], not e["allDay"], e["calendar"], e["title"]))
    return events, calendars

def fetch_month(year, month):
    binary = find_icalbuddy()
    if not binary:
        raise RuntimeError("icalBuddy가 없습니다. brew install ical-buddy 후 icalBuddy calendars 를 실행하세요.")

    cfg = load_config()
    start, end = month_bounds(year, month)
    start_text = start.astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    end_text = (end - dt.timedelta(seconds=1)).astimezone().strftime("%Y-%m-%d %H:%M:%S %z")

    cmd = [
        binary,
        "-cf", "",
        "-sc",
        "-npn",
        "-nrd",
        "-df", "%Y-%m-%d",
        "-tf", "%H:%M",
        "-iep", "title,datetime,location",
        "-po", "title,datetime,location",
        "-ps", "|\t|\t|",
        "-b", "__EVENT__ ",
        "-ab", "__EVENT__ ",
        "-ss", "__SECTION__",
    ]

    hidden = [str(x).strip() for x in cfg.get("hiddenCalendars", []) if str(x).strip()]
    if hidden:
        cmd.extend(["-ec", ",".join(hidden)])

    cmd.extend([f"eventsFrom:{start_text}", f"to:{end_text}"])

    proc = subprocess.run(cmd, text=True, capture_output=True, timeout=20)
    if proc.returncode != 0:
        raise RuntimeError((proc.stderr or proc.stdout or "icalBuddy failed").strip())

    events, calendars = parse_output(proc.stdout)
    return {
        "ok": True,
        "backend": "icalBuddy",
        "year": year,
        "month": month,
        "events": events,
        "calendars": calendars,
        "count": len(events),
        "maxEventsPerDay": max(1, min(6, int(cfg.get("maxEventsPerDay", 3)))),
        "fetchedAt": dt.datetime.now().astimezone().isoformat(timespec="minutes"),
        "widgetPosition": load_position(),
        "configPath": str(CONFIG_FILE),
    }

def main():
    ensure_dir()
    command = sys.argv[1] if len(sys.argv) > 1 else "fetch"

    if command == "save-position" and len(sys.argv) >= 4:
        print(json.dumps(save_position(sys.argv[2], sys.argv[3]), ensure_ascii=False))
        return

    now = dt.datetime.now()
    if command == "fetch":
        year = int(sys.argv[2]) if len(sys.argv) > 2 else now.year
        month = int(sys.argv[3]) if len(sys.argv) > 3 else now.month
    else:
        year, month = now.year, now.month

    try:
        print(json.dumps(fetch_month(year, month), ensure_ascii=False))
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "year": year,
            "month": month,
            "events": [],
            "calendars": [],
            "count": 0,
            "error": f"{type(exc).__name__}: {exc}",
            "widgetPosition": load_position(),
            "configPath": str(CONFIG_FILE),
        }, ensure_ascii=False))

if __name__ == "__main__":
    main()
