// ================================
// DATA - LOAD FROM DB
// ================================
let usersJSON = [];
let currentUserJSON = null;

// Load users from db.json on startup
async function loadUsers() {
    try {
        const response = await fetch('../db/db.json');
        const data = await response.json();
        usersJSON = data.candidates || [];
    } catch (error) {
        console.error('Error loading users:', error);
        usersJSON = [];
    }
}

// ================================
// INITIALIZE ON DOM READY
// ================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();

// ================================
// SIGN UP FORM HANDLER
// ================================

const signupForm = document.getElementById('signup-form');

if (signupForm) {
    const signupError = document.getElementById('signup-error');
    const signupSuccess = document.getElementById('signup-success');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameEl = document.getElementById('signup-name');
        const emailEl = document.getElementById('signup-email');
        const passwordEl = document.getElementById('signup-password');
        const confirmEl = document.getElementById('signup-confirm');

        if (!nameEl || !emailEl || !passwordEl || !confirmEl) return;

        const name = nameEl.value.trim();
        const email = emailEl.value.trim().toLowerCase();
        const password = passwordEl.value;
        const confirmPassword = confirmEl.value;

        signupError.classList.add('d-none');
        signupSuccess.classList.add('d-none');

        if (!name || !email || !password || !confirmPassword) {
            signupError.textContent = 'Please fill all fields';
            signupError.classList.remove('d-none');
            return;
        }

        if (password !== confirmPassword) {
            signupError.textContent = 'Passwords do not match';
            signupError.classList.remove('d-none');
            return;
        }

        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters';
            signupError.classList.remove('d-none');
            return;
        }

        // Check if email already exists
        if (usersJSON.find(user => user.email === email)) {
            signupError.textContent = 'Email already registered';
            signupError.classList.remove('d-none');
            return;
        }

        // Create new user object with full candidate structure
        const newId = usersJSON.length > 0 ? Math.max(...usersJSON.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: newId,
            username: email.split('@')[0],
            password: password,
            rol: 'candidate',
            name: name,
            email: email,
            phone: '',
            avatar: `https://i.pravatar.cc/150?img=${newId}`,
            profession: '',
            openToWork: true,
            bio: '',
            reservedBy: null,
            reservedForOffer: null
        };

        // Save to db.json
        try {
            usersJSON.push(newUser);
            
            // Update db.json on server
            const dbData = {
                ...await (await fetch('../db/db.json')).json(),
                candidates: usersJSON
            };
            
            // Note: Direct db.json modification requires backend support
            // For now, we save in memory and localStorage as backup
            localStorage.setItem('users', JSON.stringify(usersJSON));
            
            signupSuccess.classList.remove('d-none');
            signupForm.reset();

            setTimeout(() => {
                const loginTabTrigger = document.getElementById('login-tab');
                if (loginTabTrigger) {
                    new bootstrap.Tab(loginTabTrigger).show();
                    const loginEmail = document.getElementById('login-email');
                    if (loginEmail) loginEmail.value = email;
                }
                signupSuccess.classList.add('d-none');
            }, 1500);
        } catch (error) {
            console.error('Error saving user:', error);
            signupError.textContent = 'Error registering user';
            signupError.classList.remove('d-none');
        }
    });
}


// ================================
// LOGIN FORM HANDLER
// ================================

const loginForm = document.getElementById('login-form');

if (loginForm) {
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailEl = document.getElementById('login-email');
        const passwordEl = document.getElementById('login-password');

        if (!emailEl || !passwordEl) return;

        const email = emailEl.value.trim().toLowerCase();
        const password = passwordEl.value;

        loginError.classList.add('d-none');

        if (!email || !password) {
            loginError.textContent = 'Please enter email and password';
            loginError.classList.remove('d-none');
            return;
        }

        // Buscamos en el JSON en memoria
        const user = usersJSON.find(u => u.email === email && u.password === password);

        if (user) {
            // Guardamos sesión en memoria
            currentUserJSON = user;
            window.location.href = 'indexTask.html';
        } else {
            loginError.textContent = usersJSON.length === 0
                ? 'No users found. Please Sign Up first.'
                : 'Invalid email or password';
            loginError.classList.remove('d-none');
        }
    });
}

}); // Fin DOMContentLoaded

// ================================
// SESSION HANDLER (indexTask.html)
// ================================

document.addEventListener('DOMContentLoaded', () => {
    // Ahora: variable en memoria
    if (!currentUserJSON) return;

    const nameElement = document.getElementById('user-name');
    if (nameElement) {
        nameElement.textContent = currentUserJSON.name;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUserJSON = null;
            window.location.href = 'login.html';
        });
    }
});
