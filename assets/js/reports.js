document.addEventListener('DOMContentLoaded', () => {
    // Reports doesn't need full CRUD, just list out generated reports.
    // For this dummy logic, we'll pretend we have some reports.
    
    renderReports();
});

function getFilteredReports() {
    let reports = YogastraData.getAll('reports') || [];
    if(reports.length === 0) {
        reports = [
            { id: 'RPT-001', name: 'Monthly Revenue', type: 'Financial', date: '2026-10-01', status: 'Ready' },
            { id: 'RPT-002', name: 'Member Attendance', type: 'Analytics', date: '2026-10-05', status: 'Ready' },
            { id: 'RPT-003', name: 'Trainer Performance', type: 'HR', date: '2026-10-10', status: 'Processing' }
        ];
        localStorage.setItem('yogastra_reports', JSON.stringify(reports));
    }
    return reports;
}

function renderReports() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const reports = getFilteredReports();
    tableBody.innerHTML = '';
    
    if (reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No reports generated.</td></tr>';
        return;
    }
    
    reports.forEach(r => {
        let statusClass = r.status === 'Ready' ? 'status-active' : 'status-pending';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${r.id}</td>
            <td class="fw-bold">${r.name}</td>
            <td><span class="badge bg-secondary">${r.type}</span></td>
            <td>${r.date}</td>
            <td><span class="status-badge ${statusClass}">${r.status}</span></td>
            <td>
                <button class="btn-icon" title="Download"><i class="fas fa-download"></i></button>
                <button class="btn-icon delete" onclick="deleteReport('${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.deleteReport = function(id) {
    if(confirm(`Are you sure you want to delete report ${id}?`)) {
        let reports = YogastraData.getAll('reports') || [];
        reports = reports.filter(r => r.id !== id);
        localStorage.setItem('yogastra_reports', JSON.stringify(reports));
        
        YogastraData.logAction('Report Deleted', `Deleted report ID: ${id}`);
        showToast('Report deleted successfully!', 'danger');
        renderReports();
    }
};

window.generateReport = function() {
    const id = `RPT-00${(YogastraData.getAll('reports')||[]).length + 1}`;
    const newReport = {
        id,
        name: 'Custom Ad-Hoc Report',
        type: 'Custom',
        date: new Date().toISOString().split('T')[0],
        status: 'Ready'
    };
    let reports = YogastraData.getAll('reports') || [];
    reports.push(newReport);
    localStorage.setItem('yogastra_reports', JSON.stringify(reports));
    
    YogastraData.logAction('Report Generated', `Generated custom report`);
    showToast('New report generated successfully!');
    renderReports();
};
