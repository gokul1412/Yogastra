document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderGallery();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderGallery);
    }

    // Setup Add/Edit form submission
    const galleryForm = document.getElementById('galleryForm');
    if(galleryForm) {
        galleryForm.addEventListener('submit', handleGalleryFormSubmit);
    }
});

function getFilteredGallery() {
    let gallery = YogastraData.getAll('gallery') || [];
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        gallery = gallery.filter(g => g.title.toLowerCase().includes(searchTerm) || g.category.toLowerCase().includes(searchTerm));
    }
    
    // Sort by date descending
    return gallery.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderGallery() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const gallery = getFilteredGallery();
    tableBody.innerHTML = '';
    
    if (gallery.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No gallery items found.</td></tr>';
        return;
    }
    
    gallery.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${item.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.image}" class="rounded me-3" width="80" height="60" style="object-fit: cover;" alt="Gallery">
                    <span class="fw-bold">${item.title}</span>
                </div>
            </td>
            <td><span class="badge bg-secondary">${item.category}</span></td>
            <td>${item.date}</td>
            <td>
                <button class="btn-icon" onclick="editGallery('${item.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteGallery('${item.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleGalleryFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('galleryId').value;
    const title = document.getElementById('galleryTitle').value;
    const category = document.getElementById('galleryCategory').value;
    const imageInput = document.getElementById('galleryImage');
    const date = new Date().toISOString().split('T')[0]; // Auto-set date
    
    let image = 'https://source.unsplash.com/random/800x600/?yoga'; // Default image
    
    // Attempt to handle image upload if provided (base64)
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            image = evt.target.result;
            saveGalleryData(id, title, category, image, date);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // If editing and no new image is provided, keep old image
        if(id) {
            const oldG = YogastraData.getAll('gallery').find(g => g.id === id);
            if(oldG && oldG.image) {
                image = oldG.image;
            }
        }
        saveGalleryData(id, title, category, image, date);
    }
}

function saveGalleryData(id, title, category, image, date) {
    // Generate ID if new
    if(!id) {
        const gallery = YogastraData.getAll('gallery') || [];
        id = `GAL-00${gallery.length + 1}`;
    }
    
    const galleryData = {
        id, title, category, image, date
    };
    
    if (document.getElementById('galleryId').value) {
        YogastraData.logAction('Gallery Updated', `Updated gallery item: ${title}`);
        showToast('Gallery item updated successfully!');
    } else {
        YogastraData.logAction('Gallery Added', `Added new gallery item: ${title}`);
        showToast('Gallery item added successfully!');
    }
    
    let gallery = YogastraData.getAll('gallery') || [];
    const index = gallery.findIndex(g => g.id === id);
    if(index !== -1) {
        // Preserve original date on edit
        galleryData.date = gallery[index].date;
        gallery[index] = galleryData;
    } else {
        gallery.push(galleryData);
    }
    localStorage.setItem('yogastra_gallery', JSON.stringify(gallery));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('galleryModal'));
    modal.hide();
    
    renderGallery();
}

window.openGalleryModal = function() {
    document.getElementById('galleryForm').reset();
    document.getElementById('galleryId').value = '';
    document.getElementById('galleryModalLabel').textContent = 'Add New Gallery Image';
    
    const modal = new bootstrap.Modal(document.getElementById('galleryModal'));
    modal.show();
};

window.editGallery = function(id) {
    const g = (YogastraData.getAll('gallery') || []).find(g => g.id === id);
    if (!g) return;
    
    document.getElementById('galleryId').value = g.id;
    document.getElementById('galleryTitle').value = g.title;
    document.getElementById('galleryCategory').value = g.category;
    
    document.getElementById('galleryModalLabel').textContent = 'Edit Gallery Image';
    
    const modal = new bootstrap.Modal(document.getElementById('galleryModal'));
    modal.show();
};

window.deleteGallery = function(id) {
    if(confirm(`Are you sure you want to delete gallery item ${id}?`)) {
        let gallery = YogastraData.getAll('gallery') || [];
        gallery = gallery.filter(g => g.id !== id);
        localStorage.setItem('yogastra_gallery', JSON.stringify(gallery));
        
        YogastraData.logAction('Gallery Deleted', `Deleted gallery item ID: ${id}`);
        showToast('Gallery item deleted successfully!', 'danger');
        renderGallery();
    }
};
