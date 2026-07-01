document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderLogs();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderLogs);
    }
});

function getFilteredLogs() {
    let logs = YogastraData.getAll('logs') || [];
    
    // Sort by timestamp descending
    logs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        logs = logs.filter(l => 
            l.action.toLowerCase().includes(searchTerm) || 
            l.details.toLowerCase().includes(searchTerm)
        );
    }
    
    return logs;
}

function renderLogs() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const logs = getFilteredLogs();
    tableBody.innerHTML = '';
    
    if (logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No activity logs found.</td></tr>';
        return;
    }
    
    logs.forEach((log, index) => {
        const tr = document.createElement('tr');
        const dateObj = new Date(log.timestamp);
        const formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
        
        tr.innerHTML = `
            <td class="text-muted fw-bold">#${logs.length - index}</td>
            <td class="fw-bold">${log.action}</td>
            <td class="text-muted">${log.details}</td>
            <td>${log.user}</td>
            <td>${formattedDate}</td>
        `;
        tableBody.appendChild(tr);
    });
}

window.clearLogs = function() {
    if(confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
        localStorage.removeItem('yogastra_logs');
        showToast('Activity logs cleared successfully.', 'success');
        renderLogs();
    }
};
