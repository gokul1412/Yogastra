document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderBookings();
    populateBookingDropdowns();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderBookings);
    }

    // Setup Add/Edit form submission
    const bookingForm = document.getElementById('bookingForm');
    if(bookingForm) {
        bookingForm.addEventListener('submit', handleBookingFormSubmit);
    }
});

function getFilteredBookings() {
    let bookings = YogastraData.getAll('bookings');
    const members = YogastraData.getAll('members');
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        bookings = bookings.filter(b => {
            const member = members.find(m => m.id === b.memberId);
            const schedule = schedules.find(s => s.id === b.scheduleId);
            const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
            
            return (member && member.name.toLowerCase().includes(searchTerm)) || 
                   (cls && cls.name.toLowerCase().includes(searchTerm)) ||
                   b.bookingDate.toLowerCase().includes(searchTerm);
        });
    }
    
    return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
}

function renderBookings() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const bookings = getFilteredBookings();
    const members = YogastraData.getAll('members');
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    
    tableBody.innerHTML = '';
    
    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No bookings found.</td></tr>';
        return;
    }
    
    bookings.forEach(booking => {
        const member = members.find(m => m.id === booking.memberId);
        const schedule = schedules.find(s => s.id === booking.scheduleId);
        const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
        
        if(!member || !schedule || !cls) return;
        
        let statusClass = 'status-pending';
        if (booking.status === 'Confirmed') statusClass = 'status-active';
        if (booking.status === 'Cancelled') statusClass = 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${booking.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${member.image}" class="rounded-circle me-2" width="24" height="24" alt="Avatar">
                    <span class="fw-bold">${member.name}</span>
                </div>
            </td>
            <td>
                <div class="fw-bold">${cls.name}</div>
                <small class="text-muted">${schedule.date} at ${schedule.time}</small>
            </td>
            <td>${booking.bookingDate}</td>
            <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editBooking('${booking.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteBooking('${booking.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function populateBookingDropdowns() {
    const memberSelect = document.getElementById('bookingMember');
    const scheduleSelect = document.getElementById('bookingSchedule');
    if (!memberSelect || !scheduleSelect) return;
    
    const members = YogastraData.getAll('members');
    const schedules = YogastraData.getAll('schedules');
    const classes = YogastraData.getAll('classes');
    
    memberSelect.innerHTML = '<option value="">Select Member</option>';
    members.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.name;
        memberSelect.appendChild(option);
    });
    
    scheduleSelect.innerHTML = '<option value="">Select Schedule</option>';
    schedules.forEach(s => {
        const cls = classes.find(c => c.id === s.classId);
        if(cls) {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = `${cls.name} - ${s.date} ${s.time}`;
            scheduleSelect.appendChild(option);
        }
    });
}

function handleBookingFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('bookingId').value;
    const memberId = document.getElementById('bookingMember').value;
    const scheduleId = document.getElementById('bookingSchedule').value;
    const status = document.getElementById('bookingStatus').value;
    const notes = document.getElementById('bookingNotes').value;
    
    const bookingData = {
        memberId, scheduleId, status, notes,
        bookingDate: YogastraData.getById('bookings', id)?.bookingDate || new Date().toISOString().split('T')[0]
    };
    
    if (id) {
        bookingData.id = id;
        YogastraData.logAction('Booking Updated', `Updated booking ID: ${id}`);
        showToast('Booking updated successfully!');
    } else {
        YogastraData.logAction('Booking Added', `Added new booking for member: ${memberId}`);
        showToast('Booking added successfully!');
    }
    
    YogastraData.save('bookings', bookingData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
    modal.hide();
    
    renderBookings();
}

window.openBookingModal = function() {
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingId').value = '';
    document.getElementById('bookingModalLabel').textContent = 'Add New Booking';
    
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
};

window.editBooking = function(id) {
    const booking = YogastraData.getById('bookings', id);
    if (!booking) return;
    
    document.getElementById('bookingId').value = booking.id;
    document.getElementById('bookingMember').value = booking.memberId;
    document.getElementById('bookingSchedule').value = booking.scheduleId;
    document.getElementById('bookingStatus').value = booking.status;
    document.getElementById('bookingNotes').value = booking.notes || '';
    
    document.getElementById('bookingModalLabel').textContent = 'Edit Booking';
    
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
};

window.deleteBooking = function(id) {
    if(confirm(`Are you sure you want to delete booking ${id}?`)) {
        YogastraData.delete('bookings', id);
        YogastraData.logAction('Booking Deleted', `Deleted booking ID: ${id}`);
        showToast('Booking deleted successfully!', 'danger');
        renderBookings();
    }
};
