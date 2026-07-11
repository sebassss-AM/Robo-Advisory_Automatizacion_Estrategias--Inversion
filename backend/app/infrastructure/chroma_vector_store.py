import os
from typing import Optional

import chromadb
from chromadb.config import Settings

CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "chroma_db")
COLLECTION_NAME = "financial_docs"

_client: Optional[chromadb.Client] = None


def get_client():
    global _client
    if _client is None:
        try:
            _client = chromadb.PersistentClient(
                path=CHROMA_DIR,
                settings=Settings(anonymized_telemetry=False),
            )
        except Exception as e:
            print(f"[WARN] ChromaDB no disponible: {e}")
            return None
    return _client


def get_or_create_collection():
    client = get_client()
    try:
        return client.get_collection(COLLECTION_NAME)
    except ValueError:
        return client.create_collection(COLLECTION_NAME)


def add_documents(documents: list[str], metadatas: list[dict] | None = None):
    collection = get_or_create_collection()
    ids = [f"doc_{i}" for i in range(len(documents))]
    collection.add(documents=documents, ids=ids, metadatas=metadatas)


def query_documents(query: str, n_results: int = 3) -> list[str]:
    collection = get_or_create_collection()
    results = collection.query(query_texts=[query], n_results=n_results)
    if results["documents"]:
        return results["documents"][0]
    return []
