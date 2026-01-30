// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

/**
 * Renders a candidate card in MatchFlow style
 * @param {Object} candidate - The candidate object from db.json
 * @param {Object} session - Current session object (company info)
 * @param {Array} matches - Array of matches to check if already contacted
 * @returns {string} HTML string for the candidate card
 */
export function renderCandidateCard(candidate, session, matches = []) {
    // Check if this candidate is already matched with current company
    const existingMatch = matches.find(m => 
        m.candidateId === candidate.id && 
        session && m.companyId === session.companyId
    );
    
    const isReserved = candidate.reservedBy !== null;
    const isReservedByCurrentCompany = session && candidate.reservedBy === session.companyId;
    
    // Determine status badge
    let statusBadge = '';
    let statusClass = '';
    
    if (candidate.openToWork) {
        statusBadge = 'Open to work';
        statusClass = 'status-open';
    } else {
        statusBadge = 'Not available';
        statusClass = 'status-unavailable';
    }
    
    if (existingMatch) {
        switch(existingMatch.status) {
            case 'pending':
                statusBadge = 'Match pending';
                statusClass = 'status-pending';
                break;
            case 'contacted':
                statusBadge = 'Contacted';
                statusClass = 'status-contacted';
                break;
            case 'interview':
                statusBadge = 'In interview';
                statusClass = 'status-interview';
                break;
        }
    }
    
    // Get time since creation (mock for now)
    const timeAgo = getTimeAgo(new Date());
    
    // Extract skills from bio (simple approach)
    const skills = extractSkills(candidate.profession);
    
    return `
        <article class="card candidate-card" data-candidate-id="${candidate.id}" data-profession="${escapeHtml(candidate.profession)}">
            <div class="card-body">
                <div class="card-header">
                    <div class="avatar-placeholder">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div class="card-meta">
                        <span class="${statusClass}">
                            ${candidate.openToWork && !existingMatch ? '<span class="pulse-dot"></span>' : '<span class="pulse-dot-static"></span>'}
                            ${escapeHtml(statusBadge)}
                        </span>
                        <span class="time-ago">
                            <span class="material-symbols-outlined">schedule</span>
                            ${timeAgo}
                        </span>
                    </div>
                </div>
                
                <div class="card-info">
                    <h4 class="card-title">${escapeHtml(candidate.profession)}</h4>
                    <p class="card-location">
                        <span class="material-symbols-outlined">location_on</span>
                        Bogotá, Colombia
                    </p>
                </div>
                
                <div class="tags">
                    ${skills.map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}
                </div>
                
                <div class="candidate-bio">
                    <p>${escapeHtml(candidate.bio)}</p>
                </div>
                
                ${!existingMatch ? `
                    <div class="card-privacy">
                        <span class="material-symbols-outlined">lock</span>
                        Profile details hidden until match request
                    </div>
                ` : `
                    <div class="candidate-contact-info">
                        <div class="contact-item">
                            <span class="material-symbols-outlined">person</span>
                            <span>${escapeHtml(candidate.name)}</span>
                        </div>
                        <div class="contact-item">
                            <span class="material-symbols-outlined">email</span>
                            <span>${escapeHtml(candidate.email)}</span>
                        </div>
                        <div class="contact-item">
                            <span class="material-symbols-outlined">phone</span>
                            <span>${escapeHtml(candidate.phone)}</span>
                        </div>
                    </div>
                `}
            </div>
            
            <div class="card-footer">
                ${existingMatch ? `
                    <button class="btn-view-match" data-action="view-match" data-match-id="${existingMatch.id}">
                        <span class="material-symbols-outlined">visibility</span>
                        View Match Details
                    </button>
                ` : `
                    <button class="btn-match" data-action="match-request" data-candidate-id="${candidate.id}" ${!candidate.openToWork ? 'disabled' : ''}>
                        <span class="material-symbols-outlined">verified</span>
                        Match Request
                    </button>
                    <button class="btn-bookmark ${isReservedByCurrentCompany ? 'bookmarked' : ''}" data-action="reserve" data-candidate-id="${candidate.id}">
                        <span class="material-symbols-outlined">${isReservedByCurrentCompany ? 'bookmark' : 'bookmark_border'}</span>
                    </button>
                `}
            </div>
        </article>
    `;
}

/**
 * Renders a job offer card
 * @param {Object} offer - Job offer object from db.json
 * @param {Object} company - Company object
 * @param {boolean} isOwner - Whether current session owns this offer
 * @returns {string} HTML string for the job offer card
 */
export function renderJobOfferCard(offer, company, isOwner = false) {
    const createdDate = new Date(offer.createdAt);
    const timeAgo = getTimeAgo(createdDate);
    
    return `
        <article class="card job-offer-card" data-offer-id="${offer.id}" data-company-id="${offer.companyId}">
            <div class="card-body">
                <div class="card-header">
                    <div class="company-logo">
                        <span class="material-symbols-outlined">business</span>
                    </div>
                    <div class="card-meta">
                        <span class="${offer.isActive ? 'status-active' : 'status-inactive'}">
                            <span class="${offer.isActive ? 'pulse-dot' : 'pulse-dot-static'}"></span>
                            ${offer.isActive ? 'Active' : 'Closed'}
                        </span>
                        <span class="time-ago">
                            <span class="material-symbols-outlined">schedule</span>
                            ${timeAgo}
                        </span>
                        ${isOwner ? `
                            <div class="offer-actions">
                                <button class="idea-action-btn" data-action="edit-offer" data-offer-id="${offer.id}">
                                    <span class="material-symbols-outlined">edit</span>
                                </button>
                                <button class="idea-action-btn" data-action="toggle-status" data-offer-id="${offer.id}">
                                    <span class="material-symbols-outlined">${offer.isActive ? 'pause' : 'play_arrow'}</span>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card-info">
                    <h4 class="card-title">${escapeHtml(offer.title)}</h4>
                    <p class="card-location">
                        <span class="material-symbols-outlined">business</span>
                        ${escapeHtml(company.name)}
                    </p>
                </div>
                
                <div class="tags">
                    <span class="tag">${escapeHtml(offer.profession)}</span>
                    <span class="tag">${escapeHtml(company.industry)}</span>
                </div>
                
                <div class="offer-description">
                    <p>${escapeHtml(offer.description)}</p>
                </div>
            </div>
            
            <div class="card-footer">
                <button class="btn-match" data-action="view-candidates" data-offer-id="${offer.id}">
                    <span class="material-symbols-outlined">group</span>
                    View Candidates
                </button>
                <button class="btn-bookmark" data-action="save-offer" data-offer-id="${offer.id}">
                    <span class="material-symbols-outlined">bookmark</span>
                </button>
            </div>
        </article>
    `;
}

/**
 * Extract skills from profession (basic implementation)
 * @param {string} profession - Profession string
 * @returns {Array} Array of skill strings
 */
function extractSkills(profession) {
    const skillMap = {
        'Desarrollador Frontend': ['React', 'Vue', 'JavaScript', 'CSS'],
        'Desarrollador Backend': ['Node.js', 'Python', 'API', 'SQL'],
        'Desarrollador Full Stack': ['React', 'Node.js', 'MongoDB', 'Express'],
        'Diseñador UX/UI': ['Figma', 'Sketch', 'Research', 'Prototyping'],
        'Data Analyst': ['SQL', 'Python', 'Power BI', 'Excel']
    };
    
    return skillMap[profession] || ['Professional', 'Experienced'];
}

/**
 * Calculate time ago from date
 * @param {Date} date - Date object
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

/**
 * Renders multiple candidate cards
 * @param {Array} candidates - Array of candidate objects
 * @param {Object} session - Current session
 * @param {Array} matches - Array of matches
 * @returns {string} HTML string for all cards
 */
export function renderCandidateCards(candidates, session, matches = []) {
    if (!candidates || candidates.length === 0) {
        return `
            <article class="card-empty">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">person_search</span>
                </div>
                <h4 class="empty-title">No Candidates Found</h4>
                <p class="empty-text">Try adjusting your search filters or create a new job posting.</p>
                <button class="btn-refine" onclick="resetFilters()">
                    Reset Filters
                </button>
            </article>
        `;
    }
    
    return candidates.map(candidate => 
        renderCandidateCard(candidate, session, matches)
    ).join('');
}

/**
 * Renders multiple job offer cards
 * @param {Array} offers - Array of job offer objects
 * @param {Array} companies - Array of company objects
 * @param {Object} session - Current session
 * @returns {string} HTML string for all cards
 */
export function renderJobOfferCards(offers, companies, session) {
    if (!offers || offers.length === 0) {
        return `
            <article class="card-empty">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">work</span>
                </div>
                <h4 class="empty-title">No Job Offers</h4>
                <p class="empty-text">Create your first job posting to start finding candidates.</p>
                <button class="btn-refine" onclick="createNewOffer()">
                    Create Job Offer
                </button>
            </article>
        `;
    }
    
    return offers.map(offer => {
        const company = companies.find(c => c.id === offer.companyId);
        const isOwner = session && session.companyId === offer.companyId;
        return renderJobOfferCard(offer, company, isOwner);
    }).join('');
}

/**
 * Load data from JSON file
 * @param {string} jsonPath - Path to db.json
 * @returns {Promise<Object>} Database object
 */
export async function loadDatabase(jsonPath = './db.json') {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Failed to load database');
        return await response.json();
    } catch (error) {
        console.error('Error loading database:', error);
        return {
            candidates: [],
            companies: [],
            jobOffers: [],
            matches: []
        };
    }
}

/**
 * Filter candidates by profession
 * @param {Array} candidates - All candidates
 * @param {string} profession - Profession to filter by
 * @returns {Array} Filtered candidates
 */
export function filterCandidatesByProfession(candidates, profession) {
    if (!profession || profession === 'all') return candidates;
    return candidates.filter(c => c.profession === profession);
}

/**
 * Filter candidates by availability
 * @param {Array} candidates - All candidates
 * @param {boolean} openToWork - Filter by open to work status
 * @returns {Array} Filtered candidates
 */
export function filterCandidatesByAvailability(candidates, openToWork = true) {
    return candidates.filter(c => c.openToWork === openToWork);
}

/**
 * Get candidates for a specific job offer
 * @param {Array} candidates - All candidates
 * @param {Object} jobOffer - Job offer object
 * @returns {Array} Matching candidates
 */
export function getCandidatesForJobOffer(candidates, jobOffer) {
    return candidates.filter(c => 
        c.profession === jobOffer.profession && c.openToWork
    );
}

/**
 * Setup event handlers for candidate cards
 */
export function setupCandidateCardEvents(db, session) {
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        const candidateId = parseInt(target.dataset.candidateId);
        const offerId = parseInt(target.dataset.offerId);
        const matchId = parseInt(target.dataset.matchId);
        
        switch(action) {
            case 'match-request':
                await handleMatchRequest(db, session, candidateId, target);
                break;
            case 'reserve':
                await handleReserveCandidate(db, session, candidateId, target);
                break;
            case 'view-match':
                handleViewMatch(matchId);
                break;
            case 'view-candidates':
                handleViewCandidates(offerId);
                break;
            case 'edit-offer':
                handleEditOffer(offerId);
                break;
            case 'toggle-status':
                await handleToggleOfferStatus(db, offerId, target);
                break;
        }
    });
}

/**
 * Handle match request
 */
async function handleMatchRequest(db, session, candidateId, button) {
    if (!session || !session.companyId) {
        alert('Please log in as a company to make match requests');
        return;
    }
    
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate || !candidate.openToWork) {
        alert('This candidate is not available');
        return;
    }
    
    // Check for active job offers
    const activeOffers = db.jobOffers.filter(o => 
        o.companyId === session.companyId && 
        o.isActive && 
        o.profession === candidate.profession
    );
    
    if (activeOffers.length === 0) {
        alert(`You need an active job offer for "${candidate.profession}" to request a match`);
        return;
    }
    
    // Create new match
    const newMatch = {
        id: db.matches.length + 1,
        companyId: session.companyId,
        candidateId: candidateId,
        jobOfferId: activeOffers[0].id,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    db.matches.push(newMatch);
    
    // Update UI
    button.textContent = 'Request Sent';
    button.disabled = true;
    button.classList.add('btn-success');
    
    console.log('Match created:', newMatch);
}

/**
 * Handle reserve candidate
 */
async function handleReserveCandidate(db, session, candidateId, button) {
    if (!session || !session.companyId) {
        alert('Please log in to reserve candidates');
        return;
    }
    
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    const icon = button.querySelector('.material-symbols-outlined');
    
    if (candidate.reservedBy === session.companyId) {
        // Unreserve
        candidate.reservedBy = null;
        candidate.reservedForOffer = null;
        icon.textContent = 'bookmark_border';
        button.classList.remove('bookmarked');
    } else {
        // Reserve
        candidate.reservedBy = session.companyId;
        icon.textContent = 'bookmark';
        button.classList.add('bookmarked');
    }
    
    console.log('Candidate reservation toggled:', candidate);
}

/**
 * Handle view match details
 */
function handleViewMatch(matchId) {
    console.log('View match:', matchId);
    // Implement modal or navigation to match details
}

/**
 * Handle view candidates for offer
 */
function handleViewCandidates(offerId) {
    console.log('View candidates for offer:', offerId);
    // Implement filtering/navigation
}

/**
 * Handle edit offer
 */
function handleEditOffer(offerId) {
    console.log('Edit offer:', offerId);
    // Implement edit modal
}

/**
 * Handle toggle offer status
 */
async function handleToggleOfferStatus(db, offerId, button) {
    const offer = db.jobOffers.find(o => o.id === offerId);
    if (!offer) return;
    
    offer.isActive = !offer.isActive;
    
    const icon = button.querySelector('.material-symbols-outlined');
    icon.textContent = offer.isActive ? 'pause' : 'play_arrow';
    
    console.log('Offer status toggled:', offer);
}

// Example session object
export const exampleSession = {
    companyId: 1,
    companyName: 'TechCorp Solutions',
    userId: 'company-1'
};