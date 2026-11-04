import React from 'react';
import { 
  Cpu, 
  Tag, 
  Smile, 
  Frown, 
  Meh, 
  Target, 
  Layers, 
  Key, 
  HelpCircle,
  Hash,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

export default function NLPAnalyticsPanel({ analysis, compact = false }) {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-slate-500 shadow-sm">
        <Cpu className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-50" />
        <p className="font-medium text-slate-700">NLP Analytics Engine Standby</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Send a travel query in the chat or enter text to see live tokenization, stemming, spaCy NER, and VADER sentiment analysis in real time.
        </p>
      </div>
    );
  }

  const {
    original_text,
    normalized_text,
    corrections = [],
    tokens = [],
    stems = [],
    lemmas = [],
    entities = [],
    sentiment = {},
    intent = 'general_query',
    intent_confidence = 0,
    keywords = [],
    travel_entities = {}
  } = analysis;

  const sentimentIcon = () => {
    if (sentiment.label === 'positive') return <Smile className="w-5 h-5 text-emerald-600" />;
    if (sentiment.label === 'negative') return <Frown className="w-5 h-5 text-rose-600" />;
    return <Meh className="w-5 h-5 text-amber-600" />;
  };

  const sentimentColor = () => {
    if (sentiment.label === 'positive') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (sentiment.label === 'negative') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  // Entity label coloring
  const getEntityBadgeColor = (label) => {
    switch (label) {
      case 'GPE':
      case 'LOC':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DATE':
      case 'TIME':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MONEY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PERSON':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ORG':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${compact ? 'text-xs' : 'text-sm'}`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide">Live NLP Analytics Stream</h3>
            <p className="text-[11px] text-slate-300">NLTK + spaCy en_core_web_sm + VADER Polarity</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-medium border border-emerald-400/30">
          Processed Live
        </span>
      </div>

      <div className="p-5 space-y-4">

        {/* Original & Normalized Text */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Input Utterance:</span>
            {corrections.length > 0 && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-corrected {corrections.length} typo(s)
              </span>
            )}
          </div>
          <p className="font-mono text-slate-800 text-xs sm:text-sm font-medium break-words">
            "{original_text}"
          </p>
        </div>

        {/* Intent & Sentiment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Intent Card */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" /> Classified Intent
              </span>
              <span className="text-[11px] font-mono text-indigo-600 font-bold">
                {Math.round(intent_confidence * 100)}% match
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 capitalize">
              {intent.replace(/_/g, ' ')}
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, intent_confidence * 100))}%` }}
              />
            </div>
          </div>

          {/* Sentiment Card */}
          <div className={`p-3.5 rounded-xl border shadow-xs ${sentimentColor()}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium flex items-center gap-1.5 opacity-90">
                {sentimentIcon()} Sentiment Polarity
              </span>
              <span className="text-xs font-bold capitalize">
                {sentiment.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-extrabold tracking-tight">
                {sentiment.compound >= 0 ? `+${sentiment.compound}` : sentiment.compound}
              </span>
              <div className="text-[11px] space-x-2 font-mono">
                <span title="Positive">Pos: {sentiment.positive}</span>
                <span title="Neutral">Neu: {sentiment.neutral}</span>
                <span title="Negative">Neg: {sentiment.negative}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Named Entities (spaCy) */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> Named Entity Recognition (spaCy)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {entities.length} detected
            </span>
          </div>

          {entities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {entities.map((ent, idx) => (
                <span 
                  key={idx} 
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${getEntityBadgeColor(ent.label)}`}
                >
                  <span className="font-semibold">{ent.text}</span>
                  <span className="text-[10px] uppercase font-bold opacity-75 bg-black/10 px-1 rounded">
                    {ent.label}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No formal proper named entities detected in this utterance.</p>
          )}
        </div>

        {/* Travel Specific Extracted Parameters */}
        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
          <span className="text-xs font-semibold text-emerald-900 block mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Domain Travel Entities Extracted
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Budget</span>
              <span className="font-semibold text-slate-800">
                {travel_entities.budget ? `$${travel_entities.budget}` : 'Unspecified'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Duration</span>
              <span className="font-semibold text-slate-800">
                {travel_entities.days ? `${travel_entities.days} Days` : 'Unspecified'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Travellers</span>
              <span className="font-semibold text-slate-800">
                {travel_entities.travellers ? `${travel_entities.travellers} Person(s)` : '1'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Styles</span>
              <span className="font-semibold text-slate-800 truncate block">
                {travel_entities.styles?.length > 0 ? travel_entities.styles.join(', ') : 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Tokenization */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-600" /> Tokenization (NLTK punkt)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{tokens.length} tokens</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200/60">
            {tokens.map((tok, i) => (
              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700 shadow-2xs">
                {tok}
              </span>
            ))}
          </div>
        </div>

        {/* Stemming vs Lemmatization Comparison */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" /> Porter Stemming vs WordNet Lemmatization
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-[10px] uppercase font-sans font-bold text-slate-500 block mb-1">
                Porter Stemmer (Roots)
              </span>
              <div className="flex flex-wrap gap-1">
                {stems.slice(0, 8).map((st, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200/60 text-[11px]">
                    {st}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-[10px] uppercase font-sans font-bold text-slate-500 block mb-1">
                WordNet Lemmatizer (Bases)
              </span>
              <div className="flex flex-wrap gap-1">
                {lemmas.slice(0, 8).map((lem, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/60 text-[11px]">
                    {lem}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Keywords */}
        {keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" /> Extracted Salient Keywords
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/60">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
