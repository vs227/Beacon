from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(
    documents: List[Document],
    chunk_size: int = 800,
    chunk_overlap: int = 100,
) -> List[Document]:
    """
    Split documents into chunks using RecursiveCharacterTextSplitter.
    Uses chunk_size=800 / overlap=100 for optimal token efficiency
    (smaller chunks → fewer prompt tokens per retrieval hit).
    Attaches chunk_index metadata to every chunk.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""],
    )

    chunks = splitter.split_documents(documents)

    for idx, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = idx

    print(f"Created {len(chunks)} chunks (size={chunk_size}, overlap={chunk_overlap})")
    return chunks
