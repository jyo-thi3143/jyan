from collections import OrderedDict
from io import BytesIO
from threading import Lock
from uuid import uuid4
from zipfile import ZipFile

from docx import Document
from werkzeug.utils import secure_filename

from config import (
    MAX_DOCUMENT_TEXT_CHARS,
    MAX_DOCUMENT_UNCOMPRESSED_BYTES,
    MAX_DOCUMENT_UPLOAD_BYTES,
    MAX_STORED_DOCUMENTS,
)


class DocumentUploadError(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.status_code = status_code


class DocumentService:
    """Extract and temporarily retain uploaded DOCX text in process memory."""

    def __init__(self):
        self._documents = OrderedDict()
        self._lock = Lock()

    def add_docx(self, uploaded_file):
        original_name = uploaded_file.filename or ""
        filename = secure_filename(original_name)
        if not filename:
            raise DocumentUploadError("Choose a DOCX file to upload.", 400)
        if not filename.lower().endswith(".docx"):
            raise DocumentUploadError("Unsupported file type. Please choose a .docx file.", 415)

        content = uploaded_file.read(MAX_DOCUMENT_UPLOAD_BYTES + 1)
        if len(content) > MAX_DOCUMENT_UPLOAD_BYTES:
            raise DocumentUploadError("File too large. DOCX files must be 5 MB or smaller.", 413)

        try:
            with ZipFile(BytesIO(content)) as package:
                if "word/document.xml" not in package.namelist():
                    raise DocumentUploadError("This file is not a readable DOCX document.", 400)
                uncompressed_size = sum(item.file_size for item in package.infolist())
                if uncompressed_size > MAX_DOCUMENT_UNCOMPRESSED_BYTES:
                    raise DocumentUploadError("The expanded DOCX contents are too large to process.", 413)

            document = Document(BytesIO(content))
            pieces = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
            for table in document.tables:
                for row in table.rows:
                    row_text = "\t".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        pieces.append(row_text)
            text = "\n".join(pieces).strip()
        except DocumentUploadError:
            raise
        except Exception as error:
            raise DocumentUploadError("This DOCX file is corrupted or could not be read.", 400) from error

        if not text:
            raise DocumentUploadError("No readable text was found in this DOCX file.", 422)
        if len(text) > MAX_DOCUMENT_TEXT_CHARS:
            raise DocumentUploadError(
                f"Extracted text is too large. Documents are limited to {MAX_DOCUMENT_TEXT_CHARS:,} characters.",
                413,
            )

        document_id = uuid4().hex
        record = {"document_id": document_id, "filename": filename, "text": text}
        with self._lock:
            self._documents[document_id] = record
            while len(self._documents) > MAX_STORED_DOCUMENTS:
                self._documents.popitem(last=False)

        return {
            "document_id": document_id,
            "filename": filename,
            "extracted_character_count": len(text),
        }

    def get_document(self, document_id):
        with self._lock:
            return self._documents.get(document_id)


document_service = DocumentService()
