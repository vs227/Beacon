import json
from pathlib import Path
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    CSVLoader,
)


def load_json(file_path: Path) -> List[Document]:
    """Load JSON file and convert key-values or array items into text Documents."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    documents = []
    if isinstance(data, list):
        for idx, item in enumerate(data):
            content = json.dumps(item, indent=2) if isinstance(item, (dict, list)) else str(item)
            doc = Document(
                page_content=content,
                metadata={"item_index": idx}
            )
            documents.append(doc)
    elif isinstance(data, dict):
        content = json.dumps(data, indent=2)
        doc = Document(page_content=content, metadata={})
        documents.append(doc)
    else:
        doc = Document(page_content=str(data), metadata={})
        documents.append(doc)

    return documents


def load_file(file_path: str | Path) -> List[Document]:
    """
    Detect file extension and load text into LangChain Document objects.
    Supports .pdf, .docx, .txt, .md, .csv, .json
    Adds source_file and file_type metadata.
    """
    file = Path(file_path)
    extension = file.suffix.lower()

    if extension == ".pdf":
        loader = PyPDFLoader(str(file))
        documents = loader.load()

    elif extension == ".docx":
        loader = Docx2txtLoader(str(file))
        documents = loader.load()

    elif extension == ".txt":
        loader = TextLoader(str(file), encoding="utf-8")
        documents = loader.load()

    elif extension == ".md":
        # Fallback to TextLoader for markdown if unstructured is not installed
        try:
            from langchain_community.document_loaders import UnstructuredMarkdownLoader
            loader = UnstructuredMarkdownLoader(str(file))
            documents = loader.load()
        except Exception:
            loader = TextLoader(str(file), encoding="utf-8")
            documents = loader.load()

    elif extension == ".csv":
        loader = CSVLoader(str(file), encoding="utf-8")
        documents = loader.load()

    elif extension == ".json":
        documents = load_json(file)

    else:
        raise ValueError(f"Unsupported file type: {extension}")

    # Add metadata
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
        if file.is_file() and file.suffix.lower() in [".pdf", ".docx", ".txt", ".md", ".csv", ".json"]:
            print(f"Processing: {file.name}")
            try:
                documents = load_file(file)
                all_documents.extend(documents)
                print(f"Loaded {len(documents)} document(s)")
            except Exception as e:
                print(f"Error processing {file.name}: {e}")

    print(f"Total documents loaded: {len(all_documents)}")
    return all_documents
