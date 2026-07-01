document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

function loadProfile() {
    let profile = YogastraData.getAll('profile') || {};
    
    // Default values if empty
    if(Object.keys(profile).length === 0) {
        profile = {
            firstName: 'Kiran',
            lastName: 'Rani',
            email: 'admin@yogastra.com',
            phone: '+1 234 567 890',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        };
        localStorage.setItem('yogastra_profile', JSON.stringify([profile])); // Since getAll returns array usually, let's keep it consistent
    } else {
        profile = profile[0] || profile;
    }

    document.getElementById('profFirstName').value = profile.firstName || '';
    document.getElementById('profLastName').value = profile.lastName || '';
    document.getElementById('profEmail').value = profile.email || '';
    document.getElementById('profPhone').value = profile.phone || '';
    
    if (profile.image) {
        const img = document.getElementById('profImage');
        if(img) img.src = profile.image;
    }
}

window.saveProfile = function() {
    const firstName = document.getElementById('profFirstName').value;
    const lastName = document.getElementById('profLastName').value;
    const email = document.getElementById('profEmail').value;
    const phone = document.getElementById('profPhone').value;
    const password = document.getElementById('profPassword').value;
    
    let profile = (YogastraData.getAll('profile') || [])[0] || {};
    
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.email = email;
    profile.phone = phone;
    
    if (password) {
        profile.password = password; // In a real app this would be hashed
    }

    // Keep existing image if not changed (image change would be a separate logic, simplified here)
    localStorage.setItem('yogastra_profile', JSON.stringify([profile]));
    
    YogastraData.logAction('Profile Updated', `Updated admin profile`);
    showToast('Profile saved successfully!');
    
    // Optionally clear password fields
    document.getElementById('profPassword').value = '';
    document.getElementById('profPasswordConfirm').value = '';
};

window.changeProfilePhoto = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                let profile = (YogastraData.getAll('profile') || [])[0] || {};
                profile.image = evt.target.result;
                localStorage.setItem('yogastra_profile', JSON.stringify([profile]));
                
                const img = document.getElementById('profImage');
                if(img) img.src = profile.image;
                
                YogastraData.logAction('Profile Photo Updated', `Changed profile photo`);
                showToast('Profile photo updated!');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
};

window.removeProfilePhoto = function() {
    let profile = (YogastraData.getAll('profile') || [])[0] || {};
    profile.image = 'https://ui-avatars.com/api/?name=Admin+User&background=random';
    localStorage.setItem('yogastra_profile', JSON.stringify([profile]));
    
    const img = document.getElementById('profImage');
    if(img) img.src = profile.image;
    
    YogastraData.logAction('Profile Photo Removed', `Removed profile photo`);
    showToast('Profile photo removed!');
};
