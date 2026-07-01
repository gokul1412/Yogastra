document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderNotifications();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderNotifications);
    }

    // Setup Add form submission
    const nForm = document.getElementById('notificationForm');
    if(nForm) {
        nForm.addEventListener('submit', handleNotificationFormSubmit);
    }
});

function getFilteredNotifications() {
    let notifs = YogastraData.getAll('notifications') || [];
    
    // Default initial data
    if(notifs.length === 0) {
        notifs = [
            { id: 'NOT-001', title: 'System Update', message: 'The system will undergo maintenance at midnight.', date: '2026-10-20', type: 'System', status: 'Sent' },
            { id: 'NOT-002', title: 'New Class Added', message: 'A new Vinyasa flow class has been added to the schedule.', date: '2026-10-21', type: 'Announcement', status: 'Draft' }
        ];
        localStorage.setItem('yogastra_notifications', JSON.stringify(notifs));
    }
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        notifs = notifs.filter(n => n.title.toLowerCase().includes(searchTerm) || n.message.toLowerCase().includes(searchTerm));
    }
    
    // Sort by date descending
    return notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderNotifications() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const notifs = getFilteredNotifications();
    tableBody.innerHTML = '';
    
    if (notifs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No notifications found.</td></tr>';
        return;
    }
    
    notifs.forEach(n => {
        let statusClass = n.status === 'Sent' ? 'status-active' : 'status-pending';
        let typeBadge = n.type === 'System' ? 'bg-danger' : (n.type === 'Announcement' ? 'bg-info text-dark' : 'bg-secondary');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${n.id}</td>
            <td>
                <div class="fw-bold">${n.title}</div>
                <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">${n.message}</small>
            </td>
            <td><span class="badge ${typeBadge}">${n.type}</span></td>
            <td>${n.date}</td>
            <td><span class="status-badge ${statusClass}">${n.status}</span></td>
            <td>
                ${n.status === 'Draft' ? `<button class="btn-icon" onclick="sendNotification('${n.id}')" title="Send"><i class="fas fa-paper-plane"></i></button>` : ''}
                <button class="btn-icon delete" onclick="deleteNotification('${n.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleNotificationFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('notifTitle').value;
    const type = document.getElementById('notifType').value;
    const message = document.getElementById('notifMessage').value;
    const status = document.getElementById('notifStatus').value;
    const date = new Date().toISOString().split('T')[0];
    
    const notifs = YogastraData.getAll('notifications') || [];
    const id = `NOT-00${notifs.length + 1}`;
    
    const notifData = { id, title, type, message, status, date };
    
    notifs.push(notifData);
    localStorage.setItem('yogastra_notifications', JSON.stringify(notifs));
    
    YogastraData.logAction('Notification Created', `Created notification: ${title}`);
    showToast('Notification created successfully!');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('notifModal'));
    modal.hide();
    
    renderNotifications();
}

window.openNotificationModal = function() {
    document.getElementById('notificationForm').reset();
    document.getElementById('notifModalLabel').textContent = 'Create New Notification';
    
    const modal = new bootstrap.Modal(document.getElementById('notifModal'));
    modal.show();
};

window.sendNotification = function(id) {
    if(confirm(`Are you sure you want to send notification ${id} to all users?`)) {
        let notifs = YogastraData.getAll('notifications') || [];
        const index = notifs.findIndex(n => n.id === id);
        if(index !== -1) {
            notifs[index].status = 'Sent';
            localStorage.setItem('yogastra_notifications', JSON.stringify(notifs));
            
            YogastraData.logAction('Notification Sent', `Sent notification ID: ${id}`);
            showToast('Notification sent successfully!', 'success');
            renderNotifications();
        }
    }
};

window.deleteNotification = function(id) {
    if(confirm(`Are you sure you want to delete notification ${id}?`)) {
        let notifs = YogastraData.getAll('notifications') || [];
        notifs = notifs.filter(n => n.id !== id);
        localStorage.setItem('yogastra_notifications', JSON.stringify(notifs));
        
        YogastraData.logAction('Notification Deleted', `Deleted notification ID: ${id}`);
        showToast('Notification deleted successfully!', 'danger');
        renderNotifications();
    }
};
