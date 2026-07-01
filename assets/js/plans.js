document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderPlans();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderPlans);
    }

    // Setup Add/Edit form submission
    const planForm = document.getElementById('planForm');
    if(planForm) {
        planForm.addEventListener('submit', handlePlanFormSubmit);
    }
});

function getFilteredPlans() {
    let plans = YogastraData.getAll('plans');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        plans = plans.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    return plans;
}

function renderPlans() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const plans = getFilteredPlans();
    tableBody.innerHTML = '';
    
    if (plans.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No plans found.</td></tr>';
        return;
    }
    
    plans.forEach(plan => {
        let statusClass = 'status-inactive';
        if (plan.status === 'Active') statusClass = 'status-active';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${plan.id}</td>
            <td class="fw-bold">${plan.name}</td>
            <td class="text-success fw-bold">$${plan.price}</td>
            <td>${plan.duration}</td>
            <td><small class="text-muted">${plan.features.slice(0, 2).join(', ')}${plan.features.length > 2 ? '...' : ''}</small></td>
            <td><span class="status-badge ${statusClass}">${plan.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editPlan('${plan.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deletePlan('${plan.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handlePlanFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('planId').value;
    const name = document.getElementById('planName').value;
    const price = document.getElementById('planPrice').value;
    const duration = document.getElementById('planDuration').value;
    const featuresStr = document.getElementById('planFeatures').value;
    const status = document.getElementById('planStatus').value;
    
    const features = featuresStr.split(',').map(f => f.trim()).filter(f => f);
    
    // Generate ID if new
    if(!id) {
        const plans = YogastraData.getAll('plans');
        id = `PLN-00${plans.length + 1}`;
    }
    
    const planData = {
        id, name, price: parseFloat(price), duration, features, status
    };
    
    if (document.getElementById('planId').value) {
        YogastraData.logAction('Plan Updated', `Updated plan: ${name}`);
        showToast('Plan updated successfully!');
    } else {
        YogastraData.logAction('Plan Added', `Added new plan: ${name}`);
        showToast('Plan added successfully!');
    }
    
    let plans = YogastraData.getAll('plans');
    const index = plans.findIndex(p => p.id === id);
    if(index !== -1) {
        plans[index] = planData;
    } else {
        plans.push(planData);
    }
    localStorage.setItem('yogastra_plans', JSON.stringify(plans));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('planModal'));
    modal.hide();
    
    renderPlans();
}

window.openPlanModal = function() {
    document.getElementById('planForm').reset();
    document.getElementById('planId').value = '';
    document.getElementById('planModalLabel').textContent = 'Add New Plan';
    
    const modal = new bootstrap.Modal(document.getElementById('planModal'));
    modal.show();
};

window.editPlan = function(id) {
    const plan = YogastraData.getAll('plans').find(p => p.id === id);
    if (!plan) return;
    
    document.getElementById('planId').value = plan.id;
    document.getElementById('planName').value = plan.name;
    document.getElementById('planPrice').value = plan.price;
    document.getElementById('planDuration').value = plan.duration;
    document.getElementById('planFeatures').value = plan.features.join(', ');
    document.getElementById('planStatus').value = plan.status;
    
    document.getElementById('planModalLabel').textContent = 'Edit Plan';
    
    const modal = new bootstrap.Modal(document.getElementById('planModal'));
    modal.show();
};

window.deletePlan = function(id) {
    if(confirm(`Are you sure you want to delete plan ${id}?`)) {
        let plans = YogastraData.getAll('plans');
        plans = plans.filter(p => p.id !== id);
        localStorage.setItem('yogastra_plans', JSON.stringify(plans));
        
        YogastraData.logAction('Plan Deleted', `Deleted plan ID: ${id}`);
        showToast('Plan deleted successfully!', 'danger');
        renderPlans();
    }
};
