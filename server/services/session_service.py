import random
import threading
import time

from config import CHECK_SECONDS, NUDGES
from models.study_session import StudySession
from services.focus_service import get_active_window


class SessionService:
    """Runs the one current study session and watches for distractions."""

    def __init__(self):
        self.session = None
        self.events = []      # [{"kind": "left" | "finished", "text": "..."}]
        self.active = False

    def start(self, minutes, allowed=None):
        if self.session:
            self.session.stopped = True
        s = StudySession(minutes, allowed)
        self.session, self.events, self.active = s, [], True
        threading.Thread(target=self._watch, args=(s,), daemon=True).start()
        return s

    def _emit(self, s, kind, text):
        if self.session is not s:   # an old session, ignore it
            return
        self.events.append({"kind": kind, "text": text})
        if kind == "finished":
            self.active = False

    def _watch(self, s):
        was_bad = False
        while not s.stopped:
            if s.remaining <= 0:
                self._emit(s, "finished", s.summary())
                return
            title = get_active_window()
            bad = s.is_distraction(title)
            if bad:
                s.seconds_away += CHECK_SECONDS
                if not was_bad:  # flag once per wander, not every 2 seconds
                    s.flags += 1
                    what = f'"{title[:45]}"'
                    self._emit(s, "left", random.choice(NUDGES).format(what=what))
            was_bad = bad
            time.sleep(CHECK_SECONDS)

    def snapshot(self, since=0):
        s = self.session
        if not s:
            return {"active": False, "events": []}
        return {"active": self.active, **s.to_dict(), "events": self.events[since:]}

    def stop(self):
        s = self.session
        summary = s.summary() if s else ""
        if s:
            s.stopped = True
        self.session, self.active = None, False
        return summary


session_service = SessionService()
