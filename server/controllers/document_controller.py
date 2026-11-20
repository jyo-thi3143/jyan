from flask import jsonify, request

from services.document_service import DocumentUploadError, document_service


def post_document():
    uploaded_file = request.files.get("file")
    if uploaded_file is None:
        return jsonify(error="Upload a DOCX file using the 'file' form field."), 400

    try:
        result = document_service.add_docx(uploaded_file)
    except DocumentUploadError as error:
        return jsonify(error=str(error)), error.status_code

    return jsonify(result), 201
