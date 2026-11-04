import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatAssistant from './components/ChatAssistant';
import DestinationExplorer from './components/DestinationExplorer';
import TripPlanner from './components/TripPlanner';
import ItineraryView from './components/ItineraryView';
import NLPDashboard from './components/NLPDashboard';
import AboutSection from './components/AboutSection';
import { fetchSavedItineraries, deleteSavedItinerary } from './services/api';
import { Compass, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [latestNlpAnalysis, setLatestNlpAnalysis] = useState(null);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [prefillDest, setPrefillDest] = useState(null);

  const loadSavedItineraries = async () => {
    try {
      const data = await fetchSavedItineraries();
      setSavedItineraries(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSavedItineraries();
  }, []);

  const handleSelectDestination = (dest) => {
    setPrefillDest(dest);
    setActiveTab('destinations');
  };

  const handlePlanTripFromExplorer = (dest) => {
    setPrefillDest(dest);
    setActiveTab('planner');
  };

  const handleViewItinerary = (itin) => {
    setCurrentItinerary(itin);
    setActiveTab('itineraries');
  };

  const handleItinerarySaved = (itin) => {
    loadSavedItineraries();
  };

  const handleDeleteSaved = async (id) => {
    try {
      await deleteSavedItinerary(id);
      loadSavedItineraries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChatWithPlan = (preferences) => {
    setActiveTab('chat');
  };

  const handleStartChatWithItin = (itin) => {
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        savedCount={savedItineraries.length} 
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatAssistant 
            onSelectDestination={handleSelectDestination}
            onViewItinerary={handleViewItinerary}
            onItinerarySaved={handleItinerarySaved}
            latestNlpAnalysis={latestNlpAnalysis}
            setLatestNlpAnalysis={setLatestNlpAnalysis}
          />
        )}

        {activeTab === 'destinations' && (
          <DestinationExplorer 
            onSelectDestination={handleSelectDestination}
            onPlanTrip={handlePlanTripFromExplorer}
          />
        )}

        {activeTab === 'planner' && (
          <TripPlanner 
            prefillDest={prefillDest}
            onItineraryGenerated={handleViewItinerary}
            onStartChatWithPlan={handleStartChatWithPlan}
          />
        )}

        {activeTab === 'itineraries' && (
          <ItineraryView 
            itinerary={currentItinerary}
            onUpdateItinerary={setCurrentItinerary}
            savedItineraries={savedItineraries}
            onSelectSavedItinerary={setCurrentItinerary}
            onDeleteSavedItinerary={handleDeleteSaved}
            onStartChatWithItin={handleStartChatWithItin}
          />
        )}

        {activeTab === 'nlp' && (
          <NLPDashboard 
            initialAnalysis={latestNlpAnalysis}
          />
        )}

        {activeTab === 'about' && (
          <AboutSection />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">RoamWise</span>
            <span>— AI-Powered NLP Travel Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setActiveTab('nlp')} className="hover:text-emerald-700 transition-colors">
              NLP Engine
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('destinations')} className="hover:text-emerald-700 transition-colors">
              Destinations
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('planner')} className="hover:text-emerald-700 transition-colors">
              Trip Planner
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('about')} className="hover:text-emerald-700 transition-colors">
              Architecture
            </button>
          </div>

          <p className="text-slate-400">
            Python NLTK • spaCy • VADER • FastAPI • React
          </p>
        </div>
      </footer>

    </div>
  );
}
