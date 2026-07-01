document.addEventListener('DOMContentLoaded', () => {
    renderDashboardStats();
    renderRecentBookings();
    renderClassPopularity();
});

function renderDashboardStats() {
    const members = YogastraData.getAll('members');
    const classes = YogastraData.getAll('classes');
    const payments = YogastraData.getAll('payments');
    const attendance = YogastraData.getAll('attendance');
    
    // Total Members
    document.getElementById('totalMembers').textContent = members.length;
    
    // Monthly Revenue (sum of all completed payments for simplicity)
    const totalRevenue = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('monthlyRevenue').textContent = `$${totalRevenue}`;
    
    // Yoga Classes
    document.getElementById('totalClasses').textContent = classes.filter(c => c.status === 'Active').length;
    
    // Attendance Rate
    const present = attendance.filter(a => a.status === 'Present').length;
    const rate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
    document.getElementById('attendanceRate').textContent = `${rate}%`;
}

function renderRecentBookings() {
    const tableBody = document.getElementById('recentBookingsTable');
    if (!tableBody) return;
    
    const bookings = YogastraData.getAll('bookings').slice(0, 5); // top 5
    const members = YogastraData.getAll('members');
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    
    tableBody.innerHTML = '';
    
    if(bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No recent bookings.</td></tr>';
        return;
    }
    
    bookings.forEach(b => {
        const member = members.find(m => m.id === b.memberId);
        const schedule = schedules.find(s => s.id === b.scheduleId);
        const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
        
        if(!member || !cls || !schedule) return;
        
        let statusClass = 'status-pending';
        if (b.status === 'Confirmed') statusClass = 'status-active';
        if (b.status === 'Cancelled') statusClass = 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${member.image}" class="rounded-circle me-2" width="32" height="32" alt="Avatar">
                    <span class="fw-bold">${member.name}</span>
                </div>
            </td>
            <td>${cls.name}</td>
            <td>${schedule.date}, ${schedule.time}</td>
            <td><span class="status-badge ${statusClass}">${b.status}</span></td>
            <td>
                <a href="bookings.html" class="btn-icon"><i class="fas fa-eye"></i></a>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderClassPopularity() {
    const list = document.getElementById('classPopularityList');
    if (!list) return;
    
    // Dummy dynamic logic for popularity
    const classes = YogastraData.getAll('classes');
    const colors = ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6'];
    
    list.innerHTML = '';
    
    classes.slice(0, 4).forEach((cls, index) => {
        const percent = Math.floor(Math.random() * 40) + 50; // Random 50-90%
        const color = colors[index % colors.length];
        
        const div = document.createElement('div');
        div.className = 'mb-4';
        div.innerHTML = `
            <div class="d-flex justify-content-between mb-1">
                <span class="fw-bold">${cls.name}</span>
                <span class="text-muted">${percent}%</span>
            </div>
            <div class="css-chart-bar">
                <div class="css-chart-progress" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
        `;
        list.appendChild(div);
    });
}
