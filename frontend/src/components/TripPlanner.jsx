import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Sparkles, 
  Plane, 
  Hotel, 
  Compass, 
  Check, 
  ArrowRight,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { getRecommendations, generateItinerary } from '../services/api';

export default function TripPlanner({ onItineraryGenerated, onStartChatWithPlan, prefillDest }) {
  const [startingLocation, setStartingLocation] = useState('');
  const [destinationInput, setDestinationInput] = useState(prefillDest?.name || '');
  const [budget, setBudget] = useState(2500);
  const [days, setDays] = useState(5);
  const [travellers, setTravellers] = useState(2);
  const [season, setSeason] = useState('Summer');
  const [selectedStyles, setSelectedStyles] = useState(['Adventure', 'Nature']);
  const [transportation, setTransportation] = useState('Train');
  const [accommodation, setAccommodation] = useState('Boutique Hotel');

  const [recommendations, setRecommendations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const styleOptions = [
    'Adventure', 'Nature', 'Beaches', 'Mountains', 'Luxury',
    'Family', 'Romantic', 'Historical', 'Culinary', 'Urban'
  ];

  const transportOptions = ['Flight', 'Train', 'Rental Car', 'Bus', 'Ferry'];
  const accommodationOptions = ['Boutique Hotel', 'Luxury Resort', 'Budget Hostel', 'Private Villa', 'Alpine Chalet'];
  const seasonOptions = ['Spring', 'Summer', 'Autumn', 'Winter'];

  const toggleStyle = (style) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style) 
        : [...prev, style]
    );
  };

  const fetchLiveRecommendations = async () => {
    setIsSearching(true);
    try {
      const res = await getRecommendations({
        budget: Number(budget),
        days: Number(days),
        travellers: Number(travellers),
        travel_styles: selectedStyles,
        travel_season: season,
        preferred_region: destinationInput || null,
        limit: 3
      });
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveRecommendations();
    }, 400);
    return () => clearTimeout(timer);
  }, [budget, days, travellers, season, selectedStyles, destinationInput]);

  const handleGenerateItinerary = async (targetDestId = null) => {
    setIsGenerating(true);
    try {
      const destIdToUse = targetDestId || (recommendations[0]?.destination?.id) || 'swiss-alps';
      let tier = 'moderate';
      if (budget / (days * travellers) < 75) tier = 'budget';
      if (budget / (days * travellers) > 200) tier = 'luxury';

      const itinerary = await generateItinerary({
        destination_id: destIdToUse,
        days: Number(days),
        budget_tier: tier,
        travellers: Number(travellers),
        travel_styles: selectedStyles
      });

      if (onItineraryGenerated) {
        onItineraryGenerated(itinerary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTransferToChat = () => {
    const preferences = {
      starting_location: startingLocation,
      preferred_region: destinationInput,
      budget: Number(budget),
      days: Number(days),
      travellers: Number(travellers),
      travel_season: season,
      travel_styles: selectedStyles,
      transportation_preference: transportation,
      accommodation_preference: accommodation
    };
    if (onStartChatWithPlan) {
      onStartChatWithPlan(preferences);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Page Title */}
      <div className="mb-8">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider inline-block mb-2">
          Custom Trip Planner
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Configure Your Perfect Travel Blueprint
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-1 max-w-2xl">
          Customize your journey requirements through optional fields. Our NLP recommendation engine updates live destination matches dynamically as you adjust your preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Planner Controls Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
          
          {/* Starting Location & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Starting From (Optional)
              </label>
              <input
                type="text"
                value={startingLocation}
                onChange={(e) => setStartingLocation(e.target.value)}
                placeholder="e.g. New York, London, Mumbai"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" /> Target Destination / Region
              </label>
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="e.g. Switzerland, Bali, Europe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Budget Slider */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Target Budget (USD)
              </label>
              <span className="text-lg font-extrabold text-emerald-700 font-mono">
                ${Number(budget).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>$500 (Budget)</span>
              <span>$3,000 (Comfortable)</span>
              <span>$10,000+ (Luxury)</span>
            </div>
          </div>

          {/* Duration & Travellers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Days Slider */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Days
                </label>
                <span className="font-extrabold text-slate-900 text-base">{days} Days</span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Travellers Count */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Travellers
              </label>
              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setTravellers(Math.max(1, travellers - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="font-extrabold text-slate-900 text-sm">
                  {travellers} {travellers === 1 ? 'Person' : 'People'}
                </span>
                <button
                  type="button"
                  onClick={() => setTravellers(Math.min(10, travellers + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Season Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Travel Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

          </div>

          {/* Travel Styles Multi-select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Your Travel Styles (Multi-select)
            </label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((st) => {
                const isSelected = selectedStyles.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStyle(st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transport & Accommodation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-blue-600" /> Preferred Transportation
              </label>
              <select
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700"
              >
                {transportOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-amber-600" /> Accommodation Preference
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700"
              >
                {accommodationOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => handleGenerateItinerary()}
              disabled={isGenerating || recommendations.length === 0}
              className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Day-by-Day Itinerary...' : 'Generate AI Itinerary'}</span>
            </button>

            <button
              type="button"
              onClick={handleTransferToChat}
              className="w-full sm:w-auto py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Discuss in Chat</span>
            </button>
          </div>

        </div>

        {/* Live Matching Recommendations Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Live Matched Destinations
            </h3>
            {isSearching && (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" /> Scoring...
              </span>
            )}
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              <Compass className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Calculating recommendations for your filters...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => {
                const dest = rec.destination;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all p-4 group"
                  >
                    <div className="flex gap-4">
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {rec.match_score}% Match
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            ~${intOrZero(rec.estimated_total_cost)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                          {dest.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {rec.reasons[0]}
                        </p>
                        
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {dest.styles.slice(0, 2).join(' • ')}
                          </span>
                          <button
                            onClick={() => handleGenerateItinerary(dest.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            Generate Plan <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick NLP Match Note */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900">
            <span className="font-bold block mb-1">💡 Scoring Methodology:</span>
            Scores dynamically synthesize travel style Jaccard overlaps, daily expense feasibility, duration range constraints, and seasonal meteorological windows.
          </div>

        </div>

      </div>

    </div>
  );
}

function intOrZero(val) {
  if (!val) return 0;
  return Math.round(Number(val)).toLocaleString();
}
