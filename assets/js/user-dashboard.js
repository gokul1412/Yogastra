document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on based on URL or DOM elements
    const path = window.location.pathname;
    
    // Hide all skeleton loaders and show real content on load
    const skeletons = document.querySelectorAll('.skeleton-content');
    const realContents = document.querySelectorAll('.real-content');
    
    setTimeout(() => {
        skeletons.forEach(s => s.style.display = 'none');
        realContents.forEach(r => r.style.display = 'block');
        
        // Page specific routing
        if (document.getElementById('userSummaryCards')) {
            loadUserDashboard();
        }
        if (document.getElementById('userAvailableClasses')) {
            loadUserBookings();
        }
        if (document.getElementById('userClassHistory')) {
            loadUserHistory();
        }
        if (document.getElementById('userMembershipProfile')) {
            loadUserMembership();
        }
        if (document.getElementById('userProfilePage')) {
            loadUserFullProfile();
        }
        
    }, 500); // Small delay to simulate loading for UX

    // Handle global logout for user panel
    const logoutLinks = document.querySelectorAll('a[href="index.html"].text-danger, a.text-danger:contains("Logout")');
    logoutLinks.forEach(link => {
        if(link.textContent.toLowerCase().includes('logout')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    });
});

// Dummy current user for the user panel
const CURRENT_USER_ID = 'MEM-001';

// Global Toast for User Panel
function showUserToast(message, type = 'success') {
    let toastContainer = document.getElementById('userToastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'userToastContainer';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';
        document.body.appendChild(toastContainer);
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toastEl);
    
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
    }, 3000);
}

function logoutUser() {
    if(confirm('Are you sure you want to log out?')) {
        // Since we are running locally without backend, we just simulate session clearing
        // Usually we would clear tokens here
        window.location.href = 'index.html';
    }
}

// ==========================================
// 1. Dashboard Home Logic
// ==========================================
function loadUserDashboard() {
    // Use YogastraData if available (assumes admin-data.js is loaded)
    if (typeof YogastraData === 'undefined') return;
    
    const members = YogastraData.getAll('members');
    const bookings = YogastraData.getAll('bookings');
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    
    const currentUser = members.find(m => m.id === CURRENT_USER_ID) || { name: 'Sarah', status: 'Active', plan: 'Standard' };
    
    // Welcome message
    const welcomeTitle = document.getElementById('welcomeTitle');
    if(welcomeTitle) welcomeTitle.textContent = `Hello, ${currentUser.name.split(' ')[0]}`;
    
    // Stats
    const userBookings = bookings.filter(b => b.memberId === CURRENT_USER_ID);
    const attendedBookings = userBookings.filter(b => b.status === 'Completed' || b.status === 'Attended');
    const upcomingBookings = userBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending');
    
    const classesThisWeekEl = document.getElementById('statClassesThisWeek');
    const totalAttendedEl = document.getElementById('statTotalAttended');
    const membershipStatusEl = document.getElementById('statMembershipStatus');
    
    if(classesThisWeekEl) classesThisWeekEl.textContent = upcomingBookings.length;
    if(totalAttendedEl) totalAttendedEl.textContent = attendedBookings.length;
    if(membershipStatusEl) membershipStatusEl.textContent = `${currentUser.status} (${currentUser.plan})`;
    
    // Upcoming Bookings Table
    const tableBody = document.getElementById('upcomingBookingsTable');
    if (tableBody) {
        tableBody.innerHTML = '';
        if (upcomingBookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No upcoming classes.</td></tr>';
        } else {
            upcomingBookings.forEach(b => {
                const schedule = schedules.find(s => s.id === b.scheduleId);
                const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
                
                if (schedule && cls) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="py-3 px-4">
                            <div class="fw-bold">${schedule.date}</div>
                            <small class="text-muted">${schedule.time}</small>
                        </td>
                        <td class="py-3 px-4">${cls.name}</td>
                        <td class="py-3 px-4">${schedule.trainerId}</td>
                        <td class="py-3 px-4 text-end">
                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="cancelBooking('${b.id}')">Cancel</button>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                }
            });
        }
    }
}

// ==========================================
// 2. Book a Class Logic
// ==========================================
function loadUserBookings() {
    if (typeof YogastraData === 'undefined') return;
    
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    const grid = document.getElementById('userAvailableClassesGrid');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Filter active schedules
    const activeSchedules = schedules.filter(s => s.status === 'Scheduled');
    
    if (activeSchedules.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5">No classes available for booking right now.</div>';
        return;
    }
    
    activeSchedules.forEach(s => {
        const cls = classes.find(c => c.id === s.classId);
        if(!cls) return;
        
        const card = document.createElement('div');
        card.className = 'col-md-6 col-xl-4';
        card.innerHTML = `
            <div class="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column border-top border-primary border-4">
                <div class="d-flex justify-content-between mb-3">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">${s.date} ${s.time}</span>
                    <span class="text-success small fw-bold">${s.capacity} Slots</span>
                </div>
                <h5 class="fw-bold mb-1">${cls.name}</h5>
                <p class="text-muted small mb-4">with ${s.trainerId}</p>
                
                <div class="mt-auto pt-3 border-top">
                    <button type="button" class="btn btn-primary w-100 btn-book-now" onclick="confirmBookClass('${s.id}')">Book Now</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.confirmBookClass = function(scheduleId) {
    if(confirm('Do you want to book this class?')) {
        const bookings = YogastraData.getAll('bookings') || [];
        const newId = `BKG-00${bookings.length + 1}`;
        
        bookings.push({
            id: newId,
            memberId: CURRENT_USER_ID,
            scheduleId: scheduleId,
            date: new Date().toISOString().split('T')[0],
            status: 'Confirmed'
        });
        
        localStorage.setItem('yogastra_bookings', JSON.stringify(bookings));
        showUserToast('Class booked successfully!');
        
        // Refresh page logic if needed
        setTimeout(() => window.location.href = 'dashboard-home.html', 1500);
    }
}

window.cancelBooking = function(bookingId) {
    if(confirm('Are you sure you want to cancel this booking?')) {
        let bookings = YogastraData.getAll('bookings') || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index > -1) {
            bookings[index].status = 'Cancelled';
            localStorage.setItem('yogastra_bookings', JSON.stringify(bookings));
            showUserToast('Booking cancelled.', 'warning');
            loadUserDashboard(); // Reload current view
            loadUserHistory(); // Reload history if on history page
        }
    }
}

// ==========================================
// 3. Class History Logic
// ==========================================
function loadUserHistory() {
    if (typeof YogastraData === 'undefined') return;
    
    const bookings = YogastraData.getAll('bookings');
    const schedules = YogastraData.getAll('schedules');
    const classes = YogastraData.getAll('classes');
    
    const userBookings = bookings.filter(b => b.memberId === CURRENT_USER_ID);
    const tableBody = document.getElementById('userClassHistoryTable');
    
    if(!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (userBookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No class history found.</td></tr>';
        return;
    }
    
    // Sort descending by date
    userBookings.sort((a,b) => new Date(b.bookingDate) - new Date(a.bookingDate)).forEach(b => {
        const schedule = schedules.find(s => s.id === b.scheduleId);
        const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
        
        if (schedule && cls) {
            let statusBadge = '';
            if (b.status === 'Completed' || b.status === 'Attended') statusBadge = '<span class="badge bg-success">Attended</span>';
            else if (b.status === 'Cancelled') statusBadge = '<span class="badge bg-danger">Cancelled</span>';
            else statusBadge = `<span class="badge bg-primary">${b.status}</span>`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-3 px-4">
                    <div class="fw-bold">${schedule.date}</div>
                </td>
                <td class="py-3 px-4">
                    <div class="fw-bold">${cls.name}</div>
                    <small class="text-muted">${schedule.time} with ${schedule.trainerId}</small>
                </td>
                <td class="py-3 px-4">${statusBadge}</td>
                <td class="py-3 px-4 text-end">
                    <button class="btn btn-sm btn-outline-secondary">Details</button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
    });
}

// ==========================================
// 4. Membership Profile Logic
// ==========================================
function loadUserMembership() {
    if (typeof YogastraData === 'undefined') return;
    
    const members = YogastraData.getAll('members');
    const currentUser = members.find(m => m.id === CURRENT_USER_ID);
    
    if(currentUser) {
        const planNameEl = document.getElementById('userPlanName');
        const planStatusEl = document.getElementById('userPlanStatus');
        
        if(planNameEl) planNameEl.textContent = `${currentUser.plan} Plan`;
        if(planStatusEl) planStatusEl.textContent = currentUser.status;
        
        loadUserBillingHistory();
    }
}

function loadUserBillingHistory() {
    const payments = YogastraData.getAll('payments');
    // Filter payments for current user (Sarah Jenkins = MEM-001)
    const userPayments = payments.filter(p => p.memberId === CURRENT_USER_ID);
    
    const tbody = document.getElementById('userBillingHistoryTable');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    if(userPayments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No billing history found.</td></tr>`;
        return;
    }
    
    // Sort by date desc
    userPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    userPayments.forEach(payment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-3 px-4">${new Date(payment.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</td>
            <td class="py-3 px-4">${payment.invoiceNumber} - ${payment.method}</td>
            <td class="py-3 px-4 fw-bold">$${payment.amount.toFixed(2)}</td>
            <td class="py-3 px-4 text-end">
                <span class="badge ${payment.status === 'Completed' ? 'bg-success' : 'bg-warning'} me-2">${payment.status}</span>
                <a href="#" class="text-primary" aria-label="Download invoice"><i class="fas fa-download"></i></a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// ==========================================
// 5. Dedicated Profile Page Logic
// ==========================================
function loadUserFullProfile() {
    if (typeof YogastraData === 'undefined') return;
    
    const members = YogastraData.getAll('members');
    const currentUser = members.find(m => m.id === CURRENT_USER_ID);
    
    if(currentUser) {
        document.getElementById('userProfileNameFull').value = currentUser.name || '';
        document.getElementById('userProfileEmailFull').value = currentUser.email || '';
        document.getElementById('userProfilePhoneFull').value = currentUser.phone || '';
        document.getElementById('userProfileAddress').value = currentUser.address || '';
        document.getElementById('userProfileEmergency').value = currentUser.emergencyContact || '';
        document.getElementById('userProfileMedical').value = currentUser.medicalInfo || '';
        
        document.getElementById('userProfileDisplayName').textContent = currentUser.name || '';
        document.getElementById('userProfileDisplayEmail').textContent = currentUser.email || '';
        
        if (currentUser.image) {
            document.getElementById('userProfileImagePreview').src = currentUser.image;
        }
        
        // Handle image upload locally
        const imageInput = document.getElementById('userProfileImageInput');
        if(imageInput) {
            imageInput.addEventListener('change', function(e) {
                if(e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById('userProfileImagePreview').src = e.target.result;
                    }
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
    }
}

window.saveUserFullProfile = function() {
    if (typeof YogastraData === 'undefined') return;
    
    const name = document.getElementById('userProfileNameFull').value;
    const email = document.getElementById('userProfileEmailFull').value;
    const phone = document.getElementById('userProfilePhoneFull').value;
    const address = document.getElementById('userProfileAddress').value;
    const emergency = document.getElementById('userProfileEmergency').value;
    const medical = document.getElementById('userProfileMedical').value;
    const imageSrc = document.getElementById('userProfileImagePreview').src;
    
    const members = YogastraData.getAll('members');
    const index = members.findIndex(m => m.id === CURRENT_USER_ID);
    
    if (index > -1) {
        members[index].name = name;
        members[index].email = email;
        members[index].phone = phone;
        members[index].address = address;
        members[index].emergencyContact = emergency;
        members[index].medicalInfo = medical;
        members[index].image = imageSrc;
        
        localStorage.setItem('yogastra_members', JSON.stringify(members));
        showUserToast('Profile details updated successfully!');
        
        document.getElementById('userProfileDisplayName').textContent = name;
        document.getElementById('userProfileDisplayEmail').textContent = email;
    }
};
