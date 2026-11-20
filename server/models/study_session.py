import time

from config import DISTRACTION_WORDS, OWN_WINDOWS


class StudySession:
    def __init__(self, minutes, allowed=None):
        self.total = int(minutes * 60)
        self.start = time.time()
        self.end = self.start + self.total
        # If given, ONLY windows containing one of these words are okay.
        self.allowed = [a.strip().lower() for a in (allowed or []) if a.strip()]
        self.flags = 0
        self.seconds_away = 0
        self.stopped = False

    @property
    def remaining(self):
        return max(0, int(self.end - time.time()))

    def is_distraction(self, title):
        t = title.lower().strip()
        if not t or t in OWN_WINDOWS or t.startswith("pip"):
            return False
        if self.allowed:
            return not any(a in t for a in self.allowed)
        return any(w in t for w in DISTRACTION_WORDS)

    def summary(self):
        studied = round(min(self.total, time.time() - self.start) / 60)
        return (f"You studied for {studied} of {round(self.total / 60)} min, "
                f"got flagged {self.flags} time(s) and spent {self.seconds_away}s distracted.")

    def to_dict(self):
        return {
            "remaining": self.remaining,
            "total": self.total,
            "flags": self.flags,
            "away": self.seconds_away,
        }
