document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderClasses();
    populateTrainerDropdown();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderClasses);
    }

    // Setup Add/Edit form submission
    const classForm = document.getElementById('classForm');
    if(classForm) {
        classForm.addEventListener('submit', handleClassFormSubmit);
    }
});

function getFilteredClasses() {
    let classes = YogastraData.getAll('classes');
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        classes = classes.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.difficulty.toLowerCase().includes(searchTerm)
        );
    }
    
    return classes;
}

function renderClasses() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const classes = getFilteredClasses();
    const trainers = YogastraData.getAll('trainers');
    tableBody.innerHTML = '';
    
    if (classes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No classes found.</td></tr>';
        return;
    }
    
    classes.forEach(cls => {
        let statusClass = 'status-inactive';
        if (cls.status === 'Active') statusClass = 'status-active';
        
        const trainer = trainers.find(t => t.id === cls.trainerId);
        const trainerName = trainer ? trainer.name : 'Unknown';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${cls.id}</td>
            <td class="fw-bold">${cls.name}</td>
            <td>${trainerName}</td>
            <td>${cls.duration}</td>
            <td>${cls.capacity}</td>
            <td><span class="badge bg-secondary">${cls.difficulty}</span></td>
            <td><span class="status-badge ${statusClass}">${cls.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editClass('${cls.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteClass('${cls.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function populateTrainerDropdown() {
    const select = document.getElementById('classTrainer');
    if (!select) return;
    
    const trainers = YogastraData.getAll('trainers');
    select.innerHTML = '<option value="">Select Trainer</option>';
    
    trainers.forEach(trainer => {
        const option = document.createElement('option');
        option.value = trainer.id;
        option.textContent = trainer.name;
        select.appendChild(option);
    });
}

function handleClassFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('classId').value;
    const name = document.getElementById('className').value;
    const trainerId = document.getElementById('classTrainer').value;
    const duration = document.getElementById('classDuration').value;
    const capacity = document.getElementById('classCapacity').value;
    const difficulty = document.getElementById('classDifficulty').value;
    const status = document.getElementById('classStatus').value;
    const description = document.getElementById('classDescription').value;
    
    const classData = {
        name, trainerId, duration, capacity: parseInt(capacity), difficulty, status, description
    };
    
    if (id) {
        classData.id = id;
        YogastraData.logAction('Class Updated', `Updated yoga class: ${name}`);
        showToast('Class updated successfully!');
    } else {
        YogastraData.logAction('Class Added', `Added new yoga class: ${name}`);
        showToast('Class added successfully!');
    }
    
    YogastraData.save('classes', classData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('classModal'));
    modal.hide();
    
    renderClasses();
}

window.openClassModal = function() {
    document.getElementById('classForm').reset();
    document.getElementById('classId').value = '';
    document.getElementById('classModalLabel').textContent = 'Add New Class';
    
    const modal = new bootstrap.Modal(document.getElementById('classModal'));
    modal.show();
};

window.editClass = function(id) {
    const cls = YogastraData.getById('classes', id);
    if (!cls) return;
    
    document.getElementById('classId').value = cls.id;
    document.getElementById('className').value = cls.name;
    document.getElementById('classTrainer').value = cls.trainerId;
    document.getElementById('classDuration').value = cls.duration;
    document.getElementById('classCapacity').value = cls.capacity;
    document.getElementById('classDifficulty').value = cls.difficulty;
    document.getElementById('classStatus').value = cls.status;
    document.getElementById('classDescription').value = cls.description || '';
    
    document.getElementById('classModalLabel').textContent = 'Edit Class';
    
    const modal = new bootstrap.Modal(document.getElementById('classModal'));
    modal.show();
};

window.deleteClass = function(id) {
    const cls = YogastraData.getById('classes', id);
    if(confirm(`Are you sure you want to delete class ${cls.name}?`)) {
        YogastraData.delete('classes', id);
        YogastraData.logAction('Class Deleted', `Deleted yoga class: ${cls.name}`);
        showToast('Class deleted successfully!', 'danger');
        renderClasses();
    }
};
