import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Send, 
  Tag, 
  Layers, 
  Smile, 
  Frown, 
  Meh, 
  Target, 
  Key, 
  CheckCircle2, 
  BarChart3, 
  Clock, 
  Sparkles,
  RefreshCw,
  Hash
} from 'lucide-react';
import { analyzeNLP, fetchNLPStats } from '../services/api';
import NLPAnalyticsPanel from './NLPAnalyticsPanel';

export default function NLPDashboard({ initialAnalysis }) {
  const [inputText, setInputText] = useState(
    initialAnalysis?.original_text || "I want an adventurous 5-day trip to Switzerland or Paris with a budget of $2500 in December! I am so excited!"
  );
  const [analysis, setAnalysis] = useState(initialAnalysis || null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async (textToRun = null) => {
    const text = textToRun || inputText;
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const data = await analyzeNLP(text);
      setAnalysis(data);
      loadStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await fetchNLPStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!analysis) {
      runAnalysis();
    }
    loadStats();
  }, []);

  const sampleQueries = [
    "I want an adventurous 5-day trip to Switzerland or Paris with a budget of $2500 in December! I am so excited!",
    "Can you make the itinerary cheaper and add two more days?",
    "We are planning a romantic honeymoon to Bali with beaches and luxury resorts for $3000.",
    "Is it safe to travel alone in Tokyo? What are the best historical temples to visit?",
    "Horrible flight delays ruined my mood, need a relaxed and peaceful nature trip somewhere nearby."
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 shadow-card">
        <div className="max-w-3xl relative z-10">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold tracking-wider uppercase border border-emerald-400/30 inline-block mb-3">
            Real NLP Telemetry & Analytics
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            NLP Engine Inspection Workbench
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Inspect the live pipeline operations behind RoamWise: tokenization with NLTK Punkt, morphological root reduction via Porter Stemmer, WordNet base lemmatization, Named Entity Recognition using spaCy's convolutional statistical model, and sentiment scoring with VADER.
          </p>
        </div>
      </div>

      {/* Interactive Workbench Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            Live Text Pipeline Tester
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Direct Backend API Call
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type any sentence to run full NLP pipeline..."
            className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
          <button
            onClick={() => runAnalysis()}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isLoading ? 'Processing...' : 'Run Pipeline'}</span>
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Try benchmark travel utterances:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(q);
                  runAnalysis(q);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl text-xs font-medium border border-slate-200/60 transition-colors truncate max-w-md text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <NLPAnalyticsPanel analysis={analysis} compact={false} />

          {/* Deep-Dive Comparative Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Morphological Analysis: Stemming vs Lemmatization Side-by-Side
            </h3>
            <p className="text-xs text-slate-500">
              Notice how Porter Stemming applies heuristic suffix stripping (e.g., chopping 'adventurous' to 'adventur'), whereas WordNet Lemmatization uses linguistic vocabulary and Part-Of-Speech context to return valid dictionary lemmas.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Raw Token</th>
                    <th className="py-3 px-4">POS Tag</th>
                    <th className="py-3 px-4 text-teal-700">Porter Stemmer</th>
                    <th className="py-3 px-4 text-emerald-700">WordNet Lemma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {analysis.pos_tags?.slice(0, 12).map((item, idx) => {
                    const stem = analysis.stems?.[idx] || '-';
                    const lemma = analysis.lemmas?.[idx] || '-';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{item.token}</td>
                        <td className="py-2.5 px-4 text-slate-500">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                            {item.tag}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-teal-700 font-medium">{stem}</td>
                        <td className="py-2.5 px-4 text-emerald-700 font-bold">{lemma}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate NLP System Telemetry */}
      {stats && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                RoamWise System NLP Metrics
              </h3>
              <p className="text-xs text-slate-500">
                Persistent telemetry recorded across user conversational turns in SQLite
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-mono text-xs font-bold border border-indigo-200">
              {stats.total_queries} Total Queries Processed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Intent Distribution */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" /> Intent Classification Frequency
              </h4>
              <div className="space-y-2.5">
                {Object.entries(stats.intent_distribution || {}).map(([intent, count]) => {
                  const pct = Math.round((count / Math.max(1, stats.total_queries)) * 100);
                  return (
                    <div key={intent} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-700 capitalize">
                          {intent.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-600" /> Conversational Sentiment Ratios
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center my-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-bold block">Positive</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {stats.sentiment_distribution?.positive || 0}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xs text-amber-800 font-bold block">Neutral</span>
                  <span className="text-xl font-extrabold text-amber-700">
                    {stats.sentiment_distribution?.neutral || 0}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-xs text-rose-800 font-bold block">Negative</span>
                  <span className="text-xl font-extrabold text-rose-700">
                    {stats.sentiment_distribution?.negative || 0}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic text-center">
                Chatbot responses dynamically modulate conversational warmth, empathy, and tone based on this sentiment telemetry.
              </p>
            </div>

          </div>

          {/* Recent Queries Table */}
          {stats.recent_queries && stats.recent_queries.length > 0 && (
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Recent User Utterances Logged
              </h4>
              <div className="space-y-1.5 text-xs">
                {stats.recent_queries.slice(0, 5).map((q, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                    <span className="font-mono text-slate-700 truncate max-w-lg">
                      "{q.user_query}"
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] uppercase font-bold text-slate-600 capitalize">
                      {q.intent.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
