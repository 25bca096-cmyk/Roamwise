import React from 'react';
import { 
  Compass, 
  Cpu, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  Database, 
  Bot,
  BrainCircuit,
  Sliders,
  Scale
} from 'lucide-react';

export default function AboutSection() {
  const pipelineSteps = [
    {
      title: "1. Lexical Tokenization & Cleaning",
      tech: "NLTK Punkt Tokenizer",
      description: "Splits natural human utterances into discrete syntactic tokens while handling contractions, punctuation boundaries, and fuzzy spelling corrections."
    },
    {
      title: "2. Stemming vs Lemmatization",
      tech: "Porter Stemmer & WordNet Lemmatizer",
      description: "Applies dual morphological normalization. Porter Stemmer strips derivational affixes, while WordNet Lemmatizer maps word forms to meaningful semantic dictionary bases using Part-Of-Speech (POS) context."
    },
    {
      title: "3. Named Entity Recognition (NER)",
      tech: "spaCy (en_core_web_sm) + Domain Rules",
      description: "Extracts real-world geopolitical entities (GPE), geographic locations (LOC), calendar dates (DATE), financial figures (MONEY), and custom travel constraints like travel styles and companion counts."
    },
    {
      title: "4. Sentiment & Tone Polarity",
      tech: "NLTK VADER Lexicon",
      description: "Scores valence intensity across positive, neutral, and negative dimensions. RoamWise modulates conversational warmth, empathy, and advice style based on compound polarity."
    },
    {
      title: "5. Semantic Intent Classification",
      tech: "TF-IDF N-Grams + Cosine Similarity",
      description: "Maps user queries to dialogue goals (recommendation, itinerary creation, budget adjustment, duration changes) with resilience against typos and variant phrasing."
    },
    {
      title: "6. Multi-Factor Recommendation Scoring",
      tech: "Jaccard Overlap + Constraint Solvers",
      description: "Scores global destinations across travel style compatibility, financial headroom, duration fit, and seasonal climate conditions."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-12">
      
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white p-8 sm:p-14 shadow-card">
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase">
              NLP Architecture & Engineering
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            About RoamWise
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            RoamWise is an intelligent, genuinely functional NLP travel recommendation chatbot and itinerary generation platform. Unlike rigid keyword-matching bots, RoamWise employs full linguistic pipelines in Python to comprehend context, tone, intent, and subtle conversational follow-ups.
          </p>
        </div>
      </div>

      {/* NLP Pipeline Walkthrough */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            End-to-End Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            How RoamWise Processes Human Language
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelineSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                {step.tech}
              </span>
              <h3 className="font-bold text-base text-slate-900">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stemming vs Lemmatization Deep Dive */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Stemming vs. Lemmatization in RoamWise
            </h3>
            <p className="text-xs text-slate-500">
              Understanding the difference between algorithmic suffix cutting and morphological base analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/70 space-y-2">
            <h4 className="font-bold text-sm text-teal-900">Porter Stemming (NLTK)</h4>
            <p className="text-slate-700">
              Uses the classic Martin Porter heuristic algorithm. It operates rule-by-rule without a dictionary, stripping common morphological endings. For example, <span className="font-mono font-bold text-teal-800">"adventurous"</span> becomes <span className="font-mono font-bold text-teal-800">"adventur"</span> and <span className="font-mono font-bold text-teal-800">"beaches"</span> becomes <span className="font-mono font-bold text-teal-800">"beach"</span>. It is blazingly fast and useful for crude recall.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
            <h4 className="font-bold text-sm text-emerald-900">WordNet Lemmatization (NLTK)</h4>
            <p className="text-slate-700">
              Uses the Princeton WordNet cognitive lexical database. By cross-referencing Part-of-Speech tags, it determines the true canonical lemma of words (e.g., verbs, nouns, adjectives). Lemmatization ensures that search tokens map to genuine linguistic entries, preventing false matches.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Travel Estimates Statement */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Scale className="w-5 h-5 text-emerald-600" />
          <span>Realistic Estimation & Data Integrity Guarantee</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          RoamWise adheres strictly to high technical and ethical standards: we never invent live fake flight seat numbers or hotel reservation prices. All budget metrics, daily expenses, and duration bands in RoamWise are realistic, well-researched benchmarks calibrated across global travel indexes and labeled clearly as estimates.
        </p>
      </div>

    </div>
  );
}
