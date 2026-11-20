"""Run:    python main.py            -> API on http://127.0.0.1:5001
Debug:  python main.py windows    -> prints the active window every 2s,
                                     to test focus detection on its own
"""
import sys
import time

from flask import Flask
from flask_cors import CORS

from config import HOST, PORT
from routes.chat_routes import chat_bp
from routes.timer_routes import timer_bp


def create_app():
    app = Flask(__name__)
    CORS(app)  # lets the client (a different port) call us
    app.register_blueprint(chat_bp)
    app.register_blueprint(timer_bp)
    return app


def print_windows():
    from models.study_session import StudySession
    from services.focus_service import get_active_window

    probe = StudySession(1)
    print("Switch between windows. Ctrl+C to stop.\n")
    while True:
        title = get_active_window()
        print(repr(title), "-> DISTRACTION" if probe.is_distraction(title) else "-> ok")
        time.sleep(2)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "windows":
        print_windows()
    else:
        create_app().run(host=HOST, port=PORT, threaded=True)
