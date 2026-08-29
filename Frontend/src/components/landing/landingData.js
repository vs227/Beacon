export const CODE_EXAMPLES = {
  js: `import { Beacon } from "@beacon/sdk";

const beacon = new Beacon({
  apiKey: process.env.BEACON_API_KEY
});

const context = await beacon.retrieve({
  knowledgeBase: "company-docs",
  query: "How does authentication work?"
});`,
  python: `from beacon import Beacon
import os

beacon = Beacon(api_key=os.getenv("BEACON_API_KEY"))

context = beacon.retrieve(
    knowledge_base="company-docs",
    query="How does authentication work?"
)`,
  curl: `curl -X POST "https://api.beacon.ai/v1/retrieve" \\
  -H "Authorization: Bearer $BEACON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "knowledgeBase": "company-docs",
    "query": "How does authentication work?"
  }'`
}

export const SECTIONS_DATA = [
  {
    id: 'genesis',
    tag: '00. Infrastructure',
    tagColor: '#C86F52',
    title: 'Zero-Latency Vector Infrastructure.',
    desc: 'Eliminate bottlenecked vector search at scale. We solve the challenge of high-latency semantic lookups across billions of nodes, delivering sub-millisecond retrieval speeds to serve as a real-time backbone for production RAG.',
  },
  {
    id: 'entry',
    tag: '01. Ingestion Pipeline',
    tagColor: '#52A88B',
    title: 'Autonomous Chunking & Embedding.',
    desc: 'End manual data prep and bad chunking. We solve parsing errors and context loss by automating the entire ingestion pipeline, intelligently chunking and embedding multi-format files while preserving core semantic boundaries.',
  },
  {
    id: 'beyond',
    tag: '02. Generation Engine',
    tagColor: '#C86F52',
    title: 'Hallucination-Free Synthesis.',
    desc: "Eradicate LLM hallucinations and data privacy risks. We solve the lack of auditable facts in production by validating every output against secure, citation-verified semantic records, guaranteeing 99.9% ground-truth accuracy.",
    showCta: true,
  },
  {
    id: 'problem',
    tag: '03. The Problem',
    tagColor: '#C86F52',
    title: 'RAG is Easy to Describe. Hard to Build.',
    desc: 'A production RAG system is more than a vector database. Developers have to deal with ingestion, parsing, chunking, embeddings, indexing, retrieval, filtering, reranking, context construction, scaling and monitoring.',
    callout: 'BEACON gives you the infrastructure instead of another infrastructure project.',
  },
  {
    id: 'solution',
    tag: '04. The Retrieval Layer',
    tagColor: '#52A88B',
    title: 'Everything Between Your Data & Your AI.',
    desc: 'BEACON handles the retrieval layer so your team can focus on the application, experience and intelligence that actually differentiate your product.',
    showFlow: true,
  },
  {
    id: 'howItWorks',
    tag: '05. How It Works',
    tagColor: '#52A88B',
    title: 'Four Steps to Production Retrieval.',
    desc: 'From raw data to AI-ready context in four simple steps.',
    showSteps: true,
  },
  {
    id: 'devApi',
    tag: '06. Developer API',
    tagColor: '#C86F52',
    title: 'One API. Your Entire Retrieval Layer.',
    desc: 'Integrate RAG directly into your application instead of building and maintaining the infrastructure behind it.',
    showCodeTabs: true,
  },
  {
    id: 'capabilities',
    tag: '07. Capabilities',
    tagColor: '#52A88B',
    title: 'The Infrastructure You Shouldn\'t Have to Build.',
    desc: 'Data Ingestion · Intelligent Processing · Embeddings · Knowledge Bases · Retrieval · Metadata Filtering · Reranking · API + SDK',
  },
  {
    id: 'architecture',
    tag: '08. Architecture',
    tagColor: '#C86F52',
    title: 'Your Application. Our Retrieval Infrastructure.',
    desc: 'A single integration point for the infrastructure behind production RAG.',
    showArch: true,
  },
  {
    id: 'useCases',
    tag: '09. Use Cases',
    tagColor: '#52A88B',
    title: 'Build What Comes Next.',
    desc: 'AI SaaS · AI Agents · Enterprise Search · Customer Support · Internal Knowledge · Developer Tools',
  },
  {
    id: 'whyBeacon',
    tag: '10. Why Beacon',
    tagColor: '#C86F52',
    title: 'Focus on Your Product. Not Your Retrieval Stack.',
    desc: 'Build Faster — skip weeks of infrastructure work. Stay Flexible — works alongside your existing AI models. Scale Your Knowledge — infrastructure designed for growth.',
    showFinalCta: true,
  },
]
