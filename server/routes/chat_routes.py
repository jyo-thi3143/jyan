from flask import Blueprint

from controllers import chat_controller

chat_bp = Blueprint("chat", __name__, url_prefix="/api")

chat_bp.add_url_rule("/status", view_func=chat_controller.get_status, methods=["GET"])
chat_bp.add_url_rule("/chat", view_func=chat_controller.post_chat, methods=["POST"])
