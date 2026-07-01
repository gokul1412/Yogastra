document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderAttendance();
    populateAttendanceDropdowns();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderAttendance);
    }

    // Setup Add/Edit form submission
    const attendanceForm = document.getElementById('attendanceForm');
    if(attendanceForm) {
        attendanceForm.addEventListener('submit', handleAttendanceFormSubmit);
    }
});

function getFilteredAttendance() {
    let attendance = YogastraData.getAll('attendance');
    const members = YogastraData.getAll('members');
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        attendance = attendance.filter(a => {
            const member = members.find(m => m.id === a.memberId);
            const schedule = schedules.find(s => s.id === a.scheduleId);
            const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
            
            return (member && member.name.toLowerCase().includes(searchTerm)) || 
                   (cls && cls.name.toLowerCase().includes(searchTerm));
        });
    }
    
    // Sort by latest schedule date first
    return attendance.sort((a, b) => {
        const schedA = schedules.find(s => s.id === a.scheduleId);
        const schedB = schedules.find(s => s.id === b.scheduleId);
        if(!schedA || !schedB) return 0;
        return new Date(schedB.date) - new Date(schedA.date);
    });
}

function renderAttendance() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const attendance = getFilteredAttendance();
    const members = YogastraData.getAll('members');
    const classes = YogastraData.getAll('classes');
    const schedules = YogastraData.getAll('schedules');
    
    tableBody.innerHTML = '';
    
    if (attendance.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No attendance records found.</td></tr>';
        return;
    }
    
    attendance.forEach(record => {
        const member = members.find(m => m.id === record.memberId);
        const schedule = schedules.find(s => s.id === record.scheduleId);
        const cls = schedule ? classes.find(c => c.id === schedule.classId) : null;
        
        if(!member || !schedule || !cls) return;
        
        let statusClass = 'status-pending';
        if (record.status === 'Present') statusClass = 'status-active';
        if (record.status === 'Absent') statusClass = 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${record.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${member.image}" class="rounded-circle me-2" width="24" height="24" alt="Avatar">
                    <span class="fw-bold">${member.name}</span>
                </div>
            </td>
            <td>
                <div class="fw-bold">${cls.name}</div>
            </td>
            <td>${schedule.date} at ${schedule.time}</td>
            <td><span class="status-badge ${statusClass}">${record.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editAttendance('${record.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteAttendance('${record.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function populateAttendanceDropdowns() {
    const memberSelect = document.getElementById('attendanceMember');
    const scheduleSelect = document.getElementById('attendanceSchedule');
    if (!memberSelect || !scheduleSelect) return;
    
    const members = YogastraData.getAll('members').filter(m => m.status === 'Active');
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
    // Sort schedules by date descending for easier access to recent ones
    const sortedSchedules = [...schedules].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sortedSchedules.forEach(s => {
        const cls = classes.find(c => c.id === s.classId);
        if(cls) {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = `${cls.name} - ${s.date} ${s.time}`;
            scheduleSelect.appendChild(option);
        }
    });
}

function handleAttendanceFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('attendanceId').value;
    const memberId = document.getElementById('attendanceMember').value;
    const scheduleId = document.getElementById('attendanceSchedule').value;
    const status = document.getElementById('attendanceStatus').value;
    
    const attendanceData = {
        memberId, scheduleId, status
    };
    
    if (id) {
        attendanceData.id = id;
        YogastraData.logAction('Attendance Updated', `Updated attendance ID: ${id}`);
        showToast('Attendance updated successfully!');
    } else {
        YogastraData.logAction('Attendance Marked', `Marked attendance for member: ${memberId}`);
        showToast('Attendance marked successfully!');
    }
    
    YogastraData.save('attendance', attendanceData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('attendanceModal'));
    modal.hide();
    
    renderAttendance();
}

window.openAttendanceModal = function() {
    document.getElementById('attendanceForm').reset();
    document.getElementById('attendanceId').value = '';
    document.getElementById('attendanceModalLabel').textContent = 'Mark Attendance';
    
    const modal = new bootstrap.Modal(document.getElementById('attendanceModal'));
    modal.show();
};

window.editAttendance = function(id) {
    const record = YogastraData.getById('attendance', id);
    if (!record) return;
    
    document.getElementById('attendanceId').value = record.id;
    document.getElementById('attendanceMember').value = record.memberId;
    document.getElementById('attendanceSchedule').value = record.scheduleId;
    document.getElementById('attendanceStatus').value = record.status;
    
    document.getElementById('attendanceModalLabel').textContent = 'Edit Attendance';
    
    const modal = new bootstrap.Modal(document.getElementById('attendanceModal'));
    modal.show();
};

window.deleteAttendance = function(id) {
    if(confirm(`Are you sure you want to delete attendance record ${id}?`)) {
        YogastraData.delete('attendance', id);
        YogastraData.logAction('Attendance Deleted', `Deleted attendance record ID: ${id}`);
        showToast('Attendance record deleted successfully!', 'danger');
        renderAttendance();
    }
};
