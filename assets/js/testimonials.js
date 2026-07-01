document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderTestimonials();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderTestimonials);
    }

    // Setup Add/Edit form submission
    const testimonialForm = document.getElementById('testimonialForm');
    if(testimonialForm) {
        testimonialForm.addEventListener('submit', handleTestimonialFormSubmit);
    }
});

function getFilteredTestimonials() {
    let testimonials = YogastraData.getAll('testimonials');
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        testimonials = testimonials.filter(t => t.name.toLowerCase().includes(searchTerm) || t.content.toLowerCase().includes(searchTerm));
    }
    
    return testimonials;
}

function renderTestimonials() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const testimonials = getFilteredTestimonials();
    tableBody.innerHTML = '';
    
    if (testimonials.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No testimonials found.</td></tr>';
        return;
    }
    
    testimonials.forEach(t => {
        let statusClass = 'status-inactive';
        if (t.status === 'Published') statusClass = 'status-active';
        if (t.status === 'Pending') statusClass = 'status-pending';
        
        let stars = '';
        for(let i=0; i<5; i++) {
            if(i < t.rating) {
                stars += '<i class="fas fa-star text-warning"></i>';
            } else {
                stars += '<i class="far fa-star text-muted"></i>';
            }
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${t.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${t.image}" class="rounded-circle me-2" width="24" height="24" alt="Avatar">
                    <span class="fw-bold">${t.name}</span>
                </div>
            </td>
            <td><small class="text-muted">${t.content.length > 50 ? t.content.substring(0, 50) + '...' : t.content}</small></td>
            <td>${stars}</td>
            <td><span class="status-badge ${statusClass}">${t.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editTestimonial('${t.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteTestimonial('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleTestimonialFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('testimonialId').value;
    const name = document.getElementById('testimonialName').value;
    const content = document.getElementById('testimonialContent').value;
    const rating = document.getElementById('testimonialRating').value;
    const status = document.getElementById('testimonialStatus').value;
    const imageInput = document.getElementById('testimonialImage');
    
    let image = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
    
    // Attempt to handle image upload if provided (base64)
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            image = evt.target.result;
            saveTestimonialData(id, name, content, rating, status, image);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // If editing and no new image is provided, keep old image
        if(id) {
            const oldT = YogastraData.getAll('testimonials').find(t => t.id === id);
            if(oldT && oldT.image) {
                image = oldT.image;
            }
        }
        saveTestimonialData(id, name, content, rating, status, image);
    }
}

function saveTestimonialData(id, name, content, rating, status, image) {
    // Generate ID if new
    if(!id) {
        const testimonials = YogastraData.getAll('testimonials');
        id = `TST-00${testimonials.length + 1}`;
    }
    
    const testimonialData = {
        id, name, content, rating: parseInt(rating), status, image
    };
    
    if (document.getElementById('testimonialId').value) {
        YogastraData.logAction('Testimonial Updated', `Updated testimonial: ${name}`);
        showToast('Testimonial updated successfully!');
    } else {
        YogastraData.logAction('Testimonial Added', `Added new testimonial: ${name}`);
        showToast('Testimonial added successfully!');
    }
    
    let testimonials = YogastraData.getAll('testimonials');
    const index = testimonials.findIndex(t => t.id === id);
    if(index !== -1) {
        testimonials[index] = testimonialData;
    } else {
        testimonials.push(testimonialData);
    }
    localStorage.setItem('yogastra_testimonials', JSON.stringify(testimonials));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('testimonialModal'));
    modal.hide();
    
    renderTestimonials();
}

window.openTestimonialModal = function() {
    document.getElementById('testimonialForm').reset();
    document.getElementById('testimonialId').value = '';
    document.getElementById('testimonialModalLabel').textContent = 'Add New Testimonial';
    
    const modal = new bootstrap.Modal(document.getElementById('testimonialModal'));
    modal.show();
};

window.editTestimonial = function(id) {
    const t = YogastraData.getAll('testimonials').find(t => t.id === id);
    if (!t) return;
    
    document.getElementById('testimonialId').value = t.id;
    document.getElementById('testimonialName').value = t.name;
    document.getElementById('testimonialContent').value = t.content;
    document.getElementById('testimonialRating').value = t.rating;
    document.getElementById('testimonialStatus').value = t.status;
    // Cannot set file input value programmatically for security reasons, it remains empty
    
    document.getElementById('testimonialModalLabel').textContent = 'Edit Testimonial';
    
    const modal = new bootstrap.Modal(document.getElementById('testimonialModal'));
    modal.show();
};

window.deleteTestimonial = function(id) {
    if(confirm(`Are you sure you want to delete testimonial ${id}?`)) {
        let testimonials = YogastraData.getAll('testimonials');
        testimonials = testimonials.filter(t => t.id !== id);
        localStorage.setItem('yogastra_testimonials', JSON.stringify(testimonials));
        
        YogastraData.logAction('Testimonial Deleted', `Deleted testimonial ID: ${id}`);
        showToast('Testimonial deleted successfully!', 'danger');
        renderTestimonials();
    }
};
