from flask import jsonify, request

from services.session_service import session_service


def start_session():
    data = request.get_json(silent=True) or {}
    try:
        minutes = float(data.get("minutes", 25))
    except (TypeError, ValueError):
        return jsonify(error="minutes must be a number"), 400
    if not 0 < minutes <= 600:
        return jsonify(error="minutes must be between 0 and 600"), 400

    allowed = data.get("allowed", [])
    if isinstance(allowed, str):          # accept "canvas, docs" too
        allowed = allowed.split(",")

    session_service.start(minutes, allowed)
    return jsonify(ok=True)


def get_session():
    try:
        since = int(request.args.get("since", 0))
    except ValueError:
        since = 0
    return jsonify(session_service.snapshot(since))


def stop_session():
    return jsonify(summary=session_service.stop())
