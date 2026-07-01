document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderTrainers();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderTrainers);
    }

    // Setup Add/Edit form submission
    const trainerForm = document.getElementById('trainerForm');
    if(trainerForm) {
        trainerForm.addEventListener('submit', handleTrainerFormSubmit);
    }
});

function getFilteredTrainers() {
    let trainers = YogastraData.getAll('trainers');
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        trainers = trainers.filter(t => 
            t.name.toLowerCase().includes(searchTerm) || 
            t.email.toLowerCase().includes(searchTerm) ||
            t.specialization.toLowerCase().includes(searchTerm)
        );
    }
    
    return trainers;
}

function renderTrainers() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const trainers = getFilteredTrainers();
    tableBody.innerHTML = '';
    
    if (trainers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No trainers found.</td></tr>';
        return;
    }
    
    trainers.forEach(trainer => {
        let statusClass = 'status-inactive';
        if (trainer.status === 'Active') statusClass = 'status-active';
        if (trainer.status === 'On Leave') statusClass = 'status-pending';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${trainer.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${trainer.image}" class="rounded-circle me-2" width="32" height="32" alt="Avatar">
                    <span class="fw-bold">${trainer.name}</span>
                </div>
            </td>
            <td>${trainer.specialization}</td>
            <td>${trainer.experience}</td>
            <td><span class="status-badge ${statusClass}">${trainer.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editTrainer('${trainer.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="viewTrainer('${trainer.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn-icon delete" onclick="deleteTrainer('${trainer.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleTrainerFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('trainerId').value;
    const name = document.getElementById('trainerName').value;
    const email = document.getElementById('trainerEmail').value;
    const phone = document.getElementById('trainerPhone').value;
    const specialization = document.getElementById('trainerSpecialization').value;
    const experience = document.getElementById('trainerExperience').value;
    const certifications = document.getElementById('trainerCertifications').value;
    const status = document.getElementById('trainerStatus').value;
    
    // Get working days (checkboxes)
    const workingDays = Array.from(document.querySelectorAll('input[name="workingDays"]:checked')).map(cb => cb.value);
    
    const trainerData = {
        name, email, phone, specialization, experience, certifications, status, workingDays,
        image: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
    };
    
    if (id) {
        trainerData.id = id;
        YogastraData.logAction('Trainer Updated', `Updated trainer: ${name}`);
        showToast('Trainer updated successfully!');
    } else {
        YogastraData.logAction('Trainer Added', `Added new trainer: ${name}`);
        showToast('Trainer added successfully!');
    }
    
    YogastraData.save('trainers', trainerData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('trainerModal'));
    modal.hide();
    
    renderTrainers();
}

window.openTrainerModal = function() {
    document.getElementById('trainerForm').reset();
    document.getElementById('trainerId').value = '';
    document.getElementById('trainerModalLabel').textContent = 'Add New Trainer';
    
    const modal = new bootstrap.Modal(document.getElementById('trainerModal'));
    modal.show();
};

window.editTrainer = function(id) {
    const trainer = YogastraData.getById('trainers', id);
    if (!trainer) return;
    
    document.getElementById('trainerId').value = trainer.id;
    document.getElementById('trainerName').value = trainer.name;
    document.getElementById('trainerEmail').value = trainer.email;
    document.getElementById('trainerPhone').value = trainer.phone || '';
    document.getElementById('trainerSpecialization').value = trainer.specialization;
    document.getElementById('trainerExperience').value = trainer.experience;
    document.getElementById('trainerCertifications').value = trainer.certifications || '';
    document.getElementById('trainerStatus').value = trainer.status;
    
    // Check working days
    document.querySelectorAll('input[name="workingDays"]').forEach(cb => {
        cb.checked = trainer.workingDays && trainer.workingDays.includes(cb.value);
    });
    
    document.getElementById('trainerModalLabel').textContent = 'Edit Trainer';
    
    const modal = new bootstrap.Modal(document.getElementById('trainerModal'));
    modal.show();
};

window.viewTrainer = function(id) {
    const trainer = YogastraData.getById('trainers', id);
    if (!trainer) return;
    
    document.getElementById('viewTrainerName').textContent = trainer.name;
    document.getElementById('viewTrainerEmail').textContent = trainer.email;
    document.getElementById('viewTrainerPhone').textContent = trainer.phone || 'N/A';
    document.getElementById('viewTrainerSpecialization').textContent = trainer.specialization;
    document.getElementById('viewTrainerExperience').textContent = trainer.experience;
    document.getElementById('viewTrainerCertifications').textContent = trainer.certifications || 'N/A';
    document.getElementById('viewTrainerStatus').textContent = trainer.status;
    document.getElementById('viewTrainerDays').textContent = trainer.workingDays ? trainer.workingDays.join(', ') : 'N/A';
    document.getElementById('viewTrainerImage').src = trainer.image;
    
    const modal = new bootstrap.Modal(document.getElementById('viewTrainerModal'));
    modal.show();
};

window.deleteTrainer = function(id) {
    const trainer = YogastraData.getById('trainers', id);
    if(confirm(`Are you sure you want to delete trainer ${trainer.name}?`)) {
        YogastraData.delete('trainers', id);
        YogastraData.logAction('Trainer Deleted', `Deleted trainer: ${trainer.name}`);
        showToast('Trainer deleted successfully!', 'danger');
        renderTrainers();
    }
};
