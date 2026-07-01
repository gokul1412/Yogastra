document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

function loadSettings() {
    let settings = YogastraData.getAll('settings') || {};
    
    // Default values if empty
    if(Object.keys(settings).length === 0 || !settings.centerName) {
        settings = {
            centerName: 'Yogastra Center',
            contactEmail: 'hello@yogastra.com',
            contactPhone: '+1 800 123 4567',
            address: '123 Yoga Street, Wellness City, YC 12345',
            currency: 'USD',
            timezone: 'America/New_York'
        };
        localStorage.setItem('yogastra_settings', JSON.stringify([settings]));
    } else {
        settings = settings[0] || settings;
    }

    document.getElementById('setCenterName').value = settings.centerName || '';
    document.getElementById('setContactEmail').value = settings.contactEmail || '';
    document.getElementById('setContactPhone').value = settings.contactPhone || '';
    document.getElementById('setAddress').value = settings.address || '';
    document.getElementById('setCurrency').value = settings.currency || 'USD';
    document.getElementById('setTimezone').value = settings.timezone || 'America/New_York';
}

window.saveSettings = function() {
    const centerName = document.getElementById('setCenterName').value;
    const contactEmail = document.getElementById('setContactEmail').value;
    const contactPhone = document.getElementById('setContactPhone').value;
    const address = document.getElementById('setAddress').value;
    const currency = document.getElementById('setCurrency').value;
    const timezone = document.getElementById('setTimezone').value;
    
    const settings = { centerName, contactEmail, contactPhone, address, currency, timezone };
    
    localStorage.setItem('yogastra_settings', JSON.stringify([settings]));
    
    YogastraData.logAction('Settings Updated', `Updated application settings`);
    showToast('Settings saved successfully!');
};
