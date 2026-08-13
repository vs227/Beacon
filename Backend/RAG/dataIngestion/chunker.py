from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(
    documents: List[Document],
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[Document]:
    """
    Split documents into chunks using RecursiveCharacterTextSplitter.
    Attaches chunk_index metadata to every chunk.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    chunks = splitter.split_documents(documents)

    for idx, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = idx

    print(f"Created {len(chunks)} chunks")
    return chunks
