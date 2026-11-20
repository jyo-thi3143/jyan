from flask import Blueprint

from controllers import document_controller

document_bp = Blueprint("documents", __name__, url_prefix="/api")
document_bp.add_url_rule("/documents", view_func=document_controller.post_document, methods=["POST"])
