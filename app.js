import {
    loadDatabase,
    renderCandidateCards,
    filterCandidatesByProfession,
    filterCandidatesByAvailability,
    exampleSession,
    renderJobOfferCards,
    setupCandidateCardEvents
} from './showOferts.js';

// Global state
let db = null;
let currentView = 'offers'; // 'candidates', 'offers', or 'matches'
let currentFilter = 'all';
let showOnlyAvailable = false;
let currentSession = exampleSession;

// Initialize app
async function init() {
    try {
        db = await loadDatabase('./db.json');
        // Use event handlers from showOferts (handles both candidates and offers actions)
        setupCandidateCardEvents(db, currentSession);
        setupNavigationEvents();
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
    } else if (currentView === 'offers') {
        const activeOffers = db.jobOffers.filter(o => o.isActive);
        grid.innerHTML = renderJobOfferCards(activeOffers, db.companies, currentSession);
        document.getElementById('results-count').textContent = activeOffers.length;
        document.getElementById('view-title').textContent = 'Job Offers';
    } else if (currentView === 'matches') {
        // Show candidates that have matches with current company
        const myMatches = db.matches.filter(m => m.companyId === currentSession.companyId);
        const matchedCandidateIds = myMatches.map(m => m.candidateId);
        const matchedCandidates = db.candidates.filter(c => matchedCandidateIds.includes(c.id));

        grid.innerHTML = renderCandidateCards(matchedCandidates, currentSession, db.matches);
        document.getElementById('results-count').textContent = matchedCandidates.length;
        document.getElementById('view-title').textContent = 'My Matches';
    }

    // Add animation to cards
    setTimeout(() => {
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 50);
        });
    }, 10);

    updateFilterSummary();
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
    if (currentView === 'matches') {
        summary.textContent = 'Matched candidates';
    } else if (currentFilter === 'all') {
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

// Setup navigation and header button events
function setupNavigationEvents() {
    // Sidebar nav items (simple text-based routing)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.textContent || '';
            if (text.includes('Matches') || text.includes('My Matches')) {
                currentView = 'matches';
            } else if (text.includes('Job') || text.includes('Job Boards')) {
                currentView = 'offers';
            } else {
                currentView = 'candidates';
            }
            // update UI and stats after navigation
            updateUI();
            updateStats();
        });
    });

    // Reload data button
    const reloadBtn = document.querySelector('.btn-save');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async () => {
            try {
                db = await loadDatabase('./db.json');
                // refresh UI
                populateProfessionFilter();
                updateUI();
                updateStats();
                showToast('Reloaded', 'Database reloaded');
            } catch (err) {
                console.error('Reload error', err);
                showToast('Error', 'Failed to reload database', 'error');
            }
        });
    }
}

// Reset filters helper (referenced from some templates)
window.resetFilters = function() {
    currentFilter = 'all';
    showOnlyAvailable = false;
    const availText = document.getElementById('availability-text');
    if (availText) availText.textContent = 'Open to Work Only';
    const select = document.getElementById('job-filter');
    if (select) select.value = 'all';
    updateUI();
};

// Placeholder for load-more action
window.loadMoreCandidates = function() {
    showToast('Not implemented', 'Load more is not implemented in this demo', 'info');
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
