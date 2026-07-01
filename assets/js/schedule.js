document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderSchedules();
    populateDropdowns();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderSchedules);
    }

    // Setup Add/Edit form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if(scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleFormSubmit);
    }
});

function getFilteredSchedules() {
    let schedules = YogastraData.getAll('schedules');
    const classes = YogastraData.getAll('classes');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        schedules = schedules.filter(s => {
            const cls = classes.find(c => c.id === s.classId);
            return (cls && cls.name.toLowerCase().includes(searchTerm)) || 
                   s.date.toLowerCase().includes(searchTerm);
        });
    }
    
    // Sort by date then time
    return schedules.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
    });
}

function renderSchedules() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const schedules = getFilteredSchedules();
    const classes = YogastraData.getAll('classes');
    const trainers = YogastraData.getAll('trainers');
    const bookings = YogastraData.getAll('bookings');
    
    tableBody.innerHTML = '';
    
    if (schedules.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No schedules found.</td></tr>';
        return;
    }
    
    schedules.forEach(schedule => {
        const cls = classes.find(c => c.id === schedule.classId);
        const trainer = trainers.find(t => t.id === schedule.trainerId);
        
        if(!cls || !trainer) return;
        
        const currentBookings = bookings.filter(b => b.scheduleId === schedule.id && b.status !== 'Cancelled').length;
        const capacityClass = currentBookings >= schedule.capacity ? 'text-danger' : 'text-success';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${schedule.id}</td>
            <td class="fw-bold">${cls.name}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${trainer.image}" class="rounded-circle me-2" width="24" height="24" alt="Avatar">
                    <span>${trainer.name}</span>
                </div>
            </td>
            <td>${schedule.date}</td>
            <td>${schedule.time}</td>
            <td class="fw-bold ${capacityClass}">${currentBookings} / ${schedule.capacity}</td>
            <td>
                <button class="btn-icon" onclick="editSchedule('${schedule.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteSchedule('${schedule.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function populateDropdowns() {
    const classSelect = document.getElementById('scheduleClass');
    const trainerSelect = document.getElementById('scheduleTrainer');
    if (!classSelect || !trainerSelect) return;
    
    const classes = YogastraData.getAll('classes').filter(c => c.status === 'Active');
    const trainers = YogastraData.getAll('trainers').filter(t => t.status === 'Active');
    
    classSelect.innerHTML = '<option value="">Select Class</option>';
    classes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        // Store trainer ID and capacity to auto-fill
        option.dataset.trainerId = c.trainerId;
        option.dataset.capacity = c.capacity;
        classSelect.appendChild(option);
    });
    
    trainerSelect.innerHTML = '<option value="">Select Trainer</option>';
    trainers.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.name;
        trainerSelect.appendChild(option);
    });
    
    // Auto-fill trainer and capacity when class is selected
    classSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            trainerSelect.value = selectedOption.dataset.trainerId;
            document.getElementById('scheduleCapacity').value = selectedOption.dataset.capacity;
        } else {
            trainerSelect.value = '';
            document.getElementById('scheduleCapacity').value = '';
        }
    });
}

function handleScheduleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('scheduleId').value;
    const classId = document.getElementById('scheduleClass').value;
    const trainerId = document.getElementById('scheduleTrainer').value;
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const capacity = document.getElementById('scheduleCapacity').value;
    
    const scheduleData = {
        classId, trainerId, date, time, capacity: parseInt(capacity)
    };
    
    if (id) {
        scheduleData.id = id;
        YogastraData.logAction('Schedule Updated', `Updated schedule for: ${date}`);
        showToast('Schedule updated successfully!');
    } else {
        YogastraData.logAction('Schedule Added', `Added new schedule for: ${date}`);
        showToast('Schedule added successfully!');
    }
    
    YogastraData.save('schedules', scheduleData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
    modal.hide();
    
    renderSchedules();
}

window.openScheduleModal = function() {
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value = '';
    document.getElementById('scheduleModalLabel').textContent = 'Add New Schedule';
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
};

window.editSchedule = function(id) {
    const schedule = YogastraData.getById('schedules', id);
    if (!schedule) return;
    
    document.getElementById('scheduleId').value = schedule.id;
    document.getElementById('scheduleClass').value = schedule.classId;
    document.getElementById('scheduleTrainer').value = schedule.trainerId;
    document.getElementById('scheduleDate').value = schedule.date;
    document.getElementById('scheduleTime').value = schedule.time;
    document.getElementById('scheduleCapacity').value = schedule.capacity;
    
    document.getElementById('scheduleModalLabel').textContent = 'Edit Schedule';
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
};

window.deleteSchedule = function(id) {
    const schedule = YogastraData.getById('schedules', id);
    const classes = YogastraData.getAll('classes');
    const cls = classes.find(c => c.id === schedule.classId);
    
    if(confirm(`Are you sure you want to delete the schedule for ${cls ? cls.name : 'this class'} on ${schedule.date}?`)) {
        YogastraData.delete('schedules', id);
        YogastraData.logAction('Schedule Deleted', `Deleted schedule for ${schedule.date}`);
        showToast('Schedule deleted successfully!', 'danger');
        renderSchedules();
    }
};
