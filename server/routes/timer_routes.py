from flask import Blueprint

from controllers import timer_controller

timer_bp = Blueprint("timer", __name__, url_prefix="/api")

timer_bp.add_url_rule("/session/start", view_func=timer_controller.start_session, methods=["POST"])
timer_bp.add_url_rule("/session", view_func=timer_controller.get_session, methods=["GET"])
timer_bp.add_url_rule("/session/stop", view_func=timer_controller.stop_session, methods=["POST"])
