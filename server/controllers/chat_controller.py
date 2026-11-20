import json

from flask import Response, jsonify, request

from services.claude_service import claude_service


def get_status():
    return jsonify(ready=claude_service.ready, error=claude_service.error)


def post_chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages")
    if not isinstance(messages, list) or not messages:
        return jsonify(error="Send {messages: [{role, content}, ...]}"), 400

    def generate():
        for event in claude_service.stream_events(messages):
            yield f"data: {json.dumps(event)}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
