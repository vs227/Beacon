# Beacon: Technical Overview

Live demo: https://beacon-seven-iota.vercel.app/
Code: https://github.com/vs227/Beacon

## What is Beacon?

Beacon is a project I built to make it easier to connect an app with your own documents, vector search and different LLM providers.

Normally a developer has to set up document processing, a vector database, an API and LLM access one by one. The idea behind Beacon was simple: add your data in one place and use it with a RAG pipeline, without wiring everything together yourself.

## How it works

The flow is:

User -> API -> Document processing -> Vector search -> LLM -> Response

When a document is added, Beacon cleans the text, splits it into smaller chunks and makes an embedding for each chunk. These are saved in PostgreSQL using pgvector.

When someone asks a question, the question is turned into an embedding too. Beacon finds the chunks closest to it and sends them to the LLM together with the question.

## RAG pipeline

RAG is the core of Beacon. I used LangChain for the document processing and retrieval steps. Documents are split with recursive chunking, which tries to cut at natural places like paragraphs and sentences instead of in the middle of a thought. The chunks are then turned into embeddings with SentenceTransformers and stored in Supabase/PostgreSQL.

At query time Beacon looks for chunks with a similar meaning, not just the same keywords. Those chunks go to the LLM as context before it writes the answer.

## Vector search

I used pgvector with an HNSW index.

Vector search matters because two sentences can mean the same thing without sharing words. "How do I change my password?" and "Steps to update login details" look different but are close in meaning, and embeddings catch that. HNSW keeps the search fast when there are a lot of stored vectors, so it doesn't have to compare against every single one.

## LLM integration

I didn't want Beacon to depend on one provider. The routing layer supports Groq, OpenAI, Google Gemini, Anthropic Claude and custom endpoints. If one provider is down or slow, the app can fall back to another one.

## Authentication and APIs

The backend is built with FastAPI and exposes REST APIs. Login uses JWT, and apps can use scoped API keys. There is also rate limiting, so one user can't flood the system. The React frontend sits on top and gives a simple dashboard to use all of this.

## GitHub integration

You can connect a GitHub repository to Beacon. Its content is pulled in, indexed, and becomes searchable through the same RAG system. Webhooks tell Beacon when someone pushes new code, so the index updates by itself and doesn't go stale.

## Problems I faced

Most of my problems had nothing to do with the LLM. They were around the pipeline.

- **Chunking changed everything.** When chunks were cut badly, the right information was split across two pieces and the answers got worse. Moving to recursive chunking, which respects paragraph and sentence boundaries, gave more useful results.
- **Every provider behaves a bit differently.** Each one has its own API format, errors and limits. Putting them behind one routing layer, with a fallback, made the rest of the app much simpler.
- **Too much text was going into prompts.** Sending every retrieved chunk in full cost more and slowed things down. Adding token compression helped keep prompts smaller.
- **Keeping GitHub data fresh.** Re-indexing a whole repo on every change is wasteful. Webhooks that trigger an update only when something is pushed solved this.

These taught me that building an AI app is not just plugging in an LLM. Data processing, retrieval quality, APIs and handling failures matter just as much.

## Performance

I worked on three things:

- HNSW indexing so similarity search stays quick as the data grows
- Token compression so fewer unnecessary tokens reach the LLM
- Startup time, so the app is ready to use sooner

I haven't run proper benchmarks yet, so I'm not going to quote numbers I can't back up. Adding real measurements is on my list.

## What works and what doesn't (yet)

**What works**

- + Not tied to one LLM provider, with a fallback if one fails
- + Search by meaning, so questions don't have to match the document's exact words
- + Documents, embeddings and app data all live in one Postgres database
- + GitHub repos stay up to date through webhooks
- + Smaller prompts mean faster and cheaper responses

**What's still weak**

- - Answer quality depends heavily on chunking
- - No proper retrieval evaluation yet, so I mostly check quality by hand
- - The LLM can still give a wrong answer even when retrieval worked, so output needs checking
- - Users have to set up their own Supabase/Postgres and bring their own API keys

## What I learned

Building Beacon gave me real experience with RAG, vector databases, APIs and LLM integration.

More than that, I learned how the different parts of an AI app have to work together. I also learned that retrieved information should always be checked, because an LLM can be wrong even when the system itself is working fine.

## What's next

Beacon is still a work in progress. Next I want to add retrieval evaluation so I can measure quality, make it more reliable when things fail, and make it easier for other developers to set up and use.
