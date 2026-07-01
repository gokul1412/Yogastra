document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderTrainerSchedule();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderTrainerSchedule);
    }

    // Setup Add/Edit form submission
    const tsForm = document.getElementById('trainerScheduleForm');
    if(tsForm) {
        tsForm.addEventListener('submit', handleTrainerScheduleFormSubmit);
    }
});

function getFilteredTrainerSchedule() {
    let schedule = YogastraData.getAll('trainerSchedule') || [];
    
    // If empty, generate some initial data from trainers
    if(schedule.length === 0) {
        const trainers = YogastraData.getAll('trainers') || [];
        schedule = trainers.map((t, idx) => ({
            id: `TS-00${idx+1}`,
            trainerId: t.id,
            trainerName: t.name,
            day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][idx % 5],
            shift: '08:00 AM - 02:00 PM',
            status: 'Active'
        }));
        localStorage.setItem('yogastra_trainerSchedule', JSON.stringify(schedule));
    }
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        schedule = schedule.filter(s => s.trainerName.toLowerCase().includes(searchTerm) || s.day.toLowerCase().includes(searchTerm));
    }
    
    return schedule;
}

function renderTrainerSchedule() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const schedule = getFilteredTrainerSchedule();
    tableBody.innerHTML = '';
    
    if (schedule.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No schedule records found.</td></tr>';
        return;
    }
    
    schedule.forEach(item => {
        let statusClass = item.status === 'Active' ? 'status-active' : 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${item.id}</td>
            <td class="fw-bold text-primary">${item.trainerName}</td>
            <td><span class="badge bg-info text-dark">${item.day}</span></td>
            <td><i class="far fa-clock text-muted me-2"></i>${item.shift}</td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editTrainerSchedule('${item.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteTrainerSchedule('${item.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleTrainerScheduleFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('tsId').value;
    const trainerName = document.getElementById('tsTrainerName').value;
    const day = document.getElementById('tsDay').value;
    const shift = document.getElementById('tsShift').value;
    const status = document.getElementById('tsStatus').value;
    
    // Generate ID if new
    if(!id) {
        const schedule = YogastraData.getAll('trainerSchedule') || [];
        id = `TS-00${schedule.length + 1}`;
    }
    
    const tsData = { id, trainerName, day, shift, status };
    
    if (document.getElementById('tsId').value) {
        YogastraData.logAction('Trainer Schedule Updated', `Updated schedule for: ${trainerName}`);
        showToast('Schedule updated successfully!');
    } else {
        YogastraData.logAction('Trainer Schedule Added', `Added schedule for: ${trainerName}`);
        showToast('Schedule added successfully!');
    }
    
    let schedule = YogastraData.getAll('trainerSchedule') || [];
    const index = schedule.findIndex(s => s.id === id);
    if(index !== -1) {
        schedule[index] = tsData;
    } else {
        schedule.push(tsData);
    }
    localStorage.setItem('yogastra_trainerSchedule', JSON.stringify(schedule));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('tsModal'));
    modal.hide();
    
    renderTrainerSchedule();
}

window.openTrainerScheduleModal = function() {
    document.getElementById('trainerScheduleForm').reset();
    document.getElementById('tsId').value = '';
    document.getElementById('tsModalLabel').textContent = 'Assign Trainer Schedule';
    
    // Populate trainer dropdown
    populateTrainerDropdown();
    
    const modal = new bootstrap.Modal(document.getElementById('tsModal'));
    modal.show();
};

window.editTrainerSchedule = function(id) {
    const s = (YogastraData.getAll('trainerSchedule') || []).find(s => s.id === id);
    if (!s) return;
    
    populateTrainerDropdown();
    
    document.getElementById('tsId').value = s.id;
    document.getElementById('tsTrainerName').value = s.trainerName;
    document.getElementById('tsDay').value = s.day;
    document.getElementById('tsShift').value = s.shift;
    document.getElementById('tsStatus').value = s.status;
    
    document.getElementById('tsModalLabel').textContent = 'Edit Trainer Schedule';
    
    const modal = new bootstrap.Modal(document.getElementById('tsModal'));
    modal.show();
};

window.deleteTrainerSchedule = function(id) {
    if(confirm(`Are you sure you want to remove schedule ${id}?`)) {
        let schedule = YogastraData.getAll('trainerSchedule') || [];
        schedule = schedule.filter(s => s.id !== id);
        localStorage.setItem('yogastra_trainerSchedule', JSON.stringify(schedule));
        
        YogastraData.logAction('Trainer Schedule Deleted', `Deleted schedule ID: ${id}`);
        showToast('Schedule deleted successfully!', 'danger');
        renderTrainerSchedule();
    }
};

function populateTrainerDropdown() {
    const select = document.getElementById('tsTrainerName');
    const trainers = YogastraData.getAll('trainers') || [];
    
    if(select.options.length <= 1 && trainers.length > 0) {
        select.innerHTML = '<option value="">Select Trainer</option>';
        trainers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.name;
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    }
}
