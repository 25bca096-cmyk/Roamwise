import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  Calendar, 
  DollarSign, 
  Star, 
  ChevronRight, 
  Compass, 
  Sparkles, 
  Info, 
  X,
  CheckCircle2,
  Utensils,
  Car
} from 'lucide-react';
import { fetchDestinations } from '../services/api';

export default function DestinationExplorer({ onSelectDestination, onPlanTrip }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeModalDest, setActiveModalDest] = useState(null);

  const stylesList = ['All', 'Adventure', 'Beaches', 'Mountains', 'Romantic', 'Historical', 'Nature', 'Luxury', 'Culinary'];
  const tiersList = ['All', 'Budget', 'Moderate', 'Luxury'];
  const regionsList = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const data = await fetchDestinations({
        search,
        style: selectedStyle,
        budget_tier: selectedTier,
        region: selectedRegion
      });
      setDestinations(data.destinations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, [selectedStyle, selectedTier, selectedRegion]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDestinations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 mb-8 shadow-card">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs tracking-wider uppercase border border-emerald-400/30 inline-block mb-3">
            Global Destination Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Discover Your Next Extraordinary Journey
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Browse through expertly curated worldwide destinations analyzed with NLP intelligence. Filter by travel styles, seasonal alignment, and budget tiers.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Compass className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-8 space-y-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by destination name, country, attractions, or keywords (e.g. 'Matterhorn', 'Indonesia')..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="space-y-3 pt-2">
          
          {/* Style Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Style:
            </span>
            {stylesList.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStyle(st)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedStyle === st
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Region and Budget Selectors */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            
            {/* Region selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Budget Tier */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Budget Tier:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {tiersList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <span className="text-slate-400 font-medium ml-auto">
              Found {destinations.length} destination{destinations.length === 1 ? '' : 's'}
            </span>
          </div>

        </div>

      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No destinations matched your criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the travel style filter, or reset filters to see all global spots.
          </p>
          <button
            onClick={() => { setSelectedStyle('All'); setSelectedTier('All'); setSelectedRegion('All'); setSearch(''); }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Photo & Overlays */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Rating */}
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{dest.rating}</span>
                </span>

                {/* Country Pill */}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs rounded-full text-xs font-medium text-white flex items-center gap-1 shadow-xs">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{dest.country}</span>
                </span>

                {/* Cost and duration bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    ~${dest.avg_daily_cost_usd} / day
                  </span>
                  <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    {dest.ideal_duration_days[0]}–{dest.ideal_duration_days[1]} Days
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {dest.description}
                  </p>

                  {/* Travel Styles */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {dest.styles.slice(0, 3).map((st, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {st}
                      </span>
                    ))}
                  </div>

                  {/* Top Attractions preview */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">Top Attractions:</span>
                    <p className="text-slate-500 line-clamp-1 text-[11px]">
                      {dest.major_attractions.slice(0, 3).join(' • ')}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalDest(dest)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500" /> Details
                  </button>
                  <button
                    onClick={() => onPlanTrip && onPlanTrip(dest)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Plan Trip
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Destination Detail Modal */}
      {activeModalDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative">
            
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-72">
              <img
                src={activeModalDest.image_url}
                alt={activeModalDest.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalDest(null)}
                className="absolute top-4 right-4 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-1 bg-emerald-600 rounded-md text-xs font-semibold uppercase tracking-wider mb-1 inline-block">
                  {activeModalDest.region}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalDest.name}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-sm">
              <p className="text-slate-700 leading-relaxed">
                {activeModalDest.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Daily Cost</span>
                  <span className="font-extrabold text-emerald-700 text-base">~${activeModalDest.avg_daily_cost_usd}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ideal Duration</span>
                  <span className="font-extrabold text-slate-800 text-base">{activeModalDest.ideal_duration_days[0]}–{activeModalDest.ideal_duration_days[1]} Days</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Season</span>
                  <span className="font-extrabold text-slate-800 text-base">{activeModalDest.best_seasons[0]}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating</span>
                  <span className="font-extrabold text-amber-600 text-base">★ {activeModalDest.rating}</span>
                </div>
              </div>

              {/* Major Attractions */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Must-See Attractions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalDest.major_attractions.map((attr, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{attr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Food Specialties */}
              {activeModalDest.food_specialties && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-amber-600" /> Culinary Specialties
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalDest.food_specialties.map((dish, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-xs font-medium">
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transportation */}
              {activeModalDest.transportation && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" /> Getting Around
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalDest.transportation.map((trans, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-xs font-medium">
                        {trans}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Tips */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Insider Travel Tips
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {activeModalDest.practical_tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Modal Action */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalDest(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const dest = activeModalDest;
                    setActiveModalDest(null);
                    if (onPlanTrip) onPlanTrip(dest);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" /> Plan Itinerary for {activeModalDest.name.split(' ')[0]}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
