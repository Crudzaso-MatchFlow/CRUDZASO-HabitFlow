import {
    loadDatabase,
    renderCandidateCards,
    filterCandidatesByProfession,
    filterCandidatesByAvailability,
    exampleSession
} from './matchflow.js';
import {
    renderJobOfferCards as renderJobOfferCardsFromShow,
    setupCandidateCardEvents as setupShowEvents
} from './showOferts.js';

// Global state
let db = null;
let currentView = 'candidates'; // 'candidates' or 'offers'
let currentFilter = 'all';
let showOnlyAvailable = false;
let currentSession = exampleSession;

// Initialize app
async function init() {
    try {
        db = await loadDatabase('./db.json');
        // Use event handlers from showOferts (handles both candidates and offers actions)
        setupShowEvents(db, currentSession);
        updateUI();
        populateProfessionFilter();
        updateStats();
        showToast('Welcome!', 'Database loaded successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Error', 'Failed to load database', 'error');
    }
}

// Update UI
function updateUI() {
    const grid = document.getElementById('cards-grid');
    
    if (currentView === 'candidates') {
        let candidates = db.candidates;
        
        if (showOnlyAvailable) {
            candidates = filterCandidatesByAvailability(candidates, true);
        }
        
        if (currentFilter !== 'all') {
            candidates = filterCandidatesByProfession(candidates, currentFilter);
        }
        
        grid.innerHTML = renderCandidateCards(candidates, currentSession, db.matches);
        document.getElementById('results-count').textContent = candidates.length;
        document.getElementById('view-title').textContent = 'Candidates';
    } else {
        const activeOffers = db.jobOffers.filter(o => o.isActive);
        grid.innerHTML = renderJobOfferCardsFromShow(activeOffers, db.companies, currentSession);
        document.getElementById('results-count').textContent = activeOffers.length;
        document.getElementById('view-title').textContent = 'Job Offers';
    }
    
    // Add animation to cards
    setTimeout(() => {
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 50);
        });
    }, 10);
}

// Populate profession filter
function populateProfessionFilter() {
    const select = document.getElementById('job-filter');
    const professions = [...new Set(db.candidates.map(c => c.profession))];
    
    professions.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof;
        option.textContent = prof;
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        updateUI();
        updateFilterSummary();
    });
}

// Update filter summary
function updateFilterSummary() {
    const summary = document.getElementById('filter-summary');
    if (currentFilter === 'all') {
        summary.textContent = showOnlyAvailable ? 'Available candidates' : 'All candidates';
    } else {
        summary.textContent = currentFilter;
    }
}

// Toggle availability filter
window.toggleAvailability = function() {
    showOnlyAvailable = !showOnlyAvailable;
    const btn = document.getElementById('availability-text');
    btn.textContent = showOnlyAvailable ? 'Show All' : 'Open to Work Only';
    updateUI();
    updateFilterSummary();
};

// Toggle view
window.toggleView = function() {
    currentView = currentView === 'candidates' ? 'offers' : 'candidates';
    const btnText = document.getElementById('view-toggle-text');
    btnText.textContent = currentView === 'candidates' ? 'View Job Offers' : 'View Candidates';
    updateUI();
};

// Update stats
function updateStats() {
    const myMatches = db.matches.filter(m => m.companyId === currentSession.companyId);
    const reserved = db.candidates.filter(c => c.reservedBy === currentSession.companyId);
    
    document.getElementById('matches-count').textContent = myMatches.length;
    document.getElementById('reserved-count').textContent = reserved.length;
}

// Show toast notification
window.showToast = function(title, text, type = 'success') {
    const toast = document.getElementById('toast-notification');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-text').textContent = text;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        hideToast();
    }, 5000);
};

// Hide toast
window.hideToast = function() {
    const toast = document.getElementById('toast-notification');
    toast.style.display = 'none';
};

// Update time
function updateTime() {
    const now = new Date();
    const minutes = Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 60000);
    document.getElementById('update-time').textContent = minutes < 1 ? 'now' : `${minutes}m ago`;
}

setInterval(updateTime, 60000);

// Start app
init();
