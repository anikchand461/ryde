const API_URL = window.location.origin;
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const vehicleTypePref = localStorage.getItem('vehicle_type') || 'car';

if (!token && window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'login.html';
}

// Load bookings on dashboard
async function loadBookings() {
    const response = await fetch(`${API_URL}/bookings/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const bookings = await response.json();
    const list = document.getElementById('bookingsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (bookings.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #999;">No bookings yet</li>';
        return;
    }
    
    bookings.forEach(b => {
        const li = document.createElement('li');
        const statusBadge = `<span style="background: ${b.status === 'accepted' ? '#4CAF50' : b.status === 'rejected' ? '#f44336' : b.status === 'cancelled' ? '#999' : '#FF9800'}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">${b.status.toUpperCase()}</span>`;
        li.innerHTML = `
            <strong>Booking #${b.id}</strong> - ${b.type} ${statusBadge}<br>
            <small>Issue: ${b.breakdown_type}</small><br>
            <small>Created: ${new Date(b.created_at).toLocaleString()}</small>
        `;
        
        if (b.status === 'pending' && role === 'owner') {
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel Booking';
            cancelBtn.onclick = () => cancelBooking(b.id);
            li.appendChild(cancelBtn);
        }
        if (b.status === 'pending' && role !== 'owner') {
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = '✓ Accept';
            acceptBtn.onclick = () => acceptBooking(b.id);
            li.appendChild(acceptBtn);
            
            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = '✗ Reject';
            rejectBtn.style.background = '#f44336';
            rejectBtn.onclick = () => rejectBooking(b.id);
            li.appendChild(rejectBtn);
        }
        list.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        loadBookings();
    }
});

// Booking form on map
document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const providerId = localStorage.getItem('selectedProvider');
    
    if (!providerId) {
        alert('Please select a provider on the map first');
        return;
    }
    
    const breakdownType = document.getElementById('breakdownType').value;
    if (!breakdownType) {
        alert('Please select a breakdown/issue type');
        return;
    }
    
    // Get location from manual inputs
    const lat = parseFloat(document.getElementById('manualLat')?.value || 0);
    const lng = parseFloat(document.getElementById('manualLng')?.value || 0);

    const booking = {
        provider_id: parseInt(providerId),
        type,
        breakdown_type: breakdownType,
        description: document.getElementById('description').value,
        reason: document.getElementById('reason')?.value || null,
        lat: lat,
        lng: lng
    };
    
    const response = await fetch(`${API_URL}/bookings/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(booking)
    });
    
    if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Booking failed');
        return;
    }
    
    alert('✓ Booking submitted successfully! You will receive updates on your dashboard.');
    window.location.href = 'dashboard.html';
});

async function cancelBooking(id) {
    await fetch(`${API_URL}/bookings/booking/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
    });
    loadBookings();
}

async function acceptBooking(id) {
    await fetch(`${API_URL}/bookings/booking/${id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
    });
    loadBookings();
}

async function rejectBooking(id) {
    await fetch(`${API_URL}/bookings/booking/${id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
    });
    loadBookings();
}

// Populate breakdown types on page load
function populateBreakdownOptions() {
    const breakdownSelect = document.getElementById('breakdownType');
    if (!breakdownSelect) {
        console.log('breakdownType select not found');
        return;
    }
    
    console.log('Populating breakdown options for vehicle type:', vehicleTypePref);
    
    const byType = {
        car: [
            'Engine failure',
            'Battery dead',
            'Fuel leakage / fuel issue',
            'Overheating',
            'Electrical fault',
            'Brake failure',
            'Alternator failure',
            'Radiator leak',
            'Transmission failure',
            'Power steering failure',
            'Starter motor issue',
            'AC compressor failure'
        ],
        bike: [
            'Engine failure',
            'Battery dead',
            'Fuel leakage / fuel issue',
            'Overheating',
            'Electrical fault',
            'Brake failure',
            'Chain break / chain jam',
            'Clutch cable break',
            'Kick start failure',
            'Carburetor blockage',
            'Spark plug failure',
            'Gear shifter issue'
        ],
        other: [
            'Engine failure',
            'Battery dead',
            'Fuel leakage / fuel issue',
            'Overheating',
            'Electrical fault',
            'Brake failure',
            'Air brake failure',
            'Axle break',
            'Differential failure',
            'Suspension failure',
            'Turbocharger failure',
            'Hydraulic system failure'
        ]
    };
    
    // Clear existing options
    breakdownSelect.innerHTML = '<option value="">-- Select Issue --</option>';
    
    const options = byType[vehicleTypePref] || byType.car;
    console.log(`Adding ${options.length} breakdown options`);
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.text = opt;
        breakdownSelect.add(option);
    });
}

// Show/hide towing reason field based on service type
function initializeServiceTypeUI() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const towingReasonSection = document.getElementById('towingReasonSection');
    
    if (towingReasonSection) {
        if (type === 'towing') {
            towingReasonSection.style.display = 'block';
        } else {
            towingReasonSection.style.display = 'none';
        }
    }
    
    // Populate breakdown options
    populateBreakdownOptions();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bookings.js loaded, initializing...');
    initializeServiceTypeUI();
});