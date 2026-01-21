const API_URL = window.location.origin;

const breakdownOptions = {
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

const towingCapabilities = [
    'Two-wheeler towing', 'Car towing', 'SUV towing', 'Commercial vehicle towing', 'Heavy vehicle towing',
    'Flatbed towing', 'Wheel-lift towing', 'Accident recovery towing', 'Long-distance towing'
];

const amenityHints = ['roadside support', 'pickup', 'waiting area'];

function renderRoleFields(role) {
    const additional = document.getElementById('additionalFields');
    if (!additional) return;
    let html = '';

    if (role === 'owner') {
        html += `
            <h3>Vehicle Details</h3>
            <label>Vehicle Type: 
                <select id="vehicle_type" required>
                    <option value="">-- Select Vehicle Type --</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="other">Other Vehicle</option>
                </select>
            </label><br>
            <label>Vehicle Name: <input type="text" id="vehicle_name" required placeholder="e.g., Honda, Toyota"></label><br>
            <label>Vehicle Model: <input type="text" id="vehicle_model" required placeholder="e.g., Civic, Camry"></label><br>
            <label>Registration Number: <input type="text" id="vehicle_registration" required placeholder="e.g., AB12CD3456"></label><br>
        `;
    }

    if (role === 'repair') {
        html += `
            <h3>Repair Shop Details</h3>
            <p><strong>Select the types of vehicles your shop can repair and the breakdowns you handle:</strong></p>
            <label>Shop Name: <input type="text" id="shop_name" required></label><br>
            <label>Email: <input type="email" id="shop_email" required></label><br>
            <label>Phone/WhatsApp: <input type="text" id="shop_phone" required placeholder="+91XXXXXXXXXX"></label><br>
            <label>Shop Timings: <input type="text" id="shop_timings" required placeholder="e.g., 9 AM - 6 PM"></label><br>
            <label>Amenities (comma separated): <input type="text" id="shop_amenities" placeholder="e.g., roadside support, waiting area, pickup"></label><br>
            
            <h4>Vehicle Types & Breakdown Services</h4>
            <div id="vehicleTypeSelector">
                <label><input type="checkbox" class="rp-vehicle-type" value="car" onchange="toggleBreakdownSection('car')"> Car</label><br>
                <label><input type="checkbox" class="rp-vehicle-type" value="bike" onchange="toggleBreakdownSection('bike')"> Bike</label><br>
                <label><input type="checkbox" class="rp-vehicle-type" value="other" onchange="toggleBreakdownSection('other')"> Other Vehicle</label><br>
            </div>
            
            <div id="breakdownSections"></div>
        `;
    }

    if (role === 'towing') {
        html += `
            <h3>Towing Provider Details</h3>
            <p><strong>Select vehicle types you can tow and your towing capabilities:</strong></p>
            <label>Provider Name: <input type="text" id="tow_name" required></label><br>
            <label>Email: <input type="email" id="tow_email" required></label><br>
            <label>Phone/WhatsApp: <input type="text" id="tow_phone" required placeholder="+91XXXXXXXXXX"></label><br>
            <label>Availability: <input type="text" id="tow_timings" required placeholder="e.g., 24x7 or 9 AM - 9 PM"></label><br>
            <label>Service Radius (km): <input type="number" id="tow_radius" min="1" value="50" required></label><br>
            <label>Towing Vehicle Capacity: <input type="text" id="tow_capacity" required placeholder="e.g., Up to 3000 kg"></label><br>
            <label>Additional Services (comma separated): <input type="text" id="tow_additional" placeholder="e.g., night service, highway recovery"></label><br>
            
            <h4>Vehicle Types You Can Tow</h4>
            <label><input type="checkbox" class="tow-vehicle" value="car"> Car</label><br>
            <label><input type="checkbox" class="tow-vehicle" value="bike"> Bike</label><br>
            <label><input type="checkbox" class="tow-vehicle" value="other"> Other Vehicle (Trucks, Buses, etc.)</label><br>
            
            <h4>Towing Capabilities</h4>
            ${towingCapabilities.map(c => `<label><input type="checkbox" class="tow-cap" value="${c}"> ${c}</label>`).join('<br>')}<br>
        `;
    }

    additional.innerHTML = html;
}

window.toggleBreakdownSection = function(vehicleType) {
    const checkbox = document.querySelector(`.rp-vehicle-type[value="${vehicleType}"]`);
    const container = document.getElementById('breakdownSections');
    const sectionId = `breakdown-${vehicleType}`;
    
    if (checkbox.checked) {
        // Add breakdown section for this vehicle type
        const section = document.createElement('div');
        section.id = sectionId;
        section.className = 'breakdown-section';
        section.innerHTML = `
            <h4>${vehicleType.toUpperCase()} Breakdown Services (Select all that apply)</h4>
            ${breakdownOptions[vehicleType].map(bd => 
                `<label><input type="checkbox" class="bd-${vehicleType}" value="${bd}"> ${bd}</label>`
            ).join('<br>')}
            <br><br>
        `;
        container.appendChild(section);
    } else {
        // Remove breakdown section
        const section = document.getElementById(sectionId);
        if (section) section.remove();
    }
};

renderRoleFields(document.getElementById('role')?.value || 'owner');
document.getElementById('role')?.addEventListener('change', (e) => {
    renderRoleFields(e.target.value);
});

function collectChecked(selector) {
    return Array.from(document.querySelectorAll(selector)).filter(c => c.checked).map(c => c.value);
}

function parseComma(inputId) {
    const el = document.getElementById(inputId);
    if (!el || !el.value) return [];
    return el.value.split(',').map(s => s.trim()).filter(Boolean);
}

function getLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ lat: 0, lng: 0 });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: 0, lng: 0 })
        );
    });
}

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('role').value;
    const { lat, lng } = await getLocation();

    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        role,
    };

    if (role === 'owner') {
        userData.vehicle_type = document.getElementById('vehicle_type')?.value;
        userData.vehicle_name = document.getElementById('vehicle_name')?.value;
        userData.vehicle_model = document.getElementById('vehicle_model')?.value;
        userData.vehicle_registration = document.getElementById('vehicle_registration')?.value;
    }

    const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Registration failed');
        return;
    }

    const data = await response.json();

    try {
        if (role === 'owner') {
            const vehicle = {
                type: userData.vehicle_type,
                name: userData.vehicle_name,
                model: userData.vehicle_model,
                registration: userData.vehicle_registration
            };
            await fetch(`${API_URL}/users/register/owner?user_id=${data.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicle)
            });
        } else if (role === 'repair') {
            const vehicleTypes = collectChecked('.rp-vehicle-type');
            if (vehicleTypes.length === 0) {
                alert('Please select at least one vehicle type your shop can repair');
                return;
            }
            
            const breakdowns = {};
            let hasBreakdowns = false;
            vehicleTypes.forEach(v => {
                const selected = collectChecked(`.bd-${v}`);
                if (selected.length > 0) {
                    breakdowns[v] = selected;
                    hasBreakdowns = true;
                }
            });
            
            if (!hasBreakdowns) {
                alert('Please select at least one breakdown service for the vehicle types you repair');
                return;
            }
            
            const provider = {
                vehicle_types: vehicleTypes,
                breakdowns,
                lat,
                lng,
                timings: document.getElementById('shop_timings')?.value,
                shop_name: document.getElementById('shop_name')?.value,
                email: document.getElementById('shop_email')?.value,
                phone: document.getElementById('shop_phone')?.value,
                amenities: parseComma('shop_amenities')
            };
            await fetch(`${API_URL}/users/register/repair?user_id=${data.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(provider)
            });
        } else if (role === 'towing') {
            const vehicleTypes = collectChecked('.tow-vehicle');
            if (vehicleTypes.length === 0) {
                alert('Please select at least one vehicle type you can tow');
                return;
            }
            
            const capabilities = collectChecked('.tow-cap');
            if (capabilities.length === 0) {
                alert('Please select at least one towing capability');
                return;
            }
            
            const provider = {
                vehicle_types: vehicleTypes,
                capabilities,
                lat,
                lng,
                radius: Number(document.getElementById('tow_radius')?.value || 0),
                timings: document.getElementById('tow_timings')?.value,
                provider_name: document.getElementById('tow_name')?.value,
                email: document.getElementById('tow_email')?.value,
                phone: document.getElementById('tow_phone')?.value,
                capacity: document.getElementById('tow_capacity')?.value,
                additional_services: parseComma('tow_additional')
            };
            await fetch(`${API_URL}/users/register/towing?user_id=${data.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(provider)
            });
        }
    } catch (err) {
        console.error(err);
        alert('Registered user, but failed to attach details. Please try updating profile.');
    }

    alert('Registered');
    window.location.href = 'login.html';
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const response = await fetch(`${API_URL}/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { method: 'POST' });

    if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Login failed');
        return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('userId', data.user_id);
    localStorage.setItem('role', data.role);
    if (data.vehicle_type) localStorage.setItem('vehicle_type', data.vehicle_type);
    window.location.href = 'dashboard.html';
});

// Dynamic fields for register (simplified, add more logic for actual forms)
const roleSelect = document.getElementById('role');
roleSelect?.addEventListener('change', () => {
    const additional = document.getElementById('additionalFields');
    additional.innerHTML = ''; // Clear
    // Add role-specific fields (e.g., inputs for vehicle, breakdowns, etc.)
    if (roleSelect.value === 'owner') {
        additional.innerHTML += '<label>Vehicle Type: <select><option>car</option></select></label><br>'; // Etc.
    }
    // Similarly for others
});