# Beacon – Technical Overview

## What is Beacon?

Beacon is an AI infrastructure project that I built to make it easier to connect applications with documents, vector search and different LLM providers.

The main idea was to build a platform where a developer can add their data and use it with an RAG pipeline instead of building all these components separately.

## How Beacon Works

The basic flow is:

User -> API -> Document Processing -> Vector Search -> LLM -> Response

When a document is added, Beacon processes the text, breaks it into smaller chunks and creates embeddings for those chunks. The embeddings are stored in PostgreSQL using pgvector.

When a user asks a question, the question is also converted into an embedding. Beacon then searches for the most relevant chunks and sends that information to the LLM along with the question.

## RAG Pipeline

The RAG part is one of the main components of Beacon.

I used LangChain for the document processing and retrieval workflow. Documents are divided into smaller chunks using recursive chunking and then converted into embeddings using SentenceTransformers.

These embeddings are stored in Supabase/PostgreSQL with pgvector. During a query, semantic similarity is used to find the most relevant information instead of only looking for exact keywords.

The retrieved information is then given to the LLM as context before generating the final response.

## Vector Search

For vector search, I used pgvector with HNSW indexing.

The reason for using vector search is that two sentences can have similar meanings even when they don't contain the same words. Embeddings help Beacon compare this meaning and retrieve more useful results.

HNSW was used to make similarity search more efficient when searching through stored vectors.

## LLM Integration

Beacon was designed to work with multiple LLM providers instead of depending on only one provider.

I added an LLM routing layer that can work with providers such as [write the providers you actually implemented]. This also gives the application a fallback option when a provider is unavailable.

## Authentication and APIs

The backend of Beacon is built using FastAPI and exposes REST APIs for the main functionality.

I implemented authentication using JWT/OAuth and also worked with API keys for application access.

The backend handles the main processing while the React frontend provides the interface for interacting with the system.

## GitHub Integration

One feature I worked on was connecting GitHub repositories with Beacon.

The idea is that repository content can be synchronized and indexed so that it can be searched through the RAG system. Webhooks can also be used to detect repository changes and trigger the required update process.

## Problems I Faced

While building Beacon, I faced problems around [write your real problem].

One issue was [explain what happened]. I solved it by [what you actually changed].

Another problem was [second real problem]. After testing different approaches, I [solution].

These problems helped me understand that building an AI application is not only about connecting an LLM. The data processing, retrieval quality, APIs and failure handling are also important.

## Performance

I also worked on improving the performance of Beacon.

For example, I worked on [your actual optimization]. This helped reduce [actual metric/result if you have verified it].

I also worked on reducing unnecessary prompt tokens and improving the application startup time.

## What I Learned

Building Beacon gave me practical experience with RAG systems, vector databases, APIs and LLM integration.

More importantly, I learned how different parts of an AI application need to work together. I also learned that retrieved information needs to be checked properly because an LLM can still produce incorrect answers even when the system is working correctly.

## Conclusion

Beacon is still a project that I want to improve, but it gave me a good understanding of how modern AI applications can be built around APIs, retrieval and LLMs.

My next focus would be improving retrieval evaluation, reliability and making the platform easier for developers to use.
