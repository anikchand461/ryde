// Check if logged in
if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

// WebSocket for notifications
const userId = localStorage.getItem('userId'); // Set during login
const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
ws.onmessage = (event) => {
    alert(`Notification: ${event.data}`);
};

// Logout
document.getElementById('logout')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});