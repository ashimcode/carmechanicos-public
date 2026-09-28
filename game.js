// Mechanic Tycoon - Game Logic
const BUILD_VERSION = "v0.2.9";

// --- GAME STATE ---
// --- GAME STATE ---
let money = 20000; // Starting cash
let savingsBalance = 0;
let debt = 0;
let insufficientFundsFeedbackTimer = null;

function triggerInsufficientFundsFeedback(target = document.getElementById("desktop") || document.body, feedbackClass = "insufficient-funds-feedback") {
    target.classList.remove(feedbackClass);
    void target.offsetWidth;
    target.classList.add(feedbackClass);
    if (insufficientFundsFeedbackTimer) clearTimeout(insufficientFundsFeedbackTimer);
    insufficientFundsFeedbackTimer = setTimeout(() => target.classList.remove(feedbackClass), 550);
    if (navigator.vibrate) navigator.vibrate([80, 45, 80]);
}

const factions = {
    "player": { id: "player", name: "Your Empire", color: "#38bdf8" },
    "neutral": { id: "neutral", name: "Neutral", color: "#64748b" },
    "apex": { id: "apex", name: "Apex Auto", color: "#3b82f6" },
    "scrap": { id: "scrap", name: "Scrap Syndicate", color: "#eab308" },
    "euro": { id: "euro", name: "EuroTuner Cartel", color: "#ec4899" },
    "iron": { id: "iron", name: "Ironclad Logistics", color: "#f97316" },
    "neon": { id: "neon", name: "Neon Drift Org", color: "#a855f7" },
    "black": { id: "black", name: "Black Market Ops", color: "#000000" },
    "seized": { id: "seized", name: "Seized by FBI", color: "#ef4444" }
};

let locations = [
    // --- THE STARTER TIER (USA ONLY) ---
    { id: "starter_garage_1", name: "Back-Alley Garage (Tutorial)", owner: "neutral", cost: 5000, rent: 100, classes: ["A"], left: 20, top: 40, difficulty: "Easy", bonus: "Entry Level", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_ca", name: "Los Angeles, USA", cost: 18000, rent: 90, classes: ["A"], left: 15, top: 43, difficulty: "Easy", bonus: "Scrap Yield +5%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_tx", name: "Texas, USA", cost: 18000, rent: 80, classes: ["A"], left: 20, top: 45, difficulty: "Easy", bonus: "Contraband -10% Risk", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_ny", name: "New York, USA", cost: 18000, rent: 110, classes: ["A"], left: 27, top: 39, difficulty: "Easy", bonus: "Used Car Sales +5%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_chi", name: "Chicago, USA", cost: 50000, rent: 150, classes: ["A", "B"], left: 23, top: 38, difficulty: "Medium", bonus: "Repair Speed +10%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },

    // --- MID TIER (SOUTH AMERICA & EUROPE) ---
    { id: "loc_rio", name: "Rio de Janeiro, Brazil", cost: 150000, rent: 200, classes: ["A", "B"], left: 33, top: 66, difficulty: "Medium", bonus: "Cheap Labor (Rent -10%)", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_ba", name: "Buenos Aires, Argentina", cost: 180000, rent: 220, classes: ["A", "B"], left: 31, top: 73, difficulty: "Medium", bonus: "Scrap Value +10%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_bog", name: "Bogota, Colombia", cost: 160000, rent: 210, classes: ["A", "B"], left: 29, top: 58, difficulty: "Medium", bonus: "Off-road Demand +5%", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_lon", name: "London, UK", cost: 400000, rent: 500, classes: ["A", "B", "C"], left: 47, top: 32, difficulty: "Hard", bonus: "Luxury Demand +5%", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_ber", name: "Berlin, Germany", cost: 450000, rent: 550, classes: ["A", "B", "C"], left: 50, top: 31, difficulty: "Hard", bonus: "Engineering (Part Cost -5%)", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_rom", name: "Rome, Italy", cost: 500000, rent: 600, classes: ["B", "C"], left: 51, top: 36, difficulty: "Hard", bonus: "Exotic Parts +5% Drop", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_mad", name: "Madrid, Spain", cost: 420000, rent: 520, classes: ["A", "B", "C"], left: 46, top: 37, difficulty: "Hard", bonus: "Used Car Sales +10%", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_mos", name: "Moscow, Russia", cost: 350000, rent: 400, classes: ["B", "C"], left: 55, top: 25, difficulty: "Hard", bonus: "Black Market Access", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    
    // --- HIGH TIER (AFRICA, ASIA, OCEANIA) ---
    { id: "loc_lag", name: "Lagos, Nigeria", cost: 250000, rent: 300, classes: ["B", "C"], left: 49, top: 53, difficulty: "Medium", bonus: "Export Tax -10%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_cpt", name: "Cape Town, South Africa", cost: 280000, rent: 350, classes: ["B", "C"], left: 53, top: 73, difficulty: "Medium", bonus: "Import Fees -5%", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_cai", name: "Cairo, Egypt", cost: 300000, rent: 380, classes: ["B", "C"], left: 54, top: 42, difficulty: "Medium", bonus: "Desert Salvage +15%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_nai", name: "Nairobi, Kenya", cost: 260000, rent: 320, classes: ["B", "C"], left: 56, top: 56, difficulty: "Medium", bonus: "Suspension Repair Speed +20%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_mum", name: "Mumbai, India", cost: 600000, rent: 700, classes: ["C", "D"], left: 67, top: 50, difficulty: "Hard", bonus: "Mass Volume (Orders +20%)", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_del", name: "New Delhi, India", cost: 620000, rent: 720, classes: ["C", "D"], left: 66, top: 44, difficulty: "Hard", bonus: "Part Cost -10%", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_bkk", name: "Bangkok, Thailand", cost: 700000, rent: 800, classes: ["C", "D"], left: 74, top: 53, difficulty: "Hard", bonus: "Tuner Culture (Speed +10%)", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_sin", name: "Singapore", cost: 1200000, rent: 1500, classes: ["C", "D"], left: 75, top: 59, difficulty: "Very Hard", bonus: "Tech Hub (Upgrades -10%)", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_sha", name: "Shanghai, China", cost: 1500000, rent: 1800, classes: ["C", "D"], left: 80, top: 42, difficulty: "Very Hard", bonus: "Supply Chain (Parts +10%)", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_bei", name: "Beijing, China", cost: 1400000, rent: 1700, classes: ["C", "D"], left: 78, top: 36, difficulty: "Very Hard", bonus: "Import Exotics +5%", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_seo", name: "Seoul, South Korea", cost: 1800000, rent: 2000, classes: ["C", "D", "E"], left: 83, top: 38, difficulty: "Extreme", bonus: "Electric Car Demand +20%", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_tok", name: "Tokyo, Japan", cost: 2500000, rent: 3000, classes: ["C", "D", "E"], left: 85, top: 39, difficulty: "Extreme", bonus: "Tuner Culture (Speed +20%)", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_osa", name: "Osaka, Japan", cost: 2200000, rent: 2600, classes: ["C", "D", "E"], left: 86, top: 41, difficulty: "Extreme", bonus: "Drift Part Costs -15%", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_syd", name: "Sydney, Australia", cost: 900000, rent: 1100, classes: ["C", "D"], left: 87, top: 74, difficulty: "Hard", bonus: "Off-road Demand +15%", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_mel", name: "Melbourne, Australia", cost: 880000, rent: 1050, classes: ["C", "D"], left: 85, top: 78, difficulty: "Hard", bonus: "Muscle Car Demand +10%", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_auc", name: "Auckland, New Zealand", cost: 850000, rent: 1000, classes: ["C", "D"], left: 92, top: 81, difficulty: "Hard", bonus: "Import Exotics +10%", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },

    // --- THE APEX TIER ---
    { id: "loc_dub", name: "Dubai, UAE", cost: 5000000, rent: 5000, classes: ["D", "E", "F"], left: 60, top: 45, difficulty: "Apex", bonus: "Hypercar Capital (+50% Profit)", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_auh", name: "Abu Dhabi, UAE", cost: 4800000, rent: 4800, classes: ["D", "E", "F"], left: 61, top: 46, difficulty: "Apex", bonus: "Exotic Parts +20% Drop", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    // --- 30 NEW GLOBAL CITIES ---
    { id: "loc_par", name: "Paris, France", cost: 480000, rent: 580, classes: ["A", "B", "C"], left: 48, top: 34, difficulty: "Hard", bonus: "Luxury Demand +10%", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_tor", name: "Toronto, Canada", cost: 50000, rent: 120, classes: ["A", "B"], left: 26, top: 35, difficulty: "Medium", bonus: "Winter Tires Sales +15%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_mex", name: "Mexico City, Mexico", cost: 120000, rent: 180, classes: ["A", "B"], left: 22, top: 51, difficulty: "Medium", bonus: "Street Race Scene +5%", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_san", name: "Santiago, Chile", cost: 130000, rent: 190, classes: ["A", "B"], left: 28, top: 70, difficulty: "Medium", bonus: "Mountain Suspension +10%", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_lim", name: "Lima, Peru", cost: 110000, rent: 160, classes: ["A", "B"], left: 28, top: 62, difficulty: "Medium", bonus: "Bargain Hunting +5%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_car", name: "Caracas, Venezuela", cost: 80000, rent: 140, classes: ["A"], left: 30, top: 56, difficulty: "Easy", bonus: "Fuel Smuggling +10%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_sto", name: "Stockholm, Sweden", cost: 550000, rent: 620, classes: ["B", "C"], left: 51, top: 25, difficulty: "Hard", bonus: "Winter Testing +10%", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_ams", name: "Amsterdam, Netherlands", cost: 520000, rent: 600, classes: ["B", "C"], left: 49, top: 30, difficulty: "Hard", bonus: "EV Infrastructure +15%", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_lis", name: "Lisbon, Portugal", cost: 350000, rent: 450, classes: ["B", "C"], left: 45, top: 39, difficulty: "Medium", bonus: "Coastal Imports +5%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_vie", name: "Vienna, Austria", cost: 480000, rent: 580, classes: ["B", "C"], left: 51, top: 34, difficulty: "Hard", bonus: "Classic Cars +10%", owner: "euro", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_ist", name: "Istanbul, Turkey", cost: 420000, rent: 500, classes: ["B", "C"], left: 55, top: 39, difficulty: "Hard", bonus: "Crossroads Trading +15%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_riy", name: "Riyadh, Saudi Arabia", cost: 1200000, rent: 1400, classes: ["C", "D"], left: 58, top: 46, difficulty: "Very Hard", bonus: "Hypercar Market +20%", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_teh", name: "Tehran, Iran", cost: 250000, rent: 350, classes: ["B", "C"], left: 61, top: 42, difficulty: "Medium", bonus: "Sanction Evasion +15%", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_kar", name: "Karachi, Pakistan", cost: 280000, rent: 380, classes: ["B", "C"], left: 64, top: 46, difficulty: "Medium", bonus: "Cheap Labor (Rent -15%)", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_dha", name: "Dhaka, Bangladesh", cost: 220000, rent: 320, classes: ["B", "C"], left: 70, top: 48, difficulty: "Medium", bonus: "Mass Recycling +10%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_kua", name: "Kuala Lumpur, Malaysia", cost: 650000, rent: 750, classes: ["C", "D"], left: 74, top: 57, difficulty: "Hard", bonus: "Tuner Market +10%", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_jak", name: "Jakarta, Indonesia", cost: 700000, rent: 800, classes: ["C", "D"], left: 76, top: 62, difficulty: "Hard", bonus: "Moped Conversions +5%", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_man", name: "Manila, Philippines", cost: 680000, rent: 780, classes: ["C", "D"], left: 81, top: 53, difficulty: "Hard", bonus: "Jeepney Tech +10%", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_hcm", name: "Ho Chi Minh, Vietnam", cost: 450000, rent: 550, classes: ["C"], left: 76, top: 55, difficulty: "Medium", bonus: "Scooter Market +20%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_tai", name: "Taipei, Taiwan", cost: 850000, rent: 1000, classes: ["C", "D"], left: 81, top: 45, difficulty: "Hard", bonus: "Chip Manufacturing (Parts -15%)", owner: "apex", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_hon", name: "Hong Kong", cost: 1100000, rent: 1300, classes: ["C", "D"], left: 79, top: 46, difficulty: "Very Hard", bonus: "Luxury Imports +15%", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_bus", name: "Busan, South Korea", cost: 950000, rent: 1100, classes: ["C", "D"], left: 84, top: 40, difficulty: "Very Hard", bonus: "Shipbuilding Hub +5%", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_fuk", name: "Fukuoka, Japan", cost: 850000, rent: 1000, classes: ["C", "D"], left: 84, top: 41, difficulty: "Very Hard", bonus: "Tuner Import Tax -5%", owner: "neon", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_bri", name: "Brisbane, Australia", cost: 750000, rent: 850, classes: ["C", "D"], left: 88, top: 71, difficulty: "Hard", bonus: "Ute Demand +15%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_per", name: "Perth, Australia", cost: 700000, rent: 800, classes: ["C", "D"], left: 80, top: 73, difficulty: "Hard", bonus: "Mining Equipment Tech +10%", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_cas", name: "Casablanca, Morocco", cost: 350000, rent: 450, classes: ["B", "C"], left: 45, top: 41, difficulty: "Medium", bonus: "Desert Rally Gear +10%", owner: "scrap", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_dak", name: "Dakar, Senegal", cost: 250000, rent: 350, classes: ["B"], left: 43, top: 48, difficulty: "Medium", bonus: "Endurance Racing Tech +5%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_add", name: "Addis Ababa, Ethiopia", cost: 320000, rent: 420, classes: ["B", "C"], left: 56, top: 52, difficulty: "Medium", bonus: "High Altitude Tuning +10%", owner: "neutral", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_dar", name: "Dar es Salaam, Tanzania", cost: 300000, rent: 400, classes: ["B", "C"], left: 56, top: 59, difficulty: "Medium", bonus: "Port Smuggling +5%", owner: "black", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 },
    { id: "loc_kin", name: "Kinshasa, DRC", cost: 280000, rent: 380, classes: ["B", "C"], left: 51, top: 58, difficulty: "Medium", bonus: "Rare Earth Materials (Parts -10%)", owner: "iron", funds: 1000, heat: 0, seizeCooldown: 0, stability: 100 }
];

locations.forEach(loc => {
    if (["starter_garage_1", "loc_ca", "loc_tx", "loc_ny", "loc_chi"].includes(loc.id)) {
        loc.region = "US";
    } else {
        loc.region = "International";
    }
});

let selectedLocation = null;
let hasPurchasedBusiness = false; // Flag to prevent multiple initial purchases
let activeSupplyRoutes = [];

window.updateNewsTicker = function(message) {
    const ticker = document.getElementById("news-ticker-content");
    if (ticker) {
        ticker.textContent = ">>> " + message.toUpperCase() + " <<<";
        ticker.style.animation = 'none';
        ticker.offsetHeight; 
        ticker.style.animation = null;
    }
};

window.generateSupplyRoutes = function() {
    activeSupplyRoutes = [];
    const factionLocs = {};
    locations.forEach(loc => {
        if (loc.owner !== "neutral" && loc.owner !== "seized") {
            if (!factionLocs[loc.owner]) factionLocs[loc.owner] = [];
            factionLocs[loc.owner].push(loc);
        }
    });

    Object.entries(factionLocs).forEach(([owner, locs]) => {
        if (locs.length > 1) {
            for (let i = 0; i < locs.length - 1; i++) {
                if (Math.random() > 0.4) {
                    activeSupplyRoutes.push({ owner, from: locs[i], to: locs[i+1] });
                }
            }
        }
    });
};

let activeFactionFilter = "all";

window.renderSupplyRoutes = function() {
    const svg = document.getElementById('logistics-svg');
    if (!svg) return;
    svg.innerHTML = '';

    window.activeRoutes = [];

    const factionLocs = {};
    locations.forEach(loc => {
        if (loc.owner !== "neutral" && loc.owner !== "seized") {
            if (!factionLocs[loc.owner]) factionLocs[loc.owner] = [];
            factionLocs[loc.owner].push(loc);
        }
    });

    Object.entries(factionLocs).forEach(([owner, locs]) => {
        if (activeFactionFilter !== "all" && owner !== activeFactionFilter) return;

        if (locs.length > 1) {
            for (let i = 0; i < locs.length - 1; i++) {
                if (activeFactionFilter === "all" && owner !== "player" && Math.random() > 0.4) continue;

                const locA = locs[i];
                const locB = locs[i + 1];
                const routeId = `route-${locA.id}-${locB.id}`;
                
                window.activeRoutes.push({
                    id: routeId,
                    owner: locA.owner,
                    source: locA,
                    destination: locB,
                    name: `${factions[locA.owner] ? factions[locA.owner].name : locA.owner} Convoy: ${locA.name} ➔ ${locB.name}`
                });
                
                const factionColor = factions[locA.owner] ? factions[locA.owner].color : '#ffffff';
                const deltaX = locB.left - locA.left;
                const deltaY = locB.top - locA.top;
                const rawDistance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                
                let flightDuration = rawDistance * 0.15;
                flightDuration = Math.max(2, flightDuration);
                
                const isBoat = Math.random() > 0.5;
                const vehicleSVG = isBoat
                    ? `<g transform="scale(0.12)"><path d="M-10,-4 L6,-4 L12,0 L6,4 L-10,4 Z M-6,-2 L4,-2 L4,2 L-6,2 Z" fill="${factionColor}" stroke="#000" stroke-width="1"/></g>`
                    : `<g transform="scale(0.12) rotate(90) translate(-12, -12)"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${factionColor}" stroke="#000" stroke-width="1"/></g>`;

                const svgContent = `
                    <path id="${routeId}" d="M ${locA.left} ${locA.top} L ${locB.left} ${locB.top}" fill="transparent" stroke="${factionColor}" stroke-opacity="0.2" stroke-width="0.2" />
                    <g>
                        <animateMotion dur="${flightDuration.toFixed(1)}s" repeatCount="indefinite" rotate="auto">
                            <mpath href="#${routeId}" />
                        </animateMotion>
                        ${vehicleSVG}
                    </g>
                `;
                svg.innerHTML += svgContent;
            }
        }
    });
};

window.renderDarknetSabotage = function() {
    const container = document.getElementById('darknet-sabotage-container');
    if (!container) return;
    container.innerHTML = '';

    const rivalRoutes = (window.activeRoutes || []).filter(r => r.owner !== 'player' && r.owner !== 'neutral' && r.owner !== 'seized');
    
    if (rivalRoutes.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; padding: 10px; font-size: 12px; text-align: center;">No active rival shipments detected.</div>';
        return;
    }

    rivalRoutes.forEach((route, idx) => {
        const el = document.createElement('div');
        el.style.background = 'rgba(153, 27, 27, 0.1)';
        el.style.border = '1px solid #ef4444';
        el.style.borderRadius = '4px';
        el.style.padding = '10px';
        el.style.display = 'flex';
        el.style.justifyContent = 'space-between';
        el.style.alignItems = 'center';
        el.style.marginBottom = '8px';
        
        el.innerHTML = `
            <div>
                <div style="color: #ef4444; font-weight: bold; font-size: 13px;">${route.name}</div>
                <div style="color: #fca5a5; font-size: 11px;">Target: Logistics Interception</div>
            </div>
            <button class="btn" id="sabotage-btn-${idx}" data-source="${route.source.id}" data-dest="${route.destination.id}" data-route="${route.id}" style="background: #ef4444; color: white; border: none; font-size: 11px; padding: 6px 10px;">Execute Heist (-$10k | +15 Heat)</button>
        `;
        container.appendChild(el);

        const btn = el.querySelector(`#sabotage-btn-${idx}`);
        btn.addEventListener('click', () => {
            if (money >= 10000) {
                money -= 10000;
                globalHeat += 15;
                globalHeat = Math.max(0, Math.min(100, globalHeat));
                
                const stolenCash = Math.floor(Math.random() * 25000) + 15000;
                money += stolenCash;
                
                const sourceLoc = locations.find(l => l.id === route.source.id);
                const destLoc = locations.find(l => l.id === route.destination.id);
                
                const processStabilityDrop = (loc) => {
                    if (loc) {
                        loc.stability -= 20;
                        if (loc.stability <= 0) {
                            loc.owner = "neutral";
                            loc.funds = 1000;
                            loc.stability = 100;
                            loc.heat = 0;
                            if (window.updateNewsTicker) window.updateNewsTicker(`MARKET COLLAPSE: ${factions[route.owner] ? factions[route.owner].name : route.owner} abandons operations in ${loc.name} following relentless cyber attacks!`);
                        }
                    }
                };
                
                processStabilityDrop(sourceLoc);
                processStabilityDrop(destLoc);
                
                showNotification(`Heist successful! You intercepted the convoy and stole $${stolenCash.toLocaleString()}.`, "success");
                if (window.updateNewsTicker) window.updateNewsTicker(`🚨 CARGO HEIST: A massive shipment moving from ${route.source.name} to ${route.destination.name} was hijacked by untraceable operatives!`);
                
                const svgPath = document.getElementById(route.id);
                if (svgPath) {
                    svgPath.setAttribute('stroke', '#ef4444');
                    svgPath.setAttribute('stroke-width', '0.8');
                }
                
                setTimeout(() => {
                    if (typeof window.refreshGlobalMapMarkers === "function") window.refreshGlobalMapMarkers();
                    if (typeof window.renderSupplyRoutes === "function") window.renderSupplyRoutes();
                    window.renderDarknetSabotage();
                    updateUI();
                }, 2000);
                
                saveGame();
            } else {
                showNotification("INSUFFICIENT FUNDS: You need $10,000 to execute this heist.", "error");
            }
        });
    });
};

function runDailySimulation() {
    let changed = false;
    tickGarageEvent();

    if (deliveryWorkers.length > 0) {
        const payroll = deliveryWorkers.reduce((sum, worker) => sum + (worker.wage || 180), 0);
        if (money >= payroll) {
            money -= payroll;
            deliveryWorkers.forEach(worker => worker.morale = Math.min(100, (worker.morale || 80) + 2));
        } else {
            deliveryWorkers.forEach(worker => worker.morale = Math.max(0, (worker.morale || 80) - 12));
            showNotification(`Payroll shortfall: $${payroll.toLocaleString()} needed. Worker morale has dropped.`, "error");
        }
    }
    tickGarageEvent();

    // Certified workers are paid once per simulation cycle. Morale affects future automation.
    if (deliveryWorkers.length > 0) {
        const payroll = deliveryWorkers.reduce((sum, worker) => sum + (worker.wage || 180), 0);
        if (money >= payroll) {
            money -= payroll;
            deliveryWorkers.forEach(worker => worker.morale = Math.min(100, (worker.morale || 80) + 2));
        } else {
            deliveryWorkers.forEach(worker => worker.morale = Math.max(0, (worker.morale || 80) - 12));
            showNotification(`Payroll shortfall: $${payroll.toLocaleString()} needed. Worker morale has dropped.`, "error");
        }
    }

    // Debt Interest Calculation
    if (debt > 0) {
        const interest = Math.floor(debt * 0.05);
        if (money >= interest) {
            money -= interest;
            showNotification(`Bank: $${interest} deducted for daily loan interest.`, "error");
        } else {
            const unpaid = interest - money;
            money = 0;
            debt += unpaid;
            showNotification(`Bank: Insufficient funds for interest. $${unpaid} added to debt.`, "error");
        }
        if (typeof updateUI === "function") updateUI();
    }

    locations.forEach(loc => {
        // Seized cooldown logic
        if (loc.owner === "seized") {
            loc.seizeCooldown = (loc.seizeCooldown || 0) - 1;
            if (loc.seizeCooldown <= 0) {
                loc.owner = "neutral";
                loc.heat = 0;
                loc.funds = 1000;
                loc.seizeCooldown = 0;
                changed = true;
            }
            return; // Skip rent/raid if seized
        }

        // Rent cycle
        if (loc.owner !== "neutral" && loc.owner !== "player") {
            // AI generates random income between 50% and 150% of rent
            const income = Math.floor(loc.rent * (Math.random() + 0.5));
            loc.funds += income;
        }

        // Rent is an operating expense only for an owned or AI-controlled business.
        // Neutral locations are merely available for purchase and must not drain the player.
        if (loc.owner !== "neutral") {
            loc.funds -= loc.rent;
        }

        if (loc.funds < 0) {
            if (loc.owner !== "neutral" && loc.owner !== "player") {
                if (window.updateNewsTicker) window.updateNewsTicker(`MARKET CRASH: ${factions[loc.owner] ? factions[loc.owner].name : loc.owner} files for bankruptcy in ${loc.name}!`);
            }
            if (loc.owner === "player") {
                if (money >= Math.abs(loc.funds)) {
                    money += loc.funds; 
                    loc.funds = 0; 

                } else {
                    if (playerStats.skills && playerStats.skills.secondChance > 0) {
                        playerStats.skills.secondChance = 0;
                        loc.funds = 1000;
                        showNotification(`🛡️ SECOND CHANCE ACTIVATED: A secret donor paid off your debts in ${loc.name}, saving you from bankruptcy!`, "info", 10000);
                        if (typeof renderPlayerProfile === "function") renderPlayerProfile();
                    } else {
                        loc.funds = 0;
                        loc.owner = "neutral";
                        changed = true;
                        showNotification(`🏢 BANKRUPTCY: You failed to pay rent in ${loc.name} and lost the property!`, "error", 15000);
                    }
                }
            } else {
                loc.owner = "neutral";
                loc.funds = 1000;
                loc.heat = 0;
                changed = true;
            }
        } else {
            // Raid cycle
            if (loc.heat > 0) {
                const roll = Math.random() * 100;
                if (roll < loc.heat) {
                    if (loc.owner === "player" && playerStats.skills && playerStats.skills.secondChance > 0) {
                        playerStats.skills.secondChance = 0;
                        loc.heat = 0;
                        showNotification(`🛡️ SECOND CHANCE ACTIVATED: Your inside contact tipped you off. The FBI raid in ${loc.name} was averted and heat is cleared!`, "info", 10000);
                        if (typeof renderPlayerProfile === "function") renderPlayerProfile();
                    } else {
                        loc.owner = "seized";
                        loc.funds = 0;
                        loc.seizeCooldown = 3;
                        showNotification(`🚨 FBI RAID: Authorities have raided ${loc.name}! All assets seized. Property locked pending police auction.`, "error", 15000);
                        if (window.updateNewsTicker) window.updateNewsTicker(`BREAKING: FBI raids ${loc.name}. Assets seized in major crackdown.`);
                        changed = true;
                    }
                }
            }
        }
        
        // Expansion Phase
        if (loc.owner === "neutral" && loc.region !== "US") {
            if (Math.random() < 0.04) { // 4% chance
                const aiFactions = Object.values(factions).filter(f => f.id !== "neutral" && f.id !== "seized" && f.id !== "player");
                if (aiFactions.length > 0) {
                    const randomFaction = aiFactions[Math.floor(Math.random() * aiFactions.length)];
                    loc.owner = randomFaction.id;
                    loc.stability = 100;
                    changed = true;
                    if (window.updateNewsTicker) {
                        window.updateNewsTicker(`MARKET EXPANSION: ${randomFaction.name} has acquired new territory in ${loc.name}.`);
                    }
                }
            }
        }
        
        // AI Retaliation Phase
        if (loc.owner === "player") {
            if (Math.random() < 0.08) { // 8% chance to be attacked
                const aiFactions = Object.values(factions).filter(f => f.id !== "neutral" && f.id !== "seized" && f.id !== "player");
                if (aiFactions.length > 0) {
                    const attackerFaction = aiFactions[Math.floor(Math.random() * aiFactions.length)];
                    loc.stability -= 25;
                    changed = true;
                    if (window.updateNewsTicker) {
                        window.updateNewsTicker(`⚠️ CYBER ATTACK: ${attackerFaction.name} has sabotaged your operations in ${loc.name}! Stability dropping.`);
                    }
                    
                    if (loc.stability <= 0) {
                        loc.owner = "locked";
                        loc.ransomPrice = 50000;
                        loc.stability = 0;
                        loc.funds = 0;
                        loc.heat = 0;
                        loc.extractionActive = false;
                        if (window.updateNewsTicker) {
                            window.updateNewsTicker(`SYSTEM FAILURE: ${attackerFaction.name} deploys ransomware, locking down ${loc.name}!`);
                        }
                    } else if (loc.stability <= 10 && !loc.extractionActive) {
                        loc.extractionActive = true;
                        if (window.updateNewsTicker) {
                            window.updateNewsTicker(`🚨 CRITICAL: ${loc.name} network compromised! 60-second Emergency Extraction protocol initiated.`);
                        }
                    }
                }
            }
        }
    });

    if (changed && typeof window.refreshGlobalMapMarkers === "function") {
        window.refreshGlobalMapMarkers();
    }
    if (typeof window.generateSupplyRoutes === "function") window.generateSupplyRoutes();
    if (typeof window.renderSupplyRoutes === "function") window.renderSupplyRoutes();
    if (typeof window.renderDarknetSabotage === "function") window.renderDarknetSabotage();
    saveGame();
}

// Trigger every 60 seconds
setInterval(runDailySimulation, 60000);

const baseCatalog = {
    oil: { id: "oil", name: "5W-30 Oil", emoji: "🛢️", tier: 1, basePrice: 15, delay: 5000 },
    brakeFluid: { id: "brakeFluid", name: "Brake Fluid", emoji: "🧪", tier: 1, basePrice: 10, delay: 5000 },
    coolant: { id: "coolant", name: "Coolant", emoji: "❄️", tier: 1, basePrice: 20, delay: 5000 },

    brakePads: { id: "brakePads", name: "Brake Pads", emoji: "🛑", tier: 2, basePrice: 40, delay: 5000 },
    sparkPlugs: { id: "sparkPlugs", name: "Spark Plugs", emoji: "⚡", tier: 2, basePrice: 25, delay: 5000 },
    oilFilter: { id: "oilFilter", name: "Oil Filter", emoji: "🧻", tier: 2, basePrice: 12, delay: 5000 },
    airFilter: { id: "airFilter", name: "Air Filter", emoji: "💨", tier: 2, basePrice: 12, delay: 5000 },
    driveBelt: { id: "driveBelt", name: "Drive Belt", emoji: "➰", tier: 2, basePrice: 25, delay: 10000 },
    fuelPump: { id: "fuelPump", name: "Fuel Pump", emoji: "⛽", tier: 3, basePrice: 85, delay: 15000 },
    starterMotor: { id: "starterMotor", name: "Starter Motor", emoji: "⚡", tier: 3, basePrice: 110, delay: 15000 },

    alternator: { id: "alternator", name: "Alternator", emoji: "🔄", tier: 3, basePrice: 150, delay: 30000 },
    waterPump: { id: "waterPump", name: "Water Pump", emoji: "💧", tier: 3, basePrice: 120, delay: 30000 },
    radiator: { id: "radiator", name: "Radiator", emoji: "🌬️", tier: 3, basePrice: 180, delay: 30000 },
    battery: { id: "battery", name: "Car Battery", emoji: "🔋", tier: 3, basePrice: 100, delay: 30000 },
    suspension: { id: "suspension", name: "Suspension Kit", emoji: "🪀", tier: 3, basePrice: 200, delay: 30000 },
    exhaust: { id: "exhaust", name: "Exhaust System", emoji: "💨", tier: 3, basePrice: 250, delay: 30000 },

    engineBlock: { id: "engineBlock", name: "Engine Block", emoji: "⚙️", tier: 4, basePrice: 800, delay: 30000 },
    ecu: { id: "ecu", name: "ECU", emoji: "💻", tier: 4, basePrice: 600, delay: 30000 },
    transmission: { id: "transmission", name: "Transmission", emoji: "🕹️", tier: 4, basePrice: 1200, delay: 30000 }
};

const contrabandCatalog = {
    // Legacy Contraband Items
    n54Injection: { id: "n54Injection", name: "N54 Port Injection Kit", emoji: "💉", tier: 5, basePrice: 750, delay: 15000, category: "Performance" },
    bigTurbo: { id: "bigTurbo", name: "Twin-Scroll Big Turbo", emoji: "🐌", tier: 5, basePrice: 2800, delay: 45000, category: "Performance" },
    nitrousKit: { id: "nitrousKit", name: "Wet Nitrous System (150-Shot)", emoji: "💨", tier: 5, basePrice: 950, delay: 15000, category: "Performance" },
    catlessPipe: { id: "catlessPipe", name: "Catless Downpipe (Defeat Device)", emoji: "🚎", tier: 4, basePrice: 500, delay: 10000, category: "Performance" },
    jailbrokenEcu: { id: "jailbrokenEcu", name: "Standalone Jailbroken ECU", emoji: "📟", tier: 5, basePrice: 1500, delay: 20000, category: "Electronics" },
    transCooler: { id: "transCooler", name: "Billet Trans Cooler Fitting", emoji: "⚙️", tier: 4, basePrice: 350, delay: 10000, category: "Fabrication" },

    // Fabrication
    customIntakeManifold: { id: "customIntakeManifold", name: "Custom Intake Manifold", emoji: "🖨️", tier: 5, basePrice: 1200, delay: 30000, category: "Fabrication" },
    aluminumBumperSupport: { id: "aluminumBumperSupport", name: "Aluminum Bumper Support", emoji: "🏗️", tier: 4, basePrice: 450, delay: 15000, category: "Fabrication" },

    // Electronics
    plc: { id: "plc", name: "Programmable Logic Controller (PLC)", emoji: "🎛️", tier: 5, basePrice: 850, delay: 20000, category: "Electronics" },
    highOutputCoil: { id: "highOutputCoil", name: "High-Output Ignition Coil", emoji: "🔌", tier: 4, basePrice: 300, delay: 10000, category: "Electronics" },

    // Performance
    forgedPistons: { id: "forgedPistons", name: "Forged Pistons", emoji: "🔩", tier: 5, basePrice: 1600, delay: 35000, category: "Performance" },
    lightweightFlywheel: { id: "lightweightFlywheel", name: "Lightweight Flywheel", emoji: "🥏", tier: 4, basePrice: 600, delay: 15000, category: "Performance" },
    titaniumExhaustValve: { id: "titaniumExhaustValve", name: "Titanium Exhaust Valve", emoji: "🌪️", tier: 5, basePrice: 2200, delay: 40000, category: "Performance" },
    carbonFiberDriveshaft: { id: "carbonFiberDriveshaft", name: "Carbon Fiber Driveshaft", emoji: "🏎️", tier: 5, basePrice: 1900, delay: 35000, category: "Performance" },

    // Utility
    obd2ScannerPro: { id: "obd2ScannerPro", name: "OBD-II Scanner Pro", emoji: "📱", tier: 4, basePrice: 400, delay: 5000, category: "Utility" },
    customWiringHarness: { id: "customWiringHarness", name: "Custom Wiring Harness", emoji: "🧶", tier: 4, basePrice: 250, delay: 10000, category: "Utility" }
};

const brandMultipliers = {
    classA: 1.0,
    classB: 1.5,
    classC: 3.0,
    classX: 4.0 // Illegal / Contraband
};

const brandNames = {
    classA: "Class A",
    classB: "Class B",
    classC: "Class C",
    classX: "Class X"
};

// Generate dynamic 36-item catalog and inventory
const catalog = {};
const inventory = {};

Object.entries(brandMultipliers).forEach(([brand, mult]) => {
    if (brand === 'classX') return; // Prevent base parts from generating Class X variants

    Object.entries(baseCatalog).forEach(([partKey, part]) => {
        const key = `${brandNames[brand]} ${part.name}`;
        catalog[key] = {
            id: key,
            baseId: partKey,
            brand: brand,
            name: key,
            emoji: part.emoji,
            tier: part.tier,
            basePrice: Math.round(part.basePrice * mult),
            delay: part.delay
        };
        inventory[key] = 0; // Initialize inventory at 0
    });
});

// Inject exclusive standalone contraband parts
Object.entries(contrabandCatalog).forEach(([partKey, part]) => {
    const key = `Class X ${part.name}`;
    catalog[key] = {
        id: key,
        baseId: partKey,
        brand: "classX",
        name: key,
        emoji: part.emoji,
        tier: part.tier,
        basePrice: part.basePrice,
        delay: part.delay,
        category: part.category || "Performance"
    };
    inventory[key] = 0;
});

const jobTemplates = [
    { title: "Cooling System Service", parts: ["waterPump", "coolant"], basePayout: 1200 },
    { title: "Brake & Suspension Overhaul", parts: ["brakePads", "brakeFluid"], basePayout: 1100 },
    { title: "Transmission Rebuild", parts: ["transmission", "brakeFluid"], basePayout: 3200 },
    { title: "Exhaust System Replacement", parts: ["exhaust", "sparkPlugs"], basePayout: 850 },
    { title: "Engine Swap Preparation", parts: ["engineBlock", "suspension"], basePayout: 5500 },
    { title: "Standard Oil & Filter Service", parts: ["oilFilter", "oil"], basePayout: 400 },
    { title: "High-Performance Tuning", parts: ["ecu", "exhaust"], basePayout: 4100 }
];

let activeShipments = []; // Array of { id, partId, partName, progress, duration, qty }
let activeStoreClass = "classA";
let activeInventoryFilter = "classA";
let darknetActiveCategory = "All";
let darknetActiveMarketTab = "parts";
let ownedTools = {
    policeScanner: false,
    ghostVPN: false
};
const contrabandTools = {
    policeScanner: { id: "policeScanner", name: "Police Radio Scanner", emoji: "📻", price: 2500, description: "Detects imminent FBI cargo scans." },
    ghostVPN: { id: "ghostVPN", name: "Ghost VPN", emoji: "🌐", price: 5000, description: "Reduces scan risk by 10%." }
};

let apprenticeHired = false;
let apprenticeProgress = 0; // ms, 0 to 3000
const baseApprenticeDuration = 3000; // 3 seconds base
let apprenticeSpeedLevel = 1;

// --- CERTIFICATION WORKFORCE ---
let deliveryWorkers = [];
let deliveryAutomationEnabled = false;
let nextDeliveryWorkerId = 1;
const deliveryWorkerNames = ["Maya Ortiz", "Eli Brooks", "Jordan Kim", "Riley Chen"];
const certificationTracks = [
    { id: "logisticsLicense", name: "Logistics License", icon: "📦", requiredLevel: 2, cost: 1000, description: "Hire your first delivery worker and activate automated local dispatch." },
    { id: "routeOptimization", name: "Route Optimization", icon: "🗺️", requiredLevel: 4, cost: 2500, description: "Unlock Delivery Speed upgrades and reduce active shipment time." },
    { id: "fleetManagement", name: "Fleet Management", icon: "🚛", requiredLevel: 7, cost: 5000, description: "Unlock Delivery Capacity upgrades and hire a second worker." },
    { id: "hazmatEndorsement", name: "Hazmat Endorsement", icon: "⚠️", requiredLevel: 10, cost: 10000, description: "Unlock Reliability upgrades for high-risk and contraband routes." }
];

// --- WINDOW STATE & METRICS ---
let isGamePaused = false; // State machine flag for phone call interruption

// --- APP STORE & BANK STATE ---
let coreApps = {
    garage: { locked: true },
    playerprofile: { locked: true },
    office: { locked: true },
    ops: { locked: true },
    appstore: { locked: true }
};

let unlockedApps = {
    globalmap: true,
    dealership: false,
    bank: false,
    inspections: false,
    darknet: false,
    scrapnet: false,
    certifications: false,
    bugtracker: true,
    "travel-junkyard": false
};
let installedApps = {
    globalmap: true,
    dealership: false,
    bank: false,
    inspections: false,
    darknet: false,
    scrapnet: false,
    certifications: false,
    bugtracker: true,
    "travel-junkyard": false
};
const paidAppIds = ["dealership", "inspections", "darknet", "certifications", "travel-junkyard"];
let appPurchaseLedger = [];

window.toggleAppInstall = function (appId) {
    installedApps[appId] = !installedApps[appId];
    if (!installedApps[appId]) {
        const winEl = document.getElementById(`window-${appId}`);
        if (winEl) winEl.style.display = "none";
    }
    renderDesktop();
    updateUI();
    const appName = appId === "darknet" ? "DarkNet.exe" : appId;
    showNotification(
        installedApps[appId] ? `${appName} installed and added to your desktop.` : `${appName} uninstalled.`,
        installedApps[appId] ? "success" : "info"
    );
    saveGame();
};

window.evaluateProgression = function() {
    const ownsBusiness = locations.some(loc => loc.owner === "player");
    if (ownsBusiness) {
        Object.keys(coreApps).forEach(app => {
            coreApps[app].locked = false;
        });
        renderDesktop();
    }
};

function renderDesktop() {
    Object.entries(unlockedApps).forEach(([app, unlocked]) => {
        const icon = document.getElementById(`icon-${app}`);
        if (icon) {
            const isVisible = (unlocked && installedApps[app]);
            if (isVisible) {
                icon.classList.remove('hidden-app');
                icon.style.display = "flex";
            } else {
                icon.classList.add('hidden-app');
                icon.style.display = "none";
            }
        }
    });

    // OS Lock visual logic
    const allIcons = document.querySelectorAll('.desktop-icon');
    const exemptApps = ['icon-globalmap', 'icon-settings', 'icon-devpanel', 'icon-bugtracker'];

    allIcons.forEach(icon => {
        const appId = icon.id.replace('icon-', '');
        const appConfig = appTutorialData[appId] || {};
        
        if (appConfig.alwaysUnlocked) {
            icon.classList.remove('hidden-app');
            icon.style.display = "flex";
        }
        
        let isLocked = false;
        if (coreApps[appId] !== undefined) {
            isLocked = coreApps[appId].locked;
        } else if (!appConfig.alwaysUnlocked && !exemptApps.includes(icon.id)) {
            isLocked = !playerStats.startingLocation; 
        }
        
        if (isLocked) {
            icon.classList.add('locked');
            if (!icon.querySelector('.app-lock-badge')) {
                const badge = document.createElement('div');
                badge.className = 'app-lock-badge';
                badge.textContent = '🔒';
                icon.appendChild(badge);
            }
        } else {
            icon.classList.remove('locked');
            const badge = icon.querySelector('.app-lock-badge');
            if (badge) badge.remove();
        }
    });
}let loanInterestTimer = 0;

// --- PLAYER PROGRESSION ---
let playerStats = {
    xp: 0,
    level: 1,
    xpNeeded: 100,
    skillPoints: 0,
    skills: {
        greasemonkey: 0,
        smoothTalker: 0,
        ghost: 0,
        secondChance: 0
    },
    tutorialStep: 0,
    certifications: {
        basicFabrication: false, // Unlocks at Level 5
        advancedElectronics: false, // Unlocks at Level 10
        blackMarketTuning: false, // Unlocks at Level 15
        logisticsLicense: false,
        routeOptimization: false,
        fleetManagement: false,
        hazmatEndorsement: false
    }
};
const xpToNextLevel = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 30000, 45000, 60000, 80000];
const levelRanks = [
    { level: 1, name: "Rookie" },
    { level: 3, name: "Street Mechanic" },
    { level: 5, name: "Shop Foreman" },
    { level: 8, name: "Regional Operator" },
    { level: 12, name: "Logistics Director" },
    { level: 16, name: "Global Tycoon" }
];
const levelMilestones = [
    { level: 2, text: "Logistics License becomes available" },
    { level: 4, text: "Route Optimization becomes available" },
    { level: 5, text: "Basic Fabrication certification becomes available" },
    { level: 7, text: "Fleet Management becomes available" },
    { level: 10, text: "Hazmat Endorsement and Advanced Electronics become available" },
    { level: 15, text: "Black Market Tuning becomes available" }
];

function getPlayerRank(level = playerStats.level) {
    return [...levelRanks].reverse().find(rank => level >= rank.level) || levelRanks[0];
}

function getNextLevelMilestone(level = playerStats.level) {
    return levelMilestones.find(milestone => milestone.level > level);
}

// --- GLOBAL LOGISTICS ---
let globalSupply = {
    usa: { name: "Local Scrapyard", delay: 10000, unlocked: true, contractCost: 0, tierFilter: "classA" },
    japan: { name: "Tokyo Import Hub", delay: 90000, unlocked: false, contractCost: 10000, tierFilter: "classB" },
    germany: { name: "Berlin Autobahn Tuning", delay: 180000, unlocked: false, contractCost: 25000, tierFilter: "classC" }
};
let activeLogisticsRegion = null;
let logisticsSearchQuery = "";
let activeDarkNetShipments = [];
let activeSmuggleDelivery = null;
let smuggleState = { active: false };
let globalHeat = 0;
const HEAT_PER_PART = 0.05;
let isIllicitLocked = false;
let lockdownTimeRemaining = 0;

// --- DYNAMIC COMMODITY MARKET STATE ---
let marketPrices = { scrapMetal: 1.50 };
let marketTrends = { scrapMetal: "down" };
let marketTrendPcts = { scrapMetal: 0 };

Object.keys(catalog).forEach(key => {
    marketPrices[key] = catalog[key].basePrice;
    marketTrends[key] = "up";
    marketTrendPcts[key] = 0;
});

let activeNewsEvent = null;
let newsTimer = 0;
const NEWS_INTERVAL = 120000; // 2 minutes per news cycle
let newsHistory = [];

const newsCatalog = [
    { id: "rubber_shortage", headline: "BREAKING: Global Rubber Supply Chain Collapses", body: "A massive fire at a primary manufacturing plant has halted global rubber production. Experts predict immediate shortages for automotive belts and hoses.", targetParts: ["Class A Drive Belt", "Class B Drive Belt", "Class C Drive Belt"], priceMultiplier: 2.5 },
    { id: "tech_boom", headline: "TECH WATCH: Silicon Valley Surplus", body: "Overproduction of microchips has led to a massive surplus in automotive computing parts. Prices are plummeting across the board.", targetParts: ["Class A ECU", "Class B ECU", "Class C ECU"], priceMultiplier: 0.4 },
    { id: "emissions_law", headline: "POLITICS: NYS Passes Strict Emissions Bill", body: "The state has mandated immediate replacements for aging exhaust systems. Mechanics are scrambling to secure inventory.", targetParts: ["Class A Exhaust System", "Class B Exhaust System", "Class C Exhaust System"], priceMultiplier: 1.8 },
    { id: "oil_crisis", headline: "GLOBAL ALERT: Middle East Tensions Spike", body: "Conflict in major oil-producing regions has disrupted global shipping lanes. Crude oil prices are plummeting as emergency reserves are dumped onto the market.", targetParts: ["Class A 5W-30 Oil", "Class B 5W-30 Oil", "Class C 5W-30 Oil"], priceMultiplier: 0.3 }
];

// --- APP TUTORIAL STATE ---
let seenAppTutorials = [];

const appTutorialData = {
    "inspections": { title: "Safety Inspections", text: "Run physical and digital diagnostics on fleet vehicles. Ensure physical paperwork matches the DMV database before scanning. Look out for expired stickers!" },
    "office": { title: "Global Logistics", text: "Order replacement parts from global hubs. Pay attention to transit times and costs. Use the search bar to quickly find the exact class and part you need." },
    "scrapnet": { title: "ScrapNet Exchange", text: "A live commodities market for automotive parts. Prices fluctuate based on global events and volatility. Buy low, sell high." },
    "darknet": { title: "DarkNet Operations", text: "Purchase illicit tools and Class X parts. Warning: Possessing contraband increases your heat and risks an FBI lockdown." },
    "certifications": { title: "Certifications", text: "Earn licenses to build your delivery workforce. Logistics License unlocks hiring, Route Optimization unlocks speed, Fleet Management unlocks capacity and a second worker, and Hazmat Endorsement improves high-risk route reliability." },
    "garage": { title: "Inventory & Garage", text: "View all your currently owned parts, tools, and scrap metal. Use the Salvage button to break down excess parts into scrap metal for extra cash." },
    "ops": { title: "Active Repair Orders", text: "This is your primary workflow hub. Accept incoming customer orders, manage your mechanic apprentice, and monitor system metrics. Always keep an eye on your backlog." },
    "dealership": { title: "Dealership CRM", text: "Buy cheap used cars, repair them with parts from your inventory, and flip them for a profit. Watch the live market demand charts to maximize your margins." },
    "appstore": { title: "App Store", text: "Purchase new software applications to expand your garage operations. Uninstall unneeded apps to declutter your desktop without losing ownership." },
    "bank": { title: "Bank.exe", text: "Manage your finances. Deposit cash into your savings account to earn interest, or take out high-interest loans for emergency capital. Don't fall behind on payments!", alwaysUnlocked: true },
    "settings": { title: "Settings", text: "Customize the look and feel of MechanicOS with various terminal themes and wallpapers." },
    "bugtracker": { title: "BugTracker QA", text: "Submit direct feedback or report glitches directly to the developer team.", alwaysUnlocked: true },
    "devpanel": { title: "DevPanel.exe", text: "Developer tools to manipulate the game state, inject cash, spawn orders, or override market prices.", alwaysUnlocked: true }
};

window.showAppTutorial = function (appKey) {
    const data = appTutorialData[appKey];
    if (!data) return;

    document.getElementById("tutorial-modal-title").textContent = `${data.title} Guide`;
    document.getElementById("tutorial-modal-text").textContent = data.text;
    document.getElementById("app-tutorial-modal").classList.remove("hidden");
};

let customerQueue = [
    {
        id: Math.random().toString(36).substring(2, 9),
        carModel: "Toyota Prius",
        jobTitle: "Cooling System Service",
        partsRequired: ["Class A Water Pump", "Class A Coolant"],
        payout: 1350
    },
    {
        id: Math.random().toString(36).substring(2, 9),
        carModel: "Tesla Model 3",
        jobTitle: "Brake & Suspension Overhaul",
        partsRequired: ["Class B Brake Pads", "Class B Brake Fluid"],
        payout: 1100
    }
];

const carModels = [
    "Toyota Prius", "Tesla Model 3", "Honda Civic", "Ford F-150", "BMW M3", 
    "Chevrolet Corvette", "Subaru Outback", "Audi A4", "Jeep Wrangler", 
    "Nissan GTR", "Mazda MX-5", "Dodge Charger", "Volkswagen Golf", 
    "Porsche 911", "Hyundai Sonata"
];
let customerSpawnTimer = 0;
const customerSpawnInterval = 60000; // Spawn a customer every 60s (pacing is slower and realistic)

let fixHistory = []; // Array of timestamps for Cars Fixed Per Minute (FPM)
let apprenticeHistory = []; // Array of 0s and 1s representing state over last 30s

// --- OPERATIONS CONTRACTS ---
let completedContractIds = [];
const operationsContracts = [
    { id: "first-turn", icon: "🔧", title: "First Turnaround", brief: "Fulfill your first customer repair order.", requirement: () => fixHistory.length >= 1, rewardCash: 750, rewardXP: 80 },
    { id: "parts-counter", icon: "📦", title: "Parts Counter Online", brief: "Hold five or more parts in your global inventory.", requirement: () => Object.values(inventory).reduce((sum, quantity) => sum + quantity, 0) >= 5, rewardCash: 900, rewardXP: 100 },
    { id: "second-front", icon: "🌐", title: "Open a Second Front", brief: "Own two business locations at the same time.", requirement: () => locations.filter(location => location.owner === "player").length >= 2, rewardCash: 2500, rewardXP: 180 },
    { id: "certified-dispatch", icon: "🚚", title: "Certified Dispatch", brief: "Hire your first certified delivery worker.", requirement: () => deliveryWorkers.length >= 1, rewardCash: 1800, rewardXP: 160 },
    { id: "shadow-economy", icon: "🕶️", title: "Shadow Economy", brief: "Acquire a Ghost VPN for protected high-risk operations.", requirement: () => ownedTools.ghostVPN === true, rewardCash: 3500, rewardXP: 240 }
];

window.claimOperationsContract = function (contractId) {
    const contract = operationsContracts.find(item => item.id === contractId);
    if (!contract || completedContractIds.includes(contractId) || !contract.requirement()) return;

    completedContractIds.push(contractId);
    money += contract.rewardCash;
    addXP(contract.rewardXP);
    showNotification(`${contract.title} complete: +$${contract.rewardCash.toLocaleString()} and ${contract.rewardXP} XP.`, "success");
    updateNewsTicker(`CONTRACT CLOSED: ${contract.title.toUpperCase()} — YOUR GARAGE NETWORK IS GROWING.`);
    renderOperationsContracts();
    updateUI();
    saveGame();
};

function renderOperationsContracts() {
    const container = document.getElementById("operations-contracts-list");
    if (!container) return;

    container.innerHTML = operationsContracts.map(contract => {
        const completed = completedContractIds.includes(contract.id);
        const ready = !completed && contract.requirement();
        const state = completed ? "COMPLETED" : ready ? "READY TO CLAIM" : "IN PROGRESS";
        const stateClass = completed ? "status-working" : ready ? "status-ready" : "status-idle";
        return `<div class="operations-contract-card ${completed ? "is-complete" : ""}">
            <div class="contract-copy"><div class="contract-title">${contract.icon} ${contract.title}</div><div class="contract-brief">${contract.brief}</div><div class="contract-reward">REWARD · $${contract.rewardCash.toLocaleString()} + ${contract.rewardXP} XP</div></div>
            <div class="contract-action"><span class="status-badge ${stateClass}">${state}</span><button class="btn btn-sm btn-order" onclick="window.claimOperationsContract('${contract.id}')" ${!ready ? "disabled" : ""}>${completed ? "CLAIMED" : "Claim"}</button></div>
        </div>`;
    }).join("");
}

// --- DEALERSHIP DASHBOARD STATE ---
let totalRevenue = 0;
let carsSold = 0;
let declinedCalls = 0; // Tracks rejected calls for Conversion Metric
let bodyStyleSales = { Sedan: 12, SUV: 8, Truck: 5, Coupe: 4, Hatchback: 6 };
let garageReputation = 0;
let customerSatisfaction = 80;
let businessUpgrades = { lift: 0, storage: 0, security: 0 };
let activeGarageEvent = null;
let garageEventTimer = 0;
const garageEvents = [
    { id: "supplier-bonus", title: "Supplier Loyalty Bonus", text: "A trusted supplier offers a one-cycle parts discount.", effect: "Parts prices are 15% lower for this cycle.", reward: 0.15 },
    { id: "fleet-rush", title: "Fleet Rush", text: "A local fleet needs emergency service before the end of the day.", effect: "Repair XP and reputation gains are doubled this cycle.", reward: 2 },
    { id: "rival-poach", title: "Rival Poaching Attempt", text: "A rival shop is trying to recruit your best delivery talent.", effect: "Workers lose morale unless Security is upgraded.", reward: -8 }
];

function getBusinessUpgradeCost(upgradeId) {
    const level = businessUpgrades[upgradeId] || 0;
    return (upgradeId === "security" ? 3500 : upgradeId === "storage" ? 2500 : 4000) * (level + 1);
}

function getPartsPurchasePrice(item) {
    return Math.round(item.basePrice * (activeGarageEvent?.id === "supplier-bonus" ? 0.85 : 1));
}

window.purchaseBusinessUpgrade = function (upgradeId) {
    if (!Object.prototype.hasOwnProperty.call(businessUpgrades, upgradeId)) return;
    if (!locations.some(location => location.owner === "player")) {
        showNotification("Purchase a business before installing upgrades.", "error");
        return;
    }
    const cost = getBusinessUpgradeCost(upgradeId);
    if (money < cost) {
        triggerInsufficientFundsFeedback();
        showNotification(`You need $${cost.toLocaleString()} for this upgrade.`, "error");
        return;
    }
    money -= cost;
    businessUpgrades[upgradeId] += 1;
    showNotification(`${upgradeId.toUpperCase()} upgrade installed.`, "success");
    renderPortfolio();
    updateUI();
    saveGame();
};

function tickGarageEvent() {
    garageEventTimer += 1;
    if (garageEventTimer < 3) return;
    garageEventTimer = 0;
    activeGarageEvent = garageEvents[Math.floor(Math.random() * garageEvents.length)];
    if (activeGarageEvent.id === "rival-poach" && (businessUpgrades.security || 0) === 0) {
        deliveryWorkers.forEach(worker => worker.morale = Math.max(0, (worker.morale || 80) - 8));
    }
    updateNewsTicker(`GARAGE EVENT: ${activeGarageEvent.title} — ${activeGarageEvent.effect}`);
    showOSNotification("Garage Operations", activeGarageEvent.text);
}

// --- PHONE CALL EVENT STATE ---
let callTimer = 0;
let nextCallInterval = 600000; // First call triggers after 10 minutes of play
let currentCallCustomer = null;

// --- CHART INSTANCES ---
let chartsInitialized = false;
let weeklyChart = null;
let bodyChart = null;

// --- SAFETY INSPECTION APP STATE ---
let activeInspection = null; // null or { progress, duration, reportText, status }
let currentInspectionVehicle = null;
let activeInspectionZone = null;
let serviceHistory = [];

// --- TUTORIAL ONBOARDING STATE ---
let tutorialPhase = 0;
let isTutorialComplete = false;

const tutorialSteps = [
    "Welcome to MechanicOS. Let's make some starting cash. Open your 'Inventory' app and click 'Salvage Scrap Metal'.", // Phase 0
    "Good. Now let's buy supplies. Open 'Logistics.exe' and order any Class A part from the Local Scrapyard.", // Phase 1
    "Parts are in. Open 'Active Repair Orders' and fulfill a customer's contract that requires your new part to get paid.", // Phase 2
    "Excellent work. Keep ordering parts and fulfilling repair orders to build your bank. You need to reach $5,000.", // Phase 3
    "You hit $5,000! Open the 'App Store', purchase 'Inspections.exe', and open it to start a Multi-Point Inspection on a vehicle." // Phase 4
];

function updateTutorial() {
    if (isTutorialComplete) {
        const widget = document.getElementById("tutorial-widget");
        if (widget) {
            widget.classList.add("hidden");
            widget.style.display = "none";
        }
        return;
    }

    const tutorialText = document.getElementById("tutorial-text");
    if (!tutorialText) return;
    if (tutorialPhase < tutorialSteps.length) {
        tutorialText.innerText = tutorialSteps[tutorialPhase];
        // Ensure widget is visible if tutorial is active
        const widget = document.getElementById("tutorial-widget");
        if (widget) {
            widget.classList.remove("hidden");
            widget.style.display = "";
        }
    } else {
        isTutorialComplete = true;
        tutorialText.innerText = "Tutorial Complete. The garage is yours.";
        saveGame();
        setTimeout(() => {
            const widget = document.getElementById("tutorial-widget");
            if (widget) {
                widget.classList.add("hidden");
                widget.style.display = "none";
            }
        }, 3000);
    }
}

// --- DOM ELEMENTS ---
const moneyDisplay = document.getElementById("money-display");
const salvageBtn = document.getElementById("salvage-btn");
const hireApprenticeBtn = document.getElementById("hire-apprentice-btn");

const apprenticeLockState = document.getElementById("apprentice-lock-state");
const apprenticeActiveState = document.getElementById("apprentice-active-state");
const apprenticeStatusText = document.getElementById("apprentice-status-text");
const apprenticeProgressBar = document.getElementById("apprentice-progress-bar");

// Windows & Desktop Icons
const windows = {
    globalmap: document.getElementById("window-globalmap"),
    garage: document.getElementById("window-garage"),
    office: document.getElementById("window-office"),
    ops: document.getElementById("window-ops"),
    dealership: document.getElementById("window-dealership"),
    appstore: document.getElementById("window-appstore"),
    certifications: document.getElementById("window-certifications"),
    bank: document.getElementById("window-bank"),
    scrapnet: document.getElementById("window-scrapnet"),
    inspections: document.getElementById("window-inspections"),
    sysconfig: document.getElementById("window-sysconfig"),
    settings: document.getElementById("window-settings"),
    devpanel: document.getElementById("window-devpanel"),
    bugtracker: document.getElementById("window-bugtracker"),
    darknet: document.getElementById("window-darknet"),
    playerprofile: document.getElementById("window-playerprofile")
};
const icons = {
    globalmap: document.getElementById("icon-globalmap"),
    garage: document.getElementById("icon-garage"),
    office: document.getElementById("icon-office"),
    ops: document.getElementById("icon-ops"),
    dealership: document.getElementById("icon-dealership"),
    appstore: document.getElementById("icon-appstore"),
    certifications: document.getElementById("icon-certifications"),
    bank: document.getElementById("icon-bank"),
    scrapnet: document.getElementById("icon-scrapnet"),
    inspections: document.getElementById("icon-inspections"),
    bugtracker: document.getElementById("icon-bugtracker"),
    playerprofile: document.getElementById("icon-playerprofile")
};
const taskbarWindowsContainer = document.getElementById("taskbar-windows");
const taskbarClockEl = document.getElementById("taskbar-clock");

// App Store & Bank Components
const buyAppDealershipBtn = document.getElementById("buy-app-dealership");
const buyAppBankBtn = document.getElementById("buy-app-bank");
const buyAppInspectionsBtn = document.getElementById("buy-app-inspections");
const buyAppDarknetBtn = document.getElementById("buy-app-darknet");
const buyAppScrapnetBtn = document.getElementById("buy-app-scrapnet");
const buyAppCertificationsBtn = document.getElementById("buy-app-certifications");
const buyAppJunkyardBtn = document.getElementById("buy-app-travel-junkyard");
const buyAppBugTrackerBtn = document.getElementById("buy-app-bugtracker");
const takeLoanBtn = document.getElementById("take-loan-btn");
const repayLoanBtn = document.getElementById("repay-loan-btn");
const loanAmountVal = document.getElementById("loan-amount-val");

// Ops Panel components
const systemStatusVal = document.getElementById("system-status-val");
const fpmVal = document.getElementById("fpm-val");
const apprenticeUptimeVal = document.getElementById("apprentice-uptime-val");
const backlogVal = document.getElementById("backlog-val");

// Dealership KPI components
const kpiRevenue = document.getElementById("kpi-revenue");
const kpiSold = document.getElementById("kpi-sold");
const kpiConversion = document.getElementById("kpi-conversion");

// Phone Call Widget components
const phoneWidget = document.getElementById("phone-widget");
const phoneRingingView = document.getElementById("phone-ringing-view");
const phoneActiveView = document.getElementById("phone-active-view");
const callAnswerBtn = document.getElementById("call-answer-btn");
const callDeclineBtn = document.getElementById("call-decline-btn");
const activeCallerName = document.getElementById("active-caller-name");
const callerIdText = document.getElementById("caller-id-text");
const callerSpeechText = document.getElementById("caller-speech-text");
const callAcceptBtn = document.getElementById("call-accept-btn");
const callQuoteBtn = document.getElementById("call-quote-btn");
const callHangupBtn = document.getElementById("call-hangup-btn");
const callHaggleResult = document.getElementById("call-haggle-result");

// --- GAME TICK LOOP ---
let lastTickTime = Date.now();
let fbiScanTimer = 0;
let nextFbiScanThreshold = (5 * 60 * 1000) + Math.random() * (3 * 60 * 1000); // 5 to 8 minutes

function gameLoop() {
    // If modal is active, the game state variables freeze completely
    if (isGamePaused) return;

    const now = Date.now();
    const dt = now - lastTickTime; // Delta time in ms
    lastTickTime = now;

    // --- FBI SCAN LOGIC ---
    fbiScanTimer += dt;

    const warningBanner = document.getElementById("fbi-imminent-warning");
    const hasScanner = ownedTools.policeScanner === true && !isIllicitLocked;
    if (hasScanner && (fbiScanTimer >= nextFbiScanThreshold - 30000)) {
        if (warningBanner) warningBanner.classList.remove("hidden");
        document.body.classList.add("pulse-red-border");
    } else {
        if (warningBanner) warningBanner.classList.add("hidden");
        document.body.classList.remove("pulse-red-border");
    }

    if (fbiScanTimer >= nextFbiScanThreshold) {
        triggerFbiScan();
        fbiScanTimer = 0;
        nextFbiScanThreshold = (5 * 60 * 1000) + Math.random() * (3 * 60 * 1000);
    }

    // Simulation loops run continuously
    updateShipments(dt);
    updateDarkNetShipments(dt);
    updateCustomers(dt);
    updateApprentice(dt);
    updateInspection(dt);
    updateMetrics(dt);
    updateCallTimer(dt);
    tickNews(dt);

    // Bank interest ticking
    updateLoanInterest(dt);

    // Update global heat system
    updateHeat(dt);

    // Tick down FBI lockdown if active
    if (isIllicitLocked) {
        lockdownTimeRemaining -= dt;
        if (lockdownTimeRemaining <= 0) {
            lockdownTimeRemaining = 0;
            unlockApps();
        } else {
            const minutes = Math.floor(lockdownTimeRemaining / 60000);
            const seconds = Math.floor((lockdownTimeRemaining % 60000) / 1000);
            const timeStr = `TIME REMAINING: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            const globalNotifCountdown = document.getElementById("global-lockdown-countdown");
            if (globalNotifCountdown) {
                globalNotifCountdown.textContent = timeStr;
            }
        }
    }

    // UI rendering
    updateUI();
}

function updateLoanInterest(dt) {
    // Deprecated in favor of runDailySimulation
}

// Start core loop at ~20 ticks/sec (50ms interval)
const gameIntervalId = setInterval(gameLoop, 50);

// --- SHIPPING TIMER LOGIC & BAY SYSTEM ---
// --- SYSTEM CLOCK LOGIC ---
function updateClock() {
    if (!taskbarClockEl) return;
    taskbarClockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- DRAGGABLE WINDOWS MANAGER ---
let activeDraggingWindow = null;
let dragStartX = 0;
let dragStartY = 0;
let windowStartX = 0;
let windowStartY = 0;
let maxZIndex = 100;

// --- DESKTOP ICON DRAG MANAGER ---
let activeDraggingIcon = null;
let dragStartIconX = 0;
let dragStartIconY = 0;
let dragStartMouseX = 0;
let dragStartMouseY = 0;
let dragThresholdMet = false;

function bringToFront(winEl) {
    maxZIndex += 1;
    winEl.style.zIndex = maxZIndex;

    Object.values(windows).forEach(win => {
        if (win) win.classList.remove("active-focus");
    });
    winEl.classList.add("active-focus");

    renderTaskbar();
}

function toggleMaximize(winEl, maxBtn) {
    if (!winEl) return;
    const isMaximized = winEl.getAttribute("data-maximized") === "true";

    if (isMaximized) {
        // Restore
        const prevLeft = winEl.getAttribute("data-prev-left");
        const prevTop = winEl.getAttribute("data-prev-top");
        const prevWidth = winEl.getAttribute("data-prev-width");
        const prevHeight = winEl.getAttribute("data-prev-height");

        winEl.style.left = prevLeft ? `${prevLeft}px` : "";
        winEl.style.top = prevTop ? `${prevTop}px` : "";
        winEl.style.width = prevWidth ? `${prevWidth}px` : "";
        winEl.style.height = prevHeight ? `${prevHeight}px` : "";
        winEl.style.maxHeight = "";

        winEl.setAttribute("data-maximized", "false");
        if (maxBtn) {
            maxBtn.innerHTML = "&#9633;"; // □
        }
    } else {
        // Maximize
        const style = window.getComputedStyle(winEl);
        winEl.setAttribute("data-prev-left", parseInt(style.left, 10) || 0);
        winEl.setAttribute("data-prev-top", parseInt(style.top, 10) || 0);
        winEl.setAttribute("data-prev-width", parseInt(style.width, 10) || 0);
        winEl.setAttribute("data-prev-height", parseInt(style.height, 10) || 0);

        winEl.style.left = "0px";
        winEl.style.top = "0px";
        winEl.style.width = "100%";
        winEl.style.height = "calc(100vh - 60px)";
        winEl.style.maxHeight = "none";

        winEl.setAttribute("data-maximized", "true");
        if (maxBtn) {
            maxBtn.innerHTML = "&#128471;"; // 🗗
        }
    }

    // Resize charts if the dealership window is being toggled
    if (winEl.id === "window-dealership" && chartsInitialized) {
        if (weeklyChart) weeklyChart.resize();
        if (bodyChart) bodyChart.resize();
    }
}

function initWindowManager() {
    document.querySelectorAll(".desktop-icon").forEach(icon => {
        const startDrag = (e) => {
            if (e.target.closest("button")) return;
            activeDraggingIcon = icon;
            dragThresholdMet = false;

            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

            dragStartMouseX = clientX;
            dragStartMouseY = clientY;

            const style = window.getComputedStyle(icon);
            dragStartIconX = parseInt(style.left, 10) || 0;
            dragStartIconY = parseInt(style.top, 10) || 0;

            if (e.cancelable) e.preventDefault();
        };

        icon.addEventListener("mousedown", startDrag);
        icon.addEventListener("touchstart", startDrag, { passive: false });

        icon.addEventListener("dblclick", () => {
            if (icon.id === "icon-globalmap") {
                const tutorialToast = document.getElementById('tutorial-toast-1');
                if (tutorialToast) {
                    tutorialToast.style.opacity = '0';
                    setTimeout(() => tutorialToast.remove(), 300);
                }
            } else if (icon.id === "icon-playerprofile") {
                const tutorialToast = document.getElementById('tutorial-toast-2');
                if (tutorialToast) {
                    tutorialToast.style.opacity = '0';
                    setTimeout(() => tutorialToast.remove(), 300);
                }
            }

            // OS Boot Lockout Phase 1
            if (!playerStats.startingLocation && !['icon-globalmap', 'icon-settings', 'icon-devpanel', 'icon-bugtracker'].includes(icon.id)) {
                showNotification("SYSTEM LOCK: You must purchase a Business License from GlobalBusinesses.exe to unlock the OS.", "error");
                return;
            }

            if (isIllicitLocked && ['icon-darknet', 'icon-streetracehub'].includes(icon.id)) {
                showNotification("LOCKED BY FBI: Investigation in progress.", "error");
                return;
            }
            if (icon.id === "icon-travel-junkyard") {
                document.getElementById("location-salvagemap").classList.remove("hidden");
                return;
            }

            const windowId = "window-" + icon.id.replace("icon-", "");
            const winEl = document.getElementById(windowId);
            if (winEl) {
                winEl.style.display = "flex";
                winEl.removeAttribute("data-minimized");
                bringToFront(winEl);
                renderTaskbar();

                const appKey = windowId.replace("window-", ""); // e.g., "office"
                if (appTutorialData[appKey] && !seenAppTutorials.includes(appKey)) {
                    seenAppTutorials.push(appKey);
                    showAppTutorial(appKey);
                    saveGame();
                }

                if (windowId === 'window-dealership') {
                    if (weeklyChart) weeklyChart.resize();
                    if (bodyChart) bodyChart.resize();
                }
                saveGame();
            } else {
                const notif = document.createElement("div");
                notif.style.position = "fixed";
                notif.style.top = "20px";
                notif.style.left = "50%";
                notif.style.transform = "translateX(-50%)";
                notif.style.background = "rgba(0, 0, 0, 0.9)";
                notif.style.border = "1px solid #ef4444";
                notif.style.color = "#ef4444";
                notif.style.padding = "10px 20px";
                notif.style.fontFamily = "monospace";
                notif.style.zIndex = "9999";
                notif.innerText = "APPLICATION ERROR: Executable missing or under construction.";
                document.body.appendChild(notif);
                setTimeout(() => notif.remove(), 3000);
            }
        });
    });

    Object.entries(windows).forEach(([key, winEl]) => {
        if (!winEl) return;

        winEl.addEventListener("mousedown", () => {
            bringToFront(winEl);
        });

        const header = winEl.querySelector(".window-header");
        if (header) {
            header.addEventListener("mousedown", (e) => {
                if (e.target.closest("button")) return;
                if (winEl.getAttribute("data-maximized") === "true") return;
                if (window.innerWidth <= 768) return;

                activeDraggingWindow = winEl;
                dragStartX = e.clientX;
                dragStartY = e.clientY;

                const style = window.getComputedStyle(winEl);
                windowStartX = parseInt(style.left, 10) || 0;
                windowStartY = parseInt(style.top, 10) || 0;

                bringToFront(winEl);
                e.preventDefault(); // Prevents default text-selection and drag behaviors
            });
        }

        const closeBtn = winEl.querySelector(".window-close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                winEl.style.display = "none";
                winEl.removeAttribute("data-minimized");
                winEl.classList.remove("active-focus");
                renderTaskbar();
                saveGame();
            });
        }

        const maxBtn = winEl.querySelector(".window-max-btn");
        if (maxBtn) {
            maxBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleMaximize(winEl, maxBtn);
                saveGame();
            });
        }

        const minBtn = winEl.querySelector(".window-min-btn");
        if (minBtn) {
            minBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                winEl.style.display = "none";
                winEl.setAttribute("data-minimized", "true");
                winEl.classList.remove("active-focus");
                renderTaskbar();
                saveGame();
            });
        }

        const fullBtn = winEl.querySelector(".window-full-btn");
        if (fullBtn) {
            fullBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log(`Error attempting to enable fullscreen: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
        }
    });

    function handleGlobalMove(clientX, clientY) {
        if (activeDraggingWindow) {
            const dx = clientX - dragStartX;
            const dy = clientY - dragStartY;

            let newX = windowStartX + dx;
            let newY = windowStartY + dy;

            newX = Math.max(-200, Math.min(window.innerWidth - 100, newX));
            newY = Math.max(0, Math.min(window.innerHeight - 80, newY));

            activeDraggingWindow.style.left = `${newX}px`;
            activeDraggingWindow.style.top = `${newY}px`;
        }

        if (activeDraggingIcon) {
            const dx = clientX - dragStartMouseX;
            const dy = clientY - dragStartMouseY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                dragThresholdMet = true;
            }

            let newX = dragStartIconX + dx;
            let newY = dragStartIconY + dy;

            newX = Math.max(0, Math.min(window.innerWidth - 84, newX));
            newY = Math.max(0, Math.min(window.innerHeight - 50 - 84, newY));

            activeDraggingIcon.style.left = `${newX}px`;
            activeDraggingIcon.style.top = `${newY}px`;
        }
    }

    document.addEventListener("mousemove", (e) => {
        handleGlobalMove(e.clientX, e.clientY);
    });

    document.addEventListener("touchmove", (e) => {
        if (activeDraggingWindow || activeDraggingIcon) {
            handleGlobalMove(e.touches[0].clientX, e.touches[0].clientY);
            if (e.cancelable) e.preventDefault();
        }
    }, { passive: false });

    function handleGlobalEnd() {
        if (activeDraggingWindow) {
            const style = window.getComputedStyle(activeDraggingWindow);
            let currentX = parseInt(style.left, 10) || 0;
            let currentY = parseInt(style.top, 10) || 0;

            let snappedX = Math.round(currentX / 20) * 20;
            let snappedY = Math.round(currentY / 20) * 20;

            snappedX = Math.max(-200, Math.min(window.innerWidth - 100, snappedX));
            snappedY = Math.max(0, Math.min(window.innerHeight - 80, snappedY));

            activeDraggingWindow.style.left = `${snappedX}px`;
            activeDraggingWindow.style.top = `${snappedY}px`;
            saveGame();
        }
        activeDraggingWindow = null;

        if (activeDraggingIcon) {
            saveIconStates();
        }
        activeDraggingIcon = null;
    }

    document.addEventListener("mouseup", handleGlobalEnd);
    document.addEventListener("touchend", handleGlobalEnd);

    setInterval(updateClock, 1000);
    updateClock();

    const factionFilterSelect = document.getElementById("faction-filter-select");
    if (factionFilterSelect) {
        factionFilterSelect.addEventListener("change", (e) => {
            activeFactionFilter = e.target.value;
            if (typeof window.renderSupplyRoutes === "function") window.renderSupplyRoutes();
        });
    }

    const searchInput = document.getElementById("logistics-search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            logisticsSearchQuery = e.target.value.toLowerCase();
            renderLogisticsDetail();
        });
    }

    renderTaskbar();
}

function renderTaskbar() {
    if (!taskbarWindowsContainer) return;
    taskbarWindowsContainer.innerHTML = "";

    Object.entries(windows).forEach(([key, winEl]) => {
        if (!winEl || (winEl.style.display === "none" && !winEl.getAttribute("data-minimized"))) return;

        const tab = document.createElement("div");
        tab.className = "taskbar-tab";

        if (winEl.classList.contains("active-focus") && winEl.style.display !== "none") {
            tab.classList.add("active");
        }
        if (winEl.getAttribute("data-minimized")) {
            tab.style.opacity = "0.6";
        }

        const titleText = winEl.querySelector(".window-title")?.textContent || key;
        tab.textContent = titleText;

        tab.addEventListener("click", (e) => {
            e.stopPropagation();
            if (winEl.getAttribute("data-minimized") || winEl.style.display === "none") {
                winEl.style.display = "flex";
                winEl.removeAttribute("data-minimized");
                bringToFront(winEl);
            } else if (winEl.classList.contains("active-focus")) {
                winEl.style.display = "none";
                winEl.setAttribute("data-minimized", "true");
                winEl.classList.remove("active-focus");
            } else {
                bringToFront(winEl);
            }
            renderTaskbar();
            saveGame();
        });

        taskbarWindowsContainer.appendChild(tab);
    });
}

// --- DESKTOP ICON STORAGE ---
function saveIconStates() {
    const iconData = {};
    document.querySelectorAll(".desktop-icon").forEach(icon => {
        iconData[icon.id] = {
            left: icon.style.left,
            top: icon.style.top
        };
    });
    localStorage.setItem('mechanicOS_icons', JSON.stringify(iconData));
}

function loadIconStates() {
    const saved = localStorage.getItem('mechanicOS_icons');
    let iconData = {};
    if (saved) {
        try {
            iconData = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse mechanicOS_icons", e);
        }
    }

    let needsSave = false;
    document.querySelectorAll(".desktop-icon").forEach((icon, index) => {
        if (iconData[icon.id]) {
            let left = parseInt(iconData[icon.id].left, 10) || 0;
            let top = parseInt(iconData[icon.id].top, 10) || 0;

            // Failsafe: if the icon was previously saved off-screen (e.g., the BugTracker bug), recover it
            if (top > window.innerHeight - 50 || left > window.innerWidth - 84) {
                const col = Math.floor(index / 8);
                const row = index % 8;
                left = 24 + (col * 100);
                top = 24 + (row * 90);
                needsSave = true;
            }

            icon.style.left = `${left}px`;
            icon.style.top = `${top}px`;
        } else {
            // Fallback grid assignment for new/unsaved icons
            // Wrap to a new column every 8 icons so they don't go off-screen
            const col = Math.floor(index / 8);
            const row = index % 8;
            icon.style.left = `${24 + (col * 100)}px`;
            icon.style.top = `${24 + (row * 90)}px`;
            needsSave = true;
        }
    });

    if (needsSave) saveIconStates();
}

// --- AUTOPARTS STORE & INBOUND SHIPMENTS ENGINE ---
function switchStoreTab(brandClass) {
    activeStoreClass = brandClass;

    // Toggle active classes on tab buttons
    const classes = ['classA', 'classB', 'classC'];
    classes.forEach(c => {
        const tabBtn = document.getElementById(`store-tab-${c}`);
        if (tabBtn) {
            if (c === brandClass) {
                tabBtn.classList.add("active");
            } else {
                tabBtn.classList.remove("active");
            }
        }
    });

    renderStoreItems();
}

function switchInventoryTab(brandClass) {
    activeInventoryFilter = brandClass;

    const classes = ['classA', 'classB', 'classC'];
    classes.forEach(c => {
        const tabBtn = document.getElementById(`inv-tab-${c}`);
        if (tabBtn) {
            if (c === brandClass) {
                tabBtn.classList.add("active");
            } else {
                tabBtn.classList.remove("active");
            }
        }
    });

    updateUI();
}

function renderStoreItems() {
    const listEl = document.getElementById("store-items-list");
    if (!listEl) return;

    listEl.innerHTML = "";

    const searchInput = document.getElementById("store-search-input");
    const searchStr = searchInput ? searchInput.value.trim().toLowerCase() : "";

    if (searchStr !== "") {
        // Search active: Ignore tabs, fuzzy search across full catalog
        const itemsToRender = Object.values(catalog).filter(item =>
            item.name.toLowerCase().includes(searchStr)
        ).sort((a, b) => a.name.localeCompare(b.name));

        itemsToRender.forEach(finalPart => {
            const cardItem = document.createElement("div");
            cardItem.className = "store-item";

            const delaySec = finalPart.delay / 1000;

            cardItem.innerHTML = `
                <div class="store-item-info" style="flex: 1; display: flex; flex-direction: column;">
                    <span class="store-item-name" style="font-weight: 700;">${finalPart.emoji} ${finalPart.name}</span>
                    <span class="store-item-price-delay">Price: $${finalPart.basePrice} | Delivery: ${delaySec.toFixed(0)}s</span>
                </div>
                <button class="btn btn-order btn-sm buy-btn" data-part-id="${finalPart.id}" style="width: auto; align-self: flex-end; margin-left: 8px;">
                    Buy
                </button>
            `;
            listEl.appendChild(cardItem);
        });
    } else {
        // Default: use base catalog and active class tab
        const items = Object.values(baseCatalog).sort((a, b) => a.name.localeCompare(b.name));

        items.forEach(item => {
            const cardItem = document.createElement("div");
            cardItem.className = "store-item";

            const inventoryKey = `${brandNames[activeStoreClass]} ${item.name}`;
            const finalPart = catalog[inventoryKey];
            if (!finalPart) return;

            const delaySec = item.delay / 1000;

            cardItem.innerHTML = `
                <div class="store-item-info" style="flex: 1; display: flex; flex-direction: column;">
                    <span class="store-item-name" style="font-weight: 700;">${finalPart.emoji} ${finalPart.name}</span>
                    <span class="store-item-price-delay">Price: $${finalPart.basePrice} | Delivery: ${delaySec.toFixed(0)}s</span>
                </div>
                <button class="btn btn-order btn-sm buy-btn" data-part-id="${finalPart.id}" style="width: auto; align-self: flex-end; margin-left: 8px;">
                    Buy
                </button>
            `;
            listEl.appendChild(cardItem);
        });
    }

    updateStoreButtonStates();
}

function updateStoreButtonStates() {
    const listEl = document.getElementById("store-items-list");
    if (!listEl) return;
    const storeItems = listEl.querySelectorAll(".store-item");
    const baysFull = activeShipments.length >= getShipmentCapacity();

    storeItems.forEach(itemEl => {
        const buyBtn = itemEl.querySelector(".buy-btn");
        if (buyBtn) {
            const partId = buyBtn.getAttribute("data-part-id");
            const price = catalog[partId].basePrice;

            const isShippingThis = activeShipments.some(s => s.partId === partId);

            buyBtn.disabled = baysFull;
            buyBtn.classList.toggle("insufficient-funds", money < price && !baysFull);

            if (isShippingThis || baysFull) {
                buyBtn.textContent = "Order Dispatched";
                buyBtn.style.background = "#475569";
            } else {
                buyBtn.textContent = "Buy";
                buyBtn.style.background = "";
            }
        }
    });
}

function buyPart(partId, overrideDelay = null) {
    if (activeShipments.length >= getShipmentCapacity()) {
        return; // Shipping bays are full
    }

    const item = catalog[partId];
    if (!item) return;
    const purchasePrice = getPartsPurchasePrice(item);
    if (money < purchasePrice) {
        triggerInsufficientFundsFeedback();
        showNotification(`Insufficient funds. You need $${purchasePrice.toLocaleString()} for ${item.name}.`, "error");
        return;
    }

    money -= purchasePrice;

    // Push new shipment
    activeShipments.push({
        id: Math.random().toString(36).substring(2, 9),
        partId: item.id,
        partName: item.name,
        emoji: item.emoji,
        progress: 0,
        duration: overrideDelay !== null ? overrideDelay : item.delay,
        qty: 1
    });

    updateUI();
    saveGame();
}

// --- LOGISTICS SYSTEM ---
function renderLogisticsRegions() {
    const listEl = document.getElementById("logistics-regions-list");
    if (!listEl) return;

    listEl.innerHTML = "";
    Object.entries(globalSupply).forEach(([key, region]) => {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm ${activeLogisticsRegion === key ? 'active' : ''}`;
        btn.style.textAlign = "left";
        btn.style.padding = "8px 12px";
        btn.style.background = activeLogisticsRegion === key ? "#334155" : "transparent";
        btn.style.border = "1px solid #475569";
        btn.style.color = region.unlocked ? "#e2e8f0" : "#94a3b8";
        btn.style.cursor = "pointer";

        btn.innerHTML = `
            <div style="font-weight: bold;">${region.name}</div>
            <div style="font-size: 10px;">${region.unlocked ? 'Unlocked' : 'Locked - Contract Required'}</div>
        `;

        btn.onclick = () => {
            activeLogisticsRegion = key;
            logisticsSearchQuery = "";
            const searchInput = document.getElementById("logistics-search-input");
            if (searchInput) searchInput.value = "";
            renderLogisticsRegions();
            renderLogisticsDetail();
        };

        listEl.appendChild(btn);
    });
}

function renderLogisticsDetail() {
    const viewEl = document.getElementById("logistics-detail-view");
    const searchContainer = document.getElementById("logistics-search-container");
    if (!viewEl || !activeLogisticsRegion) {
        if (viewEl) viewEl.innerHTML = `<div style="color: #64748b; text-align: center; margin: auto;">Select a region to view logistics.</div>`;
        if (searchContainer) searchContainer.style.display = "none";
        return;
    }

    const region = globalSupply[activeLogisticsRegion];

    if (!region.unlocked) {
        viewEl.innerHTML = `
            <div style="text-align: center; margin: auto; max-width: 80%;">
                <h3 style="color: #f87171; margin-bottom: 8px;">🔒 Route Locked</h3>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px;">
                    Establish a shipping contract with <strong>${region.name}</strong> to import specialized parts.
                </p>
                <div style="font-size: 18px; color: #10b981; font-weight: bold; margin-bottom: 16px;">
                    Contract Cost: $${region.contractCost.toLocaleString()}
                </div>
                <button class="btn btn-order" onclick="purchaseShippingContract('${activeLogisticsRegion}')">
                    Purchase Contract
                </button>
            </div>
        `;
        if (searchContainer) searchContainer.style.display = "none";
        return;
    }

    if (searchContainer) searchContainer.style.display = "block";

    let partsHtml = `<div style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto; max-height: 250px;">`;

    let matches = 0;
    Object.values(catalog).sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        if (item.brand !== region.tierFilter) return;

        if (logisticsSearchQuery) {
            const searchTarget = (item.name + " " + item.brand).toLowerCase();
            if (!searchTarget.includes(logisticsSearchQuery)) return;
        }
        matches++;

        const isBaysFull = activeShipments.length >= getShipmentCapacity();

        partsHtml += `
            <div class="store-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(15, 23, 42, 0.4); border: 1px solid #334155; border-radius: 4px; gap: 8px;">
                <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
                    <span style="font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.emoji || ''} ${item.name}</span>
                    <span style="font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Cost: $${item.basePrice.toLocaleString()} | Transit: ${(region.delay / 1000).toFixed(0)}s</span>
                </div>
                <button class="btn btn-order btn-sm buy-logistics-btn" style="flex-shrink: 0;" data-part-id="${item.id}" data-delay="${region.delay}" ${isBaysFull ? 'disabled' : ''}>
                    Order
                </button>
            </div>
        `;
    });

    if (matches === 0) {
        partsHtml += `<div style="text-align: center; padding: 20px; color: #94a3b8; font-style: italic;">No parts found matching '${logisticsSearchQuery}'</div>`;
    }

    partsHtml += `</div>`;

    viewEl.innerHTML = `
        <h3 style="margin-bottom: 12px; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 8px;">${region.name} Imports</h3>
        ${partsHtml}
    `;

    viewEl.querySelectorAll(".buy-logistics-btn").forEach(btn => {
        btn.onclick = (e) => {
            const pId = e.target.getAttribute("data-part-id");
            const delay = parseInt(e.target.getAttribute("data-delay"));
            buyPart(pId, delay);
            renderLogisticsDetail();
        };
    });
}

function purchaseShippingContract(regionKey) {
    const region = globalSupply[regionKey];
    if (!region || region.unlocked) return;
    if (money < region.contractCost) {
        triggerInsufficientFundsFeedback();
        showNotification(`Insufficient funds. You need $${region.contractCost.toLocaleString()} for this shipping contract.`, "error");
        return;
    }

    money -= region.contractCost;
    region.unlocked = true;

    renderLogisticsRegions();
    renderLogisticsDetail();
    updateUI();
}

function updateShipments(dt) {
    activeShipments.forEach(shipment => {
        shipment.progress += dt * getDeliverySpeedMultiplier();
        if (shipment.progress >= shipment.duration) {
            // Deliver the part!
            inventory[shipment.partId] += shipment.qty;
            shipment.completed = true;
            if (tutorialPhase === 1) {
                tutorialPhase = 2;
                updateTutorial();
            }
        }
    });

    const completed = activeShipments.filter(s => s.completed);
    if (completed.length > 0) {
        activeShipments = activeShipments.filter(s => !s.completed);
        updateUI();
    }
}

function updateDarkNetShipments(dt) {
    activeDarkNetShipments.forEach(shipment => {
        // For smuggler shipments: pause at randomized point if interception not yet cleared
        if (shipment.duration === 300000) {
            const progressPercentage = shipment.progress / shipment.duration;
            const threshold = shipment.triggerThreshold || 0.5;
            if (progressPercentage >= threshold && !shipment.interceptionCleared) {
                if (!activeSmuggleDelivery) {
                    activeSmuggleDelivery = shipment;
                    smuggleState.active = true;
                    const modal = document.getElementById("smuggle-grid-modal");
                    if (modal) modal.classList.remove("hidden");
                    setTimeout(() => {
                        showNotification("⚠️ AUTHORITIES INTERCEPTING SIGNAL! Initiate evasion protocols!", "error");
                        triggerSmuggleMiniGame();
                    }, 50);
                }
                return; // Pause the timer
            }
        }

        shipment.progress += dt;
        if (shipment.progress >= shipment.duration) {
            shipment.completed = true;

            // Roll for interception
            const finalRisk = ownedTools.ghostVPN === true
                ? Math.max(0, shipment.risk - 0.10 - getDeliveryReliabilityBonus())
                : Math.max(0, shipment.risk - getDeliveryReliabilityBonus());
            if (Math.random() < finalRisk) {
                // Intercepted!
                const fine = 10000 * shipment.qty;
                money -= fine;
                showNotification(`FEDERAL INTERCEPTION!<br><br>Your shipment of ${shipment.partName} was seized at the border.<br>You have been fined $${fine.toLocaleString()}.`, "error");
            } else {
                // Delivered successfully
                inventory[shipment.partId] += shipment.qty;
            }
        }
    });

    const completed = activeDarkNetShipments.filter(s => s.completed);
    if (completed.length > 0) {
        activeDarkNetShipments = activeDarkNetShipments.filter(s => !s.completed);
        updateDarkNetButtonStates();
        updateUI();
    }
}

function renderShipmentsProgress() {
    const containerOffice = document.getElementById("autoparts-shipments-container");
    const containerOps = document.getElementById("ops-bulk-shipping-container");
    const listOps = document.getElementById("ops-bulk-shipping-list");
    const opsNoShipmentMsg = document.getElementById("ops-no-shipment-msg");

    // Hide office shipments entirely per new spec
    if (containerOffice) containerOffice.style.display = "none";

    if (activeShipments.length === 0) {
        if (containerOps) containerOps.classList.add("hidden");
        if (opsNoShipmentMsg) opsNoShipmentMsg.classList.remove("hidden");
        return;
    }

    if (containerOps) containerOps.classList.remove("hidden");
    if (opsNoShipmentMsg) opsNoShipmentMsg.classList.add("hidden");

    let html = "";
    activeShipments.forEach(s => {
        const remaining = Math.max((s.duration - s.progress) / 1000, 0);
        const pct = Math.min((s.progress / s.duration) * 100, 100);

        html += `
            <div class="shipment-slot shipping">
                <div class="shipment-header">
                    <span class="shipment-title">${s.emoji} ${s.partName}</span>
                    <span class="shipment-time">${remaining.toFixed(1)}s</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${pct}%; background: linear-gradient(to right, #0ea5e9, #38bdf8);"></div>
                </div>
            </div>
        `;
    });

    if (listOps) listOps.innerHTML = html;
}

// --- MARKET FLUCTUATION ENGINE ---
function updateMarketPrices() {
    const alertEl = document.getElementById("market-alert");
    let alertMsg = "";

    // 1. Determine if there's a spike or crash (5% chance)
    let spikeOrCrashItem = null;
    let isCrash = false;
    if (Math.random() < 0.05) {
        const keys = Object.keys(catalog);
        spikeOrCrashItem = keys[Math.floor(Math.random() * keys.length)];
        isCrash = Math.random() < 0.5;

        const shortName = catalog[spikeOrCrashItem].name.replace("Class A ", "").replace("Class B ", "").replace("Class C ", "").replace("Class X ", "");
        if (isCrash) {
            alertMsg = `MARKET ALERT: Tech sector downturn causes ${shortName} to crash!`;
        } else {
            alertMsg = `MARKET ALERT: Supply shortages cause ${shortName} to spike!`;
        }
    } else if (Math.random() < 0.05) {
        isCrash = Math.random() < 0.5;
        spikeOrCrashItem = "scrapMetal";
        if (isCrash) {
            alertMsg = "MARKET ALERT: Excess salvage dumping drives Scrap Metal price down!";
        } else {
            alertMsg = "MARKET ALERT: High recycling demand triggers a Scrap Metal price rally!";
        }
    }

    // 2. Loop through all market parts
    Object.keys(marketPrices).forEach(key => {
        const oldPrice = marketPrices[key];
        let basePrice, variance, pullStrength;

        if (key === "scrapMetal") {
            basePrice = 1.50;
            variance = 0.8;
            pullStrength = 0.05;
        } else {
            basePrice = catalog[key].basePrice;

            // Apply news event multiplier if this part is affected
            if (activeNewsEvent && activeNewsEvent.targetParts.includes(key)) {
                basePrice *= activeNewsEvent.priceMultiplier;
            }

            variance = basePrice * 0.4;
            pullStrength = 0.05;
        }

        let change = (Math.random() - 0.5) * variance;
        const pull = (basePrice - oldPrice) * pullStrength;

        if (spikeOrCrashItem === key) {
            if (isCrash) {
                change = -oldPrice * 0.4;
            } else {
                change = oldPrice * 0.4;
            }
        }

        let newPrice = oldPrice + change + pull;

        // Mean reversion: Pull towards the basePrice
        if (newPrice > basePrice * 1.5) newPrice *= 0.95;
        if (newPrice < basePrice * 0.8) newPrice *= 1.05;

        // Ensure we don't go into negative infinity
        const minPrice = catalog[key] ? catalog[key].basePrice * 0.2 : 0.5;
        const maxPrice = catalog[key] ? catalog[key].basePrice * 5.0 : 6.0;
        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

        marketPrices[key] = parseFloat(newPrice.toFixed(2));

        const pctChange = ((marketPrices[key] - oldPrice) / oldPrice) * 100;
        marketTrends[key] = pctChange >= 0 ? "up" : "down";
        marketTrendPcts[key] = pctChange;
    });

    if (alertMsg && window.updateNewsTicker) {
        window.updateNewsTicker(alertMsg);
    }

    renderScrapNetUI();
    updateUI();
}

function renderScrapNetUI() {
    const marketContainer = document.querySelector("#window-scrapnet .ticker-container");
    if (!marketContainer) return;

    let html = `<div style="display: flex; flex-direction: column; gap: 8px;">`;

    // Optional: render Scrap Metal
    const scrapPrice = marketPrices.scrapMetal.toFixed(2);
    const scrapTrend = marketTrendPcts.scrapMetal || 0;
    const scrapOwned = inventory.scrapMetal || 0;
    const scrapColor = scrapTrend >= 0 ? "#10b981" : "#ef4444";
    const scrapSign = scrapTrend >= 0 ? "▲" : "▼";

    // Scrap Metal (No inventory, purely informational/raw material)
    html += `
    <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px; border-radius: 6px; border-left: 4px solid ${scrapColor};">
        <div style="flex: 1;">
            <div style="font-weight: bold; color: #f8fafc;">🔩 Scrap Metal</div>
            <div style="font-size: 11px; color: #94a3b8;">Raw Salvage Material</div>
        </div>
        <div style="text-align: right; margin-right: 16px;">
            <div style="font-weight: bold; color: #f8fafc;">$${scrapPrice}</div>
            <div style="font-size: 11px; color: ${scrapColor};">${scrapSign} ${Math.abs(scrapTrend).toFixed(1)}%</div>
        </div>
        <div style="display: flex; gap: 4px; visibility: hidden;">
            <button class="btn btn-sm btn-order">Buy</button>
            <button class="btn btn-sm btn-salvage">Sell</button>
        </div>
    </div>`;

    const sortedKeys = Object.keys(catalog).sort((a, b) => a.localeCompare(b));

    sortedKeys.forEach(partId => {
        const part = catalog[partId];
        const livePrice = marketPrices[partId].toFixed(2);
        const trend = marketTrendPcts[partId] || 0;
        const owned = inventory[partId] || 0;

        const color = trend >= 0 ? "#10b981" : "#ef4444"; // Green or Red
        const sign = trend >= 0 ? "▲" : "▼";

        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px; border-radius: 6px; border-left: 4px solid ${color};">
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #f8fafc;">${part.emoji} ${part.name}</div>
                <div style="font-size: 11px; color: #94a3b8;">Owned: ${owned}</div>
            </div>
            <div style="text-align: right; margin-right: 16px;">
                <div style="font-weight: bold; color: #f8fafc;">$${livePrice}</div>
                <div style="font-size: 11px; color: ${color};">${sign} ${Math.abs(trend).toFixed(1)}%</div>
            </div>
            <div style="display: flex; gap: 4px;">
                <button class="btn btn-sm btn-order" onclick="executeTrade('${partId}', 'buy')">Buy</button>
                <button class="btn btn-sm btn-salvage" style="background:#9f1239; border-color:#9f1239;" onclick="executeTrade('${partId}', 'sell')">Sell</button>
            </div>
        </div>`;
    });

    html += `</div>`;

    if (marketContainer._cachedHtml !== html) {
        marketContainer.innerHTML = html;
        marketContainer._cachedHtml = html;
    }
}

window.executeTrade = function (partId, action) {
    const price = marketPrices[partId];
    if (action === 'buy') {
        if (money >= price) {
            money -= price;
            inventory[partId] = (inventory[partId] || 0) + 1;
        } else {
            showNotification("Insufficient funds for this trade.", "error");
        }
    } else if (action === 'sell') {
        if ((inventory[partId] || 0) > 0) {
            inventory[partId]--;
            money += price;
        } else {
            showNotification("You do not own any of this part to sell.", "error");
        }
    }
    renderScrapNetUI();
    updateUI();
};

// Background market tick timer (30s)
const marketIntervalId = setInterval(updateMarketPrices, 30000);

// --- CUSTOMER SIMULATION LOGIC ---
function updateCustomers(dt) {
    // 1. Spawning customers over time (Max queue size: 5)
    customerSpawnTimer += dt;
    if (customerSpawnTimer >= customerSpawnInterval) {
        customerSpawnTimer = 0;
        if (customerQueue.length < 5) {
            spawnNewCustomerOrder();
        }
    }
}

// --- NEWS ENGINE ---
function tickNews(dt) {
    newsTimer += dt;
    if (newsTimer >= NEWS_INTERVAL) {
        // Save the current event to history before overwriting
        if (activeNewsEvent) {
            newsHistory.unshift(activeNewsEvent); // Add to the front of the array
            if (newsHistory.length > 10) newsHistory.pop(); // Cap history at 10 items
        }

        // Pick a random event
        activeNewsEvent = newsCatalog[Math.floor(Math.random() * newsCatalog.length)];
        newsTimer = 0;

        showOSNotification("📺 AutoWire News", activeNewsEvent.headline);
    }
}



let typewriterInterval = null;

window.typewriterEffect = function (text) {
    const textContainer = document.getElementById("news-body-text");
    const svgContainer = document.getElementById("anchor-jaw-serious")?.parentElement?.parentElement; // Gets the wrapper div

    if (!textContainer) return;
    if (typewriterInterval) clearInterval(typewriterInterval);

    textContainer.textContent = "";
    if (svgContainer) svgContainer.classList.add("is-talking");

    let i = 0;
    typewriterInterval = setInterval(() => {
        textContainer.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typewriterInterval);
            if (svgContainer) svgContainer.classList.remove("is-talking");
        }
    }, 30); // 30ms per character
};

function getBrandClassForModel(model) {
    if (model.includes("Prius") || model.includes("Civic") || model.includes("Toyota") && !model.includes("Supra") || model.includes("Honda") || model.includes("Subaru") || model.includes("Volkswagen") || model.includes("Hyundai") || model.includes("Mazda") && !model.includes("RX-7")) {
        return "classA";
    } else if (model.includes("BMW") || model.includes("Porsche") || model.includes("Audi")) {
        return "classC";
    } else if (model.includes("Skyline") || model.includes("RX-7") || model.includes("Supra") || model.includes("GTR")) {
        return "classX";
    } else {
        // Tesla, Ford, Chevrolet, Jeep, Wrangler, Mustang, Corvette, Dodge
        return "classB";
    }
}

function spawnNewCustomerOrder() {
    // Filter car models by player's purchased classes
    let allowedClasses = [];
    if (playerStats.locationClasses) {
        allowedClasses = playerStats.locationClasses.split(",").map(s => s.trim());
    } else {
        allowedClasses = ["A"]; // fallback
    }

    const availableModels = carModels.filter(model => {
        const bClass = getBrandClassForModel(model);
        return allowedClasses.includes(bClass.replace('class', ''));
    });

    if (availableModels.length === 0) return; // Guard clause

    const randomModel = availableModels[Math.floor(Math.random() * availableModels.length)];
    const jobTemplate = jobTemplates[Math.floor(Math.random() * jobTemplates.length)];
    const brandClass = getBrandClassForModel(randomModel);

    // Map required parts to their brand class counterparts
    const partsRequired = jobTemplate.parts.map(partId => {
        const basePart = baseCatalog[partId];
        return `${brandNames[brandClass]} ${basePart.name}`;
    });

    // Calculate payout: randomized basePayout * brand multiplier
    const payoutVariance = jobTemplate.basePayout * 0.15;
    let baseRandPayout = Math.floor(jobTemplate.basePayout + (Math.random() * payoutVariance * 2) - payoutVariance);
    
    // Apply brand multiplier
    const brandMultiplier = brandMultipliers[brandClass] || 1.0;
    let payout = Math.round(baseRandPayout * brandMultiplier);

    const payoutCap = brandClass === 'classC' ? 20000 : brandClass === 'classB' ? 8000 : 3500;
    payout = Math.min(payoutCap, payout);

    customerQueue.push({
        id: Math.random().toString(36).substring(2, 9),
        carModel: randomModel,
        jobTitle: jobTemplate.title,
        partsRequired: partsRequired,
        payout: payout
    });
}

// --- APPRENTICE AUTOMATION LOGIC ---
function hireApprentice() {
    if (money >= 500 && !apprenticeHired) {
        money -= 500;
        apprenticeHired = true;
        apprenticeProgress = 0;

        apprenticeLockState.classList.add("hidden");
        apprenticeActiveState.classList.remove("hidden");
        updateUI();
        saveGame();
    } else if (!apprenticeHired) {
        triggerInsufficientFundsFeedback();
        showNotification("You need $500 to hire an apprentice.", "error");
    }
}

function updateApprentice(dt) {
    if (!apprenticeHired) return;

    const statusBadge = document.getElementById("apprentice-status-text");
    const bar = document.getElementById("apprentice-progress-bar");

    if (statusBadge) {
        statusBadge.textContent = `Salvaging Scrap (x${apprenticeSpeedLevel})`;
        statusBadge.className = "status-badge status-working";
    }

    apprenticeProgress += dt;
    const currentDuration = baseApprenticeDuration / apprenticeSpeedLevel;

    if (apprenticeProgress >= currentDuration) {
        // Automatically salvage scrap metal
        money += marketPrices.scrapMetal;
        apprenticeProgress = 0;
        updateUI();
        saveGame();
    }

    if (bar) {
        const percent = (apprenticeProgress / currentDuration) * 100;
        bar.style.width = `${percent}%`;
    }
}

function upgradeApprentice() {
    const upgradeCost = 1000 * apprenticeSpeedLevel;
    if (money >= upgradeCost) {
        money -= upgradeCost;
        apprenticeSpeedLevel += 1;
        updateUI();
        saveGame();
    } else {
        triggerInsufficientFundsFeedback();
        showNotification(`You need $${upgradeCost.toLocaleString()} to upgrade apprentice tools.`, "error");
    }
}

// --- CERTIFICATIONS DELIVERY WORKFORCE ---
function getCertification(id) {
    return playerStats.certifications && playerStats.certifications[id] === true;
}

function getShipmentCapacity() {
    const capacityLevels = deliveryWorkers.reduce((total, worker) => total + (worker.skills?.capacity || 0), 0);
    return 3 + (businessUpgrades.storage || 0) + (getCertification("fleetManagement") ? capacityLevels : 0);
}

function getDeliverySpeedMultiplier() {
    if (!deliveryAutomationEnabled || !getCertification("logisticsLicense")) return 1;
    const speedLevels = deliveryWorkers.reduce((total, worker) => total + (worker.skills?.speed || 0), 0);
    const moraleBonus = deliveryWorkers.length ? deliveryWorkers.reduce((total, worker) => total + ((worker.morale || 80) - 50), 0) / 1000 : 0;
    return 1 + (speedLevels * 0.12) + Math.max(0, moraleBonus);
}

function getDeliveryReliabilityBonus() {
    if (!deliveryAutomationEnabled || !getCertification("hazmatEndorsement")) return 0;
    const reliabilityLevels = deliveryWorkers.reduce((total, worker) => total + (worker.skills?.reliability || 0), 0);
    return reliabilityLevels * 0.04;
}

window.purchaseCertification = function (certificationId) {
    const track = certificationTracks.find(item => item.id === certificationId);
    if (!track || getCertification(certificationId)) return;

    if (playerStats.level < track.requiredLevel) {
        showNotification(`Certification locked. Reach Level ${track.requiredLevel} first.`, "error");
        return;
    }
    if (money < track.cost) {
        triggerInsufficientFundsFeedback();
        showNotification(`Insufficient funds. You need $${track.cost.toLocaleString()} for this license.`, "error");
        return;
    }

    money -= track.cost;
    playerStats.certifications[certificationId] = true;
    renderCertificationsApp();
    updateUI();
    saveGame();
    showNotification(`${track.name} certified. New workforce permissions are available.`, "success");
};

window.hireDeliveryWorker = function () {
    if (!getCertification("logisticsLicense")) {
        showNotification("Unlock the Logistics License before hiring delivery workers.", "error");
        return;
    }

    const maxWorkers = getCertification("fleetManagement") ? 2 : 1;
    if (deliveryWorkers.length >= maxWorkers) {
        showNotification(`Workforce capacity reached. ${getCertification("fleetManagement") ? "Fleet Management allows two workers." : "Unlock Fleet Management for another worker."}`, "info");
        return;
    }

    const hireCost = 2500 + (deliveryWorkers.length * 1500);
    if (money < hireCost) {
        triggerInsufficientFundsFeedback();
        showNotification(`You need $${hireCost.toLocaleString()} to hire this delivery worker.`, "error");
        return;
    }

    money -= hireCost;
    const name = deliveryWorkerNames[(nextDeliveryWorkerId - 1) % deliveryWorkerNames.length];
    deliveryWorkers.push({
        id: `delivery-worker-${nextDeliveryWorkerId++}`,
        name,
        role: "Logistics Runner",
        wage: 180,
        morale: 80,
        skills: { speed: 0, capacity: 0, reliability: 0 }
    });
    deliveryAutomationEnabled = true;
    renderCertificationsApp();
    updateUI();
    saveGame();
    showNotification(`${name} joined the delivery workforce. Automated dispatch is online.`, "success");
};

window.upgradeDeliveryWorker = function (workerId, skill) {
    const worker = deliveryWorkers.find(item => item.id === workerId);
    if (!worker || !["speed", "capacity", "reliability"].includes(skill)) return;

    const requiredCertification = {
        speed: "routeOptimization",
        capacity: "fleetManagement",
        reliability: "hazmatEndorsement"
    }[skill];
    if (!getCertification(requiredCertification)) {
        const track = certificationTracks.find(item => item.id === requiredCertification);
        showNotification(`${track.name} is required for this worker skill.`, "error");
        return;
    }

    const currentLevel = worker.skills[skill] || 0;
    if (currentLevel >= 5) return;
    const upgradeCost = 1500 * (currentLevel + 1);
    if (money < upgradeCost) {
        triggerInsufficientFundsFeedback();
        showNotification(`You need $${upgradeCost.toLocaleString()} for this worker upgrade.`, "error");
        return;
    }

    money -= upgradeCost;
    worker.skills[skill] = currentLevel + 1;
    renderCertificationsApp();
    updateUI();
    saveGame();
    showNotification(`${worker.name}: ${skill} upgraded to Level ${worker.skills[skill]}.`, "success");
};

window.toggleDeliveryAutomation = function () {
    if (!getCertification("logisticsLicense") || deliveryWorkers.length === 0) {
        showNotification("Hire a certified delivery worker before enabling automation.", "error");
        return;
    }
    deliveryAutomationEnabled = !deliveryAutomationEnabled;
    renderCertificationsApp();
    updateUI();
    saveGame();
    showNotification(`Automated dispatch ${deliveryAutomationEnabled ? "enabled" : "paused"}.`, deliveryAutomationEnabled ? "success" : "info");
};

function renderCertificationsApp() {
    const pathContainer = document.getElementById("certification-paths");
    const workersContainer = document.getElementById("delivery-workers-list");
    const summary = document.getElementById("delivery-workforce-summary");
    const actions = document.getElementById("delivery-workforce-actions");
    const status = document.getElementById("certification-status");
    if (!pathContainer || !workersContainer || !summary || !actions || !status) return;

    const unlockedCount = certificationTracks.filter(track => getCertification(track.id)).length;
    status.textContent = `${unlockedCount}/${certificationTracks.length} LICENSES ACTIVE`;
    status.className = unlockedCount > 0 ? "status-badge status-working" : "status-badge status-idle";

    pathContainer.innerHTML = certificationTracks.map(track => {
        const unlocked = getCertification(track.id);
        const levelLocked = playerStats.level < track.requiredLevel;
        const button = unlocked
            ? `<button class="btn btn-sm" disabled>ACTIVE ✓</button>`
            : `<button class="btn btn-order btn-sm" onclick="window.purchaseCertification('${track.id}')" ${levelLocked ? "disabled" : ""}>${levelLocked ? `LEVEL ${track.requiredLevel}` : `LICENSE $${track.cost.toLocaleString()}`}</button>`;
        return `<div class="certification-card ${unlocked ? "is-unlocked" : "is-locked"}">
            <div class="certification-hero-row"><div><h3>${track.icon} ${track.name}</h3><p>${track.description}</p></div>${button}</div>
        </div>`;
    }).join("");

    const maxWorkers = getCertification("fleetManagement") ? 2 : 1;
    summary.innerHTML = `<span>WORKERS: <strong>${deliveryWorkers.length}/${getCertification("logisticsLicense") ? maxWorkers : 0}</strong> · SHIPMENT CAPACITY: <strong>${getShipmentCapacity()}</strong></span><span>DISPATCH SPEED: <strong>${Math.round(getDeliverySpeedMultiplier() * 100)}%</strong></span>`;

    workersContainer.innerHTML = deliveryWorkers.length === 0
        ? `<div class="empty-state">No certified delivery workers hired. Unlock the Logistics License to begin.</div>`
        : deliveryWorkers.map(worker => `<div class="delivery-worker-card">
            <div class="worker-header"><div><h3>🚚 ${worker.name}</h3><div class="worker-meta">${worker.role} · $${(worker.wage || 180).toLocaleString()} payroll · ${Math.round(worker.morale || 80)}% morale</div></div><span class="status-badge ${deliveryAutomationEnabled ? "status-working" : "status-paused"}">${deliveryAutomationEnabled ? "ACTIVE" : "PAUSED"}</span></div>
            ${["speed", "capacity", "reliability"].map(skill => {
                const certId = { speed: "routeOptimization", capacity: "fleetManagement", reliability: "hazmatEndorsement" }[skill];
                const cert = certificationTracks.find(track => track.id === certId);
                const level = worker.skills[skill] || 0;
                const locked = !getCertification(certId);
                return `<div class="worker-skill-row"><span>${skill.toUpperCase()} · LVL ${level}/5${locked ? ` · REQUIRES ${cert.name.toUpperCase()}` : ""}</span><button class="btn btn-sm" onclick="window.upgradeDeliveryWorker('${worker.id}','${skill}')" ${locked || level >= 5 ? "disabled" : ""}>${level >= 5 ? "MAXED" : `UPGRADE $${(1500 * (level + 1)).toLocaleString()}`}</button></div>`;
            }).join("")}
        </div>`).join("");

    const hireCost = 2500 + (deliveryWorkers.length * 1500);
    actions.innerHTML = `<button class="btn btn-order" onclick="window.hireDeliveryWorker()" ${!getCertification("logisticsLicense") || deliveryWorkers.length >= maxWorkers ? "disabled" : ""}>HIRE DELIVERY WORKER · $${hireCost.toLocaleString()}</button>
        <button class="btn ${deliveryAutomationEnabled ? "btn-salvage" : "btn-order"}" onclick="window.toggleDeliveryAutomation()" ${deliveryWorkers.length === 0 ? "disabled" : ""}>${deliveryAutomationEnabled ? "PAUSE AUTOMATED DISPATCH" : "ENABLE AUTOMATED DISPATCH"}</button>`;
}

// --- METRICS CALCULATION ---
function updateMetrics(dt) {
    const now = Date.now();

    // 1. Cars Fixed Per Minute (FPM) - rolling 60-second window
    fixHistory = fixHistory.filter(timestamp => now - timestamp <= 60000);

    // 2. Apprentice Uptime - rolling 30-second window (600 game ticks)
    if (apprenticeHired) {
        const isWorking = customerQueue.some(job =>
            getBrandClassForModel(job.carModel) === "classA" &&
            job.partsRequired.every(partId => {
                const invKey = Object.keys(inventory).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
                return (inventory[invKey] || 0) >= 1;
            })
        );
        apprenticeHistory.push(isWorking ? 1 : 0);
        if (apprenticeHistory.length > 600) {
            apprenticeHistory.shift();
        }
    }
}

// --- PHONE CALL RANDOM EVENT GENERATOR ---
function updateCallTimer(dt) {
    if (customerQueue.length >= 5) return; // Do not call if backlog is full

    callTimer += dt;
    if (callTimer >= nextCallInterval) {
        callTimer = 0;
        nextCallInterval = Math.floor(Math.random() * 60000) + 570000; // Trigger approx. every 10 mins (9.5 to 10.5 mins)
        triggerPhoneCall();
    }
}

function triggerPhoneCall() {
    const customerNames = ["Mr. Henderson", "Ms. Davis", "Officer Miller", "Dr. Jenkins", "Professor Gable", "Sheriff Vance"];
    const callerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    
    // Filter car models by player's purchased classes
    let allowedClasses = [];
    if (playerStats.locationClasses) {
        allowedClasses = playerStats.locationClasses.split(",").map(s => s.trim());
    } else {
        allowedClasses = ["A"]; // fallback
    }

    const availableModels = carModels.filter(model => {
        const bClass = getBrandClassForModel(model);
        return allowedClasses.includes(bClass.replace('class', ''));
    });

    if (availableModels.length === 0) return; // Guard clause

    const callCarModel = availableModels[Math.floor(Math.random() * availableModels.length)];
    const brandClass = getBrandClassForModel(callCarModel);

    const jobTemplate = jobTemplates[Math.floor(Math.random() * jobTemplates.length)];
    const partsRequired = jobTemplate.parts.map(partId => {
        const basePart = baseCatalog[partId];
        return `${brandNames[brandClass]} ${basePart.name}`;
    });
    const partsCost = partsRequired.reduce((sum, pKey) => sum + catalog[pKey].basePrice, 0);
    const markupMultiplier = 2.0 + Math.random() * 1.5;

    let payout = Math.round(partsCost * markupMultiplier);
    if (payout < 1000) {
        const laborFee = 1000 + Math.floor(Math.random() * 500);
        payout += laborFee;
    }
    const payoutCap = brandClass === 'classC' ? 20000 : brandClass === 'classB' ? 8000 : 3500;
    payout = Math.min(payoutCap, payout);

    const speechText = `Hello! This is ${callerName}. I'm calling about my ${callCarModel}—I need a ${jobTemplate.title.toLowerCase()}. Can you fix it for me?`;

    // Store incoming call data
    currentCallCustomer = {
        name: callerName,
        carModel: callCarModel,
        jobTitle: jobTemplate.title,
        partsRequired: partsRequired,
        payout: payout,
        speechText: speechText
    };

    // Render ringing view nodes
    callerIdText.textContent = callerName;

    // Show ringing view and hide active view
    phoneRingingView.classList.remove("hidden");
    phoneActiveView.classList.add("hidden");

    // Open phone widget (slide up)
    phoneWidget.classList.add("ringing");
}

// Hook up browser's voices on load/update
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

function getPremiumVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const premiumKeywords = ['google', 'natural', 'premium'];

    for (const keyword of premiumKeywords) {
        const match = voices.find(voice => voice.name.toLowerCase().includes(keyword));
        if (match) return match;
    }

    const enVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (enVoice) return enVoice;

    return voices[0] || null;
}

function speakCallMessage(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Terminate pending utterances
        const utterance = new SpeechSynthesisUtterance(text);

        const voice = getPremiumVoice();
        if (voice) {
            utterance.voice = voice;
        }

        utterance.pitch = 1.0;
        utterance.rate = 0.9; // Less rushed and mechanical
        window.speechSynthesis.speak(utterance);
    }
};

function handleAnswerCall() {
    if (!currentCallCustomer) return;

    isGamePaused = true; // Pause the game loop now that player has answered

    // Switch views in the widget
    phoneRingingView.classList.add("hidden");
    phoneActiveView.classList.remove("hidden");

    // Populate active call details
    activeCallerName.textContent = currentCallCustomer.name;
    callerSpeechText.textContent = currentCallCustomer.speechText;

    // Reset active view button states and haggling outcomes
    if (currentCallCustomer.isInspectionDispute) {
        callAcceptBtn.textContent = `Accept Quote ($${currentCallCustomer.payout})`;
        callQuoteBtn.textContent = "Offer Discount";
    } else {
        callAcceptBtn.textContent = `Accept Job (+$${currentCallCustomer.payout})`;
        callQuoteBtn.textContent = "Quote Price";
    }
    callAcceptBtn.classList.remove("hidden");
    callQuoteBtn.classList.remove("hidden");
    callHangupBtn.textContent = "Decline";
    callHaggleResult.className = "haggle-result hidden";

    // Play text-to-speech audio on user gesture (Answer button click)
    speakCallMessage(currentCallCustomer.speechText);
}

function handleAcceptCall() {
    if (currentCallCustomer) {
        // Stop audio immediately
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        if (currentCallCustomer.isInspectionDispute) {
            if (currentInspectionVehicle) {
                currentInspectionVehicle.totalPayout = currentCallCustomer.payout;
            }
            approveInspectionUI();

            // Hide softphone widget
            phoneWidget.classList.remove("ringing");

            // Resume game mechanics
            isGamePaused = false;
            lastTickTime = Date.now(); // Reset delta base

            // Navigate user back to the Inspections tab
            switchTab('inspections');
        } else {
            // Add job request to queue
            customerQueue.push({
                id: Math.random().toString(36).substring(2, 9),
                carModel: currentCallCustomer.carModel,
                jobTitle: currentCallCustomer.jobTitle,
                partsRequired: currentCallCustomer.partsRequired,
                payout: currentCallCustomer.payout
            });

            // Hide softphone widget
            phoneWidget.classList.remove("ringing");

            // Resume game mechanics
            isGamePaused = false;
            lastTickTime = Date.now(); // Reset delta base

            // Navigate user back to the Operations tab
            switchTab('ops');
        }
    }
}

function handleQuoteCall() {
    if (!currentCallCustomer) return;

    callQuoteBtn.classList.add("hidden"); // Single attempt at haggling

    const isHaggleSuccess = Math.random() < 0.60; // 60% success chance

    if (currentCallCustomer.isInspectionDispute) {
        if (isHaggleSuccess) {
            // Discount the inspection payout by 20%
            currentCallCustomer.payout = Math.round(currentCallCustomer.originalPayout * 0.80);
            callAcceptBtn.textContent = `Accept Quote ($${currentCallCustomer.payout})`;

            callHaggleResult.textContent = `HAGGLING SUCCESS: Customer agreed to pay $${currentCallCustomer.payout} (20% discount)!`;
            callHaggleResult.className = "haggle-result haggle-success";
            callHaggleResult.classList.remove("hidden");

            const successSpeech = `Okay, that's better. I can agree to $${currentCallCustomer.payout}. Please proceed.`;
            callerSpeechText.textContent = successSpeech;
            speakCallMessage(successSpeech);
        } else {
            // Haggle failed: customer refuses and walks away
            callAcceptBtn.classList.add("hidden");
            callHangupBtn.textContent = "Hang Up";

            declinedCalls += 1;

            callHaggleResult.textContent = "HAGGLING FAILED: Customer refused the quote and walked away!";
            callHaggleResult.className = "haggle-result haggle-fail";
            callHaggleResult.classList.remove("hidden");

            // Clear vehicle and reset inspections UI
            if (currentInspectionVehicle) {
                currentInspectionVehicle = null;
                activeInspectionZone = null;
            }

            switchInspectionTab('terminal');
            const tabVehicleBtn = document.getElementById("tab-inspection-vehicle");
            if (tabVehicleBtn) tabVehicleBtn.disabled = true;
            const tabBillingBtn = document.getElementById("tab-inspection-billing");
            if (tabBillingBtn) tabBillingBtn.disabled = true;
            const reportCard = document.getElementById("inspection-report-card");
            if (reportCard) reportCard.classList.add("hidden");

            const authBtn = document.getElementById("auth-inspection-btn");
            if (authBtn) {
                authBtn.classList.remove("btn-success");
                authBtn.style.backgroundColor = "";
                authBtn.style.color = "";
                authBtn.style.border = "";
                authBtn.disabled = false;
                authBtn.textContent = "Send for Customer Authorization";
            }

            updateUI();

            const failSpeech = "That is way too expensive! I'm taking my vehicle somewhere else. Goodbye.";
            callerSpeechText.textContent = failSpeech;
            speakCallMessage(failSpeech);
        }
    } else {
        if (isHaggleSuccess) {
            currentCallCustomer.payout = Math.min(4500, Math.round(currentCallCustomer.payout * 1.25));
            callAcceptBtn.textContent = `Accept Job (+$${currentCallCustomer.payout})`;

            callHaggleResult.textContent = `HAGGLING SUCCESS: Customer agreed to $${currentCallCustomer.payout} price quote!`;
            callHaggleResult.className = "haggle-result haggle-success";
            callHaggleResult.classList.remove("hidden");

            const successSpeech = `Okay, that seems fair. Let's do $${currentCallCustomer.payout}. Can we schedule it?`;
            callerSpeechText.textContent = successSpeech;
            speakCallMessage(successSpeech);
        } else {
            // Haggle failed: customer hangs up
            callAcceptBtn.classList.add("hidden");
            callHangupBtn.textContent = "Hang Up";

            // Increment declined count for Conversion metric
            declinedCalls += 1;

            callHaggleResult.textContent = "HAGGLING FAILED: Customer refused the quote and hung up!";
            callHaggleResult.className = "haggle-result haggle-fail";
            callHaggleResult.classList.remove("hidden");

            const failSpeech = "No way! That is way too expensive. I will go somewhere else. Goodbye.";
            callerSpeechText.textContent = failSpeech;
            speakCallMessage(failSpeech);
        }
    }
}

function handleDeclineCall() {
    // Declining from ringing state
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    declinedCalls += 1;

    if (currentCallCustomer && currentCallCustomer.isInspectionDispute) {
        if (currentInspectionVehicle) {
            currentInspectionVehicle = null;
            activeInspectionZone = null;
        }
        switchInspectionTab('terminal');
        const tabVehicleBtn = document.getElementById("tab-inspection-vehicle");
        if (tabVehicleBtn) tabVehicleBtn.disabled = true;
        const tabBillingBtn = document.getElementById("tab-inspection-billing");
        if (tabBillingBtn) tabBillingBtn.disabled = true;
        const reportCard = document.getElementById("inspection-report-card");
        if (reportCard) reportCard.classList.add("hidden");

        const authBtn = document.getElementById("auth-inspection-btn");
        if (authBtn) {
            authBtn.classList.remove("btn-success");
            authBtn.style.backgroundColor = "";
            authBtn.style.color = "";
            authBtn.style.border = "";
            authBtn.disabled = false;
            authBtn.textContent = "Send for Customer Authorization";
        }
        updateUI();
    }

    phoneWidget.classList.remove("ringing");
    isGamePaused = false;
    lastTickTime = Date.now(); // Reset delta base just in case
}

function handleHangupCall() {
    // Declining or hanging up from active state
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Only increment declined count if they declined a viable customer (button is "Decline"),
    // but not if the button is "Hang Up" (already declined and incremented in handleQuoteCall)
    if (callHangupBtn.textContent === "Decline") {
        declinedCalls += 1;

        if (currentCallCustomer && currentCallCustomer.isInspectionDispute) {
            if (currentInspectionVehicle) {
                currentInspectionVehicle = null;
                activeInspectionZone = null;
            }
            switchInspectionTab('terminal');
            const tabVehicleBtn = document.getElementById("tab-inspection-vehicle");
            if (tabVehicleBtn) tabVehicleBtn.disabled = true;
            const tabBillingBtn = document.getElementById("tab-inspection-billing");
            if (tabBillingBtn) tabBillingBtn.disabled = true;
            const reportCard = document.getElementById("inspection-report-card");
            if (reportCard) reportCard.classList.add("hidden");

            const authBtn = document.getElementById("auth-inspection-btn");
            if (authBtn) {
                authBtn.classList.remove("btn-success");
                authBtn.style.backgroundColor = "";
                authBtn.style.color = "";
                authBtn.style.border = "";
                authBtn.disabled = false;
                authBtn.textContent = "Send for Customer Authorization";
            }
            updateUI();
        }
    }

    phoneWidget.classList.remove("ringing");
    isGamePaused = false;
    lastTickTime = Date.now(); // Reset delta base
}

// --- MANUAL ACTIONS ---
function salvageScrap() {
    money += marketPrices.scrapMetal;
    updateUI();
    if (tutorialPhase === 0) {
        tutorialPhase = 1;
        updateTutorial();
    }
}

function fulfillOrder(customerId) {
    try {
        console.log("fulfillOrder called:", customerId);
        const idx = customerQueue.findIndex(c => c.id === customerId);
        if (idx === -1) {
            console.log("Customer not found!", customerId, customerQueue);
            return;
        }
        const customer = customerQueue[idx];

        // Count required parts
        const requiredCounts = {};
        customer.partsRequired.forEach(partId => {
            requiredCounts[partId] = (requiredCounts[partId] || 0) + 1;
        });

        // Verify one final time that we have enough stock for all items
        const canFulfill = Object.entries(requiredCounts).every(([partId, qty]) => {
            const invKey = Object.keys(inventory).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
            return (inventory[invKey] || 0) >= qty;
        });
        if (!canFulfill) return;

        // Deduct parts
        Object.entries(requiredCounts).forEach(([partId, qty]) => {
            const invKey = Object.keys(inventory).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
            inventory[invKey] -= qty;
        });

        // Award cash
        const liftMultiplier = 1 + ((businessUpgrades.lift || 0) * 0.1);
        const earnedPayout = Math.round(customer.payout * liftMultiplier);
        money += earnedPayout;
        totalRevenue += earnedPayout;
        carsSold += 1;
        const eventMultiplier = activeGarageEvent?.id === "fleet-rush" ? 2 : 1;
        garageReputation = Math.min(100, garageReputation + 2 * eventMultiplier);
        customerSatisfaction = Math.min(100, customerSatisfaction + 1 * eventMultiplier);
        
        // Award XP
        addXP(Math.floor((earnedPayout / 20) * eventMultiplier));

        console.log("Order Fulfilled, Payout: $" + earnedPayout);

        // Record metrics
        fixHistory.push(Date.now());
        updateChartData(customer.carModel, earnedPayout);

        // Remove customer from array
        customerQueue.splice(idx, 1);

        // Remove its HTML element from the DOM
        const rowEl = document.getElementById(`customer-row-${customerId}`);
        if (rowEl) {
            rowEl.remove();
        }

        // Spawn a replacement order immediately
        spawnNewCustomerOrder();

        if (tutorialPhase === 2) {
            tutorialPhase = 3;
            updateTutorial();
        }

        // Update UI and Save
        updateUI();
        saveGame();
        console.log("Order completely fulfilled!");
    } catch (e) {
        console.error("fulfillOrder crashed:", e);
    }
}

// --- UI RENDERING & LAYOUT SWITCHES ---
function updateUI() {
    if (typeof isTutorialComplete !== 'undefined' && isTutorialComplete) {
        const objectiveWidget = document.getElementById("tutorial-widget");
        if (objectiveWidget) {
            objectiveWidget.classList.add("hidden");
            objectiveWidget.style.display = "none";
        }
    }

    if (typeof tutorialPhase !== 'undefined' && tutorialPhase === 3 && money >= 5000) {
        tutorialPhase = 4;
        updateTutorial();
    }

    // Balances
    if (moneyDisplay) {
        moneyDisplay.textContent = money.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (money < 0) {
            moneyDisplay.style.color = "#ef4444";
        } else {
            moneyDisplay.style.color = "";
        }
    }

    const savingsDisplay = document.getElementById("savings-balance-val");
    if (savingsDisplay) {
        savingsDisplay.textContent = `$${savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (!apprenticeHired && hireApprenticeBtn) {
        hireApprenticeBtn.disabled = (money < 500);
    }

    const upgradeApprenticeBtn = document.getElementById("upgrade-apprentice-btn");
    const apprenticeInfoText = document.getElementById("apprentice-info-text");
    if (upgradeApprenticeBtn && apprenticeInfoText) {
        const upgradeCost = 1000 * apprenticeSpeedLevel;
        upgradeApprenticeBtn.textContent = `Upgrade Apprentice Tools ($${upgradeCost.toLocaleString()})`;
        upgradeApprenticeBtn.disabled = money < upgradeCost;

        const currentDurationSec = (baseApprenticeDuration / apprenticeSpeedLevel) / 1000;
        apprenticeInfoText.textContent = `Salvaging every ${currentDurationSec.toFixed(1)}s...`;
    }

    if (salvageBtn) {
        salvageBtn.innerHTML = `<span class="icon">🔩</span> Salvage Scrap Metal (+$${marketPrices.scrapMetal.toFixed(2)})`;
    }

    const appConfigs = [
        { id: 'dealership', btn: buyAppDealershipBtn, cost: 1500, label: 'Buy App' },
        { id: 'bank', btn: buyAppBankBtn, cost: 0, label: 'Download' },
        { id: 'inspections', btn: buyAppInspectionsBtn, cost: 5000, label: 'Buy App' },
        { id: 'darknet', btn: buyAppDarknetBtn, cost: 500000, label: 'Buy App' },
        { id: 'scrapnet', btn: buyAppScrapnetBtn, cost: 0, label: 'Download' },
        { id: 'certifications', btn: buyAppCertificationsBtn, cost: 7500, label: 'Buy App' },
        { id: 'travel-junkyard', btn: buyAppJunkyardBtn, cost: 7500, label: 'Buy App' },
        { id: 'bugtracker', btn: buyAppBugTrackerBtn, cost: 0, label: 'Download' }
    ];

    const purchasableApps = appConfigs.filter(app => {
        const config = appTutorialData[app.id] || {};
        return !config.alwaysUnlocked;
    });

    purchasableApps.forEach(app => {
        if (!app.btn) return;
        if (unlockedApps[app.id]) {
            app.btn.disabled = false;
            if (installedApps[app.id]) {
                app.btn.textContent = "Uninstall";
                app.btn.style.background = "#ef4444";
                app.btn.style.borderColor = "#ef4444";
            } else {
                app.btn.textContent = "Install";
                app.btn.style.background = "";
                app.btn.style.borderColor = "";
            }
        } else {
            app.btn.disabled = false;
            app.btn.classList.toggle("insufficient-funds", money < app.cost && app.cost > 0);
            app.btn.textContent = app.cost > 0 ? `Buy ($${app.cost.toLocaleString()})` : app.label;
            app.btn.style.background = "";
            app.btn.style.borderColor = "";
        }
    });

    renderDesktop();
    renderPlayerProfile();
    renderCertificationsApp();
    renderOperationsContracts();

    // Bank App interest and repay states
    if (loanAmountVal) loanAmountVal.textContent = `$${debt.toLocaleString()}`;
    const loanInterestRate = document.getElementById("loan-interest-rate");
    if (loanInterestRate) {
        loanInterestRate.textContent = `5% / Daily`;
    }

    if (repayLoanBtn) {
        repayLoanBtn.disabled = (money < debt || debt <= 0);
    }
    const takeLoanBtn = document.getElementById("take-loan-btn");
    if (takeLoanBtn) {
        takeLoanBtn.disabled = (debt > 0);
    }


    // Dynamic lists, metrics, inventory grids, and active shipments
    renderGlobalInventory();
    updateStoreButtonStates();
    renderCustomers();
    renderMetricsDisplay();
    renderDealershipStats();
    renderShipmentsProgress();
    renderInspectionUI();
    renderDarkNetShipments();
    renderDarkNetInventory();

    // Update DarkNet Heat Meter UI
    const heatMeter = document.getElementById("darknet-heat-meter");
    if (heatMeter) {
        heatMeter.className = ""; // clear old styling classes
        if (globalHeat <= 30) {
            heatMeter.style.color = "#22c55e"; // Green
            heatMeter.style.textShadow = "0 0 5px rgba(34, 197, 94, 0.4)";
            heatMeter.textContent = `${globalHeat.toFixed(1)}% (SAFE)`;
        } else if (globalHeat <= 70) {
            heatMeter.style.color = "#f97316"; // Orange
            heatMeter.style.textShadow = "0 0 5px rgba(249, 115, 22, 0.4)";
            heatMeter.textContent = `${globalHeat.toFixed(1)}% (ALERT)`;
        } else {
            heatMeter.style.color = "";
            heatMeter.style.textShadow = "";
            heatMeter.classList.add("heat-danger");
            heatMeter.textContent = `${globalHeat.toFixed(1)}% (DANGER)`;
        }
    }

    // App Store buttons disabled state
}

function renderGlobalInventory() {
    const gridEl = document.getElementById("global-inventory-display");
    if (!gridEl) return;

    const brandPrefix = brandNames[activeInventoryFilter] + " ";
    let newHtml = "";

    const sortedKeys = Object.keys(inventory)
        .filter(k => k.startsWith(brandPrefix))
        .sort((a, b) => a.localeCompare(b));

    sortedKeys.forEach(partId => {
        const qty = inventory[partId];

        const catalogKey = Object.keys(catalog).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
        const itemInfo = catalog[catalogKey];
        if (!itemInfo) return;
        newHtml += `
            <div class="inventory-item">
                <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
                    <div>
                        <span class="inventory-item-name">${itemInfo.emoji} ${itemInfo.name}</span>
                        <span class="inventory-item-qty">x${qty}</span>
                    </div>
                    <button class="btn sell-part-btn" data-part-id="${partId}" style="padding: 2px 6px; font-size: 10px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; cursor: pointer;">Sell (+$${marketPrices[partId].toFixed(2)})</button>
                </div>
            </div>
        `;
    });

    if (gridEl._cachedHtml !== newHtml) {
        gridEl.innerHTML = newHtml;
        gridEl._cachedHtml = newHtml;
    }
}

function renderCustomers() {
    const opsCustomerList = document.getElementById("ops-customer-list");
    if (!opsCustomerList) return;

    const noCustomersMsg = document.getElementById("no-customers-msg");

    if (customerQueue.length === 0) {
        if (noCustomersMsg) noCustomersMsg.classList.remove("hidden");
        const rows = opsCustomerList.querySelectorAll(".customer-row");
        rows.forEach(r => r.remove());
        return;
    }

    if (noCustomersMsg) noCustomersMsg.classList.add("hidden");

    // Remove rows for customers that have departed
    const currentCustomerIds = customerQueue.map(c => c.id);
    const existingRows = opsCustomerList.querySelectorAll(".customer-row");
    existingRows.forEach(row => {
        const id = row.id.replace("customer-row-", "");
        if (!currentCustomerIds.includes(id)) {
            row.remove();
        }
    });

    // Add/update active customer rows
    customerQueue.forEach((customer, index) => {
        let row = document.getElementById(`customer-row-${customer.id}`);
        if (!row) {
            row = document.createElement("div");
            row.className = "customer-row";
            row.id = `customer-row-${customer.id}`;
            opsCustomerList.appendChild(row);
        }

        row.style.order = index; // Keep queue visual ordering

        // Build checklist HTML and check if all parts are in stock
        let allPartsInStock = true;
        let checklistHtml = '<div class="checklist">';

        customer.partsRequired.forEach(partId => {
            const catalogKey = Object.keys(catalog).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
            const partInfo = catalog[catalogKey];
            if (!partInfo) return;
            const invKey = Object.keys(inventory).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
            const inStock = (inventory[invKey] || 0) >= 1;
            if (!inStock) {
                allPartsInStock = false;
            }

            checklistHtml += `
                <div class="checklist-item ${inStock ? 'in-stock' : 'out-of-stock'}">
                    <span class="checkbox">${inStock ? '[x]' : '[ ]'}</span>
                    <span class="part-name">${partInfo.name}</span>
                    <span class="stock-indicator">(${inventory[invKey] || 0}/1)</span>
                </div>
            `;
        });
        checklistHtml += '</div>';

        const payout = customer.payout;

        const newHtml = `
            <div class="customer-info-row">
                <span class="customer-model">🚘 ${customer.carModel}</span>
                <span class="job-title" style="font-size: 11px; font-weight: 700; color: #94a3b8;">${customer.jobTitle}</span>
            </div>
            ${checklistHtml}
            <div class="customer-status-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span class="customer-payout-label" style="font-size: 11px; font-weight: 600;">Payout: <strong class="mono-val" style="color: #4ade80;">$${payout.toLocaleString()}</strong></span>
                <button class="btn btn-order btn-sm fulfill-btn" data-job-id="${customer.id}" ${allPartsInStock ? '' : 'disabled'} style="width: auto; padding: 4px 10px;">
                    Fulfill Order
                </button>
            </div>
        `;

        if (row._cachedHtml !== newHtml) {
            row.innerHTML = newHtml;
            row._cachedHtml = newHtml;
        }
    });
}

function renderMetricsDisplay() {
    // 1. Status Alert
    const status = getSystemStatus();
    systemStatusVal.textContent = status.text;
    systemStatusVal.className = status.class;

    // 2. Cars Fixed Per Minute
    fpmVal.textContent = fixHistory.length;

    // 3. Apprentice Uptime
    let uptimePct = 0;
    if (apprenticeHired && apprenticeHistory.length > 0) {
        const activeTicks = apprenticeHistory.reduce((sum, val) => sum + val, 0);
        uptimePct = Math.round((activeTicks / apprenticeHistory.length) * 100);
    }
    apprenticeUptimeVal.textContent = apprenticeHired ? `${uptimePct}%` : "STAFF UNHIRED";

    // 4. Backlog indicator
    backlogVal.textContent = `${customerQueue.length} / 5`;
}

function getSystemStatus() {
    const totalParts = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);

    if (apprenticeHired) {
        if (totalParts === 0 && customerQueue.length === 0) {
            return { text: "STALLED (PARTS & JOBS)", class: "status-badge status-danger" };
        }
        if (totalParts === 0) {
            return { text: "PART SHORTAGE", class: "status-badge status-caution" };
        }
        if (customerQueue.length === 0) {
            return { text: "AWAITING JOBS", class: "status-badge status-caution" };
        }
        return { text: "OPTIMAL FLOW", class: "status-badge status-ok" };
    } else {
        if (totalParts === 0 && customerQueue.length === 0) {
            return { text: "AWAITING ACTION", class: "status-badge status-idle" };
        }
        return { text: "MANUAL CONTROL", class: "status-badge status-ok" };
    }
}

function renderDealershipStats() {
    kpiRevenue.textContent = `$${totalRevenue.toLocaleString()}`;
    kpiSold.textContent = carsSold;

    const conversion = (carsSold + declinedCalls === 0) ? 100 : Math.round((carsSold / (carsSold + declinedCalls)) * 100);
    kpiConversion.textContent = `${conversion}%`;
}

// --- WINDOW SELECTION COMPATIBILITY ---
function switchTab(target) {
    const win = windows[target];
    if (win) {
        win.style.display = "flex";
        bringToFront(win);

        if (target === 'ops') {
            renderCustomers();
            renderMetricsDisplay();
        } else if (target === 'dealership') {
            renderDealershipStats();
            if (weeklyChart) weeklyChart.resize();
            if (bodyChart) bodyChart.resize();
        }
    }
    updateUI();
}

// --- CHART.JS VISUALIZATIONS ---
function initCharts() {
    const ctxWeekly = document.getElementById('weekly-sales-chart');
    const ctxBody = document.getElementById('body-style-chart');

    if (ctxWeekly) {
        weeklyChart = new Chart(ctxWeekly, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sales Revenue ($)',
                    data: [0, 0, 0, 0, 0, 0, 0], // Start at 0, builds during current gameplay
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#0b0f19',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#64748b', font: { family: 'Consolas', size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#64748b', font: { family: 'Consolas', size: 10 } }
                    }
                }
            }
        });
    }

    if (ctxBody) {
        bodyChart = new Chart(ctxBody, {
            type: 'doughnut',
            data: {
                labels: ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback'],
                datasets: [{
                    data: [0, 0, 0, 0, 0], // Populated dynamically
                    backgroundColor: [
                        '#10b981', // Sedan (Green)
                        '#0ea5e9', // SUV (Blue)
                        '#f59e0b', // Truck (Orange)
                        '#8b5cf6', // Coupe (Purple)
                        '#ec4899'  // Hatchback (Pink)
                    ],
                    borderWidth: 2,
                    borderColor: '#0b0f19'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Plus Jakarta Sans', size: 11 },
                            padding: 12
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    chartsInitialized = true;
}

function updateChartData(model, payout) {
    if (!chartsInitialized) return;

    // 1. Resolve body style and update Donut chart
    const bodyStyle = getBodyStyleForModel(model);
    const labels = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback'];
    const idx = labels.indexOf(bodyStyle);

    if (idx !== -1 && bodyChart) {
        bodyChart.data.datasets[0].data[idx] += 1;
        bodyChart.update();
    }

    // 2. Add revenue payout to the weekly sales chart (on Sunday data slot)
    if (weeklyChart) {
        weeklyChart.data.datasets[0].data[6] += payout;
        weeklyChart.update();
    }
}

function getBodyStyleForModel(model) {
    if (model.includes("Mustang") || model.includes("Corvette") || model.includes("911")) return "Coupe";
    if (model.includes("Wrangler") || model.includes("SUV")) return "SUV";
    if (model.includes("Prius") || model.includes("Leaf")) return "Hatchback";
    if (model.includes("Truck") || model.includes("F-150")) return "Truck";
    return "Sedan"; // Default class mapping
}

// --- APP STORE AND BANK LOAN LOGIC ---
function buyApp(appId) {
    if (unlockedApps[appId]) {
        window.toggleAppInstall(appId);
        return;
    }

    let cost = 0;
    if (appId === 'dealership') cost = 1500;
    else if (appId === 'inspections') cost = 5000;
    else if (appId === 'darknet') cost = 500000;
    else if (appId === 'scrapnet') cost = 0;
    else if (appId === 'certifications') cost = 7500;
    else if (appId === 'travel-junkyard') cost = 7500;
    else if (appId === 'bugtracker') cost = 0;

    if (money >= cost && !unlockedApps[appId]) {
        if (cost > 0) money -= cost;
        unlockedApps[appId] = true;
        installedApps[appId] = true;
        if (cost > 0 && !appPurchaseLedger.includes(appId)) appPurchaseLedger.push(appId);
        renderDesktop();
        updateUI();
        const appName = appId === "darknet" ? "DarkNet.exe" : appId;
        showNotification(`${appName} purchased and installed. Open it from the desktop.`, "success");
        saveGame();
    } else if (!unlockedApps[appId] && money < cost) {
        const appName = appId === "darknet" ? "DarkNet.exe" : appId;
        const appStore = document.getElementById("window-appstore");
        triggerInsufficientFundsFeedback(appStore || document.body, "app-store-funds-feedback");
        showNotification(`${appName} requires $${cost.toLocaleString()}. Current balance: $${money.toLocaleString()}.`, "error");
    }

    const reputationEl = document.getElementById("reputation-val");
    const satisfactionEl = document.getElementById("satisfaction-val");
    if (reputationEl) reputationEl.textContent = `${garageReputation} / 100`;
    if (satisfactionEl) satisfactionEl.textContent = `${customerSatisfaction}%`;
}

function takeLoan() {
    money += 10000;
    debt += 10000;
    updateUI();
    saveGame();
}

function repayLoan() {
    if (money >= debt && debt > 0) {
        money -= debt;
        debt = 0;
        updateUI();
        saveGame();
    }
}

function depositSavings() {
    const input = document.getElementById("savings-amount-input");
    if (!input) return;
    const amount = parseFloat(input.value);
    if (!isNaN(amount) && amount > 0 && money >= amount) {
        money -= amount;
        savingsBalance += amount;
        input.value = "";
        updateUI();
        saveGame();
    }
}

function withdrawSavings() {
    const input = document.getElementById("savings-amount-input");
    if (!input) return;
    const amount = parseFloat(input.value);
    if (!isNaN(amount) && amount > 0 && savingsBalance >= amount) {
        savingsBalance -= amount;
        money += amount;
        input.value = "";
        updateUI();
        saveGame();
    }
}

// --- SAFETY INSPECTION DIAGNOSTICS ENGINE ---
function startInspection() {
    if (activeInspection || currentInspectionVehicle) return;

    const startBtn = document.getElementById("start-inspection-btn");
    if (startBtn) startBtn.disabled = true;

    // Filter car models by player's purchased classes
    let allowedClasses = [];
    if (playerStats.locationClasses) {
        allowedClasses = playerStats.locationClasses.split(",").map(s => s.trim());
    } else {
        allowedClasses = ["A"]; // fallback
    }

    const availableModels = carModels.filter(model => {
        const bClass = getBrandClassForModel(model);
        return allowedClasses.includes(bClass);
    });

    if (availableModels.length === 0) {
        if (startBtn) startBtn.disabled = false;
        return; // Guard clause
    }

    // Generate vehicle data for Papers Please verification
    const owners = ["John Doe", "Jane Smith", "Robert Brown", "Emily White", "Michael Davis"];
    const plates = ["ABC-1234", "XYZ-9876", "NY-6655", "STATE-1"];
    const colors = ["Red", "Blue", "Black", "White", "Silver"];

    const actualModel = availableModels[Math.floor(Math.random() * availableModels.length)];
    const actualVin = Math.random().toString(36).substring(2, 10).toUpperCase();
    const actualOwner = owners[Math.floor(Math.random() * owners.length)];
    const actualPlate = plates[Math.floor(Math.random() * plates.length)];
    const actualColor = colors[Math.floor(Math.random() * colors.length)];

    let physModel = actualModel;
    let physVin = actualVin;
    let physOwner = actualOwner;
    let physPlate = actualPlate;
    let physColor = actualColor;
    let isExpired = false;

    // 30% chance of discrepancy (discrepancyType 0 to 3)
    const discrepancyType = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : null;
    const hasDiscrepancy = (discrepancyType !== null);

    if (hasDiscrepancy) {
        if (discrepancyType === 0) {
            // Plate Mismatch
            if (actualPlate === "ABC-1234") physPlate = "ABC-1243";
            else if (actualPlate === "XYZ-9876") physPlate = "XYZ-9867";
            else if (actualPlate === "NY-6655") physPlate = "NY-6656";
            else if (actualPlate === "STATE-1") physPlate = "STATE-I";
            else physPlate = "PLATE-ERR";
        } else if (discrepancyType === 1) {
            // Owner Name Mismatch
            if (actualOwner === "John Doe") physOwner = "Jon Doe";
            else if (actualOwner === "Jane Smith") physOwner = "Jayne Smith";
            else if (actualOwner === "Robert Brown") physOwner = "Robert Browne";
            else if (actualOwner === "Emily White") physOwner = "Emilie White";
            else if (actualOwner === "Michael Davis") physOwner = "Micheal Davis";
            else physOwner = "Name Mismatch";
        } else if (discrepancyType === 2) {
            // Color Mismatch
            const alternateColors = colors.filter(c => c !== actualColor);
            physColor = alternateColors[Math.floor(Math.random() * alternateColors.length)];
        } else if (discrepancyType === 3) {
            // Expired Sticker
            isExpired = true;
        }
    }

    const currentYear = new Date().getFullYear();
    const expYear = isExpired ? currentYear - 1 : currentYear + 1;

    // Store for verification buttons
    window._verificationData = {
        actualModel, actualVin, actualOwner, actualPlate, actualColor,
        physModel, physVin, physOwner, physPlate, physColor,
        isExpired, hasDiscrepancy, expYear, discrepancyType
    };

    // Populate UI
    document.getElementById("dmv-vin").textContent = actualVin;
    document.getElementById("dmv-owner").textContent = actualOwner;
    document.getElementById("dmv-plate").textContent = actualPlate;
    document.getElementById("dmv-color").textContent = actualColor;
    const dmvStatus = document.getElementById("dmv-status");
    if (dmvStatus) dmvStatus.textContent = "VALID";

    document.getElementById("phys-vin").textContent = physVin;
    document.getElementById("phys-owner").textContent = physOwner;
    document.getElementById("phys-plate").textContent = physPlate;
    document.getElementById("phys-color").textContent = physColor;

    const expMonth = Math.floor(Math.random() * 12) + 1;
    const daysInMonth = new Date(expYear, expMonth, 0).getDate();
    const expDay = Math.floor(Math.random() * daysInMonth) + 1;

    const expSpan = document.getElementById("phys-exp");
    if (expSpan) {
        expSpan.textContent = `${expMonth.toString().padStart(2, '0')}/${expDay.toString().padStart(2, '0')}/${expYear}`;
        expSpan.style.color = isExpired ? "#ef4444" : "#4ade80";
    }

    // Reset checklist checkboxes
    const checkboxes = document.querySelectorAll(".audit-checkbox");
    checkboxes.forEach(cb => {
        cb.checked = false;
    });

    // Disable start scan button initially
    const passBtn = document.getElementById("verify-pass-btn");
    if (passBtn) {
        passBtn.disabled = true;
        passBtn.style.opacity = "0.5";
        passBtn.style.cursor = "not-allowed";
    }

    // Reset and show panel
    const resultMsg = document.getElementById("verification-result-msg");
    if (resultMsg) { resultMsg.classList.add("hidden"); resultMsg.textContent = ""; }
    const btnsDiv = document.getElementById("verification-buttons");
    if (btnsDiv) btnsDiv.style.display = "flex";

    document.getElementById("paperwork-verification-panel").classList.remove("hidden");
}

function startPhysicalDiagnosticScan(model, vin) {
    // Hide verification panel, show scan progress
    document.getElementById("paperwork-verification-panel").classList.add("hidden");

    const activeState = document.getElementById("inspection-active-state");
    if (activeState) activeState.classList.remove("hidden");

    const reportCard = document.getElementById("inspection-report-card");
    if (reportCard) reportCard.classList.add("hidden");

    activeInspection = {
        progress: 0,
        duration: 10000,
        model: model,  // Pass through verified data
        vin: vin
    };

    updateUI();
}

function resetVerificationUI() {
    document.getElementById("paperwork-verification-panel").classList.add("hidden");
    document.getElementById("start-inspection-btn").disabled = false;
    window._verificationData = null;
    updateUI();
}

function updateInspection(dt) {
    if (!activeInspection) return;

    activeInspection.progress += dt;

    let statusText = "Scanning OBD-II codes...";
    if (activeInspection.progress > 7500) {
        statusText = "Finalizing safety report...";
    } else if (activeInspection.progress > 5000) {
        statusText = "Checking tire treads & emissions...";
    } else if (activeInspection.progress > 2500) {
        statusText = "Measuring brake pad wear...";
    }

    const statusLabel = document.getElementById("inspection-status-text");
    if (statusLabel) statusLabel.textContent = statusText;

    const remaining = Math.max((activeInspection.duration - activeInspection.progress) / 1000, 0);
    const timerLabel = document.getElementById("inspection-timer-text");
    if (timerLabel) timerLabel.textContent = `${remaining.toFixed(1)}s`;

    const pct = Math.min((activeInspection.progress / activeInspection.duration) * 100, 100);
    const bar = document.getElementById("inspection-progress-bar");
    if (bar) bar.style.width = `${pct}%`;

    if (activeInspection.progress >= activeInspection.duration) {
        // Inspection completed! Use the verified model/VIN from the scan
        const randomModel = activeInspection.model;
        const vin = activeInspection.vin;
        const brandClass = getBrandClassForModel(randomModel);

        // Multi-fault generator: pick 1 to 3 unique faults
        const numFaults = Math.floor(Math.random() * 3) + 1;
        const zones = ["Engine", "Cooling", "Brakes", "Suspension", "Transmission", "Electrical", "Exhaust"];
        const zoneMapping = {
            "engineBlock": "Engine", "sparkPlugs": "Engine", "oil": "Engine", "oilFilter": "Engine",
            "airFilter": "Engine", "driveBelt": "Engine", "fuelPump": "Engine",
            "radiator": "Cooling", "waterPump": "Cooling", "coolant": "Cooling",
            "brakePads": "Brakes", "brakeFluid": "Brakes", "suspension": "Suspension",
            "transmission": "Transmission",
            "battery": "Electrical", "ecu": "Electrical", "alternator": "Electrical", "starterMotor": "Electrical",
            "exhaust": "Exhaust"
        };

        const legalPartsPool = Object.keys(catalog).filter(k => catalog[k].brand !== "classX");
        let catalogKeys = Object.keys(catalog).filter(k => catalog[k].brand === brandClass && catalog[k].brand !== "classX");
        if (catalogKeys.length === 0) catalogKeys = legalPartsPool;

        const faults = [];
        let partsCost = 0;
        const zonesObj = {};
        zones.forEach(z => { zonesObj[z] = "healthy"; });

        const shuffledParts = [...catalogKeys].sort(() => 0.5 - Math.random());

        for (const partKey of shuffledParts) {
            const part = catalog[partKey];
            const partZone = zoneMapping[part.baseId] || "Engine";

            if (zonesObj[partZone] === "healthy") {
                zonesObj[partZone] = "broken";
                faults.push({ zone: partZone, part: part, repaired: false });
                partsCost += part.basePrice;
                if (faults.length >= numFaults) break;
            }
        }

        const markup = Math.floor(partsCost * 1.8);
        const labor = 800 + ((faults.length - 1) * 400);
        const totalPayout = markup + labor;

        currentInspectionVehicle = {
            model: randomModel, brandClass: brandClass, vin: vin,
            faults: faults, partsCost: partsCost, markup: markup, labor: labor, totalPayout: totalPayout, zones: zonesObj
        };

        // Render report text with all faults listed
        let reportHtml = `VEHICLE DIAGNOSTIC LOG:\n`;
        reportHtml += `- MODEL: ${randomModel}\n`;
        reportHtml += `- VIN: ${vin}\n`;
        reportHtml += `- FAULTS DETECTED: ${faults.length}\n\n`;
        faults.forEach((f, i) => {
            reportHtml += `FAULT ${i + 1}: ${f.zone} System Failure\n`;
            reportHtml += `  → Replace ${f.part.name}\n`;
        });
        reportHtml += `\nESTIMATE BREAKDOWN:\n`;
        faults.forEach(f => {
            reportHtml += `  ${f.part.name}: $${Math.floor(f.part.basePrice * 1.8)}\n`;
        });
        reportHtml += `Labor (Base + ${faults.length - 1} extra): $${labor}\n`;
        reportHtml += `TOTAL ESTIMATE: $${totalPayout}\n`;

        const reportEl = document.getElementById("report-details");
        if (reportEl) reportEl.textContent = reportHtml;

        const activeState = document.getElementById("inspection-active-state");
        if (activeState) activeState.classList.add("hidden");

        const reportCard = document.getElementById("inspection-report-card");
        if (reportCard) reportCard.classList.remove("hidden");

        // Reset and show auth button
        const authBtn = document.getElementById("auth-inspection-btn");
        if (authBtn) {
            authBtn.disabled = false;
            authBtn.textContent = "Send for Customer Authorization";
            authBtn.style.backgroundColor = "";
            authBtn.style.color = "";
            authBtn.style.border = "";
        }

        // Re-enable start button
        const startBtn = document.getElementById("start-inspection-btn");
        if (startBtn) startBtn.disabled = false;

        activeInspection = null;
        updateUI();
        renderVehicleBay();
        saveGame();
    }
}

function renderInspectionUI() {
    const startBtn = document.getElementById("start-inspection-btn");
    if (startBtn) {
        startBtn.disabled = (activeInspection !== null) || (currentInspectionVehicle !== null);
    }
    // NOTE: renderVehicleBay() is NOT called here on every tick.
    // It is called explicitly only when state changes (inspection complete, part installed, tab switch).
}

function renderVehicleBay() {
    if (!currentInspectionVehicle) {
        document.getElementById("inspection-vehicle-name").textContent = "None";
        ["Engine", "Cooling", "Brakes", "Suspension", "Transmission", "Electrical", "Exhaust"].forEach(z => {
            const el = document.querySelector(`.car-zone[data-system="${z}"]`);
            if (el) {
                el.classList.remove("system-ok", "system-fault", "system-healthy", "system-faulty");
                el.innerHTML = z;
            }
        });
        const sendBillBtn = document.getElementById("send-inspection-bill-btn");
        if (sendBillBtn) sendBillBtn.disabled = true;
        const tabBillingBtn = document.getElementById("tab-inspection-billing");
        if (tabBillingBtn) tabBillingBtn.disabled = true;
        return;
    }

    document.getElementById("inspection-vehicle-name").textContent = currentInspectionVehicle.model;

    Object.keys(currentInspectionVehicle.zones).forEach(zone => {
        const el = document.querySelector(`.car-zone[data-system="${zone}"]`);
        if (el) {
            el.classList.remove("system-ok", "system-fault", "system-healthy", "system-faulty");
            const state = currentInspectionVehicle.zones[zone];

            if (state === "healthy") {
                el.classList.add("system-healthy");
                el.innerHTML = zone;
            } else if (state === "repaired") {
                el.classList.add("system-healthy");
                el.innerHTML = `<div style="margin-bottom:4px; font-weight:bold;">${zone}</div><div style="font-size:10px; color:#4ade80;">✓ System Repaired</div>`;
            } else if (state === "broken") {
                el.classList.add("system-faulty");
                // Find the fault for this zone
                const fault = currentInspectionVehicle.faults.find(f => f.zone === zone && !f.repaired);
                if (fault) {
                    const partName = fault.part.name;
                    const escapedZone = zone.replace(/'/g, "\\'");
                    const escapedPartId = fault.part.id.replace(/'/g, "\\'");
                    el.innerHTML = `
                        <div style="margin-bottom:4px; font-weight:bold;">${zone}</div>
                        <div style="font-size:10px; margin-bottom:4px;">Requires: ${partName}</div>
                        <button class="insert-part-btn btn btn-sm btn-order" onclick="window.installInspectionPart('${escapedZone}','${escapedPartId}')">Insert Part</button>
                    `;
                }
            }
        }
    });

    const allRepaired = currentInspectionVehicle.faults.every(f => f.repaired);
    const sendBillBtn = document.getElementById("send-inspection-bill-btn");
    if (sendBillBtn) sendBillBtn.disabled = !allRepaired;
    const tabBillingBtn = document.getElementById("tab-inspection-billing");
    if (tabBillingBtn) tabBillingBtn.disabled = !allRepaired;
}

// --- GLOBAL INSPECTION PART INSTALLER ---
window.installInspectionPart = function (zone, partId) {
    if (!currentInspectionVehicle) return;

    const fault = currentInspectionVehicle.faults.find(f => f.zone === zone && !f.repaired);
    if (!fault) return;

    // Exact inventory match
    const invKey = partId;
    if ((inventory[invKey] || 0) >= 1) {
        inventory[invKey]--;
        fault.repaired = true;
        currentInspectionVehicle.zones[zone] = "repaired";

        renderVehicleBay();
        updateUI();
        saveGame();
    } else {
        // Inline feedback: turn button red with error message, reset after 1.5s
        const zoneEl = document.querySelector(`.car-zone[data-system="${zone}"]`);
        if (zoneEl) {
            const btn = zoneEl.querySelector('.insert-part-btn');
            if (btn) {
                btn.textContent = "Not in inventory!";
                btn.style.background = "#dc2626";
                btn.style.pointerEvents = "none";
                setTimeout(() => {
                    btn.textContent = "Insert Part";
                    btn.style.background = "";
                    btn.style.pointerEvents = "";
                }, 1500);
            }
        }
    }
};

// --- EVENT LISTENER BINDINGS ---
salvageBtn.addEventListener("click", salvageScrap);
if (hireApprenticeBtn) hireApprenticeBtn.addEventListener("click", hireApprentice);

callAnswerBtn.addEventListener("click", handleAnswerCall);
callDeclineBtn.addEventListener("click", handleDeclineCall);
callAcceptBtn.addEventListener("click", handleAcceptCall);
callQuoteBtn.addEventListener("click", handleQuoteCall);
callHangupBtn.addEventListener("click", handleHangupCall);

// App Store events
if (buyAppDealershipBtn) {
    buyAppDealershipBtn.addEventListener("click", () => buyApp('dealership'));
}
if (buyAppBankBtn) {
    buyAppBankBtn.addEventListener("click", () => buyApp('bank'));
}
if (buyAppInspectionsBtn) {
    buyAppInspectionsBtn.addEventListener("click", () => buyApp('inspections'));
}
if (buyAppDarknetBtn) {
    buyAppDarknetBtn.addEventListener("click", () => buyApp('darknet'));
}
if (buyAppScrapnetBtn) {
    buyAppScrapnetBtn.addEventListener("click", () => buyApp('scrapnet'));
}
if (buyAppCertificationsBtn) {
    buyAppCertificationsBtn.addEventListener("click", () => buyApp('certifications'));
}
if (buyAppJunkyardBtn) {
    buyAppJunkyardBtn.addEventListener("click", () => buyApp('travel-junkyard'));
}
if (buyAppBugTrackerBtn) {
    buyAppBugTrackerBtn.addEventListener("click", () => buyApp('bugtracker'));
}

// Inspections App start button
const startInspectionBtn = document.getElementById("start-inspection-btn");
if (startInspectionBtn) {
    startInspectionBtn.addEventListener("click", startInspection);
}

// Papers Please: Verification button handlers
const verifyPassBtn = document.getElementById("verify-pass-btn");
const verifyFailBtn = document.getElementById("verify-fail-btn");

function showVerificationResult(message, color, autoReset) {
    const resultMsg = document.getElementById("verification-result-msg");
    const btnsDiv = document.getElementById("verification-buttons");
    if (resultMsg) {
        resultMsg.textContent = message;
        resultMsg.style.background = color === "red" ? "rgba(220, 38, 38, 0.2)" : "rgba(74, 222, 128, 0.2)";
        resultMsg.style.border = `1px solid ${color === "red" ? "#dc2626" : "#4ade80"}`;
        resultMsg.style.color = color === "red" ? "#fca5a5" : "#4ade80";
        resultMsg.classList.remove("hidden");
    }
    if (btnsDiv) btnsDiv.style.display = "none";

    if (autoReset) {
        setTimeout(() => { resetVerificationUI(); }, 2000);
    }
}

if (verifyPassBtn) {
    verifyPassBtn.addEventListener("click", () => {
        const data = window._verificationData;
        if (!data) return;

        if (data.hasDiscrepancy) {
            // Player passed a bad car — penalty!
            const fine = 500;
            money -= fine;
            let discName = "discrepancy";
            if (data.discrepancyType === 0) discName = "Plate Mismatch";
            else if (data.discrepancyType === 1) discName = "Owner Name Mismatch";
            else if (data.discrepancyType === 2) discName = "Color Mismatch";
            else if (data.discrepancyType === 3) discName = "Expired Sticker";

            showVerificationResult(`⚠️ NYS AUDIT: Approved vehicle with ${discName}! Fined -$${fine}.`, "red", true);
        } else {
            // Clean papers — proceed to physical scan
            showVerificationResult("✅ Paperwork verified. Initiating diagnostic scan...", "green", false);
            setTimeout(() => {
                startPhysicalDiagnosticScan(data.actualModel, data.actualVin);
                window._verificationData = null;
            }, 800);
        }
    });
}

if (verifyFailBtn) {
    verifyFailBtn.addEventListener("click", () => {
        const data = window._verificationData;
        if (!data) return;

        if (data.hasDiscrepancy) {
            // Good catch!
            const bounty = 88;
            money += bounty;
            let discName = "discrepancy";
            if (data.discrepancyType === 0) discName = "Plate Mismatch";
            else if (data.discrepancyType === 1) discName = "Owner Name Mismatch";
            else if (data.discrepancyType === 2) discName = "Color Mismatch";
            else if (data.discrepancyType === 3) discName = "Expired Sticker";

            showVerificationResult(`🎯 Good eye! Caught ${discName}! Vehicle rejected. NYS bounty: +$${bounty}.`, "green", true);
        } else {
            // False rejection — customer complaint
            money -= 100;
            showVerificationResult("❌ Customer Complaint! Legal paperwork rejected. Lost -$100.", "red", true);
        }
    });
}

// Function to update the Match button state based on the 5-point audit checklist
function updateAuditButtonState() {
    const checkboxes = document.querySelectorAll(".audit-checkbox");
    let allChecked = true;
    checkboxes.forEach(cb => {
        if (!cb.checked) allChecked = false;
    });

    const passBtn = document.getElementById("verify-pass-btn");
    if (passBtn) {
        if (allChecked) {
            passBtn.disabled = false;
            passBtn.style.opacity = "1";
            passBtn.style.cursor = "pointer";
        } else {
            passBtn.disabled = true;
            passBtn.style.opacity = "0.5";
            passBtn.style.cursor = "not-allowed";
        }
    }
}

// Bind audit checkbox change events
document.querySelectorAll(".audit-checkbox").forEach(cb => {
    cb.addEventListener("change", updateAuditButtonState);
});

// Inspections App Tabs
// Inspections App Tabs
const tabTerminalBtn = document.getElementById("tab-inspection-terminal");
const tabVehicleBtn = document.getElementById("tab-inspection-vehicle");
const tabBillingBtn = document.getElementById("tab-inspection-billing");
const tabHistoryBtn = document.getElementById("tab-inspection-history");

function switchInspectionTab(tabName) {
    if (tabTerminalBtn) tabTerminalBtn.classList.remove("active");
    if (tabVehicleBtn) tabVehicleBtn.classList.remove("active");
    if (tabBillingBtn) tabBillingBtn.classList.remove("active");
    if (tabHistoryBtn) tabHistoryBtn.classList.remove("active");

    document.getElementById("inspection-view-terminal").classList.add("hidden");
    document.getElementById("inspection-view-vehicle").classList.add("hidden");
    document.getElementById("inspection-view-billing").classList.add("hidden");
    document.getElementById("inspection-view-history").classList.add("hidden");

    if (tabName === 'terminal') {
        if (tabTerminalBtn) tabTerminalBtn.classList.add("active");
        document.getElementById("inspection-view-terminal").classList.remove("hidden");
    } else if (tabName === 'vehicle') {
        if (tabVehicleBtn) tabVehicleBtn.classList.add("active");
        document.getElementById("inspection-view-vehicle").classList.remove("hidden");
        renderVehicleBay();
    } else if (tabName === 'billing') {
        if (tabBillingBtn) tabBillingBtn.classList.add("active");
        document.getElementById("inspection-view-billing").classList.remove("hidden");

        // Render Billing Invoice
        if (currentInspectionVehicle) {
            const receiptEl = document.getElementById("billing-receipt");
            if (receiptEl) {
                let html = `VIN: ${currentInspectionVehicle.vin}\n`;
                html += `MODEL: ${currentInspectionVehicle.model}\n`;
                html += `DATE: ${new Date().toLocaleDateString()}\n`;
                html += `--------------------------------\n`;
                html += `PARTS INVOICE:\n`;
                currentInspectionVehicle.faults.forEach((f, i) => {
                    const faultMarkup = Math.floor(f.part.basePrice * 1.8);
                    const status = f.repaired ? "INSTALLED" : "PENDING";
                    html += `  ${i + 1}. ${f.part.name} ... $${faultMarkup} [${status}]\n`;
                });
                html += `LABOR:\n`;
                html += `  Base Diagnostic & Repair ... $800\n`;
                if (currentInspectionVehicle.faults.length > 1) {
                    html += `  Additional Fault Surcharge (x${currentInspectionVehicle.faults.length - 1}) ... $${(currentInspectionVehicle.faults.length - 1) * 400}\n`;
                }
                html += `--------------------------------\n`;
                html += `TOTAL AMOUNT DUE: $${currentInspectionVehicle.totalPayout}\n`;
                const allFixed = currentInspectionVehicle.faults.every(f => f.repaired);
                html += `STATUS: ${allFixed ? "READY TO BILL" : "REPAIRS IN PROGRESS"}\n`;
                receiptEl.textContent = html;
            }
        }
    } else if (tabName === 'history') {
        if (tabHistoryBtn) tabHistoryBtn.classList.add("active");
        document.getElementById("inspection-view-history").classList.remove("hidden");
        renderServiceHistory();
    }
}

if (tabTerminalBtn) {
    tabTerminalBtn.addEventListener("click", () => {
        // If there's an already-finalized job waiting to be closed, close it automatically
        const sendBillBtn = document.getElementById("send-inspection-bill-btn");
        if (sendBillBtn && sendBillBtn.textContent === "Job Closed - Return to Terminal") {
            currentInspectionVehicle = null;
            activeInspectionZone = null;
            sendBillBtn.textContent = "Finalize & Collect Payment";
            if (tabVehicleBtn) tabVehicleBtn.disabled = true;
            if (tabBillingBtn) tabBillingBtn.disabled = true;
            const reportCard = document.getElementById("inspection-report-card");
            if (reportCard) reportCard.classList.add("hidden");
            const authBtn = document.getElementById("auth-inspection-btn");
            if (authBtn) {
                authBtn.classList.remove("btn-success");
                authBtn.style.backgroundColor = "";
                authBtn.style.color = "";
                authBtn.style.border = "";
                authBtn.disabled = false;
                authBtn.textContent = "Send for Customer Authorization";
            }
            updateUI();
            saveGame();
        }
        switchInspectionTab('terminal');
    });
}
if (tabVehicleBtn) tabVehicleBtn.addEventListener("click", () => {
    if (!tabVehicleBtn.disabled) switchInspectionTab('vehicle');
});
if (tabBillingBtn) tabBillingBtn.disabled = () => {
    if (!tabBillingBtn.disabled) switchInspectionTab('billing');
};
// Add direct event listener click check for tabBillingBtn to bypass disabled assignment if it was a typo in main code
if (tabBillingBtn) {
    tabBillingBtn.addEventListener("click", () => {
        if (!tabBillingBtn.disabled) switchInspectionTab('billing');
    });
}
if (tabHistoryBtn) {
    tabHistoryBtn.addEventListener("click", () => {
        switchInspectionTab('history');
    });
}

function addToServiceHistory(record) {
    serviceHistory.unshift(record);
    if (serviceHistory.length > 5) {
        serviceHistory.pop();
    }
}

function renderServiceHistory() {
    const listBody = document.getElementById("history-list-body");
    if (!listBody) return;

    if (serviceHistory.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="3" style="padding: 16px; text-align: center; color: #64748b;">No completed jobs on record.</td>
            </tr>
        `;
        return;
    }

    let html = "";
    serviceHistory.forEach(record => {
        html += `<tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px; color: #94a3b8;">${record.date}</td>
            <td style="padding: 8px; color: #cbd5e1; font-weight: bold;">${record.model}</td>
            <td style="padding: 8px; color: #38bdf8; font-family: monospace;">${record.vin}</td>
        </tr>`;
    });
    listBody.innerHTML = html;
}

// Authorization Logic
const authInspectionBtn = document.getElementById("auth-inspection-btn");
if (authInspectionBtn) {
    authInspectionBtn.addEventListener("click", () => {
        authInspectionBtn.disabled = true;
        authInspectionBtn.textContent = "Awaiting Approval...";

        setTimeout(() => {
            // 40% chance the customer calls to haggle
            if (Math.random() < 0.40) {
                authInspectionBtn.textContent = "Customer Calling...";
                triggerInspectionCall();
            } else {
                approveInspectionUI();
            }
        }, 3000);
    });
}

// Global helper for the UI state so the phone can call it too
window.approveInspectionUI = function () {
    const authBtn = document.getElementById("auth-inspection-btn");
    if (authBtn) {
        authBtn.textContent = "Approved... move to vehicle bay.";
        // Greyed-out green style
        authBtn.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
        authBtn.style.color = "#a7f3d0";
        authBtn.style.border = "1px solid rgba(16, 185, 129, 0.3)";
    }
    const tabVehicleBtn = document.getElementById("tab-inspection-vehicle");
    if (tabVehicleBtn) tabVehicleBtn.disabled = false;
    updateUI();
};

function triggerInspectionCall() {
    if (!currentInspectionVehicle) return;

    const customerNames = ["Mr. Henderson", "Ms. Davis", "Officer Miller", "Dr. Jenkins", "Professor Gable", "Sheriff Vance"];
    const callerName = customerNames[Math.floor(Math.random() * customerNames.length)];

    const payout = currentInspectionVehicle.totalPayout;
    const speechText = `Hello! This is ${callerName}. I'm calling about the safety inspection estimate for my ${currentInspectionVehicle.model} which is $${payout}. That is a bit too expensive... Can you offer a discount?`;

    currentCallCustomer = {
        isInspectionDispute: true,
        name: callerName,
        carModel: currentInspectionVehicle.model,
        speechText: speechText,
        payout: payout,
        originalPayout: payout
    };

    // Render ringing view nodes
    callerIdText.textContent = callerName;

    // Show ringing view and hide active view
    phoneRingingView.classList.remove("hidden");
    phoneActiveView.classList.add("hidden");

    // Open phone widget (slide up)
    phoneWidget.classList.add("ringing");
}

// Inspections Vehicle Bay — zone toggle only (insert-part-btn handled by inline onclick)
const carDiagramContainer = document.querySelector(".car-diagram-container");
if (carDiagramContainer) {
    carDiagramContainer.addEventListener("click", (e) => {
        // Skip if clicking a button (handled by inline onclick)
        if (e.target.closest(".insert-part-btn")) return;

        const carZone = e.target.closest(".car-zone");
        if (carZone) {
            const zone = carZone.getAttribute("data-system");
            if (currentInspectionVehicle && currentInspectionVehicle.zones && currentInspectionVehicle.zones[zone] === "broken") {
                if (activeInspectionZone === zone) {
                    activeInspectionZone = null;
                } else {
                    activeInspectionZone = zone;
                }
                renderVehicleBay();
            }
        }
    });
}

const sendBillBtn = document.getElementById("send-inspection-bill-btn");
if (sendBillBtn) {
    sendBillBtn.addEventListener("click", () => {
        if (sendBillBtn.textContent === "Job Closed - Return to Terminal") {
            currentInspectionVehicle = null;
            activeInspectionZone = null;

            sendBillBtn.textContent = "Finalize & Collect Payment";
            switchInspectionTab('terminal');
            if (tabVehicleBtn) tabVehicleBtn.disabled = true;
            if (tabBillingBtn) tabBillingBtn.disabled = true;

            const reportCard = document.getElementById("inspection-report-card");
            if (reportCard) reportCard.classList.add("hidden");

            const authBtn = document.getElementById("auth-inspection-btn");
            if (authBtn) {
                authBtn.classList.remove("btn-success");
                authBtn.style.backgroundColor = "";
                authBtn.style.color = "";
                authBtn.style.border = "";
                authBtn.disabled = false;
                authBtn.textContent = "Send for Customer Authorization";
            }

            updateUI();
            saveGame();
            return;
        }

        if (!currentInspectionVehicle) return;

        money += currentInspectionVehicle.totalPayout;
        totalRevenue += currentInspectionVehicle.totalPayout;

        // Add to Service History
        addToServiceHistory({
            model: currentInspectionVehicle.model,
            vin: currentInspectionVehicle.vin,
            date: new Date().toLocaleDateString()
        });

        // Stay on Billing tab but change button text
        sendBillBtn.textContent = "Job Closed - Return to Terminal";

        updateUI();
        saveGame();
    });
}

// Global Inventory Filters
const invFilterA = document.getElementById("inv-filter-a");
const invFilterB = document.getElementById("inv-filter-b");
const invFilterC = document.getElementById("inv-filter-c");

function switchInventoryFilter(brandClass) {
    activeInventoryFilter = brandClass;
    [invFilterA, invFilterB, invFilterC].forEach(el => {
        if (el) el.classList.remove("active");
    });

    if (brandClass === 'classA' && invFilterA) invFilterA.classList.add("active");
    if (brandClass === 'classB' && invFilterB) invFilterB.classList.add("active");
    if (brandClass === 'classC' && invFilterC) invFilterC.classList.add("active");

    renderGlobalInventory();
}

if (invFilterA) invFilterA.addEventListener("click", () => switchInventoryFilter('classA'));
if (invFilterB) invFilterB.addEventListener("click", () => switchInventoryFilter('classB'));
if (invFilterC) invFilterC.addEventListener("click", () => switchInventoryFilter('classC'));

const globalInventoryDisplay = document.getElementById("global-inventory-display");
if (globalInventoryDisplay) {
    globalInventoryDisplay.addEventListener("click", (e) => {
        const sellBtn = e.target.closest(".sell-part-btn");
        if (sellBtn) {
            const partId = sellBtn.getAttribute("data-part-id");
            if (partId && inventory[partId] > 0) {
                inventory[partId]--;
                money += marketPrices[partId];
                updateUI();
                saveGame();
            }
        }
    });
}


// Bank Loan events
if (takeLoanBtn) {
    takeLoanBtn.addEventListener("click", takeLoan);
}
if (repayLoanBtn) {
    repayLoanBtn.addEventListener("click", repayLoan);
}

const depositBtn = document.getElementById("deposit-savings-btn");
if (depositBtn) {
    depositBtn.addEventListener("click", depositSavings);
}
const withdrawBtn = document.getElementById("withdraw-savings-btn");
if (withdrawBtn) {
    withdrawBtn.addEventListener("click", withdrawSavings);
}

const upgradeApprenticeBtn = document.getElementById("upgrade-apprentice-btn");
if (upgradeApprenticeBtn) {
    upgradeApprenticeBtn.addEventListener("click", upgradeApprentice);
}

// Cheat Hook for testing
window.triggerTestCall = triggerPhoneCall;
window.switchStoreTab = switchStoreTab; // Export switchStoreTab for HTML onclick triggers!

// --- AUTOPARTS STORE DELEGATED BINDINGS ---
const storeContainer = document.getElementById("autoparts-store-container");
if (storeContainer) {
    storeContainer.addEventListener("click", (e) => {
        const buyBtn = e.target.closest(".buy-btn");
        if (buyBtn) {
            const partId = buyBtn.getAttribute("data-part-id");
            if (partId) {
                buyPart(partId);
            }
        }
    });
}

// --- DEV CONSOLE SHORTCUTS & HANDLERS ---
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault(); // Prevents default Chrome bookmarking of all tabs
        const devWin = document.getElementById("window-devpanel");
        if (devWin) {
            if (devWin.style.display === "none" || !devWin.style.display) {
                devWin.style.display = "flex";
                bringToFront(devWin);
            } else {
                devWin.style.display = "none";
                devWin.classList.remove("active-focus");
                renderTaskbar();
            }
        }
    }
});

const devSetCashBtn = document.getElementById("dev-set-cash-btn");
if (devSetCashBtn) {
    devSetCashBtn.addEventListener("click", () => {
        const input = document.getElementById("dev-cash-input");
        if (input) {
            const val = parseInt(input.value, 10);
            if (!isNaN(val) && val >= 0) {
                money = val;
                updateUI();
                saveGame();
            }
        }
    });
}

const devInjectPartBtn = document.getElementById("dev-inject-part-btn");
if (devInjectPartBtn) {
    devInjectPartBtn.addEventListener("click", () => {
        const partSelect = document.getElementById("dev-part-select");
        const brandSelect = document.getElementById("dev-brand-select");
        const qtyInput = document.getElementById("dev-part-qty");

        if (partSelect && brandSelect && qtyInput) {
            const basePart = partSelect.value;
            const brandClass = brandSelect.value;
            const qty = parseInt(qtyInput.value, 10);

            if (!isNaN(qty) && qty > 0) {
                const partInfo = baseCatalog[basePart];
                const inventoryKey = `${brandNames[brandClass]} ${partInfo.name}`;
                if (inventory[inventoryKey] !== undefined) {
                    inventory[inventoryKey] += qty;
                    updateUI();
                    saveGame();
                }
            }
        }
    });
}

const devSpawnOrderBtn = document.getElementById("dev-spawn-order-btn");
if (devSpawnOrderBtn) {
    devSpawnOrderBtn.addEventListener("click", () => {
        if (customerQueue.length < 5) {
            spawnNewCustomerOrder();
            updateUI();
        }
    });
}

const devForceCrashBtn = document.getElementById("dev-force-crash-btn");
if (devForceCrashBtn) {
    devForceCrashBtn.addEventListener("click", () => {
        Object.keys(marketPrices).forEach(k => {
            const old = marketPrices[k];
            marketPrices[k] = Math.max(old * 0.2, old - old * 0.4);
            marketTrends[k] = "down";
            marketTrendPcts[k] = -40;
        });

        if (window.updateNewsTicker) {
            window.updateNewsTicker("DEV FORCED: GLOBAL MARKET CRASH!");
        }

        renderScrapNetUI();
        updateUI();
    });
}

const devForceSpikeBtn = document.getElementById("dev-force-spike-btn");
if (devForceSpikeBtn) {
    devForceSpikeBtn.addEventListener("click", () => {
        Object.keys(marketPrices).forEach(k => {
            const old = marketPrices[k];
            marketPrices[k] = Math.min(old * 2.0, old + old * 0.4);
            marketTrends[k] = "up";
            marketTrendPcts[k] = 40;
        });

        if (window.updateNewsTicker) {
            window.updateNewsTicker("DEV FORCED: GLOBAL MARKET SPIKE!");
        }

        renderScrapNetUI();
        updateUI();
    });
}

const devFastForwardBtn = document.getElementById("dev-fast-forward-btn");
if (devFastForwardBtn) {
    devFastForwardBtn.addEventListener("click", () => {
        activeShipments.forEach(s => s.progress = s.duration);
        updateShipments(0);
    });
}

const devWipeSaveBtn = document.getElementById("dev-wipe-save-btn");
if (devWipeSaveBtn) {
    devWipeSaveBtn.addEventListener("click", () => {
        localStorage.removeItem("mechanic_tycoon_save");
        location.reload();
    });
}

const appsToToggle = ['garage', 'office', 'ops', 'dealership', 'appstore', 'bank', 'scrapnet', 'inspections'];
appsToToggle.forEach(app => {
    const cb = document.getElementById(`dev-toggle-${app}`);
    if (cb) {
        cb.addEventListener("change", (e) => {
            const icon = document.getElementById(`icon-${app}`);
            if (icon) {
                icon.style.display = e.target.checked ? "flex" : "none";
            }
            const win = document.getElementById(`window-${app}`);
            if (win && !e.target.checked) {
                win.style.display = "none";
                win.classList.remove("active-focus");
                renderTaskbar();
            }
        });
    }
});

document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const theme = e.target.getAttribute("data-theme");
        if (theme) {
            document.body.style.background = theme;
            saveGame();
        }
    });
});

const devSetPriceBtn = document.getElementById("dev-set-price-btn");
if (devSetPriceBtn) {
    devSetPriceBtn.addEventListener("click", () => {
        const partSelect = document.getElementById("dev-price-part-select");
        const priceInput = document.getElementById("dev-part-price-input");
        if (partSelect && priceInput) {
            const val = parseFloat(priceInput.value);
            if (!isNaN(val) && val > 0) {
                if (catalog[partSelect.value]) {
                    catalog[partSelect.value].basePrice = val;
                    updateUI();
                    saveGame();
                    showNotification(`Updated price of ${partSelect.value} to $${val}`, "success");
                }
            }
        }
    });
}

function populateDevConsoleParts() {
    const selectEl = document.getElementById("dev-part-select");
    const priceSelectEl = document.getElementById("dev-price-part-select");

    if (selectEl) {
        selectEl.innerHTML = "";
        Object.entries(baseCatalog).forEach(([partKey, part]) => {
            const option = document.createElement("option");
            option.value = partKey;
            option.textContent = part.name;
            selectEl.appendChild(option);
        });
    }

    if (priceSelectEl) {
        priceSelectEl.innerHTML = "";
        Object.keys(catalog).sort().forEach(partKey => {
            const option = document.createElement("option");
            option.value = partKey;
            option.textContent = partKey;
            priceSelectEl.appendChild(option);
        });
    }
}

function saveGame() {
    const windowStates = {};
    document.querySelectorAll(".window").forEach(win => {
        windowStates[win.id] = {
            display: win.style.display,
            top: win.style.top,
            left: win.style.left,
            width: win.style.width,
            height: win.style.height,
            zIndex: win.style.zIndex
        };
    });

    const gameState = {
        money,
        inventory,
        customerQueue,
        unlockedApps,
        installedApps,
        debt,
        totalRevenue,
        carsSold,
        declinedCalls,
        garageReputation,
        customerSatisfaction,
        businessUpgrades,
        garageEventTimer,
        activeGarageEvent,
        apprenticeHired,
        savingsBalance,
        lastSavedTime: Date.now(),
        apprenticeSpeedLevel,
        playerStats,
        deliveryWorkers,
        deliveryAutomationEnabled,
        nextDeliveryWorkerId,
        completedContractIds,
        appPurchaseLedger,
        windowStates,
        currentTheme: document.body.style.background,
        globalHeat,
        isIllicitLocked,
        lockdownTimeRemaining,
        tutorialPhase,
        isTutorialComplete,
        serviceHistory,
        ownedTools,
        seenAppTutorials,
        newsHistory,
        locations
    };
    localStorage.setItem("mechanic_tycoon_save", JSON.stringify(gameState));
    if (window.CarMechanicBackend) window.CarMechanicBackend.queueSave(gameState);
}

function loadGame() {
    try {
        const saved = localStorage.getItem("mechanic_tycoon_save");
        if (saved) {
            const state = JSON.parse(saved);
            if (state.money !== undefined) money = parseFloat(state.money) || 0;
            if (state.savingsBalance !== undefined) savingsBalance = parseFloat(state.savingsBalance) || 0;
            if (state.apprenticeSpeedLevel !== undefined) apprenticeSpeedLevel = state.apprenticeSpeedLevel;
            if (state.playerStats !== undefined) {
                Object.assign(playerStats, state.playerStats);
                if (state.playerStats.skills) Object.assign(playerStats.skills, state.playerStats.skills);
                if (state.playerStats.certifications) Object.assign(playerStats.certifications, state.playerStats.certifications);
            }
            if (state.deliveryWorkers !== undefined && Array.isArray(state.deliveryWorkers)) {
                deliveryWorkers = state.deliveryWorkers.map(worker => ({
                    id: worker.id || `delivery-worker-${nextDeliveryWorkerId++}`,
                    name: worker.name || "Unassigned Runner",
                    role: worker.role || "Logistics Runner",
                    wage: Math.max(0, parseInt(worker.wage, 10) || 180),
                    morale: Math.max(0, Math.min(100, parseInt(worker.morale, 10) || 80)),
                    skills: { speed: 0, capacity: 0, reliability: 0, ...(worker.skills || {}) }
                }));
            }
            if (state.deliveryAutomationEnabled !== undefined) deliveryAutomationEnabled = state.deliveryAutomationEnabled === true;
            if (state.nextDeliveryWorkerId !== undefined) nextDeliveryWorkerId = Math.max(1, parseInt(state.nextDeliveryWorkerId, 10) || 1);
            if (Array.isArray(state.completedContractIds)) completedContractIds = state.completedContractIds;

            if (state.lastSavedTime) {
                const secondsOffline = (Date.now() - state.lastSavedTime) / 1000;
                if (secondsOffline > 0 && savingsBalance > 0) {
                    const earned = savingsBalance * (0.005 * secondsOffline);
                    savingsBalance += earned;
                    setTimeout(() => showNotification(`While you were away, your savings earned $${earned.toFixed(2)}.`, "success"), 1000);
                }
            }
            if (state.inventory !== undefined) {
                Object.entries(state.inventory).forEach(([key, qty]) => {
                    const catalogKey = Object.keys(catalog).find(k => k.toLowerCase() === key.toLowerCase()) || key;
                    inventory[catalogKey] = qty;
                });
            }
            if (state.customerQueue !== undefined) {
                customerQueue = state.customerQueue.map(cust => {
                    if (cust.partsRequired) {
                        cust.partsRequired = cust.partsRequired.map(partId => {
                            return Object.keys(catalog).find(k => k.toLowerCase() === partId.toLowerCase()) || partId;
                        });
                    }
                    return cust;
                });
            }
            if (state.unlockedApps !== undefined) {
                Object.assign(unlockedApps, state.unlockedApps);
            }
            if (state.installedApps !== undefined) {
                Object.assign(installedApps, state.installedApps);
            } else {
                Object.entries(unlockedApps).forEach(([app, unlocked]) => {
                    if (unlocked) installedApps[app] = true;
                });
            }
            if (Array.isArray(state.appPurchaseLedger)) {
                appPurchaseLedger = [...new Set(state.appPurchaseLedger.filter(appId => paidAppIds.includes(appId)))];
                paidAppIds.forEach(appId => {
                    unlockedApps[appId] = appPurchaseLedger.includes(appId);
                    if (!unlockedApps[appId]) installedApps[appId] = false;
                });
            } else {
                // Saves from the old blanket-unlock bug have no ownership ledger.
                // Lock paid apps once so they cannot be installed for free.
                paidAppIds.forEach(appId => {
                    unlockedApps[appId] = false;
                    installedApps[appId] = false;
                });
                setTimeout(() => showNotification("App Store ownership repaired. Paid apps now require purchase.", "info"), 800);
            }
            if (state.seenAppTutorials !== undefined) {
                seenAppTutorials = state.seenAppTutorials;
            }
            if (state.newsHistory !== undefined) {
                newsHistory = state.newsHistory;
            }
            if (state.debt !== undefined) debt = state.debt;
            else if (state.activeLoan !== undefined) debt = state.activeLoan;
            if (state.totalRevenue !== undefined) totalRevenue = state.totalRevenue;
            if (state.carsSold !== undefined) carsSold = state.carsSold;
            if (state.declinedCalls !== undefined) declinedCalls = state.declinedCalls;
            if (state.garageReputation !== undefined) garageReputation = Math.max(0, Math.min(100, parseInt(state.garageReputation, 10) || 0));
            if (state.customerSatisfaction !== undefined) customerSatisfaction = Math.max(0, Math.min(100, parseInt(state.customerSatisfaction, 10) || 80));
            if (state.businessUpgrades) Object.assign(businessUpgrades, state.businessUpgrades);
            if (state.garageEventTimer !== undefined) garageEventTimer = parseInt(state.garageEventTimer, 10) || 0;
            if (state.activeGarageEvent) activeGarageEvent = state.activeGarageEvent;
            if (state.serviceHistory !== undefined) serviceHistory = state.serviceHistory;
            if (state.ownedTools !== undefined) {
                Object.assign(ownedTools, state.ownedTools);
            }
            if (state.apprenticeHired !== undefined) {
                apprenticeHired = state.apprenticeHired;
                if (apprenticeHired) {
                    if (apprenticeLockState) apprenticeLockState.classList.add("hidden");
                    if (apprenticeActiveState) apprenticeActiveState.classList.remove("hidden");
                }
            }
            if (state.currentTheme) {
                document.body.style.background = state.currentTheme;
            }
            if (state.globalHeat !== undefined) globalHeat = parseFloat(state.globalHeat) || 0;
            if (state.isIllicitLocked !== undefined) isIllicitLocked = state.isIllicitLocked;
            else if (state.garageLockedDown !== undefined) isIllicitLocked = state.garageLockedDown; // back-compat
            if (state.lockdownTimeRemaining !== undefined) {
                lockdownTimeRemaining = parseFloat(state.lockdownTimeRemaining) || 0;

                // Account for offline time elapsed
                if (state.lastSavedTime && isIllicitLocked && lockdownTimeRemaining > 0) {
                    const msOffline = Date.now() - state.lastSavedTime;
                    if (msOffline > 0) {
                        lockdownTimeRemaining -= msOffline;
                        if (lockdownTimeRemaining <= 0) {
                            lockdownTimeRemaining = 0;
                            unlockApps();
                        }
                    }
                }

                // If lockdown is still active, show overlays immediately
                if (isIllicitLocked && lockdownTimeRemaining > 0) {
                    setTimeout(() => {
                        const illicitApps = ['icon-darknet', 'icon-streetracehub'];
                        illicitApps.forEach(appId => {
                            const el = document.getElementById(appId);
                            if (el) el.classList.add("locked-app");
                        });
                        const globalNotif = document.getElementById("global-lockdown-notification");
                        if (globalNotif) globalNotif.classList.remove("hidden");
                    }, 100);
                }
            }
            if (state.windowStates) {
                Object.entries(state.windowStates).forEach(([id, styles]) => {
                    const win = document.getElementById(id);
                    if (win) {
                        win.style.display = styles.display || "none";
                        if (styles.top) win.style.top = styles.top;
                        if (styles.left) win.style.left = styles.left;
                        if (styles.width) win.style.width = styles.width;
                        if (styles.height) win.style.height = styles.height;
                        if (styles.zIndex) win.style.zIndex = styles.zIndex;
                    }
                });
            } else {
                // Garage auto-open disabled per request
            }
            if (state.tutorialPhase !== undefined) {
                tutorialPhase = state.tutorialPhase;
            } else {
                tutorialPhase = 0;
            }
            if (state.isTutorialComplete !== undefined) {
                isTutorialComplete = state.isTutorialComplete;
            }
            if (state.locations !== undefined) {
                locations = state.locations;

                // Boot-Time Failsafe: Evict AI from US Region
                let evictionHappened = false;
                locations.forEach(loc => {
                    // Ensure region is set on loaded data
                    if (["starter_garage_1", "loc_ca", "loc_tx", "loc_ny", "loc_chi"].includes(loc.id)) {
                        loc.region = "US";
                    } else {
                        loc.region = "International";
                    }
                    
                    if (loc.region === "US" && loc.owner !== "player" && loc.owner !== "neutral" && loc.owner !== "seized") {
                        const badOwnerName = factions[loc.owner] ? factions[loc.owner].name : loc.owner;
                        console.warn(`Safe Zone Violation Detected: Evicting ${badOwnerName} from ${loc.name}`);
                        loc.owner = "neutral";
                        loc.stability = 100;
                        evictionHappened = true;
                    }
                });
                
                if (evictionHappened && typeof window.updateNewsTicker === "function") {
                    setTimeout(() => {
                        window.updateNewsTicker(`⚖️ US FEDERAL ACTION: Government forces seizure and reset of illegal foreign assets within US borders.`);
                    }, 2000);
                }
            }
        } else {
            // First ever load without save
            // Garage auto-open disabled per request
            arrangeDefaultDesktop();
        }
    } catch (e) {
        console.error("Error loading game:", e);
    }
}

// --- OPERATIONS CENTER DELEGATED BINDINGS ---
document.addEventListener("click", (e) => {
    const fulfillBtn = e.target.closest(".fulfill-btn");
    if (fulfillBtn && !fulfillBtn.disabled) {
        const jobId = fulfillBtn.getAttribute("data-job-id") || fulfillBtn.dataset.jobId;
        if (jobId) {
            fulfillOrder(jobId);
        }
    }
});

// OS Notification System
window.showNotification = function(message, type = "info", duration = 4000, toastId = null) {
    const container = document.getElementById('os-notification-center');
    if (!container) return; // Failsafe
    
    const toast = document.createElement('div');
    toast.className = 'os-toast';
    if (toastId) toast.id = toastId;
    
    // Optional: Change border color based on type (success, error, warning)
    if(type === "error") toast.style.borderLeftColor = "#ef4444";
    if(type === "success") toast.style.borderLeftColor = "#22c55e";
    
    // Notifications can include server or provider error text. Render them as
    // text so a future dynamic message can never become executable markup.
    toast.textContent = String(message).replace(/<br\s*\/?>/gi, "\n");
    toast.style.whiteSpace = "pre-line";
    container.appendChild(toast);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Guided Tutorial Sequence
function runTutorial() {
    if (playerStats.tutorialStep === 0) {
        showNotification("Welcome to MechanicOS! Your OS is currently restricted. Open GlobalBusinesses.exe to establish your headquarters. Pay attention to the details: different locations yield unique bonuses, rent costs, and car class limits!", "info", 15000, "tutorial-toast-1");
        playerStats.tutorialStep = 1;
        saveGame();
    } else if (playerStats.tutorialStep === 1 && playerStats.startingLocation) {
        showNotification("Headquarters established! As you complete repairs, you will earn XP and level up. Open your Player Profile (or Settings/Stats app) to view your skill tree and current statistics.", "success", 15000, "tutorial-toast-2");
        playerStats.tutorialStep = 2;
        
        setTimeout(() => {
            showNotification("⚠️ INTEL: You are on the radar. Rival corporations control the global market. Expand your empire carefully, and keep your illegal 'Heat' low, or the Feds will seize your properties without warning.", "error", 15000, "tutorial-toast-intel");
        }, 6000);
    }
}

// XP and Leveling Logic
window.addXP = function(amount) {
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (typeof playerStats.xp === "undefined") playerStats.xp = 0;
    if (typeof playerStats.level === "undefined") playerStats.level = 1;
    if (typeof playerStats.xpNeeded === "undefined") playerStats.xpNeeded = 100;
    if (typeof playerStats.skillPoints === "undefined") playerStats.skillPoints = 0;
    
    playerStats.xp += amount;
    
    let leveledUp = false;
    while (playerStats.xp >= playerStats.xpNeeded) {
        playerStats.xp -= playerStats.xpNeeded;
        playerStats.level += 1;
        playerStats.skillPoints += 1;
        playerStats.xpNeeded = Math.floor(playerStats.xpNeeded * 1.5);
        leveledUp = true;
    }
    
    if (leveledUp) {
        const nextMilestone = getNextLevelMilestone(playerStats.level - 1);
        showNotification(`LEVEL UP: ${getPlayerRank().name} — Level ${playerStats.level}. +1 Skill Point${nextMilestone && nextMilestone.level === playerStats.level ? `<br>${nextMilestone.text}.` : ""}`, "success");
    }
    
    renderPlayerProfile();
    saveGame();
};

window.renderPlayerProfile = function() {
    const levelEl = document.getElementById("profile-level");
    const spEl = document.getElementById("profile-sp");
    const xpBar = document.getElementById("profile-xp-bar");
    const xpText = document.getElementById("profile-xp-text");
    
    if (levelEl) levelEl.textContent = playerStats.level;
    if (spEl) spEl.textContent = playerStats.skillPoints;
    
    if (xpBar && xpText) {
        const percent = Math.min(100, Math.floor((playerStats.xp / playerStats.xpNeeded) * 100));
        xpBar.style.width = percent + "%";
        xpText.textContent = `${playerStats.xp} / ${playerStats.xpNeeded}`;
    }

    const rankEl = document.getElementById("profile-rank");
    const nextUnlockEl = document.getElementById("profile-next-unlock");
    const rank = getPlayerRank();
    const nextMilestone = getNextLevelMilestone();
    if (rankEl) rankEl.textContent = `RANK: ${rank.name.toUpperCase()}`;
    if (nextUnlockEl) nextUnlockEl.textContent = nextMilestone ? `NEXT: LVL ${nextMilestone.level} · ${nextMilestone.text.toUpperCase()}` : "ALL CORE MILESTONES REACHED";
    
    // Update skills
    const maxLevels = { greasemonkey: 5, smoothTalker: 5, ghost: 5, secondChance: 1 };
    ['greasemonkey', 'smoothTalker', 'ghost', 'secondChance'].forEach(skill => {
        const lvlEl = document.getElementById(`skill-${skill}-lvl`);
        const btn = document.getElementById(`upgrade-${skill}`);
        
        const currentLvl = playerStats.skills[skill] || 0;
        if (lvlEl) lvlEl.textContent = currentLvl;
        
        if (btn) {
            const isMaxed = currentLvl >= maxLevels[skill];
            if (isMaxed) {
                btn.textContent = "Max Level";
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else if (playerStats.skillPoints > 0) {
                btn.textContent = "Upgrade (1 SP)";
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            } else {
                btn.textContent = "Upgrade (1 SP)";
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
        }
    });
};

function renderDarkNetItems() {
    const container = document.getElementById("darknet-items-container");
    const searchInput = document.getElementById("darknet-search-input");
    if (!container) return;

    container.innerHTML = "";
    const filterText = searchInput ? searchInput.value.toLowerCase() : "";

    if (darknetActiveMarketTab === 'parts') {
        // Show category filters
        const filtersDiv = document.getElementById("darknet-parts-filters");
        if (filtersDiv) filtersDiv.classList.remove("hidden");

        Object.entries(catalog).forEach(([key, item]) => {
            if (item.brand !== "classX") return;
            if (darknetActiveCategory !== "All" && item.category !== darknetActiveCategory) return;
            if (filterText && !item.name.toLowerCase().includes(filterText)) return;

            const el = document.createElement("div");
            el.className = "store-item-card";
            // Force red styling for darknet
            el.style.borderLeftColor = "#ef4444";
            el.style.background = "rgba(153, 27, 27, 0.1)";

            const msrp = item.basePrice.toLocaleString();

            el.innerHTML = `
                <div class="store-item-info">
                    <span class="emoji">${item.emoji}</span>
                    <div class="details">
                        <div class="name" style="color: #ef4444;">${item.name}</div>
                        <div class="meta">Price: $${msrp}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; width: 100%; margin-top: 8px;">
                    <button class="btn btn-sm btn-danger buy-drone-btn darknet-buy-btn" data-part-id="${key}" style="flex: 1; background: #9f1239; border: 1px solid #e11d48; color: white;">
                        Drone (1m) - 55% Risk
                    </button>
                    <button class="btn btn-sm buy-smuggle-btn darknet-buy-btn" data-part-id="${key}" style="flex: 1; background: #1e293b; border: 1px solid #475569; color: white;">
                        Smuggle (5m) - 5% Risk
                    </button>
                </div>
            `;
            container.appendChild(el);

            const handleBuy = (duration, risk) => {
                if (money >= item.basePrice) {
                    money -= item.basePrice;
                    globalHeat += 10;
                    globalHeat = Math.max(0, Math.min(100, globalHeat));
                    activeDarkNetShipments.push({
                        id: Math.random().toString(36).substring(2, 9),
                        partId: key,
                        partName: item.name,
                        emoji: item.emoji,
                        progress: 0,
                        duration: duration,
                        risk: risk,
                        qty: 1,
                        completed: false,
                        interceptionCleared: false,
                        triggerThreshold: duration === 300000 ? Math.random() * (0.8 - 0.2) + 0.2 : 0.5
                    });
                    updateDarkNetButtonStates();
                    updateUI();
                    saveGame();
                } else {
                    triggerInsufficientFundsFeedback();
                    showNotification("Insufficient funds for this transaction.", "error");
                }
            };

            const droneBtn = el.querySelector(".buy-drone-btn");
            if (droneBtn) droneBtn.addEventListener("click", () => handleBuy(60000, 0.55));

            const smuggleBtn = el.querySelector(".buy-smuggle-btn");
            if (smuggleBtn) smuggleBtn.addEventListener("click", () => handleBuy(300000, 0.05));
        });

        updateDarkNetButtonStates();
    } else {
        // Show tools
        const filtersDiv = document.getElementById("darknet-parts-filters");
        if (filtersDiv) filtersDiv.classList.add("hidden");

        Object.entries(contrabandTools).forEach(([toolId, tool]) => {
            if (filterText && !tool.name.toLowerCase().includes(filterText)) return;

            const el = document.createElement("div");
            el.className = "store-item-card";
            el.style.borderLeftColor = "#ef4444";
            el.style.background = "rgba(153, 27, 27, 0.1)";

            const isOwned = ownedTools[toolId] === true;
            const msrp = tool.price.toLocaleString();

            el.innerHTML = `
                <div class="store-item-info">
                    <span class="emoji">${tool.emoji}</span>
                    <div class="details">
                        <div class="name" style="color: #ef4444;">${tool.name}</div>
                        <div class="meta" style="color: #94a3b8; font-size: 11px; margin-top: 2px;">${tool.description}</div>
                        <div class="meta" style="margin-top: 4px; font-weight: bold;">Price: $${msrp}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; width: 100%; margin-top: 8px;">
                    <button class="btn btn-sm tool-buy-btn" style="flex: 1; background: ${isOwned ? '#475569' : '#9f1239'}; border: 1px solid ${isOwned ? '#64748b' : '#e11d48'}; color: white;" ${isOwned ? 'disabled' : ''}>
                        ${isOwned ? 'Installed / Active ✓' : `Download & Install`}
                    </button>
                </div>
            `;
            container.appendChild(el);

            const buyBtn = el.querySelector(".tool-buy-btn");
            if (buyBtn && !isOwned) {
                buyBtn.addEventListener("click", () => {
                    if (money >= tool.price) {
                        money -= tool.price;
                        ownedTools[toolId] = true;
                        renderDarkNetItems();
                        updateUI();
                        saveGame();
                    } else {
                        triggerInsufficientFundsFeedback();
                        showNotification("Insufficient funds to download this application.", "error");
                    }
                });
            }
        });
    }
}

function updateDarkNetButtonStates() {
    // Both drone and smuggle buttons share the .darknet-buy-btn class and data-part-id
    document.querySelectorAll(".darknet-buy-btn").forEach(btn => {
        const partId = btn.getAttribute("data-part-id");
        const inTransit = activeDarkNetShipments.some(s => s.partId === partId);
        if (inTransit) {
            btn.disabled = true;
            btn.textContent = "In Transit";
            btn.style.backgroundColor = "#475569";
            btn.style.color = "#94a3b8";
        } else {
            btn.disabled = false;
            // Restore proper text based on class
            if (btn.classList.contains("buy-drone-btn")) {
                btn.textContent = "Drone (1m) - 55% Risk";
                btn.style.backgroundColor = "#9f1239";
                btn.style.color = "white";
            } else {
                btn.textContent = "Smuggle (5m) - 5% Risk";
                btn.style.backgroundColor = "#1e293b";
                btn.style.color = "white";
            }
        }
    });
}

function renderDarkNetShipments() {
    const container = document.getElementById("darknet-shipments-container");
    if (!container) return;

    if (activeDarkNetShipments.length === 0) {
        container.innerHTML = `<div style="color: #94a3b8; text-align: center; padding: 20px;">No encrypted packages in transit.</div>`;
        return;
    }

    let html = "";
    activeDarkNetShipments.forEach(s => {
        const threshold = s.triggerThreshold || 0.5;
        const progressPercentage = s.progress / s.duration;
        const isIntercepted = s.duration === 300000 && progressPercentage >= threshold && !s.interceptionCleared;
        const remaining = Math.max((s.duration - s.progress) / 1000, 0);
        const pct = Math.min((s.progress / s.duration) * 100, 100);

        const barColor = isIntercepted ? "#fbbf24" : "#ef4444";
        const metaText = isIntercepted ? "🚨 SIGNAL INTERCEPTED" : `ETA: ${remaining.toFixed(1)}s`;

        html += `
            <div class="store-item-card" style="border-left-color: ${barColor}; background: rgba(153, 27, 27, 0.1);">
                <div class="store-item-info" style="margin-bottom: 8px;">
                    <span class="emoji">${s.emoji}</span>
                    <div class="details">
                        <div class="name" style="color: #ef4444;">${s.partName}</div>
                        <div class="meta" style="color: ${isIntercepted ? '#fbbf24' : '#e2e8f0'};">${metaText}</div>
                    </div>
                </div>
                <div class="progress-bar-bg" style="width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden;">
                    <div class="progress-bar-fill" style="width: ${pct}%; height: 100%; background: ${barColor};"></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderDarkNetInventory() {
    const container = document.getElementById("darknet-inventory-container");
    if (!container) return;

    let html = "";
    let count = 0;
    Object.entries(inventory).forEach(([key, qty]) => {
        if (catalog[key].brand === "classX" && qty > 0) {
            count++;
            html += `
                <div class="store-item-card" style="border-left-color: #ef4444; background: rgba(153, 27, 27, 0.1); padding: 8px;">
                    <div class="store-item-info">
                        <span class="emoji" style="font-size: 1.2em;">${catalog[key].emoji}</span>
                        <div class="details">
                            <div class="name" style="color: #ef4444; font-size: 11px;">${catalog[key].name}</div>
                            <div class="meta" style="color: white; font-weight: bold;">Owned: ${qty}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    if (count === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; color: #94a3b8; text-align: center; padding: 20px;">Your stash is currently empty.</div>`;
    } else {
        container.innerHTML = html;
    }
}

// --- SMUGGLER GRID MINI-GAME ---
let smuggleTargets = [];
let smuggleClickedCorrect = [];
let smuggleGameActive = false;

function triggerSmuggleMiniGame() {
    const board = document.getElementById("smuggle-grid-board");
    const instructions = document.getElementById("smuggle-grid-instructions");
    const progressText = document.getElementById("smuggle-grid-progress");
    const timerText = document.getElementById("smuggle-grid-timer");
    const actionBtn = document.getElementById("smuggle-grid-action-btn");

    if (!board || !instructions || !progressText || !timerText || !actionBtn) return;

    smuggleGameActive = false;
    smuggleTargets = [];
    smuggleClickedCorrect = [];

    // Clear and build the grid
    board.innerHTML = "";
    progressText.textContent = "0 / 5";
    timerText.textContent = "1.5s";
    actionBtn.disabled = true;
    actionBtn.textContent = "Memorize Node Pattern...";
    actionBtn.style.borderColor = "#475569";
    instructions.textContent = "Secure connection intercepted. Memorize the 5 signal relays highlighted in green.";

    // Generate 5 unique random target indices between 0 and 24
    while (smuggleTargets.length < 5) {
        const idx = Math.floor(Math.random() * 25);
        if (!smuggleTargets.includes(idx)) {
            smuggleTargets.push(idx);
        }
    }

    // Create cells
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement("div");
        cell.className = "smuggle-cell";
        cell.setAttribute("data-index", i);

        // If it's a target, show it initially as revealed (green)
        if (smuggleTargets.includes(i)) {
            cell.classList.add("revealed");
        }

        board.appendChild(cell);
    }

    // Memorization phase countdown (1.5 seconds)
    let timeLeft = 1.5;
    const interval = setInterval(() => {
        timeLeft -= 0.5;
        if (timeLeft > 0) {
            timerText.textContent = `${timeLeft.toFixed(1)}s`;
        } else {
            clearInterval(interval);
            timerText.textContent = "ACTIVE";
            instructions.textContent = "Locate the 5 signal relays! A single trace detection (incorrect click) will compromise the cargo.";
            actionBtn.textContent = "Evasion Protocol Running";
            actionBtn.style.borderColor = "#ef4444";

            // Hide the green targets and enable clicking
            board.querySelectorAll(".smuggle-cell").forEach(cell => {
                cell.classList.remove("revealed");
            });
            smuggleGameActive = true;
        }
    }, 500);

    // Click handler for cells
    board.querySelectorAll(".smuggle-cell").forEach(cell => {
        cell.addEventListener("click", () => {
            if (!smuggleGameActive) return;

            const idx = parseInt(cell.getAttribute("data-index"));
            if (cell.classList.contains("correct") || cell.classList.contains("incorrect")) return;

            if (smuggleTargets.includes(idx)) {
                // Correct click!
                cell.classList.add("correct");
                if (!smuggleClickedCorrect.includes(idx)) {
                    smuggleClickedCorrect.push(idx);
                }
                progressText.textContent = `${smuggleClickedCorrect.length} / 5`;

                if (smuggleClickedCorrect.length === 5) {
                    // WIN
                    smuggleGameActive = false;
                    setTimeout(() => {
                        showNotification("Evasion successful! Proceeding to destination.", "success");
                        resolveSmuggleMiniGame(true);
                    }, 100);
                }
            } else {
                // Incorrect click! LOSS
                cell.classList.add("incorrect");
                smuggleGameActive = false;
                setTimeout(() => {
                    showNotification("FEDERAL INTERCEPTION!<br><br>Signal trace complete. Your smuggler shipment was seized.<br>You have been fined $10,000.", "error");
                    resolveSmuggleMiniGame(false);
                }, 100);
            }
        });
    });
}

function resolveSmuggleMiniGame(success) {
    const modal = document.getElementById("smuggle-grid-modal");
    if (modal) modal.classList.add("hidden");

    smuggleState.active = false;

    if (success) {
        if (activeSmuggleDelivery) {
            activeSmuggleDelivery.interceptionCleared = true;
            activeSmuggleDelivery = null;
        }
    } else {
        if (activeSmuggleDelivery) {
            // Deduct fine
            money -= 10000;
            // Delete delivery
            activeDarkNetShipments = activeDarkNetShipments.filter(s => s.id !== activeSmuggleDelivery.id);
            activeSmuggleDelivery = null;
        }
    }

    updateDarkNetButtonStates();
    updateUI();
    saveGame();
}

function updateHeat(dt) {
    if (isGamePaused) return;

    let partCount = 0;
    Object.entries(inventory).forEach(([key, qty]) => {
        if (key.includes("Class X") && qty > 0) {
            partCount += qty;
        }
    });

    let heatGenMult = 1.0;
    if (playerStats.skills && playerStats.skills.ghost) {
        heatGenMult -= (0.1 * playerStats.skills.ghost); // -10% per level
    }

    const securityMultiplier = Math.max(0.5, 1 - ((businessUpgrades.security || 0) * 0.12));
    globalHeat += (partCount * HEAT_PER_PART * (dt / 1000)) * heatGenMult * securityMultiplier;
    globalHeat -= (0.01 * (dt / 1000));
    globalHeat = Math.max(0, Math.min(100, globalHeat));

    // Check lockdown condition
    if (globalHeat >= 100 && !isIllicitLocked) {
        lockdownApps();
    }
}

function lockdownApps() {
    isIllicitLocked = true;
    lockdownTimeRemaining = 300000; // 5 minutes in ms
    globalHeat = 0; // reset globalHeat to 0 as required

    const illicitApps = ['icon-darknet', 'icon-streetracehub'];
    illicitApps.forEach(appId => {
        const el = document.getElementById(appId);
        if (el) el.classList.add("locked-app");
    });
    const globalNotif = document.getElementById("global-lockdown-notification");
    if (globalNotif) globalNotif.classList.remove("hidden");

    updateUI();
    saveGame();
}

function unlockApps() {
    isIllicitLocked = false;
    document.querySelectorAll(".locked-app").forEach(el => {
        el.classList.remove("locked-app");
    });
    const globalNotif = document.getElementById("global-lockdown-notification");
    if (globalNotif) globalNotif.classList.add("hidden");
    showNotification("[ SYSTEM STATUS: FBI INVESTIGATION CLOSED. ACCESS RESTORED. ]", "success");
    saveGame();
}

// --- SALVAGE MAP ENGINE ---
function closeSalvageMap() {
    document.getElementById("location-salvagemap").classList.add("hidden");
    document.getElementById("salvage-loot-modal").classList.add("hidden");
}

function closeSalvageLootModal() {
    document.getElementById("salvage-loot-modal").classList.add("hidden");
}

let activeSalvageStock = [];

function searchSalvageZone(targetClass, fee) {
    if (money < fee) {
        showNotification("Not enough funds for this expedition.", "error");
        return;
    }

    // Deduct fee
    money -= fee;
    updateUI();
    saveGame();

    // Filter catalog for matching class
    const matchingParts = Object.entries(catalog).filter(([key, part]) => part.brand === targetClass);

    // Shuffle and pick 3-5 random items
    matchingParts.sort(() => 0.5 - Math.random());
    const numItems = Math.floor(Math.random() * 3) + 3; // 3 to 5
    const selected = matchingParts.slice(0, numItems);

    activeSalvageStock = selected.map(([key, part]) => {
        // Calculate huge discount (20% to 50% of basePrice)
        const discountMult = 0.2 + (Math.random() * 0.3);
        let junkPrice = Math.floor(part.basePrice * discountMult);
        if (junkPrice < 1) junkPrice = 1;

        return { key, part, junkPrice };
    });

    renderSalvageLoot();
    document.getElementById("salvage-loot-modal").classList.remove("hidden");
}

function renderSalvageLoot() {
    const listEl = document.getElementById("salvage-loot-list");
    listEl.innerHTML = "";

    if (activeSalvageStock.length === 0) {
        listEl.innerHTML = "<p style='color: #94a3b8;'>No salvageable parts found in this sector...</p>";
        return;
    }

    activeSalvageStock.forEach((item, index) => {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid #334155; border-radius: 6px;";
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">${item.part.emoji}</div>
                <div>
                    <div style="color: #e2e8f0; font-weight: 600;">${item.part.name}</div>
                    <div style="color: #94a3b8; font-size: 12px; text-decoration: line-through;">MSRP: $${item.part.basePrice.toLocaleString()}</div>
                </div>
            </div>
            <button class="btn btn-salvage" id="salvage-btn-${index}">Salvage ($${item.junkPrice.toLocaleString()})</button>
        `;
        listEl.appendChild(div);

        const btn = div.querySelector(`#salvage-btn-${index}`);
        btn.addEventListener("click", () => {
            if (money >= item.junkPrice) {
                money -= item.junkPrice;
                inventory[item.key] = (inventory[item.key] || 0) + 1;
                btn.textContent = "Acquired";
                btn.disabled = true;
                btn.style.backgroundColor = "transparent";
                btn.style.border = "1px solid #10b981";
                btn.style.color = "#10b981";
                updateUI();
                saveGame();
            } else {
                showNotification("Insufficient funds.", "error");
            }
        });
    });
}

// --- FBI SECURITY SCAN ---
function triggerFbiScan() {
    const warningBanner = document.getElementById("fbi-imminent-warning");
    if (warningBanner) warningBanner.classList.add("hidden");
    document.body.classList.remove("pulse-red-border");

    isGamePaused = true;
    const modal = document.getElementById("fbi-scan-modal");
    const statusEl = document.getElementById("fbi-scan-status");
    const resultsEl = document.getElementById("fbi-scan-results");
    const ackBtn = document.getElementById("fbi-acknowledge-btn");

    modal.classList.remove("hidden");
    statusEl.style.color = "#38bdf8";
    statusEl.textContent = "SCANNING INVENTORY...";
    resultsEl.style.color = "#94a3b8";
    resultsEl.innerHTML = "Please stand by. Initiating deep packet inspection.";
    ackBtn.classList.add("hidden");

    setTimeout(() => {
        let illegalCount = 0;
        Object.entries(inventory).forEach(([key, qty]) => {
            if (key.includes("Class X") && qty > 0) {
                illegalCount += qty;
                inventory[key] = 0; // Confiscate
            }
        });

        if (illegalCount > 0) {
            const fine = illegalCount * 5000;
            money -= fine;
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "CONTRABAND DETECTED!";
            resultsEl.style.color = "#ef4444";
            resultsEl.innerHTML = `FBI Agents have raided your shop.<br><br><b>${illegalCount}</b> illegal parts were confiscated.<br>Fine issued: <b>-$${fine.toLocaleString()}</b>`;
            ackBtn.classList.remove("hidden");
        } else {
            statusEl.style.color = "#10b981";
            statusEl.textContent = "SCAN COMPLETE";
            resultsEl.style.color = "#10b981";
            resultsEl.innerHTML = "No contraband detected. Have a nice day.";
            setTimeout(() => {
                modal.classList.add("hidden");
                isGamePaused = false;
            }, 2000);
        }
        updateUI();
        saveGame();
    }, 3000);
}

function alignDesktopIcons() {
    const allIcons = Array.from(document.querySelectorAll('.desktop-icon'));
    
    // Filter out elements that are currently set to display: none
    const visibleIcons = allIcons.filter(icon => {
        const style = window.getComputedStyle(icon);
        return style.display !== 'none' && !icon.classList.contains('hidden-app');
    });

    const GRID_WIDTH = 110;  // Tighter horizontal spacing
    const GRID_HEIGHT = 100; // Much tighter vertical spacing
    const PADDING_TOP = 15;
    const PADDING_LEFT = 15;
    
    // Keep track of occupied slots to prevent stacking
    const occupiedSlots = new Set();
    let iconData = {};
    
    visibleIcons.forEach(icon => {
        // 1. Strip conflicting CSS properties
        icon.style.right = 'auto';
        icon.style.bottom = 'auto';
        
        // Get current position
        let currentLeft = icon.offsetLeft;
        let currentTop = icon.offsetTop;
        
        // Calculate nearest grid column and row
        let col = Math.round((currentLeft - PADDING_LEFT) / GRID_WIDTH);
        let row = Math.round((currentTop - PADDING_TOP) / GRID_HEIGHT);
        
        // Prevent moving off-screen (minimum column/row is 0)
        col = Math.max(0, col);
        row = Math.max(0, row);
        
        // Overlap resolution: If someone is already in this slot, bump down until we find an empty one
        while (occupiedSlots.has(`${col},${row}`)) {
            row++; 
        }
        
        // Mark this slot as taken
        occupiedSlots.add(`${col},${row}`);
        
        // Calculate exact pixel position for this slot
        let finalLeft = PADDING_LEFT + (col * GRID_WIDTH);
        let finalTop = PADDING_TOP + (row * GRID_HEIGHT);
        
        // Apply the new snapped coordinates
        icon.style.left = finalLeft + 'px';
        icon.style.top = finalTop + 'px';
        icon.style.position = 'absolute';

        iconData[icon.id] = { left: finalLeft + 'px', top: finalTop + 'px' };
    });
    localStorage.setItem('mechanicOS_icons', JSON.stringify(iconData));
}

function arrangeDefaultDesktop() {
    const icons = document.querySelectorAll('.desktop-icon');
    const PADDING_TOP = 20;
    const PADDING_LEFT = 20;
    const VERTICAL_SPACING = 110; 
    
    // Filter for visible apps only
    const visibleIcons = Array.from(icons).filter(icon => {
        return window.getComputedStyle(icon).display !== 'none';
    });
    
    // Force a single strict vertical column
    visibleIcons.forEach((icon, index) => {
        icon.style.position = 'absolute';
        icon.style.left = PADDING_LEFT + 'px';
        icon.style.top = (PADDING_TOP + (index * VERTICAL_SPACING)) + 'px';
    });
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const buildDisplay = document.getElementById('build-version-display');
    if (buildDisplay) buildDisplay.innerText = "MechanicOS Evaluation Copy. Build " + BUILD_VERSION;

    initCharts();
    initWindowManager();
    updateMarketPrices(); // Initializes market values and renders ScrapNet exchange immediately

    const bugTrackerForm = document.getElementById("bugtracker-form");
    if (bugTrackerForm) {
        bugTrackerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById("bugtracker-submit-btn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
            }

            const issueType = document.getElementById('issueType').value;
            const playerName = document.getElementById('playerName').value;
            const description = document.getElementById('description').value;
            const configuredEndpoint = window.CARMECHANICOS_CONFIG?.bugTracker?.endpoint;

            const resetSubmitButton = () => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit Ticket";
                }
            };

            if (!configuredEndpoint) {
                showNotification("BugTracker is disabled until a protected reporting endpoint is configured.", "error", 7000);
                resetSubmitButton();
                return;
            }

            let endpointUrl;
            try {
                endpointUrl = new URL(configuredEndpoint, window.location.origin);
                const sameOrigin = endpointUrl.origin === window.location.origin;
                const isSecureRemoteEndpoint = endpointUrl.protocol === "https:";
                const isDiscordWebhook = endpointUrl.hostname === "discord.com" || endpointUrl.hostname.endsWith(".discord.com");
                if ((!sameOrigin && !isSecureRemoteEndpoint) || isDiscordWebhook) throw new Error("BugTracker endpoint must be a protected same-origin or HTTPS proxy.");
            } catch (error) {
                console.error("Invalid BugTracker endpoint:", error);
                showNotification("BugTracker is not configured with a valid secure endpoint.", "error", 7000);
                resetSubmitButton();
                return;
            }

            const payload = {
                embeds: [{
                    title: `New Bug Report: ${String(issueType || "Uncategorized").slice(0, 80)}`,
                    color: 16711680,
                    fields: [
                        { name: "Reporter Name", value: String(playerName || "Anonymous").slice(0, 120), inline: true },
                        { name: "Description", value: String(description || "No description provided").slice(0, 2000) },
                        { name: "Diagnostic", value: "```json\n" + JSON.stringify({ heat: globalHeat, inventory: inventory }, null, 2).substring(0, 1000) + "\n```" }
                    ]
                }]
            };

            try {
                const response = await fetch(endpointUrl.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                bugTrackerForm.reset();
                const successMsg = document.getElementById("bugtracker-success");
                if (successMsg) {
                    successMsg.classList.remove("hidden");
                    setTimeout(() => successMsg.classList.add("hidden"), 4000);
                }
            } catch (error) {
                console.error("BugTracker Submission Error:", error);
                showNotification("Failed to send bug report. Please verify your connection or try again later.", "error");
            } finally {
                resetSubmitButton();
            }
        });
    }

    loadGame(); // Load the saved game state
    window.evaluateProgression(); // Ensure core apps are unlocked if business is owned
    
    // Trigger tutorial sequence on fresh load
    runTutorial();
    
    loadIconStates(); // Load desktop icon coordinates
    switchStoreTab('classA'); // Pre-populate Store Items for Class A (Economy)
    renderDarkNetItems(); // Populate DarkNet items
    populateDevConsoleParts(); // Fill parts injector select options

    // Bind search input
    const storeSearchInput = document.getElementById("store-search-input");
    if (storeSearchInput) {
        storeSearchInput.addEventListener("input", () => {
            renderStoreItems();
        });
    }

    const darkNetSearchInput = document.getElementById("darknet-search-input");
    if (darkNetSearchInput) {
        darkNetSearchInput.addEventListener("input", () => {
            renderDarkNetItems();
        });
    }

    // Bind DarkNet Category Filters
    document.querySelectorAll(".darknet-filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".darknet-filter-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            darknetActiveCategory = e.target.getAttribute("data-category");
            renderDarkNetItems();
        });
    });

    // Bind DarkNet Market Sub-Tabs
    const tabParts = document.getElementById("darknet-tab-parts");
    const tabTools = document.getElementById("darknet-tab-tools");

    if (tabParts && tabTools) {
        tabParts.addEventListener("click", () => {
            darknetActiveMarketTab = 'parts';
            tabParts.classList.add("active");
            tabParts.style.background = "#ef4444";
            tabParts.style.color = "white";

            tabTools.classList.remove("active");
            tabTools.style.background = "transparent";
            tabTools.style.color = "#ef4444";

            renderDarkNetItems();
        });

        tabTools.addEventListener("click", () => {
            darknetActiveMarketTab = 'tools';
            tabTools.classList.add("active");
            tabTools.style.background = "#ef4444";
            tabTools.style.color = "white";

            tabParts.classList.remove("active");
            tabParts.style.background = "transparent";
            tabParts.style.color = "#ef4444";

            renderDarkNetItems();
        });
    }

    // Bind FBI Exit
    document.getElementById("fbi-acknowledge-btn")?.addEventListener("click", () => {
        document.getElementById("fbi-scan-modal").classList.add("hidden");
        isGamePaused = false;
    });

    // Bind Dev FBI Trigger
    document.getElementById("dev-btn-trigger-fbi")?.addEventListener("click", () => {
        triggerFbiScan();
    });

    // Bind Dev Force Scan Warning
    document.getElementById("dev-btn-force-warning")?.addEventListener("click", () => {
        ownedTools.policeScanner = true;
        isIllicitLocked = false;
        fbiScanTimer = nextFbiScanThreshold - 30000;
        updateUI();
    });

    // Bind Workspace Cleanup
    document.getElementById("cleanup-windows-btn")?.addEventListener("click", () => {
        alignDesktopIcons();
    });

    // Bind Upgrade Buttons
    ['greasemonkey', 'smoothTalker', 'scavenger'].forEach(skill => {
        const btn = document.getElementById(`upgrade-${skill}`);
        if (btn) {
            btn.addEventListener('click', () => {
                if (playerStats.skillPoints > 0) {
                    playerStats.skillPoints -= 1;
                    playerStats.skills[skill] = (playerStats.skills[skill] || 0) + 1;
                    renderPlayerProfile();
                    saveGame();
                    showNotification(`Skill upgraded! ${skill} is now Level ${playerStats.skills[skill]}`, "success");
                }
            });
        }
    });

    // Bind DarkNet Tabs
    document.querySelectorAll(".darknet-tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".darknet-tab-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");

            document.getElementById("darknet-view-market")?.classList.add("hidden");
            document.getElementById("darknet-view-transit")?.classList.add("hidden");
            document.getElementById("darknet-view-stash")?.classList.add("hidden");
            document.getElementById("darknet-view-sabotage")?.classList.add("hidden");
            document.getElementById("darknet-view-decryption")?.classList.add("hidden");

            const targetId = e.target.getAttribute("data-target");
            document.getElementById(targetId)?.classList.remove("hidden");
            
            if (targetId === "darknet-view-sabotage" && typeof window.renderDarknetSabotage === "function") {
                window.renderDarknetSabotage();
            }
            if (targetId === "darknet-view-decryption" && typeof window.renderDarknetDecryption === "function") {
                window.renderDarknetDecryption();
            }
        });
    });

    // Initialize Logistics App
    renderLogisticsRegions();
    renderLogisticsDetail();

    // Initialize Global Map Phase 1
    initGlobalMap();

    updateUI();
    updateTutorial();
});

// --- GLOBAL MAP PHASE 1 ---
function initGlobalMap() {
    const mapMarkersContainer = document.getElementById("global-map-markers");
    if (!mapMarkersContainer) return;

    // Click-away logic for popover dismissal
    const mapContainer = document.querySelector(".global-businesses-content");
    if (mapContainer) {
        mapContainer.addEventListener("click", (e) => {
            if (!e.target.classList.contains("gmap-marker") && !e.target.closest("#global-map-sidebar")) {
                const popover = document.getElementById("global-map-sidebar");
                if (popover) popover.style.display = "none";
                document.querySelectorAll(".gmap-marker").forEach(m => m.classList.remove("active"));
                // We do not clear selectedLocation so if they click Purchase it doesn't break, 
                // but the prompt asked to just dismiss the popover visually.
            }
        });
    }

    // The locations array has been moved to the global scope.

    // selectedLocation and hasPurchasedBusiness moved to global scope

    const btnViewMap = document.getElementById("btn-view-map");
    const btnViewPortfolio = document.getElementById("btn-view-portfolio");
    const mapViewContainer = document.getElementById("map-view-container");
    const portfolioViewContainer = document.getElementById("portfolio-view-container");

    if (btnViewMap && btnViewPortfolio) {
        btnViewPortfolio.addEventListener("click", () => {
            mapViewContainer.style.display = "none";
            portfolioViewContainer.style.display = "flex";
            btnViewMap.style.background = "#0f172a";
            btnViewMap.style.color = "white";
            btnViewPortfolio.style.background = "#38bdf8";
            btnViewPortfolio.style.color = "black";
            if (typeof window.renderPortfolio === "function") window.renderPortfolio();
        });

        btnViewMap.addEventListener("click", () => {
            portfolioViewContainer.style.display = "none";
            mapViewContainer.style.display = "block";
            btnViewPortfolio.style.background = "#0f172a";
            btnViewPortfolio.style.color = "white";
            btnViewMap.style.background = "#38bdf8";
            btnViewMap.style.color = "black";
        });
    }

    // DEBUG: Coordinate overlay - hover over map to see exact x,y percentages
    const debugLabel = document.createElement('div');
    debugLabel.style.cssText = 'position:absolute;top:4px;left:4px;color:#fbbf24;font-size:11px;font-family:monospace;z-index:100;pointer-events:none;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;';
    debugLabel.textContent = 'Hover map for X,Y %';
    mapMarkersContainer.parentElement.appendChild(debugLabel);
    mapMarkersContainer.parentElement.addEventListener('mousemove', (e) => {
        const rect = mapMarkersContainer.parentElement.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const yPct = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        debugLabel.textContent = `X: ${xPct}%  Y: ${yPct}%`;
    });

    mapMarkersContainer.parentElement.addEventListener('click', (e) => {
        if (e.target.classList.contains("gmap-marker")) return;
        const rect = mapMarkersContainer.parentElement.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const yPct = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        console.log(`{ name: 'New Location', owner: 'neutral', top: ${yPct}, left: ${xPct}, price: 50000 },`);
    });

    window.refreshGlobalMapMarkers = function() {
        // Clear existing markers except debug label
        Array.from(mapMarkersContainer.children).forEach(child => {
            if (child.classList.contains("gmap-marker")) {
                child.remove();
            }
        });

        // Determine if player has purchased a business
        if (playerStats.startingLocation) {
            hasPurchasedBusiness = true;
        }

        locations.forEach(loc => {
            const marker = document.createElement("div");
            marker.className = "gmap-marker";
            
            if (loc.owner && factions[loc.owner]) {
                marker.style.backgroundColor = factions[loc.owner].color;
                if (loc.owner === "seized") {
                    marker.style.boxShadow = "0 0 10px #ef4444";
                    marker.style.border = "2px solid white";
                } else if (loc.owner !== "neutral") {
                    marker.style.boxShadow = `0 0 5px ${factions[loc.owner].color}`;
                }
            }

            marker.style.top = `${loc.top}%`;
            marker.style.left = `${loc.left}%`;
            marker.title = `${loc.name} (${loc.owner && factions[loc.owner] ? factions[loc.owner].name : 'Unknown'})`;

            marker.addEventListener("mousedown", (e) => {
                e.preventDefault();
                
                const mapContainer = mapMarkersContainer.parentElement;
                let isDragging = true;

                const onMouseMove = (moveEvent) => {
                    if (!isDragging) return;
                    const mapRect = mapContainer.getBoundingClientRect();
                    let newLeftPercent = ((moveEvent.clientX - mapRect.left) / mapRect.width) * 100;
                    let newTopPercent = ((moveEvent.clientY - mapRect.top) / mapRect.height) * 100;
                    
                    marker.style.left = `${newLeftPercent}%`;
                    marker.style.top = `${newTopPercent}%`;
                };

                const onMouseUp = (upEvent) => {
                    if (!isDragging) return;
                    isDragging = false;
                    
                    const mapRect = mapContainer.getBoundingClientRect();
                    let newLeftPercent = ((upEvent.clientX - mapRect.left) / mapRect.width) * 100;
                    let newTopPercent = ((upEvent.clientY - mapRect.top) / mapRect.height) * 100;
                    
                    console.log(`Updated Location Code:`);
                    console.log(`{ id: "${loc.id}", name: "${loc.name}", owner: "${loc.owner}", price: ${loc.cost}, top: ${newTopPercent.toFixed(1)}, left: ${newLeftPercent.toFixed(1)} },`);
                    
                    loc.left = parseFloat(newLeftPercent.toFixed(1));
                    loc.top = parseFloat(newTopPercent.toFixed(1));
                    if (typeof window.renderSupplyRoutes === "function") window.renderSupplyRoutes();

                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            marker.addEventListener("click", () => {
                // Highlight selected marker
                document.querySelectorAll(".gmap-marker").forEach(m => m.classList.remove("active"));
                marker.classList.add("active");

                // Update Sidebar
                selectedLocation = loc;
                const popover = document.getElementById("global-map-sidebar");
                const mapContainer = document.querySelector(".global-businesses-content");

                popover.style.display = "flex";
                document.getElementById("global-map-location-info").style.display = "flex";

                // Calculate popover position
                let leftPos = marker.offsetLeft + 25;
                let topPos = marker.offsetTop - 20;

                // Edge Case: Right side bounds check
                if (leftPos + 260 > mapContainer.offsetWidth) {
                    leftPos = marker.offsetLeft - 260 - 15;
                }
                const popoverHeight = popover.offsetHeight || 280;
                if (topPos + popoverHeight > mapContainer.offsetHeight) {
                    topPos = mapContainer.offsetHeight - popoverHeight - 10;
                }

                popover.style.left = leftPos + 'px';
                popover.style.top = topPos + 'px';

                document.getElementById("gmap-loc-name").textContent = loc.name;
                document.getElementById("gmap-loc-cost").textContent = `$${loc.cost.toLocaleString()}`;
                document.getElementById("gmap-loc-rent").textContent = `$${loc.rent}`;
                document.getElementById("gmap-loc-classes").textContent = loc.classes.join(", ");
                document.getElementById("gmap-loc-bonuses").textContent = loc.bonus;
                document.getElementById("gmap-loc-diff").textContent = loc.difficulty;

                const btn = document.getElementById("gmap-purchase-btn");
                
                let actualCost = loc.cost;
                if (loc.owner !== "neutral" && loc.owner !== "player" && loc.owner !== "seized") {
                    actualCost = loc.cost * 3; // Hostile Takeover
                }
                
                document.getElementById("gmap-loc-cost").textContent = `$${actualCost.toLocaleString()}`;
                
                if (loc.owner === "locked") {
                    btn.textContent = "Encrypted - Check DarkNet";
                    btn.disabled = true;
                    btn.style.opacity = "0.5";
                } else if (loc.owner === "seized") {
                    btn.textContent = "Property Locked (FBI)";
                    btn.disabled = true;
                    btn.style.opacity = "0.5";
                } else if (loc.owner === "player") {
                    btn.textContent = "Owned";
                    btn.disabled = true;
                    btn.style.opacity = "0.5";
                } else if (money < actualCost) {
                    btn.textContent = `Insufficient Funds ($${actualCost.toLocaleString()})`;
                    btn.disabled = false;
                    btn.dataset.cost = actualCost;
                    btn.style.opacity = "0.5";
                } else {
                    if (loc.owner === "neutral") {
                        btn.textContent = `Purchase Business License ($${actualCost.toLocaleString()})`;
                    } else {
                        btn.textContent = `Hostile Takeover ($${actualCost.toLocaleString()})`;
                    }
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.dataset.cost = actualCost;
                }
            });

            mapMarkersContainer.appendChild(marker);
        });
    };

    window.refreshGlobalMapMarkers();
    if (typeof window.generateSupplyRoutes === "function") window.generateSupplyRoutes();
    if (typeof window.renderSupplyRoutes === "function") window.renderSupplyRoutes();

    const purchaseBtn = document.getElementById("gmap-purchase-btn");
    purchaseBtn.addEventListener("click", () => {
        if (!selectedLocation || selectedLocation.owner === "player" || selectedLocation.owner === "seized") return;
        
        const actualCost = parseInt(purchaseBtn.dataset.cost) || selectedLocation.cost;

        // Balance Check
        if (money >= actualCost) {
            // Deduct the cost
            money -= actualCost;

            // Announce Hostile Takeover
            if (selectedLocation.owner !== "neutral") {
                const oldOwnerName = factions[selectedLocation.owner] ? factions[selectedLocation.owner].name : selectedLocation.owner;
                if (typeof window.updateNewsTicker === "function") {
                    window.updateNewsTicker(`📉 CORPORATE BUYOUT: The player has aggressively acquired ${selectedLocation.name} from ${oldOwnerName} in a massive hostile takeover!`);
                }
                globalHeat += 10;
                globalHeat = Math.max(0, Math.min(100, globalHeat));
                selectedLocation.stability = 100;
            }

            selectedLocation.owner = "player";
            hasPurchasedBusiness = true;

            // Save to player profile
            if (!playerStats.startingLocation) {
                playerStats.startingLocation = selectedLocation.id;
            }
            playerStats.locationRent = selectedLocation.rent;
            playerStats.locationClasses = selectedLocation.classes.join(", ");
            playerStats.locationBonuses = selectedLocation.bonus;

            window.refreshGlobalMapMarkers();
            
            // Re-trigger click on the current marker to update the popover button
            const activeMarker = document.querySelector(".gmap-marker.active");
            if (activeMarker) activeMarker.click();
            
            window.evaluateProgression();
            // Wipe the existing job board and generate new ones for the new tier
            if (customerQueue.length === 0) {
                for (let i = 0; i < 4; i++) {
                    spawnNewCustomerOrder();
                }
            }

            renderTaskbar();
            updateUI();
            
            if (playerStats.tutorialStep === 1) {
                playerStats.tutorialStep = 2;
                runTutorial();
            }
            
            saveGame();
            showNotification(`Congratulations! You have acquired ${selectedLocation.name}.`, "success");
        } else {
            // Player is broke
            triggerInsufficientFundsFeedback();
            showNotification("INSUFFICIENT FUNDS: You need $" + actualCost.toLocaleString() + " to purchase this location.", "error");
        }
    });
}

document.addEventListener("click", (e) => {
    if (e.target.id && e.target.id.startsWith("upgrade-")) {
        const skill = e.target.id.replace("upgrade-", "");
        const maxLevels = { greasemonkey: 5, smoothTalker: 5, ghost: 5, secondChance: 1 };
        
        if (maxLevels[skill] && playerStats.skillPoints > 0) {
            const currentLvl = playerStats.skills[skill] || 0;
            if (currentLvl < maxLevels[skill]) {
                playerStats.skills[skill] = currentLvl + 1;
                playerStats.skillPoints -= 1;
                renderPlayerProfile();
                saveGame();
                showNotification(`Upgraded ${skill} to Level ${playerStats.skills[skill]}`, "success");
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const colorPicker = document.getElementById("player-color-picker");
    if (colorPicker) {
        // Load existing color if available
        if (factions["player"]) {
            colorPicker.value = factions["player"].color;
        }

        colorPicker.addEventListener("change", (e) => {
            const newColor = e.target.value.toLowerCase();
            if (factions["player"]) {
                factions["player"].color = newColor;
            } else {
                factions["player"] = { id: "player", name: "Your Empire", color: newColor };
            }

            // Backup colors for AI rebranding
            const backupColors = ["#fbcfe8", "#bef264", "#5eead4", "#fca5a5", "#d8b4fe"]; 
            let backupIndex = 0;

            // Check all factions (excluding the player and neutral)
            for (const key in factions) {
                if (key === "player" || key === "neutral" || key === "seized") continue;
                
                // If the AI's color matches the player's new color
                if (factions[key].color.toLowerCase() === newColor) {
                    factions[key].color = backupColors[backupIndex];
                    backupIndex = (backupIndex + 1) % backupColors.length;
                    
                    if (typeof updateNewsTicker === 'function') {
                        updateNewsTicker(`CORPORATE REBRAND: ${factions[key].name} announces new corporate colors following trademark dispute.`);
                    }
                }
            }
            
            if (typeof window.refreshGlobalMapMarkers === "function") {
                window.refreshGlobalMapMarkers();
            }
            if (typeof window.renderSupplyRoutes === "function") {
                window.renderSupplyRoutes();
            }
            saveGame();
        });
    }
});

window.renderPortfolio = function() {
    const container = document.getElementById('portfolio-view-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const myProperties = locations.filter(loc => loc.owner === "player");
    
    if (myProperties.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; font-size: 14px; text-align: center; width: 100%; padding: 20px;">You do not own any businesses. Return to the map to expand your empire.</div>';
        return;
    }
    
    myProperties.forEach(loc => {
        const card = document.createElement('div');
        card.className = 'portfolio-card';
        card.style.borderLeft = `5px solid ${factions["player"] ? factions["player"].color : '#38bdf8'}`;
        card.style.background = 'rgba(15, 23, 42, 0.8)';
        card.style.border = '1px solid #334155';
        card.style.borderRadius = '4px';
        card.style.padding = '15px';
        card.style.width = '100%';
        
        const repairCost = 5000;
        const isDamaged = loc.stability < 100;
        
        card.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: white;">${loc.name}</h3>
            <p style="margin: 5px 0; font-size: 13px; color: #cbd5e1;"><strong>Difficulty:</strong> ${loc.difficulty}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #cbd5e1;"><strong>Daily Rent:</strong> $${loc.rent}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #4ade80;"><strong>Local Funds:</strong> $${loc.funds || 0}</p>
            <p style="margin: 5px 0; font-size: 13px; color: ${loc.heat > 50 ? '#ef4444' : '#cbd5e1'};"><strong>Heat Level:</strong> ${loc.heat || 0}%</p>
            <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;"><span>Stability</span><span>${loc.stability}%</span></div>
                <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; margin-bottom: 10px;">
                    <div style="width: ${loc.stability}%; height: 100%; background: ${loc.stability > 50 ? '#10b981' : '#ef4444'}; border-radius: 4px; transition: width 0.3s;"></div>
                </div>
                <div class="business-upgrades-box">
                    <div class="business-upgrades-title">BUSINESS DEVELOPMENT</div>
                    <div class="business-upgrades-grid">
                        ${[
                            ["lift", "🔧", "Repair Lift", "Adds repair throughput"],
                            ["storage", "📦", "Parts Storage", "Adds shipment capacity"],
                            ["security", "🛡️", "Security", "Reduces heat generation"]
                        ].map(([id, icon, name, description]) => `<button class="business-upgrade-btn" onclick="window.purchaseBusinessUpgrade('${id}')"><span>${icon} ${name} Lv.${businessUpgrades[id] || 0}</span><small>${description}<br>$${getBusinessUpgradeCost(id).toLocaleString()}</small></button>`).join("")}
                    </div>
                </div>
                ${loc.extractionActive ? 
                `<button class="btn btn-extraction" disabled style="width: 100%; padding: 6px; font-size: 12px; background: #ef4444; color: white; border: none; font-weight: bold; cursor: not-allowed;">
                    Emergency Extraction (0:59)
                </button>` :
                `<button class="btn btn-restore-stability" data-id="${loc.id}" ${(!isDamaged || money < repairCost) ? 'disabled' : ''} style="width: 100%; padding: 6px; font-size: 12px; background: ${(!isDamaged || money < repairCost) ? '#334155' : '#38bdf8'}; color: ${(!isDamaged || money < repairCost) ? '#94a3b8' : '#0f172a'}; border: none; font-weight: bold; cursor: ${(!isDamaged || money < repairCost) ? 'not-allowed' : 'pointer'};">
                    Restore Stability (-$${repairCost.toLocaleString()})
                </button>`
                }
            </div>
        `;
        container.appendChild(card);
    });

    container.onclick = (e) => {
        const btn = e.target.closest('.btn-restore-stability');
        if (!btn || btn.disabled) return;
        
        const locId = btn.getAttribute('data-id');
        const loc = locations.find(l => l.id === locId);
        const repairCost = 5000;
        
        if (loc && money >= repairCost && loc.stability < 100) {
            money -= repairCost;
            loc.stability = Math.min(100, loc.stability + 25);
            updateUI();
            window.renderPortfolio();
            if (typeof window.refreshGlobalMapMarkers === "function") window.refreshGlobalMapMarkers();
            saveGame();
        }
    };
};

window.renderDarknetDecryption = function() {
    const container = document.getElementById('darknet-decryption-container');
    if (!container) return;
    container.innerHTML = '';
    
    const lockedLocs = locations.filter(l => l.owner === "locked");
    if (lockedLocs.length === 0) {
        container.innerHTML = '<div style="color: #94a3b8; padding: 10px; font-size: 12px; text-align: center;">No encrypted assets detected.</div>';
        return;
    }
    
    lockedLocs.forEach((loc, idx) => {
        const el = document.createElement('div');
        el.style.background = 'rgba(15, 23, 42, 0.8)';
        el.style.border = '1px dashed #ef4444';
        el.style.borderRadius = '4px';
        el.style.padding = '10px';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.gap = '8px';
        el.style.marginBottom = '8px';
        
        const ransomPrice = loc.ransomPrice || 50000;
        
        el.innerHTML = `
            <div>
                <div style="color: #ef4444; font-weight: bold; font-size: 13px;">LOCKED: ${loc.name}</div>
                <div style="color: #fca5a5; font-size: 11px;">Ransomware encryption active. Assets frozen.</div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-ransom" data-id="${loc.id}" style="flex: 1; background: #991b1b; color: white; border: none; font-size: 11px; padding: 6px 10px;">Pay Ransom ($${ransomPrice.toLocaleString()})</button>
                <button class="btn btn-hack" data-id="${loc.id}" style="flex: 1; background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; font-size: 11px; padding: 6px 10px;">Execute Penetration Test</button>
            </div>
        `;
        container.appendChild(el);
    });

    container.onclick = (e) => {
        const ransomBtn = e.target.closest('.btn-ransom');
        const hackBtn = e.target.closest('.btn-hack');
        
        if (ransomBtn) {
            const locId = ransomBtn.getAttribute('data-id');
            const loc = locations.find(l => l.id === locId);
            const ransomPrice = loc.ransomPrice || 50000;
            
            if (money >= ransomPrice) {
                money -= ransomPrice;
                loc.owner = "player";
                loc.stability = 25;
                loc.extractionActive = false;
                showNotification(`Decryption key acquired. Operations in ${loc.name} have resumed.`, "success");
                if (window.updateNewsTicker) window.updateNewsTicker(`CRISIS AVERTED: Extortion payment confirmed. Systems restored at ${loc.name}.`);
                
                if (typeof window.refreshGlobalMapMarkers === "function") window.refreshGlobalMapMarkers();
                if (typeof window.renderPortfolio === "function") window.renderPortfolio();
                window.renderDarknetDecryption();
                updateUI();
                saveGame();
            } else {
                showNotification(`INSUFFICIENT FUNDS: You need $${ransomPrice.toLocaleString()} to pay the ransom.`, "error");
            }
        } else if (hackBtn) {
            const locId = hackBtn.getAttribute('data-id');
            const loc = locations.find(l => l.id === locId);
            
            if (Math.random() < 0.5) {
                // Success
                loc.owner = "player";
                loc.stability = 25;
                loc.extractionActive = false;
                showNotification(`Counter-hack successful! Systems forcibly restored at ${loc.name}.`, "success");
                if (window.updateNewsTicker) window.updateNewsTicker(`CYBER WARFARE: Player operatives successfully break ransomware encryption at ${loc.name}!`);
            } else {
                // Fail
                globalHeat += 20;
                globalHeat = Math.max(0, Math.min(100, globalHeat));
                showNotification(`Counter-hack failed! Tracers triggered. Heat increased!`, "error");
            }
            
            if (typeof window.refreshGlobalMapMarkers === "function") window.refreshGlobalMapMarkers();
            if (typeof window.renderPortfolio === "function") window.renderPortfolio();
            window.renderDarknetDecryption();
            updateUI();
            saveGame();
        }
    };
};

// Factory Reset Logic
const factoryResetBtn = document.getElementById("btn-factory-reset");
if (factoryResetBtn) {
    factoryResetBtn.addEventListener("click", async () => {
        const confirmWipe = confirm("CRITICAL WARNING: This will permanently delete your entire empire, cash, and all progress. This cannot be undone. Are you absolutely sure you want to start over?");
        
        if (confirmWipe) {
            factoryResetBtn.disabled = true;
            factoryResetBtn.textContent = "WIPING LOCAL + CLOUD SAVE...";
            try {
                if (window.CarMechanicBackend?.clearSave) {
                    await window.CarMechanicBackend.clearSave();
                }
                // Clear every local preference and save, including app ownership and icon positions.
                localStorage.clear();
                window.location.reload();
            } catch (error) {
                factoryResetBtn.disabled = false;
                factoryResetBtn.textContent = "⚠️ FACTORY RESET (WIPE SAVE)";
                showNotification(`Factory reset stopped: ${error.message}. Local save was not cleared.`, "error", 10000);
            }
        }
    });
}
