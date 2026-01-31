const API_URL = 'http://localhost:3000/companies';
let companyId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadCompany();
  setupEvents();
});

function setupEvents() {
  document.getElementById('editProfileBtn').onclick = openModal;
  document.getElementById('closeModal').onclick = closeModal;
  document.getElementById('cancelBtn').onclick = closeModal;
  document.getElementById('saveProfileBtn').onclick = saveProfile;
  document.getElementById('avatarEdit').onclick = () =>
    document.getElementById('photoInput').click();
  document.getElementById('photoInput').onchange = uploadPhoto;
  document.getElementById('profileModal').onclick = (e) => {
    if (e.target.id === 'profileModal') closeModal();
  };
}

async function loadCompany() {
  try {
    const res = await fetch(API_URL);
    const companies = await res.json();

    if (companies.length > 0) {
      companyId = companies[0].id || '1';
      updateUI(companies[0]);
    } else {
      await createCompany();
    }
  } catch (error) {
    console.error('Error loading company:', error);
    await createCompany();
  }
}

async function createCompany() {
  const newCompany = {
    name: 'Your Company Name',
    industry: 'Industry',
    size: '',
    location: 'Location',
    phone: '',
    email: 'email@company.com',
    website: '',
    description: 'Add a description about your company...',
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany),
    });
    const data = await res.json();
    companyId = data.id;
    updateUI(data);
  } catch (error) {
    console.error('Error creating company:', error);
  }
}

function updateUI(data) {
  document.getElementById('companyName').textContent =
    data.name || 'Your Company Name';
  document.getElementById('companyIndustry').textContent =
    data.industry || 'Industry';
  document.getElementById('companySize').textContent =
    data.size || 'Company Size';
  document.getElementById('companyLocation').textContent =
    data.location || 'Location';
  document.getElementById('companyPhone').textContent = data.phone || '+57 ...';
  document.getElementById('companyEmail').textContent =
    data.email || 'email@company.com';
  document.getElementById('companyWebsite').textContent =
    data.website || 'www.company.com';
  document.getElementById('companyDescription').textContent =
    data.description || 'Add a description about your company...';

  // Mostrar/ocultar contactos
  const contacts = document.getElementById('companyContacts');
  if (data.phone || data.email || data.website) {
    contacts.classList.remove('hidden');
  }

  updateAvatar(data.name || 'Company');
}

function updateAvatar(name) {
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=140`;
  document.getElementById('profileAvatar').src = url;
  document.getElementById('topAvatar').src = url;
  document.getElementById('topName').textContent = name;
}

function openModal() {
  document.getElementById('profileModal').classList.add('active');

  fetch(`${API_URL}/${companyId}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById('modalName').value = data.name || '';
      document.getElementById('modalIndustry').value = data.industry || '';
      document.getElementById('modalSize').value = data.size || '';
      document.getElementById('modalLocation').value = data.location || '';
      document.getElementById('modalPhone').value = data.phone || '';
      document.getElementById('modalEmail').value = data.email || '';
      document.getElementById('modalWebsite').value = data.website || '';
      document.getElementById('modalDescription').value =
        data.description || '';
    });
}

function closeModal() {
  document.getElementById('profileModal').classList.remove('active');
}

async function saveProfile() {
  const form = document.getElementById('profileForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!companyId) {
    alert('Error: Company not loaded');
    return;
  }

  const data = {
    id: companyId,
    name:
      document.getElementById('modalName').value.trim() || 'Your Company Name',
    industry:
      document.getElementById('modalIndustry').value.trim() || 'Industry',
    size: document.getElementById('modalSize').value || '',
    location:
      document.getElementById('modalLocation').value.trim() || 'Location',
    phone: document.getElementById('modalPhone').value.trim() || '',
    email:
      document.getElementById('modalEmail').value.trim() || 'email@company.com',
    website: document.getElementById('modalWebsite').value.trim() || '',
    description:
      document.getElementById('modalDescription').value.trim() ||
      'Add a description about your company...',
  };

  console.log('Saving company:', data);

  try {
    const res = await fetch(`${API_URL}/${companyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const updated = await res.json();
    console.log('Company updated:', updated);
    updateUI(updated);
    closeModal();
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving: ' + error.message);
  }
}

function uploadPhoto(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('profileAvatar').src = e.target.result;
    document.getElementById('topAvatar').src = e.target.result;
  };
  reader.readAsDataURL(file);
}
