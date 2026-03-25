// This event listener ensures that the script runs only after the entire HTML document has been loaded.
document.addEventListener('DOMContentLoaded', () => {

    // UPDATE THIS URL after you host on Render
    const API_URL = "https://neon-cup-backend.onrender.com";

    // =================================================================
    // 🧠 CORE LOGIC & PAGE PROTECTION
    // =================================================================

    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const currentPage = document.body.id;

    // 🔐 Page Guard
    if (currentPage === 'dashboard-page' && !loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';

    } else if (loggedInUser && currentPage === 'dashboard-page') {
        
        document.getElementById('welcomeMessage').textContent = `Welcome, ${loggedInUser.username}!`;

        // Fetch registration status from the BACKEND
        async function checkStatus() {
            try {
                const response = await fetch(`${API_URL}/get-status?email=${loggedInUser.email}`);
                const data = await response.json();

                if (data.registered) {
                    const statusCard = document.getElementById('registration-status-card');
                    statusCard.innerHTML = `
                        <h3>Your Registration Status</h3>
                        <p style="color: #00ffcc;">✅ You are registered for the Neon Cup!</p>
                        <br>
                        <p><strong>Team Name:</strong> ${data.teamName}</p>
                        <p><strong>Player ID:</strong> ${data.playerId}</p>
                    `;

                    const registrationFormCard = document.getElementById('tournament-register-section');
                    if (registrationFormCard) {
                        registrationFormCard.style.display = 'none';
                    }
                }
            } catch (error) {
                console.log("Status check failed. Make sure your Python server is running.");
            }
        }
        checkStatus();
    }


    // =================================================================
    // 📝 REGISTRATION LOGIC (register.html)
    // =================================================================

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('✅ Registration successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    alert(`❌ Error: ${result.detail}`);
                }
            } catch (error) {
                alert("Could not connect to the server. Is main.py running?");
            }
        });
    }

    // =================================================================
    // 🔑 LOGIN LOGIC 
    // MOVED: Login logic is now handled natively inside login.html 
    // to properly route Super Admins vs Regular Players.
    // =================================================================


    // =================================================================
    // 🚪 LOGOUT LOGIC
    // =================================================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('loggedInUser');
            // Also clear localStorage just in case we used it for admin routing
            localStorage.clear(); 
            alert('You have been logged out.');
            window.location.href = 'index.html';
        });
    }

    // =================================================================
    // 🏆 TOURNAMENT FORM LOGIC (dashboard.html)
    // =================================================================

    const tournamentForm = document.getElementById('tournamentForm');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!loggedInUser) return;

            const team_name = tournamentForm.querySelector('input[name="team_name"]').value;
            const player_id = tournamentForm.querySelector('input[name="player_id"]').value;
            const phone = tournamentForm.querySelector('input[name="phone"]').value;

            try {
                const response = await fetch(`${API_URL}/join-tournament`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        team_name,
                        leader_id: player_id,
                        phone,
                        user_email: loggedInUser.email
                    })
                });

                if (response.ok) {
                    alert(`✅ Great job! Your squad '${team_name}' has been registered in the cloud.`);
                    window.location.reload();
                }
            } catch (error) {
                alert("Failed to submit registration.");
            }
        });
    }

    // =================================================================
    // ⏳ COUNTDOWN TIMER LOGIC
    // =================================================================

    const tournamentCountdown = document.getElementById('tournamentCountdown');
    if (tournamentCountdown) {
        const countDownDate = new Date("Oct 25, 2026 00:00:00").getTime();
        const x = setInterval(function() {
            const now = new Date().getTime();
            const distance = countDownDate - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (tournamentCountdown) {
                tournamentCountdown.innerHTML = `<span>${days}</span>D <span>${hours}</span>H <span>${minutes}</span>M <span>${seconds}</span>S`;
            }
            
            if (distance < 0) {
                clearInterval(x);
                tournamentCountdown.innerHTML = "REGISTRATION CLOSED";
            }
        }, 1000);
    }
    
    // =================================================================
    // ✉️ CONTACT FORM LOGIC
    // =================================================================

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('✅ Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});