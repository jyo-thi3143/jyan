import queue
import re
import threading

from groq import Groq, RateLimitError

from config import GROQ_API_KEY, MODEL, SYSTEM_PROMPT, TOOLS

# gpt-oss adds markers like 【2†L6-L10】 when it cites a page. Hide them from the chat.
CITATION_MARKS = re.compile(r"【[^】]*】")


def _get(obj, key):
    """Read a field from either a dict or an object."""
    if obj is None:
        return None
    if isinstance(obj, dict):
        return obj.get(key)
    return getattr(obj, key, None)


class LLMService:
    def __init__(self):
        self.client = None
        self.error = ""
        if not GROQ_API_KEY:
            self.error = "No API key found. Put GROQ_API_KEY=... in server/.env"
            return
        try:
            self.client = Groq(api_key=GROQ_API_KEY)
        except Exception as e:
            self.error = str(e)

    @property
    def ready(self):
        return self.client is not None

    def ask(self, messages):
        """Blocking. Returns (text, [(title, url), ...])."""
        if not self.ready:
            raise RuntimeError(self.error)

        response = self.client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
            tools=TOOLS,
            tool_choice="auto",          # "auto" = only search when it helps
            max_completion_tokens=2048,
            reasoning_effort="low",      # Groq recommends low for browsing
        )
        msg = response.choices[0].message
        text = CITATION_MARKS.sub("", msg.content or "").strip()
        return text, self._sources(msg)

    def _sources(self, msg):
        """Best effort: pull page titles/links out of the search results, if Groq sent them."""
        found = {}
        try:
            for tool in _get(msg, "executed_tools") or []:
                results = _get(_get(tool, "search_results"), "results") or []
                for r in results:
                    url = _get(r, "url")
                    if url:
                        found[url] = _get(r, "title") or url
        except Exception:
            pass
        return [(title, url) for url, title in found.items()][:3]

    def stream_events(self, messages):
        """Generator of event dicts for the client:
        {type:"search"} | {type:"token",text} | {type:"done",sources} | {type:"error",message}"""
        q = queue.Queue()

        def work():
            # We can't see inside a search while it runs, so if the answer takes
            # more than 2.5s we tell the sprite to show its "searching" look.
            timer = threading.Timer(2.5, lambda: q.put({"type": "search"}))
            timer.start()
            try:
                text, sources = self.ask(messages)
                if text:
                    q.put({"type": "token", "text": text})
                q.put({"type": "done", "sources": [{"title": t, "url": u} for t, u in sources]})
            except RateLimitError:
                q.put({"type": "error", "message": "Hit Groq's free-tier limit. Wait a few seconds and try again."})
            except Exception as e:
                q.put({"type": "error", "message": str(e)})
            finally:
                timer.cancel()
                q.put(None)  # end of stream

        threading.Thread(target=work, daemon=True).start()
        while True:
            item = q.get()
            if item is None:
                return
            yield item


claude_service = LLMService()  # same name as before, so the controller needs no changes