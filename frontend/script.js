const API_BASE_URL = 'http://localhost:3001/api'; 

// Sections
const registerSection = document.getElementById('registerSection');
const loginSection = document.getElementById('loginSection');
const profileSection = document.getElementById('profileSection');

// Forms
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const updateProfileForm = document.getElementById('updateProfileForm');

// Buttons for navigation
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const showProfileBtn = document.getElementById('showProfile');
const logoutBtn = document.getElementById('logoutButton');

// Profile details display
const profileUsernameSpan = document.getElementById('profileUsername');
const profileEmailSpan = document.getElementById('profileEmail');
const profileProgramSpan = document.getElementById('profileProgram');
const profileYearSpan = document.getElementById('profileYear');
const profileInterestsSpan = document.getElementById('profileInterests');

// Message and error display
const messageDiv = document.getElementById('message');
const errorDiv = document.getElementById('error');

let token = null; 

function showSection(sectionToShow) {
    registerSection.style.display = 'none';
    loginSection.style.display = 'none';
    profileSection.style.display = 'none';

    sectionToShow.style.display = 'block';

    // Adjust navigation buttons visibility
    if (token) {
        showRegisterBtn.style.display = 'none';
        showLoginBtn.style.display = 'none';
        showProfileBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'inline-block';
    } else {
        showRegisterBtn.style.display = 'inline-block';
        showLoginBtn.style.display = 'inline-block';
        showProfileBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
    clearMessages();
}

function displayMessage(msg, isError = false) {
    messageDiv.textContent = '';
    errorDiv.textContent = '';
    if (isError) {
        errorDiv.textContent = msg;
    } else {
        messageDiv.textContent = msg;
    }
}

function clearMessages() {
    messageDiv.textContent = '';
    errorDiv.textContent = '';
}

function saveToken(jwtToken) {
    token = jwtToken;
    localStorage.setItem('jwtToken', jwtToken); // Store in local storage for persistence
}

function removeToken() {
    token = null;
    localStorage.removeItem('jwtToken');
}

// --- API Calls ---

async function registerUser(username, email, password, program, year, interests) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, program, year: parseInt(year) || null, interests })
        });
        const data = await response.json();

        if (response.ok) {
            displayMessage(data.msg + '. Please log in.');
            showSection(loginSection); // Show login form after successful registration
        } else {
            displayMessage(data.msg || 'Registration failed', true);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        displayMessage('Network error or server unreachable during registration.', true);
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await await response.json();

        if (response.ok) {
            saveToken(data.token);
            displayMessage(data.msg);
            showSection(profileSection); // Show profile after successful login
            fetchProfile(); // Fetch and display profile immediately
        } else {
            displayMessage(data.msg || 'Login failed', true);
        }
    } catch (error) {
        console.error('Error during login:', error);
        displayMessage('Network error or server unreachable during login.', true);
    }
}

async function fetchProfile() {
    if (!token) {
        displayMessage('You are not logged in.', true);
        showSection(loginSection);
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Send the JWT token
            }
        });
        const data = await response.json();

        if (response.ok) {
            profileUsernameSpan.textContent = data.username || 'N/A';
            profileEmailSpan.textContent = data.email || 'N/A';
            profileProgramSpan.textContent = data.program || 'N/A';
            profileYearSpan.textContent = data.year || 'N/A';
            profileInterestsSpan.textContent = data.interests || 'N/A';

            // Populate update form fields
            document.getElementById('updateUsername').value = data.username || '';
            document.getElementById('updateEmail').value = data.email || '';
            document.getElementById('updateProgram').value = data.program || '';
            document.getElementById('updateYear').value = data.year || '';
            document.getElementById('updateInterests').value = data.interests || '';

            displayMessage('Profile loaded successfully!');
        } else {
            // Handle token expiration/invalid token (401 Unauthorized)
            if (response.status === 401) {
                displayMessage('Session expired or invalid. Please log in again.', true);
                removeToken();
                showSection(loginSection);
            } else {
                displayMessage(data.msg || 'Failed to load profile', true);
            }
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        displayMessage('Network error or server unreachable during profile fetch.', true);
    }
}

async function updateProfile(username, email, program, year, interests) {
    if (!token) {
        displayMessage('You are not logged in.', true);
        showSection(loginSection);
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Send the JWT token
            },
            body: JSON.stringify({ username, email, program, year: parseInt(year) || null, interests })
        });
        const data = await response.json();

        if (response.ok) {
            displayMessage(data.msg || 'Profile updated successfully!');
            fetchProfile(); // Refresh profile details after update
        } else {
            if (response.status === 401) {
                displayMessage('Session expired or invalid. Please log in again.', true);
                removeToken();
                showSection(loginSection);
            } else {
                displayMessage(data.msg || 'Failed to update profile', true);
            }
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        displayMessage('Network error or server unreachable during profile update.', true);
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Attempt to load token from local storage on page load
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
        token = storedToken;
        showSection(profileSection);
        fetchProfile(); // Fetch profile if token exists
    } else {
        showSection(registerSection); // Default to register if no token
    }
});

showRegisterBtn.addEventListener('click', () => showSection(registerSection));
showLoginBtn.addEventListener('click', () => showSection(loginSection));
showProfileBtn.addEventListener('click', () => {
    showSection(profileSection);
    fetchProfile(); // Always refetch profile when navigating to it
});
logoutBtn.addEventListener('click', () => {
    removeToken();
    displayMessage('Logged out successfully.');
    showSection(loginSection); // Go back to login after logout
});


registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const program = document.getElementById('registerProgram').value;
    const year = document.getElementById('registerYear').value;
    const interests = document.getElementById('registerInterests').value;

    registerUser(username, email, password, program, year, interests);
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    loginUser(email, password);
});

updateProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('updateUsername').value;
    const email = document.getElementById('updateEmail').value;
    const program = document.getElementById('updateProgram').value;
    const year = document.getElementById('updateYear').value;
    const interests = document.getElementById('updateInterests').value;

    updateProfile(username, email, program, year, interests);
});