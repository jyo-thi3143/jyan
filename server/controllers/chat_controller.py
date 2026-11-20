import json

from flask import Response, jsonify, request

from services.claude_service import claude_service
from services.document_service import document_service


def get_status():
    return jsonify(ready=claude_service.ready, error=claude_service.error)


def post_chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages")
    if not isinstance(messages, list) or not messages:
        return jsonify(error="Send {messages: [{role, content}, ...]}"), 400

    document_id = data.get("document_id")
    document = None
    if document_id is not None:
        if not isinstance(document_id, str) or not document_id.strip():
            return jsonify(error="document_id must be a non-empty string."), 400
        document = document_service.get_document(document_id)
        if document is None:
            return jsonify(error="Document not found. Upload the DOCX again and retry."), 404

    def generate():
        if document is None:
            events = claude_service.stream_events(messages)
        else:
            events = claude_service.stream_events(messages, document=document)
        for event in events:
            yield f"data: {json.dumps(event)}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
