const API_URL = window.location.origin;
const token = localStorage.getItem('token');
const vehicleType = localStorage.getItem('vehicle_type') || 'car';

if (!token) {
    window.location.href = 'login.html';
}

let map;
let userMarker;
let currentLat = 28.6139; // Default Delhi
let currentLng = 77.2090;

async function initMap(lat, lng) {
    try {
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            throw new Error('Leaflet library not loaded');
        }
        
        // Check if map div exists
        const mapDiv = document.getElementById('map');
        if (!mapDiv) {
            throw new Error('Map container not found');
        }
        
        // Remove existing map if any
        if (map) {
            map.remove();
        }
        
        currentLat = lat;
        currentLng = lng;
        
        // Create map
        map = L.map('map').setView([lat, lng], 13);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Add user marker
        userMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup('📍 Your Location')
            .openPopup();

        // Load providers
        await loadProviders(lat, lng);
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Map initialization error:', error);
        alert('Error loading map: ' + error.message + '. Please check your internet connection and refresh the page.');
    }
}

async function loadProviders(lat, lng) {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    let providers = [];
    try {
        if (type === 'repair') {
            const response = await fetch(`${API_URL}/providers/nearby/repair?lat=${lat}&lng=${lng}&vehicle_type=${vehicleType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch repair providers');
            providers = await response.json();
        } else if (type === 'towing') {
            const response = await fetch(`${API_URL}/providers/nearby/towing?lat=${lat}&lng=${lng}&vehicle_type=${vehicleType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch towing providers');
            providers = await response.json();
        }

        providers.forEach(p => {
            const label = `${p.details.shop_name || p.details.provider_name || p.name} - ${p.distance.toFixed(1)} km`;
            const button = `<button onclick="selectProvider(${p.id})">Book This Provider</button>`;
            L.marker([p.lat, p.lng]).addTo(map)
                .bindPopup(`<strong>${label}</strong><br>${button}`);
        });
        
        if (providers.length === 0) {
            alert('No providers found nearby. Try expanding your search radius or different location.');
        } else {
            console.log(`Loaded ${providers.length} providers`);
        }
    } catch (error) {
        console.error('Error loading providers:', error);
        alert('Could not load service providers. Please try again.');
    }
}

window.detectLocation = function() {
    const btn = document.getElementById('detectBtn');
    if (btn) btn.textContent = 'Detecting...';
    
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        if (btn) btn.textContent = '📍 Detect My Location';
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            document.getElementById('manualLat').value = lat.toFixed(6);
            document.getElementById('manualLng').value = lng.toFixed(6);
            initMap(lat, lng);
            if (btn) btn.textContent = '📍 Detect My Location';
        },
        (error) => {
            console.error('Geolocation error:', error);
            let errorMsg = 'Could not detect location. ';
            if (error.code === 1) errorMsg += 'Permission denied. Please allow location access in your browser.';
            else if (error.code === 2) errorMsg += 'Position unavailable.';
            else errorMsg += 'Timeout.';
            alert(errorMsg + ' Please enter manually.');
            if (btn) btn.textContent = '📍 Detect My Location';
        }
    );
};

window.updateMapLocation = function() {
    const lat = parseFloat(document.getElementById('manualLat').value);
    const lng = parseFloat(document.getElementById('manualLng').value);
    
    if (isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid coordinates');
        return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert('Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
        return;
    }
    
    initMap(lat, lng);
};

window.selectProvider = (providerId) => {
    localStorage.setItem('selectedProvider', providerId);
    alert('Provider selected! Complete the booking form below.');
};

// Initialize when DOM is ready
function initializePage() {
    console.log('Page initializing...');
    
    // Set default location values
    document.getElementById('manualLat').value = currentLat.toFixed(6);
    document.getElementById('manualLng').value = currentLng.toFixed(6);
    
    // Try auto-detect first
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('manualLat').value = lat.toFixed(6);
                document.getElementById('manualLng').value = lng.toFixed(6);
                initMap(lat, lng);
            },
            () => {
                // Use default location if geolocation fails
                console.log('Using default location');
                initMap(currentLat, currentLng);
            }
        );
    } else {
        // No geolocation support, use default
        initMap(currentLat, currentLng);
    }
}

// Wait for DOM and check if Leaflet is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializePage, 100); // Small delay to ensure Leaflet is loaded
    });
} else {
    setTimeout(initializePage, 100);
}