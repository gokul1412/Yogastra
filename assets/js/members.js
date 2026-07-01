document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.admin-table tbody');
    const searchInput = document.querySelector('input[placeholder="Search members..."]');
    const planFilter = document.querySelectorAll('.form-select')[0];
    const statusFilter = document.querySelectorAll('.form-select')[1];
    
    // Initial Render
    renderMembers();
    
    // Setup event listeners for search and filter
    searchInput.addEventListener('input', renderMembers);
    planFilter.addEventListener('change', renderMembers);
    statusFilter.addEventListener('change', renderMembers);

    // Setup Add/Edit form submission
    const memberForm = document.getElementById('memberForm');
    if(memberForm) {
        memberForm.addEventListener('submit', handleFormSubmit);
    }
});

function getFilteredMembers() {
    let members = YogastraData.getAll('members');
    
    const searchInput = document.querySelector('input[placeholder="Search members..."]').value.toLowerCase();
    const planFilter = document.querySelectorAll('.form-select')[0].value;
    const statusFilter = document.querySelectorAll('.form-select')[1].value;
    
    if (searchInput) {
        members = members.filter(m => 
            m.name.toLowerCase().includes(searchInput) || 
            m.email.toLowerCase().includes(searchInput) ||
            m.id.toLowerCase().includes(searchInput)
        );
    }
    
    if (planFilter !== 'All Plans') {
        members = members.filter(m => m.plan === planFilter);
    }
    
    if (statusFilter !== 'All Status') {
        members = members.filter(m => m.status === statusFilter);
    }
    
    return members;
}

function renderMembers() {
    const tableBody = document.querySelector('.admin-table tbody');
    const members = getFilteredMembers();
    
    tableBody.innerHTML = '';
    
    if (members.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No members found.</td></tr>';
        return;
    }
    
    members.forEach(member => {
        let badgeClass = 'bg-dark';
        if (member.plan === 'Premium') badgeClass = 'bg-primary';
        if (member.plan === 'Standard') badgeClass = 'bg-secondary';
        
        const statusClass = member.status === 'Active' ? 'status-active' : 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${member.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${member.image}" class="rounded-circle me-2" width="32" height="32" alt="Avatar">
                    <span class="fw-bold">${member.name}</span>
                </div>
            </td>
            <td>${member.email}</td>
            <td><span class="badge ${badgeClass}">${member.plan}</span></td>
            <td><span class="status-badge ${statusClass}">${member.status}</span></td>
            <td>${member.joinedDate}</td>
            <td>
                <button class="btn-icon" onclick="editMember('${member.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="viewMember('${member.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn-icon delete" onclick="deleteMember('${member.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('memberId').value;
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;
    const phone = document.getElementById('memberPhone').value;
    const plan = document.getElementById('memberPlan').value;
    const status = document.getElementById('memberStatus').value;
    const address = document.getElementById('memberAddress').value || '';
    
    const memberData = {
        name,
        email,
        phone,
        plan,
        status,
        address,
        image: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
    };
    
    if (id) {
        memberData.id = id;
        YogastraData.logAction('Member Updated', `Updated member: ${name}`);
        showToast('Member updated successfully!');
    } else {
        memberData.joinedDate = new Date().toISOString().split('T')[0];
        memberData.emergencyContact = "Not provided";
        memberData.medicalInfo = "None";
        YogastraData.logAction('Member Added', `Added new member: ${name}`);
        showToast('Member added successfully!');
    }
    
    YogastraData.save('members', memberData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('memberModal'));
    modal.hide();
    
    renderMembers();
}

function openAddModal() {
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';
    document.getElementById('memberModalLabel').textContent = 'Add New Member';
    
    const modal = new bootstrap.Modal(document.getElementById('memberModal'));
    modal.show();
}

window.editMember = function(id) {
    const member = YogastraData.getById('members', id);
    if (!member) return;
    
    document.getElementById('memberId').value = member.id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberEmail').value = member.email;
    document.getElementById('memberPhone').value = member.phone || '';
    document.getElementById('memberPlan').value = member.plan;
    document.getElementById('memberStatus').value = member.status;
    document.getElementById('memberAddress').value = member.address || '';
    
    document.getElementById('memberModalLabel').textContent = 'Edit Member';
    
    const modal = new bootstrap.Modal(document.getElementById('memberModal'));
    modal.show();
};

window.viewMember = function(id) {
    const member = YogastraData.getById('members', id);
    if (!member) return;
    
    document.getElementById('viewMemberName').textContent = member.name;
    document.getElementById('viewMemberEmail').textContent = member.email;
    document.getElementById('viewMemberPhone').textContent = member.phone || 'N/A';
    document.getElementById('viewMemberAddress').textContent = member.address || 'N/A';
    document.getElementById('viewMemberPlan').textContent = member.plan;
    document.getElementById('viewMemberStatus').textContent = member.status;
    document.getElementById('viewMemberJoined').textContent = member.joinedDate;
    document.getElementById('viewMemberImage').src = member.image;
    
    const modal = new bootstrap.Modal(document.getElementById('viewMemberModal'));
    modal.show();
};

window.deleteMember = function(id) {
    const member = YogastraData.getById('members', id);
    if(confirm(`Are you sure you want to delete member ${member.name}?`)) {
        YogastraData.delete('members', id);
        YogastraData.logAction('Member Deleted', `Deleted member: ${member.name}`);
        showToast('Member deleted successfully!', 'danger');
        renderMembers();
    }
};
