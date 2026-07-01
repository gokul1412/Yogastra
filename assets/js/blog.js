document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    
    // Initial Render
    renderBlogs();
    
    // Setup event listeners for search
    if(searchInput) {
        searchInput.addEventListener('input', renderBlogs);
    }

    // Setup Add/Edit form submission
    const blogForm = document.getElementById('blogForm');
    if(blogForm) {
        blogForm.addEventListener('submit', handleBlogFormSubmit);
    }
});

function getFilteredBlogs() {
    let blogs = YogastraData.getAll('blogs') || [];
    
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        blogs = blogs.filter(b => b.title.toLowerCase().includes(searchTerm) || b.category.toLowerCase().includes(searchTerm));
    }
    
    // Sort by date descending
    return blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderBlogs() {
    const tableBody = document.querySelector('.admin-table tbody');
    if(!tableBody) return;
    
    const blogs = getFilteredBlogs();
    tableBody.innerHTML = '';
    
    if (blogs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No blog posts found.</td></tr>';
        return;
    }
    
    blogs.forEach(blog => {
        let statusClass = 'status-pending';
        if (blog.status === 'Published') statusClass = 'status-active';
        if (blog.status === 'Draft') statusClass = 'status-inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-muted fw-bold">${blog.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${blog.image}" class="rounded me-3" width="60" height="40" style="object-fit: cover;" alt="Blog">
                    <span class="fw-bold">${blog.title}</span>
                </div>
            </td>
            <td><span class="badge bg-secondary">${blog.category}</span></td>
            <td>${blog.date}</td>
            <td><span class="status-badge ${statusClass}">${blog.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editBlog('${blog.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteBlog('${blog.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleBlogFormSubmit(e) {
    e.preventDefault();
    
    let id = document.getElementById('blogId').value;
    const title = document.getElementById('blogTitle').value;
    const category = document.getElementById('blogCategory').value;
    const content = document.getElementById('blogContent').value;
    const status = document.getElementById('blogStatus').value;
    const imageInput = document.getElementById('blogImage');
    const date = new Date().toISOString().split('T')[0]; // Auto-set date
    
    let image = 'https://source.unsplash.com/random/400x300/?yoga'; // Default image
    
    // Attempt to handle image upload if provided (base64)
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            image = evt.target.result;
            saveBlogData(id, title, category, content, status, image, date);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // If editing and no new image is provided, keep old image
        if(id) {
            const oldB = YogastraData.getAll('blogs').find(b => b.id === id);
            if(oldB && oldB.image) {
                image = oldB.image;
            }
        }
        saveBlogData(id, title, category, content, status, image, date);
    }
}

function saveBlogData(id, title, category, content, status, image, date) {
    // Generate ID if new
    if(!id) {
        const blogs = YogastraData.getAll('blogs');
        id = `BLG-00${blogs.length + 1}`;
    }
    
    const blogData = {
        id, title, category, content, status, image, date, author: "Admin"
    };
    
    if (document.getElementById('blogId').value) {
        YogastraData.logAction('Blog Updated', `Updated blog: ${title}`);
        showToast('Blog updated successfully!');
    } else {
        YogastraData.logAction('Blog Added', `Added new blog: ${title}`);
        showToast('Blog added successfully!');
    }
    
    let blogs = YogastraData.getAll('blogs');
    const index = blogs.findIndex(b => b.id === id);
    if(index !== -1) {
        // Preserve original date on edit
        blogData.date = blogs[index].date;
        blogs[index] = blogData;
    } else {
        blogs.push(blogData);
    }
    localStorage.setItem('yogastra_blogs', JSON.stringify(blogs));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('blogModal'));
    modal.hide();
    
    renderBlogs();
}

window.openBlogModal = function() {
    document.getElementById('blogForm').reset();
    document.getElementById('blogId').value = '';
    document.getElementById('blogModalLabel').textContent = 'Create New Blog Post';
    
    const modal = new bootstrap.Modal(document.getElementById('blogModal'));
    modal.show();
};

window.editBlog = function(id) {
    const b = YogastraData.getAll('blogs').find(b => b.id === id);
    if (!b) return;
    
    document.getElementById('blogId').value = b.id;
    document.getElementById('blogTitle').value = b.title;
    document.getElementById('blogCategory').value = b.category;
    document.getElementById('blogContent').value = b.content;
    document.getElementById('blogStatus').value = b.status;
    
    document.getElementById('blogModalLabel').textContent = 'Edit Blog Post';
    
    const modal = new bootstrap.Modal(document.getElementById('blogModal'));
    modal.show();
};

window.deleteBlog = function(id) {
    if(confirm(`Are you sure you want to delete blog post ${id}?`)) {
        let blogs = YogastraData.getAll('blogs');
        blogs = blogs.filter(b => b.id !== id);
        localStorage.setItem('yogastra_blogs', JSON.stringify(blogs));
        
        YogastraData.logAction('Blog Deleted', `Deleted blog ID: ${id}`);
        showToast('Blog deleted successfully!', 'danger');
        renderBlogs();
    }
};
