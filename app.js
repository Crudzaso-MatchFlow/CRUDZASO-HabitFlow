// Minimal app.js - direct navigation only
import { loadDb, renderCandidates, renderOffers, renderMatches } from './showOferts.js';

let db;
let currentView = 'offers';
let currentUserId = 1; // Default user ID

(async () => {
  db = await loadDb();
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  currentUserId = user.userId || 1; // Use saved or default to 1
  
  localStorage.setItem('currentUser', JSON.stringify({ name: 'Usuario', avatar: '', userId: currentUserId }));
  
  // Set default view - show offers
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = renderOffers(db.jobOffers, db.companies);
  
  // Nav click handlers
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', () => {
      const text = nav.textContent;
      if(text.includes('Discovery')) {
        currentView = 'discovery';
        grid.innerHTML = renderOffers(db.jobOffers, db.companies);
      } else if(text.includes('Match')) {
        currentView = 'matches';
        const myMatches = db.matches.filter(m => m.candidateId === currentUserId);
        grid.innerHTML = renderMatches(myMatches, db.jobOffers, db.companies);
      } else if(text.includes('Job')) {
        currentView = 'offers';
        grid.innerHTML = renderOffers(db.jobOffers, db.companies);
      }
    });
  });
})();
