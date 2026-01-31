const API_URL = 'http://localhost:3000/candidates';
let candidateId = null;

// Load data on start
document.addEventListener('DOMContentLoaded', async () => {
  await loadCandidate();
  setupEvents();
});

// Event config
function setupEvents() {
  document.getElementById('editProfileBtn').onclick = openModal;
  document.getElementById('closeModal').onclick = closeModal;
  document.getElementById('cancelBtn').onclick = closeModal;
  document.getElementById('saveProfileBtn').onclick = saveProfile;
  document.getElementById('openToWorkToggle').onchange = toggleStatus;
  document.getElementById('avatarEdit').onclick = () =>
    document.getElementById('photoInput').click();
  document.getElementById('photoInput').onchange = uploadPhoto;
  document.getElementById('profileModal').onclick = (e) => {
    if (e.target.id === 'profileModal') closeModal();
  };
}

// Load candidate from API
async function loadCandidate() {
  try {
    const res = await fetch(API_URL);
    const candidates = await res.json();

    if (candidates.length > 0) {
      candidateId = candidates[0].id || '1';
      updateUI(candidates[0]);
    } else {
      await createCandidate();
    }
  } catch (error) {
    console.error('Error loading candidate:', error);
    await createCandidate();
  }
}

// Create candidate
async function createCandidate() {
  const newCandidate = {
    name: '',
    email: '',
    phone: '',
    profession: '',
    experience: 0,
    location: '',
    openToWork: false,
    bio: '',
    reservedBy: null,
    reservedForOffer: null,
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCandidate),
    });
    const data = await res.json();
    candidateId = data.id;
    updateUI(data);
  } catch (error) {
    console.error('Error creating candidate:', error);
  }
}

// Update UI with data
function updateUI(data) {
  document.getElementById('profileName').textContent = data.name || '';
  document.getElementById('profileTitle').textContent = data.profession || '';
  document.getElementById('profileExperience').textContent =
    `${data.experience || 0} years of experience`;
  document.getElementById('profileLocation').textContent = data.location || '';
  document.getElementById('profilePhone').textContent = data.phone || '';
  document.getElementById('profileEmail').textContent = data.email || '';
  document.getElementById('openToWorkToggle').checked =
    data.openToWork || false;

  // Show/hide contacts
  const contacts = document.getElementById('profileContacts');
  if (
    data.phone &&
    data.phone !== '+57 ...' &&
    data.email &&
    data.email !== 'email@dominio.com'
  ) {
    contacts.classList.remove('hidden');
  } else {
    contacts.classList.add('hidden');
  }

  // Update status
  updateStatusUI(data.openToWork);

  // Update avatar
  updateAvatar(data.name || 'User');
}

// Update avatar
function updateAvatar(name) {
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=140`;
  document.getElementById('profileAvatar').src = url;
  document.querySelector('.user-menu img').src = url;
  document.querySelector('.user-menu span').textContent = name;
}

// Update UI status
function updateStatusUI(isOpen) {
  const text = document.getElementById('statusText');
  const toggle = document.getElementById('statusToggle');

  if (isOpen) {
    text.textContent = 'Open to work';
    text.classList.remove('inactive');
    toggle.style.background = '#f0fdf4';
    toggle.style.borderColor = '#bbf7d0';
  } else {
    text.textContent = 'Not available';
    text.classList.add('inactive');
    toggle.style.background = '#f9fafb';
    toggle.style.borderColor = '#e5e7eb';
  }
}

// Open modal
function openModal() {
  document.getElementById('profileModal').classList.add('active');

  // Fill out the form with current information
  fetch(`${API_URL}/${candidateId}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById('modalName').value = data.name || '';
      document.getElementById('modalProfession').value = data.profession || '';
      document.getElementById('modalExperience').value = data.experience || 0;
      document.getElementById('modalLocation').value = data.location || '';
      document.getElementById('modalPhone').value = data.phone || '';
      document.getElementById('modalEmail').value = data.email || '';
    })
    .catch((error) => {
      console.error('Error loading modal data:', error);
    });
}

// Close modal
function closeModal() {
  document.getElementById('profileModal').classList.remove('active');
}

// Save profile
async function saveProfile() {
  const form = document.getElementById('profileForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!candidateId) {
    alert('Error: Candidate ID not found');
    return;
  }

  const data = {
    id: candidateId,
    name: document.getElementById('modalName').value.trim() || '',
    profession: document.getElementById('modalProfession').value.trim() || '',
    experience: parseInt(document.getElementById('modalExperience').value) || 0,
    location: document.getElementById('modalLocation').value.trim() || '',
    phone: document.getElementById('modalPhone').value.trim() || '',
    email: document.getElementById('modalEmail').value.trim() || '',
    openToWork: document.getElementById('openToWorkToggle').checked,
    bio: '',
    reservedBy: null,
    reservedForOffer: null,
  };

  console.log('Saving candidate:', data);
  console.log('URL:', `${API_URL}/${candidateId}`);

  try {
    const res = await fetch(`${API_URL}/${candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const updated = await res.json();
    console.log('Candidate updated:', updated);
    updateUI(updated);
    closeModal();
  } catch (error) {
    console.error('Full error:', error);
    alert('Error saving profile: ' + error.message);
  }
}

// Toggle status
async function toggleStatus() {
  const isOpen = document.getElementById('openToWorkToggle').checked;

  if (!candidateId) {
    console.error('No candidate ID found');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${candidateId}`);
    const current = await res.json();

    const updated = { ...current, openToWork: isOpen };

    await fetch(`${API_URL}/${candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    updateStatusUI(isOpen);
  } catch (error) {
    console.error('Error toggling status:', error);
  }
}

// Upload photo
function uploadPhoto(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('profileAvatar').src = e.target.result;
  };
  reader.readAsDataURL(file);
}
