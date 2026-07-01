document.addEventListener('DOMContentLoaded', () => {
    // 1. Remove Page Loader
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500); // Wait for transition
        }, 500);
    }

    // 2. Sidebar Toggle (Mobile)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // Close sidebar if clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && sidebar && sidebar.classList.contains('show')) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    // 3. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('adminTheme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // 4. RTL Toggle
    const rtlToggle = document.getElementById('rtl-toggle');
    if (rtlToggle) {
        const savedDir = localStorage.getItem('adminDir');
        if (savedDir === 'rtl') {
            document.documentElement.setAttribute('dir', 'rtl');
        }

        rtlToggle.addEventListener('click', () => {
            const currentDir = document.documentElement.getAttribute('dir');
            if (currentDir === 'rtl') {
                document.documentElement.setAttribute('dir', 'ltr');
                localStorage.setItem('adminDir', 'ltr');
            } else {
                document.documentElement.setAttribute('dir', 'rtl');
                localStorage.setItem('adminDir', 'rtl');
            }
        });
    }

    // 5. Intercept Logout Links
    const logoutLinks = document.querySelectorAll('a[href="../login.html"], a[href="../pages/login.html"], a[href="login.html"], a[data-admin-logout]');
    logoutLinks.forEach(link => {
        if (link.textContent.toLowerCase().includes('logout')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
});

// Function for dummy CRUD actions (Delete confirmation)
function confirmDelete(id) {
    if(confirm('Are you sure you want to delete this record?')) {
        alert('Record deleted successfully (Demo).');
        // In a real app, you would make an AJAX call here and remove the row from DOM
    }
}

// Global Toast Notification
function showToast(message, type = 'success') {
    // Check if toast container exists
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';
        document.body.appendChild(toastContainer);
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
    }, 3000);
}

// Admin Logout Logic
window.logout = function() {
    if(confirm('Are you sure you want to log out?')) {
        if (typeof AdminAuth !== 'undefined' && typeof AdminAuth.logout === 'function') {
            AdminAuth.logout();
            return;
        }

        sessionStorage.clear();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');

        const isAdminPage = window.location.pathname.includes('/admin/');
        window.location.href = isAdminPage ? '../pages/login.html' : 'login.html';
    }
};
