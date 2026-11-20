import ctypes
import subprocess
import sys


def _run(cmd):
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=2)
    return out.stdout.strip()


def get_active_window():
    """Title of the window in front right now, or '' if we can't tell."""
    try:
        if sys.platform.startswith("win"):
            user32 = ctypes.windll.user32
            hwnd = user32.GetForegroundWindow()
            n = user32.GetWindowTextLengthW(hwnd)
            buf = ctypes.create_unicode_buffer(n + 1)
            user32.GetWindowTextW(hwnd, buf, n + 1)
            return buf.value
        if sys.platform == "darwin":
            app_name = _run(["osascript", "-e",
                             'tell application "System Events" to get name of '
                             'first application process whose frontmost is true'])
            tab = ""
            if app_name in ("Google Chrome", "Brave Browser", "Microsoft Edge", "Arc"):
                tab = _run(["osascript", "-e",
                            f'tell application "{app_name}" to get title of active tab of front window'])
            elif app_name == "Safari":
                tab = _run(["osascript", "-e",
                            'tell application "Safari" to get name of current tab of front window'])
            return f"{tab} - {app_name}" if tab else app_name
        return _run(["xdotool", "getactivewindow", "getwindowname"])  # Linux (X11)
    except Exception:
        return ""
