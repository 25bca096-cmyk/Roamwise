import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Compass, 
  RefreshCw, 
  Activity, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  ArrowRight,
  BookmarkPlus,
  Smile,
  Frown,
  Meh,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { sendChatMessage, saveItinerary } from '../services/api';
import NLPAnalyticsPanel from './NLPAnalyticsPanel';

export default function ChatAssistant({ 
  onSelectDestination, 
  onViewItinerary, 
  onItinerarySaved,
  latestNlpAnalysis,
  setLatestNlpAnalysis 
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello! I'm **RoamWise**, your intelligent AI travel advisor. 🌍✈️\n\nI combine natural language processing with deep travel intelligence to understand your preferences, analyze your travel style, recommend perfect destinations across the globe, and generate custom day-by-day itineraries.\n\n**To get started, feel free to ask me anything in natural language:**\n• *"I want an adventurous 5-day mountain trip for 2 people with a $2000 budget"*\n• *"Recommend romantic beach destinations for our honeymoon in December"*\n• *"Plan a 7-day cultural itinerary for Kyoto and Tokyo"*`,
      sentiment: { label: 'positive', compound: 0.8 },
      follow_up_chips: [
        '5-day mountain adventure under $2000',
        'Romantic beach getaway in Bali',
        'Explore cultural wonders in Japan',
        'Family trip to Europe'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNlpDrawer, setShowNlpDrawer] = useState(true);
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(text, sessionId);

      if (response.nlp_analysis) {
        setLatestNlpAnalysis(response.nlp_analysis);
      }

      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.bot_response,
        nlp_analysis: response.nlp_analysis,
        recommendations: response.recommendations,
        itinerary: response.itinerary,
        follow_up_chips: response.follow_up_chips,
        sentiment: response.nlp_analysis?.sentiment,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I encountered an issue processing your travel request. Please ensure the backend server is reachable and try again.",
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItineraryClick = async (itin) => {
    try {
      await saveItinerary(itin);
      if (onItinerarySaved) onItinerarySaved(itin);
      setSavedSuccessMsg(`Saved "${itin.title}" to your itineraries!`);
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Chat history cleared! Tell me where you'd like to travel next.",
        follow_up_chips: [
          '5-day mountain adventure under $2000',
          'Romantic beach getaway in Bali',
          'Budget backpacking in Southeast Asia'
        ]
      }
    ]);
  };

  // Basic markdown bold parser helper
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold syntax **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={`${line.trim() === '' ? 'h-2' : 'my-1'} leading-relaxed`}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="italic text-slate-700">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Toast Notification */}
      {savedSuccessMsg && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Main Layout Grid: Chat + NLP Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Chat Interface Column */}
        <div className={`${showNlpDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 flex flex-col h-[82vh] bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden`}>
          
          {/* Chat Header */}
          <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  RoamWise Conversational Advisor
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Context-Aware
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Natural Language Understanding & Itinerary Planner
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNlpDrawer(!showNlpDrawer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showNlpDrawer 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle Real-time NLP Analytics Panel"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">NLP Panel</span>
              </button>

              <button
                onClick={handleClearChat}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                title="Reset Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 flex-shrink-0 flex items-center justify-center text-white mt-1 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl shadow-xs text-sm ${
                        isUser 
                          ? 'bg-emerald-600 text-white rounded-tr-xs' 
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                      }`}>
                        
                        {/* Sentiment Pill (if assistant message) */}
                        {!isUser && msg.sentiment && (
                          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
                            {msg.sentiment.label === 'positive' && <Smile className="w-3.5 h-3.5 text-emerald-600" />}
                            {msg.sentiment.label === 'negative' && <Frown className="w-3.5 h-3.5 text-rose-600" />}
                            {msg.sentiment.label === 'neutral' && <Meh className="w-3.5 h-3.5 text-amber-600" />}
                            <span className="capitalize text-slate-600 font-semibold">{msg.sentiment.label} Tone</span>
                            <span className="text-slate-400 font-mono text-[10px]">({msg.sentiment.compound})</span>
                          </div>
                        )}

                        <div className="prose prose-sm max-w-none prose-slate">
                          {renderFormattedContent(msg.content)}
                        </div>
                      </div>

                      {/* Travel Recommendations Cards (if returned in this turn) */}
                      {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Recommended Destinations
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.recommendations.map((rec, rIdx) => {
                              const dest = rec.destination;
                              return (
                                <div 
                                  key={rIdx}
                                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all group"
                                >
                                  <div className="relative h-28 overflow-hidden">
                                    <img 
                                      src={dest.image_url} 
                                      alt={dest.name} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <span className="absolute top-2 right-2 bg-emerald-600/95 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-xs">
                                      {rec.match_score}% Match
                                    </span>
                                    <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
                                      ${dest.avg_daily_cost_usd}/day
                                    </span>
                                  </div>
                                  <div className="p-3">
                                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                                      {dest.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                      {dest.description}
                                    </p>
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                      <button
                                        onClick={() => onSelectDestination && onSelectDestination(dest)}
                                        className="text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1"
                                      >
                                        Explore <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleSendMessage(`Create a ${rec.trip_days}-day itinerary for ${dest.name}`)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                      >
                                        Plan Trip
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Itinerary Preview Card (if generated in this turn) */}
                      {!isUser && msg.itinerary && (
                        <div className="bg-white rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-sm mt-3 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block mb-1">
                                Generated Itinerary
                              </span>
                              <h4 className="font-bold text-slate-900 text-base">
                                {msg.itinerary.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {msg.itinerary.days} Days • ~${intOrZero(msg.itinerary.total_estimated_cost)} USD • {msg.itinerary.travellers} Person(s)
                              </p>
                            </div>
                            <img 
                              src={msg.itinerary.image_url} 
                              alt={msg.itinerary.destination} 
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200" 
                            />
                          </div>

                          {/* Quick Day Peek */}
                          <div className="mt-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700">
                            <span className="font-semibold text-slate-900">Day 1 Preview: </span>
                            {msg.itinerary.daily_itineraries?.[0]?.title || 'Arrival and orientation'}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => onViewItinerary && onViewItinerary(msg.itinerary)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              View Full Day-by-Day Schedule <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSaveItineraryClick(msg.itinerary)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
                              title="Save Itinerary"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Follow-up Quick Chips */}
                      {!isUser && msg.follow_up_chips && msg.follow_up_chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.follow_up_chips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleSendMessage(chip)}
                              className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-full text-xs font-medium border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              <span>{chip}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">RoamWise NLP Engine analyzing...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200/80">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask RoamWise (e.g., 'Plan a 6-day trip to Switzerland with $2500' or 'make it cheaper')..."
                className="w-full pl-4 pr-12 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Powered by NLTK, spaCy, and VADER Sentiment Analysis</span>
              <span className="hidden sm:inline">Try follow-ups: "make it cheaper", "add two days"</span>
            </div>
          </div>

        </div>

        {/* NLP Analytics Drawer Column */}
        {showNlpDrawer && (
          <div className="lg:col-span-4 h-[82vh] overflow-y-auto space-y-4 animate-fade-in">
            <NLPAnalyticsPanel analysis={latestNlpAnalysis} />
          </div>
        )}

      </div>
    </div>
  );
}

function intOrZero(val) {
  if (!val) return 0;
  return Math.round(Number(val)).toLocaleString();
}
