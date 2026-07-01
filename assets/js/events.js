document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderEvents();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderEvents);
    }

    // Setup Add/Edit form submission
    const eventForm = document.getElementById('eventForm');
    if(eventForm) {
        eventForm.addEventListener('submit', handleEventFormSubmit);
    }
});

function getFilteredEvents() {
    let events = YogastraData.getAll('events');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        events = events.filter(e => e.name.toLowerCase().includes(searchTerm) || e.location.toLowerCase().includes(searchTerm));
    }
    
    // Sort by date
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderEvents() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const events = getFilteredEvents();
    tableBody.innerHTML = '';
    
    if (events.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No events found.</td></tr>';
        return;
    }
    
    events.forEach(event => {
        let statusClass = 'status-pending';
        if (event.status === 'Upcoming') statusClass = 'status-active';
        if (event.status === 'Completed' || event.status === 'Cancelled') statusClass = 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${event.id}</td>
            <td class="fw-bold">${event.name}</td>
            <td>
                <div>${event.date}</div>
                <small class="text-muted">${event.time}</small>
            </td>
            <td>${event.location}</td>
            <td>${event.capacity}</td>
            <td><span class="status-badge ${statusClass}">${event.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editEvent('${event.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteEvent('${event.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleEventFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('eventId').value;
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const capacity = document.getElementById('eventCapacity').value;
    const status = document.getElementById('eventStatus').value;
    
    // Generate ID if new
    if(!id) {
        const events = YogastraData.getAll('events');
        id = `EVT-00${events.length + 1}`;
    }
    
    const eventData = {
        id, name, date, time, location, capacity: parseInt(capacity), status
    };
    
    if (document.getElementById('eventId').value) {
        YogastraData.logAction('Event Updated', `Updated event: ${name}`);
        showToast('Event updated successfully!');
    } else {
        YogastraData.logAction('Event Added', `Added new event: ${name}`);
        showToast('Event added successfully!');
    }
    
    let events = YogastraData.getAll('events');
    const index = events.findIndex(ev => ev.id === id);
    if(index !== -1) {
        events[index] = eventData;
    } else {
        events.push(eventData);
    }
    localStorage.setItem('yogastra_events', JSON.stringify(events));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
    modal.hide();
    
    renderEvents();
}

window.openEventModal = function() {
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('eventModalLabel').textContent = 'Add New Event';
    
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
};

window.editEvent = function(id) {
    const event = YogastraData.getAll('events').find(e => e.id === id);
    if (!event) return;
    
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventCapacity').value = event.capacity;
    document.getElementById('eventStatus').value = event.status;
    
    document.getElementById('eventModalLabel').textContent = 'Edit Event';
    
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
};

window.deleteEvent = function(id) {
    if(confirm(`Are you sure you want to delete event ${id}?`)) {
        let events = YogastraData.getAll('events');
        events = events.filter(e => e.id !== id);
        localStorage.setItem('yogastra_events', JSON.stringify(events));
        
        YogastraData.logAction('Event Deleted', `Deleted event ID: ${id}`);
        showToast('Event deleted successfully!', 'danger');
        renderEvents();
    }
};
