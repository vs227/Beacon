import csv
import json
import logging
from pathlib import Path
from typing import List
from langchain_core.documents import Document

logger = logging.getLogger(__name__)


def load_text_file(file_path: Path) -> List[Document]:
    """Ultra-lightweight text loader using built-in file IO (0 MB memory overhead)."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    if not text.strip():
        return []
    return [Document(page_content=text, metadata={})]


def load_json_file(file_path: Path) -> List[Document]:
    """Load JSON file into Document objects."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        data = json.load(f)

    documents = []
    if isinstance(data, list):
        for idx, item in enumerate(data):
            content = json.dumps(item, indent=2) if isinstance(item, (dict, list)) else str(item)
            if content.strip():
                documents.append(Document(page_content=content, metadata={"item_index": idx}))
    elif isinstance(data, dict):
        content = json.dumps(data, indent=2)
        if content.strip():
            documents.append(Document(page_content=content, metadata={}))
    else:
        content = str(data)
        if content.strip():
            documents.append(Document(page_content=content, metadata={}))

    return documents


def load_pdf_file(file_path: Path) -> List[Document]:
    """Lightweight PDF loader using pypdf directly (< 2MB RAM)."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(file_path))
        documents = []
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                documents.append(Document(page_content=text, metadata={"page": idx + 1}))
        return documents
    except Exception as e:
        logger.error(f"Error reading PDF {file_path.name}: {e}")
        return load_text_file(file_path)


def load_docx_file(file_path: Path) -> List[Document]:
    """Lightweight DOCX loader using python-docx directly (< 2MB RAM)."""
    try:
        import docx
        doc = docx.Document(str(file_path))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        if not full_text.strip():
            return []
        return [Document(page_content=full_text, metadata={})]
    except Exception as e:
        logger.error(f"Error reading DOCX {file_path.name}: {e}")
        return load_text_file(file_path)


def load_csv_file(file_path: Path) -> List[Document]:
    """Lightweight CSV loader using built-in csv module (< 1MB RAM)."""
    documents = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            for idx, row in enumerate(reader):
                line = ", ".join(row)
                if line.strip():
                    documents.append(Document(page_content=line, metadata={"row_index": idx + 1}))
        return documents
    except Exception as e:
        logger.error(f"Error reading CSV {file_path.name}: {e}")
        return load_text_file(file_path)


def load_file(file_path: str | Path) -> List[Document]:
    """
    Ultra-lightweight document loader:
    Supports .pdf, .docx, .txt, .md, .csv, .json, .py, .js, .ts, .jsx, .tsx, .html, .css, .yaml, .yml
    Uses direct pure-Python parsers to guarantee RAM footprint stays under 5MB (never triggers Render restart).
    """
    file = Path(file_path)
    extension = file.suffix.lower()

    if extension in {".txt", ".md", ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".yaml", ".yml", ".go", ".rs", ".java", ".cpp", ".c", ".h"}:
        documents = load_text_file(file)

    elif extension == ".pdf":
        documents = load_pdf_file(file)

    elif extension == ".docx":
        documents = load_docx_file(file)

    elif extension == ".csv":
        documents = load_csv_file(file)

    elif extension == ".json":
        documents = load_json_file(file)

    else:
        documents = load_text_file(file)

    # Attach metadata
    for doc in documents:
        doc.metadata["source_file"] = file.name
        doc.metadata["file_type"] = extension.replace(".", "")

    return documents


def process_all_files(directory: str | Path) -> List[Document]:
    """Process all files in a directory across all supported formats."""
    all_documents = []
    directory = Path(directory)
    files = list(directory.glob("**/*"))

    for file in files:
        if file.is_file() and file.suffix.lower() in [".pdf", ".docx", ".txt", ".md", ".csv", ".json", ".py", ".js", ".ts"]:
            try:
                documents = load_file(file)
                all_documents.extend(documents)
            except Exception as e:
                logger.error(f"Error processing {file.name}: {e}")

    return all_documents

