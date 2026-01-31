// ================================
// DATA (ONLY JSON IN MEMORY)
// ================================
let usersJSON = [];
let currentUserJSON = null;

// ================================
// INITIALIZE ON DOM READY
// ================================
document.addEventListener('DOMContentLoaded', () => {

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

        // Ahora buscamos en la variable JSON
        if (usersJSON.find(user => user.email === email)) {
            signupError.textContent = 'Email already registered';
            signupError.classList.remove('d-none');
            return;
        }

        const newUser = { name, email, password };

        // Guardamos en el JSON en memoria
        usersJSON.push(newUser);

        signupSuccess.classList.remove('d-none');
        signupForm.reset();

        setTimeout(() => {
            const loginTabTrigger = document.getElementById('login-tab');
            if (loginTabTrigger) {
                new bootstrap.Tab(loginTabTrigger).show();
                document.getElementById('login-email').value = email;
            }
            signupSuccess.classList.add('d-none');
        }, 1500);
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
