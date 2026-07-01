document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderMessages();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderMessages);
    }
});

function getFilteredMessages() {
    let messages = YogastraData.getAll('messages') || [];
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        messages = messages.filter(m => 
            m.name.toLowerCase().includes(searchTerm) || 
            m.email.toLowerCase().includes(searchTerm) ||
            m.subject.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date descending
    return messages.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMessages() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const messages = getFilteredMessages();
    tableBody.innerHTML = '';
    
    if (messages.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No messages found.</td></tr>';
        return;
    }
    
    messages.forEach(msg => {
        let statusClass = 'status-pending';
        if (msg.status === 'Read' || msg.status === 'Replied') statusClass = 'status-active';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${msg.id}</td>
            <td>
                <div class="fw-bold">${msg.name}</div>
                <small class="text-muted">${msg.email}</small>
            </td>
            <td class="fw-bold">${msg.subject}</td>
            <td>${msg.date}</td>
            <td><span class="status-badge ${statusClass}">${msg.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewMessage('${msg.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn-icon delete" onclick="deleteMessage('${msg.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.viewMessage = function(id) {
    const msg = YogastraData.getAll('messages').find(m => m.id === id);
    if (!msg) return;
    
    // Mark as read if it was pending
    if (msg.status === 'Unread') {
        msg.status = 'Read';
        let messages = YogastraData.getAll('messages');
        const idx = messages.findIndex(m => m.id === id);
        if(idx !== -1) {
            messages[idx] = msg;
            localStorage.setItem('yogastra_messages', JSON.stringify(messages));
            renderMessages();
        }
    }
    
    document.getElementById('msgSenderName').textContent = msg.name;
    document.getElementById('msgSenderEmail').textContent = msg.email;
    document.getElementById('msgDate').textContent = msg.date;
    document.getElementById('msgSubject').textContent = msg.subject;
    document.getElementById('msgContent').textContent = msg.message;
    
    document.getElementById('replyBtn').onclick = () => {
        window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`;
    };
    
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    modal.show();
};

window.deleteMessage = function(id) {
    if(confirm(`Are you sure you want to delete message ${id}?`)) {
        let messages = YogastraData.getAll('messages');
        messages = messages.filter(m => m.id !== id);
        localStorage.setItem('yogastra_messages', JSON.stringify(messages));
        
        YogastraData.logAction('Message Deleted', `Deleted message ID: ${id}`);
        showToast('Message deleted successfully!', 'danger');
        renderMessages();
    }
};
