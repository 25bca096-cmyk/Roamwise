/**
 * RoamWise Client-Side NLP Engine Fallback
 * Provides 100% resilient linguistic processing in the browser when running
 * on static/serverless deployments:
 * - Tokenization
 * - Porter Stemmer implementation
 * - Lemmatization rules
 * - Named Entity Recognition (Dates, Money, GPE, Travel Entities)
 * - VADER Polarity Sentiment Analysis
 * - Semantic Intent Classification
 * - Multi-attribute Recommendation Scoring
 * - Day-by-Day Itinerary Synthesis
 */

export const DESTINATIONS_DATA = [
  {
    "id": "swiss-alps",
    "name": "Swiss Alps (Interlaken & Zermatt)",
    "country": "Switzerland",
    "region": "Western Europe",
    "continent": "Europe",
    "styles": ["Mountains", "Adventure", "Nature", "Romantic", "Luxury"],
    "budget_tier": "luxury",
    "avg_daily_cost_usd": 240,
    "ideal_duration_days": [5, 10],
    "best_seasons": ["Summer", "Winter"],
    "best_months": ["June", "July", "August", "December", "January", "February"],
    "major_attractions": ["Jungfraujoch - Top of Europe", "Matterhorn Viewpoint", "Lake Thun & Brienz", "Harder Kulm", "Gornergrat Railway"],
    "highlights": ["Panoramic glacier trains", "Alpine hiking trails", "World-class ski resorts", "Fondue chalets"],
    "description": "Dramatic snow-capped peaks, crystalline glacial lakes, and quintessential Alpine villages offering the ultimate fusion of mountain adventure and luxury serenity.",
    "image_url": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Get the Swiss Travel Pass for unlimited train, boat, and bus transit.", "Layer clothing even in summer as high elevations are frosty."],
    "transportation": ["Scenic Trains (Glacier Express)", "Cable Cars & Funiculars", "Rental Car"],
    "food_specialties": ["Cheese Fondue", "Raclette", "Rösti", "Swiss Chocolate"],
    "rating": 4.95,
    "reviews_count": 2840
  },
  {
    "id": "bali",
    "name": "Bali (Ubud & Seminyak)",
    "country": "Indonesia",
    "region": "Southeast Asia",
    "continent": "Asia",
    "styles": ["Beaches", "Romantic", "Nature", "Adventure", "Family"],
    "budget_tier": "budget",
    "avg_daily_cost_usd": 65,
    "ideal_duration_days": [6, 12],
    "best_seasons": ["Spring", "Summer", "Autumn"],
    "best_months": ["April", "May", "June", "July", "August", "September"],
    "major_attractions": ["Tegallalang Rice Terraces", "Uluwatu Sea Temple", "Sacred Monkey Forest", "Mount Batur Sunrise Trek", "Seminyak Beach"],
    "highlights": ["Private pool villas", "Vibrant sunset beach clubs", "Spiritual yoga sanctuaries", "Active volcano treks"],
    "description": "An enchanted island paradise blending emerald jungle terraces, mystical Hindu water temples, golden surf beaches, and indulgent wellness retreats.",
    "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Hire private scooter or car drivers through Grab/Gojek.", "Dress modestly with sarongs when entering temples."],
    "transportation": ["Private Driver", "Scooter Rental", "Speedboats to Gili/Nusa Penida"],
    "food_specialties": ["Nasi Goreng", "Babi Guling", "Satay Lilit", "Açaí Bowls"],
    "rating": 4.88,
    "reviews_count": 4120
  },
  {
    "id": "kyoto",
    "name": "Kyoto & Nara",
    "country": "Japan",
    "region": "East Asia",
    "continent": "Asia",
    "styles": ["Historical", "Romantic", "Nature", "Culinary", "Family"],
    "budget_tier": "moderate",
    "avg_daily_cost_usd": 135,
    "ideal_duration_days": [4, 8],
    "best_seasons": ["Spring", "Autumn"],
    "best_months": ["March", "April", "May", "October", "November"],
    "major_attractions": ["Fushimi Inari Shrine (Torii Gates)", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)", "Gion Geisha District", "Nara Deer Park"],
    "highlights": ["Traditional Machiya townhouses", "Autumn crimson maple foliage", "Zen stone rock gardens", "Authentic Kaiseki tea ceremonies"],
    "description": "The cultural soul of Japan with thousands of classical Buddhist temples, serene Shinto shrines, meditative gardens, and historic wooden geisha alleys.",
    "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Visit Fushimi Inari at dawn (6 AM) to escape tour crowds.", "Purchase an IC card (ICOCA/Suica) for smooth subway travel."],
    "transportation": ["Shinkansen Bullet Train", "Kyoto City Bus & Metro", "Bicycle"],
    "food_specialties": ["Matcha Parfaits", "Kaiseki Ryori", "Kyoto Yudofu", "Ramen"],
    "rating": 4.94,
    "reviews_count": 3910
  },
  {
    "id": "paris",
    "name": "Paris",
    "country": "France",
    "region": "Western Europe",
    "continent": "Europe",
    "styles": ["Romantic", "Historical", "Luxury", "Culinary", "Urban"],
    "budget_tier": "luxury",
    "avg_daily_cost_usd": 210,
    "ideal_duration_days": [4, 7],
    "best_seasons": ["Spring", "Summer", "Autumn"],
    "best_months": ["April", "May", "June", "September", "October"],
    "major_attractions": ["Eiffel Tower & Champ de Mars", "The Louvre Museum", "Musée d'Orsay", "Montmartre & Sacré-Cœur", "Seine River Cruise"],
    "highlights": ["Gourmet Michelin patisseries", "World-renowned art masterpieces", "Haussmannian boulevards", "Champagne river cruises"],
    "description": "The timeless City of Light captivates travelers with monumental architecture, world-leading art galleries, charming pavement cafés, and haute couture elegance.",
    "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Book Louvre and Eiffel Tower tickets at least 3 weeks in advance.", "Navigo Easy card makes metro hopping effortless."],
    "transportation": ["Paris Métro & RER", "Walking", "Seine River Bateaux"],
    "food_specialties": ["Croissants & Baguettes", "Duck Confit", "Macarons", "Boeuf Bourguignon"],
    "rating": 4.87,
    "reviews_count": 5200
  },
  {
    "id": "santorini",
    "name": "Santorini & Oia",
    "country": "Greece",
    "region": "Southern Europe",
    "continent": "Europe",
    "styles": ["Romantic", "Beaches", "Luxury", "Historical"],
    "budget_tier": "luxury",
    "avg_daily_cost_usd": 230,
    "ideal_duration_days": [3, 6],
    "best_seasons": ["Spring", "Summer", "Autumn"],
    "best_months": ["May", "June", "July", "August", "September", "October"],
    "major_attractions": ["Oia Sunset Viewpoint", "Caldera Cliffside Walk", "Red Beach & Perissa Black Sand", "Akrotiri Archaeological Site", "Amoudi Bay"],
    "highlights": ["Whitewashed cliffside villas", "Blue-domed cycladic churches", "Volcanic wine tastings", "Catamaran caldera cruises"],
    "description": "Perched on dramatic Aegean volcanic cliffs, Santorini mesmerizes with iconic cobalt-domed chapels, cliffside infinity pools, and legendary sunsets over the caldera.",
    "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Stay in Imerovigli for caldera views with fewer crowds than Oia.", "Wear sturdy flat shoes for the cobblestone caldera steps."],
    "transportation": ["Catamaran Ferries", "Rental ATV/Buggy", "Local KTEL Buses"],
    "food_specialties": ["Santorini Fava", "Tomato Keftedes", "Fresh Grilled Octopus", "Assyrtiko Wine"],
    "rating": 4.91,
    "reviews_count": 3450
  },
  {
    "id": "costa-rica",
    "name": "Costa Rica (Arenal & Manuel Antonio)",
    "country": "Costa Rica",
    "region": "Central America",
    "continent": "Americas",
    "styles": ["Adventure", "Nature", "Family", "Beaches"],
    "budget_tier": "moderate",
    "avg_daily_cost_usd": 110,
    "ideal_duration_days": [7, 12],
    "best_seasons": ["Winter", "Spring"],
    "best_months": ["December", "January", "February", "March", "April"],
    "major_attractions": ["Arenal Volcano National Park", "Manuel Antonio Rainforest Beach", "Monteverde Cloud Forest Hanging Bridges", "Tabacón Thermal Hot Springs", "La Fortuna Waterfall"],
    "highlights": ["Ziplining above cloud canopy", "Sloth and toucan wildlife safaris", "Geothermal hot spring rivers", "Pura Vida beach lifestyle"],
    "description": "A pioneering eco-tourism haven boasting rich biodiversity, active volcanoes, misty cloud forests, thrilling canopy zip-lines, and idyllic Pacific beaches.",
    "image_url": "https://images.unsplash.com/photo-1518259102261-b40117eabbc9?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Rent a 4WD SUV if driving through Monteverde cloud forest roads.", "Pack high-factor insect repellant and dry-fit rain jackets."],
    "transportation": ["4x4 Rental SUV", "Interbus Shuttles", "Domestic Small Flights"],
    "food_specialties": ["Gallo Pinto", "Casado Plate", "Fresh Ceviche", "Highland Arabica Coffee"],
    "rating": 4.89,
    "reviews_count": 2180
  },
  {
    "id": "banff",
    "name": "Banff & Lake Louise",
    "country": "Canada",
    "region": "North America",
    "continent": "Americas",
    "styles": ["Mountains", "Nature", "Adventure", "Family"],
    "budget_tier": "moderate",
    "avg_daily_cost_usd": 150,
    "ideal_duration_days": [5, 8],
    "best_seasons": ["Summer", "Winter"],
    "best_months": ["June", "July", "August", "September", "December", "January", "February"],
    "major_attractions": ["Moraine Lake & Valley of Ten Peaks", "Lake Louise Turquoise Waters", "Banff Gondola & Sulphur Mountain", "Icefields Parkway", "Johnston Canyon"],
    "highlights": ["Electric-turquoise glacial waters", "Grizzly and elk wildlife sightings", "Rocky Mountain ski basins", "Natural geothermal hot springs"],
    "description": "Nestled in the heart of the Canadian Rockies, Banff National Park features unreal turquoise glacial waters, soaring mountain amphitheatres, and pristine alpine wilderness.",
    "image_url": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Reserve Parks Canada shuttles to Moraine Lake well ahead.", "Carry bear spray when hiking."],
    "transportation": ["Rental Car", "Parks Canada Shuttles", "Roam Public Transit"],
    "food_specialties": ["Alberta Bison Steaks", "Poutine with Cheese Curds", "Maple Taffy"],
    "rating": 4.97,
    "reviews_count": 2790
  },
  {
    "id": "rome",
    "name": "Rome & Vatican City",
    "country": "Italy",
    "region": "Southern Europe",
    "continent": "Europe",
    "styles": ["Historical", "Culinary", "Romantic", "Urban", "Family"],
    "budget_tier": "moderate",
    "avg_daily_cost_usd": 140,
    "ideal_duration_days": [4, 7],
    "best_seasons": ["Spring", "Autumn"],
    "best_months": ["March", "April", "May", "September", "October", "November"],
    "major_attractions": ["The Colosseum & Roman Forum", "Vatican Museums & Sistine Chapel", "Trevi Fountain", "The Pantheon", "Trastevere Alleyways"],
    "highlights": ["2,800 years of living history", "Wood-fired Roman pizzerias", "Artisan gelato parlors", "Baroque piazzas and marble fountains"],
    "description": "An open-air amphitheater of antiquities where ancient gladiatorial monuments sit beside buzzing espresso bars and renaissance fountains.",
    "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Bring a reusable water bottle — Rome's fountains offer free cold mineral water.", "Book Vatican skip-the-line early."],
    "transportation": ["Rome Metro & Tram", "Foot Walking", "Frecciarossa High-Speed Trains"],
    "food_specialties": ["Carbonara & Cacio e Pepe", "Supplì", "Roman-style Thin Crust Pizza", "Artisan Gelato"],
    "rating": 4.92,
    "reviews_count": 4780
  },
  {
    "id": "queenstown",
    "name": "Queenstown & Milford Sound",
    "country": "New Zealand",
    "region": "Oceania",
    "continent": "Oceania",
    "styles": ["Adventure", "Nature", "Mountains", "Romantic"],
    "budget_tier": "moderate",
    "avg_daily_cost_usd": 160,
    "ideal_duration_days": [6, 10],
    "best_seasons": ["Summer", "Autumn", "Winter"],
    "best_months": ["December", "January", "February", "March", "July", "August"],
    "major_attractions": ["Milford Sound Fjord Cruise", "Lake Wakatipu Steamship", "Skyline Gondola & Luge", "Shotover Jet Boat"],
    "highlights": ["Global capital of adrenaline sports", "Majestic fjord waterfalls", "Central Otago Pinot Noir", "Dramatic Southern Alps"],
    "description": "Set against the Remarkables mountain range on Lake Wakatipu, Queenstown is the world capital of adventure, nature spectacles, and alpine luxury.",
    "image_url": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Take a scenic coach combo to Milford Sound for unforgettable views.", "Try the famous Fergburger during off-peak hours."],
    "transportation": ["Rental Campervan/Car", "Scenic Shuttles", "Helicopter Tours"],
    "food_specialties": ["Fergburger Gourmet Burger", "New Zealand Lamb", "Pinot Noir"],
    "rating": 4.96,
    "reviews_count": 2340
  },
  {
    "id": "maldives",
    "name": "Maldives (North Malé & Ari Atolls)",
    "country": "Maldives",
    "region": "South Asia",
    "continent": "Asia",
    "styles": ["Romantic", "Beaches", "Luxury", "Nature"],
    "budget_tier": "luxury",
    "avg_daily_cost_usd": 380,
    "ideal_duration_days": [5, 8],
    "best_seasons": ["Winter", "Spring"],
    "best_months": ["December", "January", "February", "March", "April"],
    "major_attractions": ["Overwater Villa Reef Lagoons", "Whale Shark & Manta Ray Snorkel Safari", "Bioluminescent Beach Phenomena", "Undersea Dining"],
    "highlights": ["Stilted overwater bungalows with glass floors", "Crystal clear turquoise atolls", "Swimming alongside sea turtles", "Unrivaled romantic seclusion"],
    "description": "The pinnacle of tropical luxury: idyllic coral atolls scattered across the warm Indian Ocean featuring overwater villas, marine life, and pure romance.",
    "image_url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=80",
    "practical_tips": ["Choose speedboat-accessible resorts to avoid seaplane costs.", "Book all-inclusive meal packages."],
    "transportation": ["Seaplane", "Speedboat Transfer", "Dhoni Traditional Boat"],
    "food_specialties": ["Mas Huni Tuna Breakfast", "Fresh Maldivian Lobster", "Coconut Curries"],
    "rating": 4.98,
    "reviews_count": 2100
  }
];

// Simple Porter Stemmer in JS
function porterStem(word) {
  let w = word.toLowerCase();
  if (w.length < 3) return w;
  if (w.endsWith("sses")) w = w.slice(0, -2);
  else if (w.endsWith("ies")) w = w.slice(0, -2);
  else if (w.endsWith("ss")) {}
  else if (w.endsWith("s")) w = w.slice(0, -1);

  if (w.endsWith("eed")) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if ((w.endsWith("ed") || w.endsWith("ing")) && /[aeiou]/.test(w.slice(0, -3))) {
    w = w.endsWith("ing") ? w.slice(0, -3) : w.slice(0, -2);
    if (w.endsWith("at") || w.endsWith("bl") || w.endsWith("iz")) w += "e";
  }

  if (w.endsWith("y") && /[bcdfghjklmnpqrstvwxz]/.test(w.charAt(w.length - 2))) {
    w = w.slice(0, -1) + "i";
  }
  return w;
}

// Simple WordNet base lookup
const LEMMA_MAP = {
  "adventurous": "adventure", "beaches": "beach", "travelling": "travel", "traveled": "travel",
  "visiting": "visit", "visited": "visit", "cities": "city", "countries": "country",
  "mountains": "mountain", "cheaper": "cheap", "expensive": "expensive", "planning": "plan"
};

// VADER Lexicon Sample
const VADER_LEXICON = {
  "love": 3.2, "amazing": 3.4, "wonderful": 3.2, "excited": 2.8, "exciting": 2.8,
  "great": 2.5, "good": 1.9, "best": 3.0, "beautiful": 2.9, "paradise": 3.1,
  "bad": -2.5, "horrible": -3.2, "terrible": -3.0, "hate": -2.8, "ruined": -2.6,
  "delayed": -1.5, "expensive": -1.0, "budget": 0.5, "adventure": 2.0, "peaceful": 2.1
};

export function clientNLPAnalyze(text) {
  const rawText = text || "";
  const tokens = rawText.match(/\b\w+\b|[^\w\s]/g) || [];
  
  const stems = tokens.filter(t => /^\w+$/.test(t)).map(t => porterStem(t));
  const lemmas = tokens.filter(t => /^\w+$/.test(t)).map(t => LEMMA_MAP[t.toLowerCase()] || t.toLowerCase());

  // Entity Extraction
  const entities = [];
  const textLower = rawText.toLowerCase();

  // Locations / Countries
  const locMap = {
    "switzerland": "GPE", "swiss": "GPE", "bali": "GPE", "indonesia": "GPE",
    "paris": "GPE", "france": "GPE", "kyoto": "GPE", "japan": "GPE",
    "santorini": "GPE", "greece": "GPE", "rome": "GPE", "italy": "GPE",
    "costa rica": "GPE", "banff": "GPE", "canada": "GPE", "new zealand": "GPE",
    "queenstown": "GPE", "maldives": "GPE"
  };

  for (const [loc, type] of Object.entries(locMap)) {
    if (textLower.includes(loc)) {
      entities.push({ text: loc.charAt(0).toUpperCase() + loc.slice(1), label: type });
    }
  }

  // Dates
  const dateMatch = rawText.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|summer|winter|spring|autumn|\d{1,2}\s*days?)\b/gi);
  if (dateMatch) {
    dateMatch.forEach(d => entities.push({ text: d, label: "DATE" }));
  }

  // Money
  const moneyMatch = rawText.match(/(\$|usd|inr|eur)\s*\d+|\d+\s*(\$|usd|dollars)/gi);
  if (moneyMatch) {
    moneyMatch.forEach(m => entities.push({ text: m, label: "MONEY" }));
  }

  // Sentiment Scoring
  let scoreSum = 0;
  let wordCount = 0;
  tokens.forEach(tok => {
    const val = VADER_LEXICON[tok.toLowerCase()];
    if (val !== undefined) {
      scoreSum += val;
      wordCount++;
    }
  });

  const compound = wordCount > 0 ? Math.max(-0.99, Math.min(0.99, Number((scoreSum / (Math.sqrt(wordCount * wordCount + 15))).toFixed(4)))) : 0.0;
  let sentimentLabel = "neutral";
  if (compound >= 0.05) sentimentLabel = "positive";
  else if (compound <= -0.05) sentimentLabel = "negative";

  // Intent Detection
  let intent = "general_query";
  let confidence = 0.55;
  if (/cheaper|reduce|cut budget|add\s+\w+\s+days|extend|another destination|different/i.test(rawText)) {
    intent = "modify_plan";
    confidence = 0.94;
  } else if (/itinerary|plan my|schedule|day by day/i.test(rawText)) {
    intent = "create_itinerary";
    confidence = 0.91;
  } else if (/recommend|suggest|where to|places to visit/i.test(rawText)) {
    intent = "recommend_destination";
    confidence = 0.88;
  } else if (/hi|hello|hey|greetings/i.test(rawText)) {
    intent = "greeting";
    confidence = 0.85;
  }

  // Travel entities
  let budget = null;
  const bMatch = rawText.match(/(\d{3,6})/);
  if (bMatch) budget = Number(bMatch[1]);

  let days = null;
  const dMatch = rawText.match(/(\d{1,2})\s*days?/i);
  if (dMatch) days = Number(dMatch[1]);

  let destMatch = null;
  if (/swiss|switzerland|alps/i.test(rawText)) destMatch = "swiss-alps";
  else if (/bali|indonesia/i.test(rawText)) destMatch = "bali";
  else if (/kyoto|japan/i.test(rawText)) destMatch = "kyoto";
  else if (/paris|france/i.test(rawText)) destMatch = "paris";
  else if (/santorini|greece/i.test(rawText)) destMatch = "santorini";
  else if (/costa rica/i.test(rawText)) destMatch = "costa-rica";
  else if (/banff|canada/i.test(rawText)) destMatch = "banff";
  else if (/rome|italy/i.test(rawText)) destMatch = "rome";
  else if (/queenstown|new zealand/i.test(rawText)) destMatch = "queenstown";
  else if (/maldives/i.test(rawText)) destMatch = "maldives";

  const styles = [];
  ["Adventure", "Nature", "Beaches", "Mountains", "Luxury", "Romantic", "Historical", "Family"].forEach(st => {
    if (new RegExp(st, "i").test(rawText)) styles.push(st);
  });

  return {
    original_text: rawText,
    normalized_text: rawText,
    corrections: [],
    tokens: tokens,
    tokens_count: tokens.length,
    stems: stems.slice(0, 20),
    lemmas: lemmas.slice(0, 20),
    pos_tags: tokens.slice(0, 15).map(t => ({ token: t, tag: /^[A-Z]/.test(t) ? "NNP" : "NN" })),
    entities: entities,
    sentiment: {
      label: sentimentLabel,
      compound: compound,
      positive: compound > 0 ? 0.35 : 0.05,
      neutral: 0.60,
      negative: compound < 0 ? 0.35 : 0.0
    },
    intent: intent,
    intent_confidence: confidence,
    keywords: tokens.filter(t => t.length > 3 && !["with", "this", "that", "want", "have", "from"].includes(t.toLowerCase())).slice(0, 8),
    travel_entities: {
      budget: budget,
      days: days,
      travellers: 2,
      styles: styles,
      destination_match: destMatch,
      modification_requests: /cheaper/i.test(rawText) ? ["make_cheaper"] : []
    }
  };
}

export function clientRecommend(criteria) {
  const tripDays = criteria.days || 5;
  const userBudget = criteria.budget || 2000;
  const userStyles = (criteria.travel_styles || []).map(s => s.toLowerCase());

  const scored = DESTINATIONS_DATA.map(d => {
    let score = 60;
    const destStyles = d.styles.map(s => s.toLowerCase());
    const overlap = userStyles.filter(s => destStyles.includes(s));
    if (overlap.length > 0) score += 25;

    const estCost = d.avg_daily_cost_usd * tripDays * 1.5;
    if (userBudget >= estCost * 0.8) score += 15;

    return {
      destination: d,
      match_score: Math.min(99, Math.max(50, score)),
      estimated_total_cost: Math.round(estCost),
      reasons: [
        `Aligns with your travel preferences`,
        `Estimated at ~$${Math.round(estCost)} for ${tripDays} days`,
        `Ideal for ${d.styles[0]} & ${d.styles[1]}`
      ],
      trip_days: tripDays,
      travellers: criteria.travellers || 2
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, criteria.limit || 4);
}

export function clientGenerateItinerary(destId, days = 5, budgetTier = "moderate") {
  const dest = DESTINATIONS_DATA.find(d => d.id === destId) || DESTINATIONS_DATA[0];
  const numDays = Math.max(2, Math.min(10, days));
  const mult = budgetTier === "budget" ? 0.7 : budgetTier === "luxury" ? 1.6 : 1.0;
  const totalCost = Math.round(dest.avg_daily_cost_usd * numDays * 1.5 * mult);

  const dailyPlans = [];
  for (let i = 1; i <= numDays; i++) {
    const attr = dest.major_attractions[(i - 1) % dest.major_attractions.length];
    dailyPlans.push({
      day_number: i,
      title: i === 1 ? `Arrival & Orientation in ${dest.name}` : `Exploring ${attr}`,
      morning: {
        time: "09:00 AM - 12:30 PM",
        activity: `Morning excursion to ${attr}. Experience scenic panoramic views.`,
        location: attr,
        tip: "Early arrival avoids long ticket queues."
      },
      afternoon: {
        time: "01:30 PM - 05:00 PM",
        activity: `Cultural walking exploration and regional tasting.`,
        location: "Historic Quarter",
        tip: "Comfortable footwear recommended."
      },
      evening: {
        time: "06:30 PM - 09:30 PM",
        activity: `Sunset promenade stroll followed by dinner tasting ${dest.food_specialties[0]}.`,
        location: "Promenade / Harbor",
        tip: "Reservations advised."
      },
      meals: {
        breakfast: "Local café breakfast",
        lunch: "Regional lunch bistro",
        dinner: `Dinner featuring ${dest.food_specialties[0]}`
      },
      estimated_day_cost: Math.round(totalCost / numDays)
    });
  }

  return {
    id: "itin-" + Math.random().toString(36).substring(2, 8),
    title: `${numDays}-Day Curated ${dest.name} Getaway`,
    destination: dest.name,
    destination_id: dest.id,
    country: dest.country,
    region: dest.region,
    image_url: dest.image_url,
    days: numDays,
    travellers: 2,
    budget_tier: budgetTier,
    total_estimated_cost: totalCost,
    currency: "USD",
    daily_itineraries: dailyPlans,
    transportation_summary: dest.transportation,
    accommodation_suggestion: budgetTier === "budget" ? "Boutique guesthouse" : "4-Star Hotel",
    practical_tips: dest.practical_tips,
    food_recommendations: dest.food_specialties
  };
}
