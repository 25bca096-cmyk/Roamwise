import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  BookmarkPlus, 
  Printer, 
  Share2, 
  Utensils, 
  Car, 
  Compass, 
  ShieldAlert, 
  ArrowRight,
  TrendingDown,
  PlusCircle,
  Coffee,
  Sun,
  Moon,
  Trash2,
  BookmarkCheck
} from 'lucide-react';
import { modifyItinerary, saveItinerary } from '../services/api';

export default function ItineraryView({ 
  itinerary, 
  onUpdateItinerary, 
  savedItineraries = [], 
  onSelectSavedItinerary,
  onDeleteSavedItinerary,
  onStartChatWithItin
}) {
  const [activeDay, setActiveDay] = useState(1);
  const [isModifying, setIsModifying] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'saved'

  if (!itinerary && savedItineraries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 shadow-sm">
          <Calendar className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-70" />
          <h2 className="text-2xl font-bold text-slate-800">No Itinerary Generated Yet</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            You can generate a personalized day-by-day travel plan instantly from the AI Chat Assistant or configure one in the Trip Planner.
          </p>
        </div>
      </div>
    );
  }

  const current = itinerary || (savedItineraries[0]?.itinerary);

  const handleModification = async (modType, extraParam = null) => {
    if (!current) return;
    setIsModifying(true);
    try {
      const updated = await modifyItinerary(current, modType, extraParam);
      if (onUpdateItinerary) onUpdateItinerary(updated);
      setToastMsg(`Itinerary updated: ${modType.replace(/_/g, ' ')}`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsModifying(false);
    }
  };

  const handleSaveCurrent = async () => {
    if (!current) return;
    try {
      await saveItinerary(current);
      setToastMsg(`Saved "${current.title}" to your collection!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Selector: Current Itinerary vs Saved Itineraries */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider inline-block mb-1">
            AI Travel Itineraries
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curated Day-by-Day Master Plan
          </h1>
        </div>

        {savedItineraries.length > 0 && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Plan
            </button>
            <button
              onClick={() => setViewMode('saved')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'saved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved ({savedItineraries.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* SAVED ITINERARIES GALLERY VIEW */}
      {viewMode === 'saved' ? (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-800">Your Saved Itineraries</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItineraries.map((saved) => (
              <div
                key={saved.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {saved.days} Days
                    </span>
                    <span className="font-mono">
                      ~${Math.round(saved.total_estimated_cost).toLocaleString()} {saved.currency}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">
                    {saved.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {saved.destination}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onSelectSavedItinerary) onSelectSavedItinerary(saved.itinerary);
                      setViewMode('active');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Open Itinerary <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSavedItinerary && onDeleteSavedItinerary(saved.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete saved itinerary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE ITINERARY VIEW */
        <div className="space-y-8">
          
          {/* Hero Itinerary Card */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-card">
            <div className="h-64 sm:h-80 relative">
              <img
                src={current.image_url}
                alt={current.destination}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
              
              <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                <span className="px-3 py-1 bg-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs">
                  {current.region}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveCurrent}
                    className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <BookmarkPlus className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Export / Print
                  </button>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  {current.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-emerald-400" /> {current.days} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> ~${Math.round(current.total_estimated_cost).toLocaleString()} USD Total
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded-md bg-white/10 font-semibold">
                    {current.budget_tier} Tier
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Modification Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Adjust & Regenerate Itinerary:
            </span>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => handleModification('make_cheaper')}
                disabled={isModifying}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
              >
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Make it Cheaper</span>
              </button>

              <button
                onClick={() => handleModification('add_days', 2)}
                disabled={isModifying}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add 2 More Days</span>
              </button>

              <button
                onClick={() => onStartChatWithItin && onStartChatWithItin(current)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Discuss with RoamWise AI</span>
              </button>
            </div>
          </div>

          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {current.daily_itineraries?.map((day) => {
              const isActive = activeDay === day.day_number;
              return (
                <button
                  key={day.day_number}
                  onClick={() => setActiveDay(day.day_number)}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Day {day.day_number}
                </button>
              );
            })}
          </div>

          {/* Active Day Card Breakdown */}
          {(() => {
            const dayPlan = current.daily_itineraries?.find(d => d.day_number === activeDay) || current.daily_itineraries?.[0];
            if (!dayPlan) return null;

            return (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Day {dayPlan.day_number} Schedule
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {dayPlan.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    Est. Day Cost: ~${Math.round(dayPlan.estimated_day_cost)} USD
                  </span>
                </div>

                {/* Morning / Afternoon / Evening Timeline */}
                <div className="space-y-4">
                  
                  {/* Morning */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                          Morning Exploration ({dayPlan.morning.time})
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" /> {dayPlan.morning.location}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {dayPlan.morning.activity}
                      </p>
                      <p className="text-xs text-amber-800/80 mt-1 italic">
                        💡 Tip: {dayPlan.morning.tip}
                      </p>
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                          Afternoon Adventure ({dayPlan.afternoon.time})
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" /> {dayPlan.afternoon.location}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {dayPlan.afternoon.activity}
                      </p>
                      <p className="text-xs text-emerald-800/80 mt-1 italic">
                        💡 Tip: {dayPlan.afternoon.tip}
                      </p>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/60 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                          Evening Atmosphere & Dinner ({dayPlan.evening.time})
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-600" /> {dayPlan.evening.location}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {dayPlan.evening.activity}
                      </p>
                      <p className="text-xs text-indigo-800/80 mt-1 italic">
                        💡 Tip: {dayPlan.evening.tip}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Day Meals recommendation */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" /> Recommended Dining for Today
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">Breakfast:</span>
                      <span className="text-slate-500">{dayPlan.meals.breakfast}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">Lunch:</span>
                      <span className="text-slate-500">{dayPlan.meals.lunch}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">Dinner:</span>
                      <span className="text-slate-500">{dayPlan.meals.dinner}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Practical Trip Information Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Accommodation & Transportation */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" /> Recommended Logistics
              </h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Accommodation Blueprint:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    {current.accommodation_suggestion}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Transit Modes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {current.transportation_summary?.map((tr, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">
                        {tr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Advisories & Tips */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Practical Travel Advisories
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {current.practical_tips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
