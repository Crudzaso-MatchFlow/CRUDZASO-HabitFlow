// 4 functions only - brute force rendering
export async function loadDb(){ return await fetch('../db.json').then(r => r.json()); }

export function renderCandidates(list){
  return list.map(c => `<article class="card candidate-card"><div class="card-body"><img src="${c.avatar||'https://via.placeholder.com/48?text=%3F'}" width="48" height="48" class="avatar"><div class="info"><h4>${c.name}</h4><p>${c.profession} • ${c.openToWork?'Open':'Busy'}</p></div></div><div class="card-footer"><button class="btn">Match</button></div></article>`).join('');
}

export function renderOffers(offers, companies){
  return offers.map(o => { 
    const c = companies.find(x => x.id === o.companyId); 
    return `
      <article class="card job-offer-card">
        <div class="card-body">
          <h4>${o.title}</h4>
          <p>${o.profession} • ${c.name}</p>
        </div>
        <div class="card-footer">
          <button class="btn">View</button>
        </div>
      </article>
    `;
  }).join('');
}

export function renderMatches(matches, jobOffers, companies){
  return matches.map(m => { 
    const offer = jobOffers.find(x => x.id === m.jobOfferId);
    const company = companies.find(x => x.id === offer.companyId);
    return `
      <article class="card job-offer-card">
        <div class="card-body">
          <h4>${offer.title}</h4>
          <p>${offer.profession} • ${company.name}</p>
          <p style="margin-top:8px; font-size:12px; color:#64748b;">Status: <strong>${m.status}</strong></p>
        </div>
        <div class="card-footer">
          <button class="btn">View Details</button>
        </div>
      </article>
    `;
  }).join('');
}
