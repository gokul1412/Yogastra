document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderPayments();
    populatePaymentDropdowns();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderPayments);
    }

    // Setup Add/Edit form submission
    const paymentForm = document.getElementById('paymentForm');
    if(paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentFormSubmit);
    }
});

function getFilteredPayments() {
    let payments = YogastraData.getAll('payments');
    const members = YogastraData.getAll('members');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        payments = payments.filter(p => {
            const member = members.find(m => m.id === p.memberId);
            return (member && member.name.toLowerCase().includes(searchTerm)) || 
                   p.id.toLowerCase().includes(searchTerm) ||
                   p.method.toLowerCase().includes(searchTerm);
        });
    }
    
    // Sort by date descending
    return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderPayments() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const payments = getFilteredPayments();
    const members = YogastraData.getAll('members');
    
    tableBody.innerHTML = '';
    
    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No payments found.</td></tr>';
        return;
    }
    
    payments.forEach(payment => {
        const member = members.find(m => m.id === payment.memberId);
        
        if(!member) return;
        
        let statusClass = 'status-pending';
        if (payment.status === 'Completed') statusClass = 'status-active';
        if (payment.status === 'Failed' || payment.status === 'Refunded') statusClass = 'status-inactive';
        
        let methodIcon = 'fa-money-bill-wave';
        if (payment.method === 'Credit Card') methodIcon = 'fa-credit-card';
        if (payment.method === 'Bank Transfer') methodIcon = 'fa-university';
        if (payment.method === 'UPI' || payment.method === 'Online') methodIcon = 'fa-mobile-alt';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${payment.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${member.image}" class="rounded-circle me-2" width="24" height="24" alt="Avatar">
                    <span class="fw-bold">${member.name}</span>
                </div>
            </td>
            <td class="fw-bold text-success">$${payment.amount}</td>
            <td>${payment.date}</td>
            <td><i class="fas ${methodIcon} me-2 text-muted"></i>${payment.method}</td>
            <td><span class="status-badge ${statusClass}">${payment.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editPayment('${payment.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deletePayment('${payment.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function populatePaymentDropdowns() {
    const memberSelect = document.getElementById('paymentMember');
    if (!memberSelect) return;
    
    const members = YogastraData.getAll('members');
    
    memberSelect.innerHTML = '<option value="">Select Member</option>';
    members.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.name;
        memberSelect.appendChild(option);
    });
}

function handlePaymentFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('paymentId').value;
    const memberId = document.getElementById('paymentMember').value;
    const amount = document.getElementById('paymentAmount').value;
    const date = document.getElementById('paymentDate').value;
    const method = document.getElementById('paymentMethod').value;
    const status = document.getElementById('paymentStatus').value;
    const notes = document.getElementById('paymentNotes').value;
    
    // Generate an ID if it's new
    if(!id) {
        const payments = YogastraData.getAll('payments');
        id = `TXN-${(payments.length + 1001)}`;
    }
    
    const paymentData = {
        id, memberId, amount: parseFloat(amount), date, method, status, notes
    };
    
    if (document.getElementById('paymentId').value) {
        YogastraData.logAction('Payment Updated', `Updated transaction ID: ${id}`);
        showToast('Payment updated successfully!');
    } else {
        YogastraData.logAction('Payment Recorded', `Recorded new payment for member: ${memberId}`);
        showToast('Payment recorded successfully!');
    }
    
    // Custom save logic for payments since we generated ID manually here or might need to update existing
    let payments = YogastraData.getAll('payments');
    const index = payments.findIndex(p => p.id === id);
    if(index !== -1) {
        payments[index] = paymentData;
    } else {
        payments.push(paymentData);
    }
    localStorage.setItem('yogastra_payments', JSON.stringify(payments));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    modal.hide();
    
    renderPayments();
}

window.openPaymentModal = function() {
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentId').value = '';
    // Set default date to today
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('paymentModalLabel').textContent = 'Record New Payment';
    
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
};

window.editPayment = function(id) {
    const payment = YogastraData.getAll('payments').find(p => p.id === id);
    if (!payment) return;
    
    document.getElementById('paymentId').value = payment.id;
    document.getElementById('paymentMember').value = payment.memberId;
    document.getElementById('paymentAmount').value = payment.amount;
    document.getElementById('paymentDate').value = payment.date;
    document.getElementById('paymentMethod').value = payment.method;
    document.getElementById('paymentStatus').value = payment.status;
    document.getElementById('paymentNotes').value = payment.notes || '';
    
    document.getElementById('paymentModalLabel').textContent = 'Edit Payment';
    
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
};

window.deletePayment = function(id) {
    if(confirm(`Are you sure you want to delete transaction ${id}?`)) {
        let payments = YogastraData.getAll('payments');
        payments = payments.filter(p => p.id !== id);
        localStorage.setItem('yogastra_payments', JSON.stringify(payments));
        
        YogastraData.logAction('Payment Deleted', `Deleted transaction ID: ${id}`);
        showToast('Payment deleted successfully!', 'danger');
        renderPayments();
    }
};
