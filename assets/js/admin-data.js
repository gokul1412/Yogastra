const sampleData = {
    members: [
        { id: "MEM-001", name: "Emma Watson", email: "emma@example.com", phone: "+1 234 567 8901", address: "123 Yoga St, NY", plan: "Premium", status: "Active", joinedDate: "2026-01-15", emergencyContact: "John Watson (+1 987 654 3210)", medicalInfo: "None", image: "https://ui-avatars.com/api/?name=Emma+Watson&background=random" },
        { id: "MEM-002", name: "James Bond", email: "james@example.com", phone: "+1 234 567 8902", address: "456 Spy Way, LDN", plan: "Standard", status: "Active", joinedDate: "2026-02-02", emergencyContact: "M (+44 123 456 7890)", medicalInfo: "Minor shoulder pain", image: "https://ui-avatars.com/api/?name=James+Bond&background=random" },
        { id: "MEM-003", name: "Lucy Liu", email: "lucy@example.com", phone: "+1 234 567 8903", address: "789 Action Ave, LA", plan: "Basic", status: "Inactive", joinedDate: "2026-03-10", emergencyContact: "Jane Doe (+1 555 123 4567)", medicalInfo: "Asthma", image: "https://ui-avatars.com/api/?name=Lucy+Liu&background=random" },
        { id: "MEM-004", name: "Chris Evans", email: "chris@example.com", phone: "+1 234 567 8904", address: "101 Cap St, NY", plan: "Premium", status: "Active", joinedDate: "2026-04-12", emergencyContact: "Bucky Barnes (+1 999 888 7777)", medicalInfo: "None", image: "https://ui-avatars.com/api/?name=Chris+Evans&background=random" },
        { id: "MEM-005", name: "Scarlett Johansson", email: "scarlett@example.com", phone: "+1 234 567 8905", address: "202 Widow Ln, RU", plan: "Standard", status: "Active", joinedDate: "2026-05-20", emergencyContact: "Natasha Romanoff (+1 444 555 6666)", medicalInfo: "None", image: "https://ui-avatars.com/api/?name=Scarlett+Johansson&background=random" }
    ],
    trainers: [
        { id: "TRN-001", name: "Arjun Singh", email: "arjun@yogastra.com", phone: "+1 555 111 2222", specialization: "Hatha Yoga", experience: "8 Years", certifications: "RYT 500", workingDays: ["Mon", "Wed", "Fri"], status: "Active", image: "https://ui-avatars.com/api/?name=Arjun+Singh&background=random" },
        { id: "TRN-002", name: "Maya Patel", email: "maya@yogastra.com", phone: "+1 555 333 4444", specialization: "Vinyasa Flow", experience: "5 Years", certifications: "RYT 200", workingDays: ["Tue", "Thu", "Sat"], status: "Active", image: "https://ui-avatars.com/api/?name=Maya+Patel&background=random" },
        { id: "TRN-003", name: "David Kim", email: "david@yogastra.com", phone: "+1 555 555 6666", specialization: "Ashtanga Yoga", experience: "10 Years", certifications: "E-RYT 500", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], status: "On Leave", image: "https://ui-avatars.com/api/?name=David+Kim&background=random" }
    ],
    classes: [
        { id: "CLS-001", name: "Morning Hatha", trainerId: "TRN-001", duration: "60 mins", capacity: 20, difficulty: "Beginner", status: "Active", description: "A gentle introduction to basic yoga postures." },
        { id: "CLS-002", name: "Power Vinyasa", trainerId: "TRN-002", duration: "75 mins", capacity: 15, difficulty: "Advanced", status: "Active", description: "A fast-paced, cardiovascular yoga workout." },
        { id: "CLS-003", name: "Ashtanga Primary", trainerId: "TRN-003", duration: "90 mins", capacity: 10, difficulty: "Intermediate", status: "Active", description: "A traditional, rigorous series of postures." },
        { id: "CLS-004", name: "Restorative Yoga", trainerId: "TRN-001", duration: "60 mins", capacity: 25, difficulty: "All Levels", status: "Inactive", description: "Deep relaxation and stretching with props." }
    ],
    schedules: [
        { id: "SCH-001", classId: "CLS-001", trainerId: "TRN-001", date: "2026-07-02", time: "07:00 AM", room: "Studio A", status: "Scheduled" },
        { id: "SCH-002", classId: "CLS-002", trainerId: "TRN-002", date: "2026-07-02", time: "09:00 AM", room: "Studio B", status: "Scheduled" },
        { id: "SCH-003", classId: "CLS-003", trainerId: "TRN-003", date: "2026-07-03", time: "06:00 AM", room: "Studio A", status: "Cancelled" },
        { id: "SCH-004", classId: "CLS-001", trainerId: "TRN-001", date: "2026-07-04", time: "08:00 AM", room: "Studio C", status: "Scheduled" }
    ],
    bookings: [
        { id: "BKG-001", memberId: "MEM-001", classId: "CLS-001", scheduleId: "SCH-001", bookingDate: "2026-07-01", status: "Confirmed", paymentStatus: "Paid" },
        { id: "BKG-002", memberId: "MEM-002", classId: "CLS-002", scheduleId: "SCH-002", bookingDate: "2026-07-01", status: "Confirmed", paymentStatus: "Pending" },
        { id: "BKG-003", memberId: "MEM-004", classId: "CLS-001", scheduleId: "SCH-001", bookingDate: "2026-07-01", status: "Cancelled", paymentStatus: "Refunded" }
    ],
    attendance: [
        { id: "ATT-001", scheduleId: "SCH-001", date: "2026-07-02", memberId: "MEM-001", status: "Present" },
        { id: "ATT-002", scheduleId: "SCH-002", date: "2026-07-02", memberId: "MEM-002", status: "Absent" }
    ],
    payments: [
        { id: "PAY-001", invoiceNumber: "INV-2026-001", memberId: "MEM-001", planId: "PLN-001", amount: 150, method: "Credit Card", transactionId: "TXN123456789", date: "2026-06-15", status: "Completed" },
        { id: "PAY-002", invoiceNumber: "INV-2026-002", memberId: "MEM-002", planId: "PLN-002", amount: 100, method: "PayPal", transactionId: "TXN987654321", date: "2026-06-20", status: "Completed" },
        { id: "PAY-003", invoiceNumber: "INV-2026-003", memberId: "MEM-003", planId: "PLN-003", amount: 50, method: "Cash", transactionId: "-", date: "2026-06-25", status: "Failed" }
    ],
    plans: [
        { id: "PLN-001", name: "Premium", duration: "1 Year", price: 1200, features: "Unlimited Classes, Free Workshops, 1-on-1 Sessions", benefits: "Priority Booking", status: "Active" },
        { id: "PLN-002", name: "Standard", duration: "6 Months", price: 700, features: "15 Classes/month, Free Workshops", benefits: "Standard Booking", status: "Active" },
        { id: "PLN-003", name: "Basic", duration: "1 Month", price: 150, features: "5 Classes/month", benefits: "None", status: "Active" }
    ],
    events: [
        { id: "EVT-001", title: "Summer Solstice Yoga Retreat", date: "2026-06-21", time: "08:00 AM", venue: "Central Park", registrationLimit: 100, description: "Join us for a massive outdoor yoga session.", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80" },
        { id: "EVT-002", title: "Mindfulness Meditation Workshop", date: "2026-07-15", time: "10:00 AM", venue: "Studio B", registrationLimit: 30, description: "Learn techniques to cultivate mindfulness.", image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=400&q=80" }
    ],
    testimonials: [
        { id: "TST-001", memberName: "Sarah Connor", rating: 5, review: "Yogastra changed my life! The trainers are amazing.", status: "Approved", image: "https://ui-avatars.com/api/?name=Sarah+Connor&background=random" },
        { id: "TST-002", memberName: "John Smith", rating: 4, review: "Great facilities, but classes can get crowded.", status: "Approved", image: "https://ui-avatars.com/api/?name=John+Smith&background=random" },
        { id: "TST-003", memberName: "Alice Wonderland", rating: 5, review: "Best yoga studio in town.", status: "Pending", image: "https://ui-avatars.com/api/?name=Alice+Wonderland&background=random" }
    ],
    messages: [
        { id: "MSG-001", name: "Bruce Wayne", email: "bruce@wayne.com", subject: "Private Sessions", message: "Do you offer private evening sessions?", date: "2026-06-28", status: "Unread", reply: "" },
        { id: "MSG-002", name: "Clark Kent", email: "clark@dailyplanet.com", subject: "Membership Inquiry", message: "What are your current rates?", date: "2026-06-29", status: "Read", reply: "Hello Clark, our rates are listed on our website..." }
    ],
    blogs: [
        { id: "BLG-001", title: "5 Benefits of Morning Yoga", category: "Wellness", author: "Maya Patel", tags: "yoga, health, morning", status: "Published", date: "2026-06-01", content: "Morning yoga helps to start your day with energy...", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80" },
        { id: "BLG-002", title: "Understanding Chakras", category: "Philosophy", author: "Arjun Singh", tags: "chakras, meditation", status: "Draft", date: "2026-06-15", content: "Chakras are energy centers in the body...", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80" }
    ],
    gallery: [
        { id: "GAL-001", title: "Studio A", category: "Facilities", image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=400&q=80" },
        { id: "GAL-002", title: "Outdoor Yoga", category: "Events", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80" }
    ],
    notifications: [
        { id: "NOT-001", title: "New Member Registration", message: "Chris Evans joined the Premium plan.", date: "2026-04-12 10:00 AM", isRead: false },
        { id: "NOT-002", title: "Payment Received", message: "Payment of $150 received from Emma Watson.", date: "2026-06-15 02:30 PM", isRead: false },
        { id: "NOT-003", title: "Class Cancelled", message: "Ashtanga Primary on 2026-07-03 has been cancelled.", date: "2026-07-01 09:00 AM", isRead: true }
    ],
    logs: [
        { id: "LOG-001", action: "Login", user: "Admin (Kiran)", details: "Logged into the system", date: "2026-07-01 08:00 AM" },
        { id: "LOG-002", action: "Member Added", user: "Admin (Kiran)", details: "Added new member Scarlett Johansson", date: "2026-05-20 11:15 AM" },
        { id: "LOG-003", action: "Payment Completed", user: "System", details: "Payment PAY-001 completed automatically", date: "2026-06-15 02:30 PM" }
    ],
    adminProfile: {
        name: "Kiran",
        email: "admin@yogastra.com",
        phone: "+1 000 000 0000",
        address: "Admin HQ, Yoga Center",
        about: "Super Admin for Yogastra",
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
    }
};

const YogastraData = {
    init: function() {
        let seededMissingData = false;

        for (const key in sampleData) {
            const storageKey = `yogastra_${key}`;
            if (!localStorage.getItem(storageKey)) {
                localStorage.setItem(storageKey, JSON.stringify(sampleData[key]));
                seededMissingData = true;
            }
        }

        if (!localStorage.getItem('yogastra_initialized') || seededMissingData) {
            localStorage.setItem('yogastra_initialized', 'true');
            console.log('Sample data initialized in LocalStorage.');
        }
    },
    
    reset: function() {
        localStorage.clear();
        this.init();
        location.reload();
    },

    getAll: function(collection) {
        return JSON.parse(localStorage.getItem(`yogastra_${collection}`)) || [];
    },

    getById: function(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === id);
    },

    save: function(collection, data) {
        const items = this.getAll(collection);
        
        if (data.id) {
            const index = items.findIndex(item => item.id === data.id);
            if (index !== -1) {
                items[index] = { ...items[index], ...data };
            } else {
                items.push(data);
            }
        } else {
            // Generate ID based on collection prefix
            const prefix = collection.substring(0, 3).toUpperCase();
            data.id = `${prefix}-${Date.now().toString().slice(-6)}`;
            items.push(data);
        }
        
        localStorage.setItem(`yogastra_${collection}`, JSON.stringify(items));
        return data;
    },

    delete: function(collection, id) {
        let items = this.getAll(collection);
        items = items.filter(item => item.id !== id);
        localStorage.setItem(`yogastra_${collection}`, JSON.stringify(items));
    },

    logAction: function(action, details) {
        const logs = this.getAll('logs');
        const adminProfile = this.getAll('adminProfile');
        const userName = adminProfile && !Array.isArray(adminProfile) ? adminProfile.name : 'Admin';
        const newLog = {
            id: `LOG-${Date.now().toString().slice(-6)}`,
            action: action,
            user: `Admin (${userName})`, 
            details: details,
            date: new Date().toLocaleString()
        };
        logs.unshift(newLog); // Add to beginning
        localStorage.setItem('yogastra_logs', JSON.stringify(logs));
    },
    
    addNotification: function(title, message) {
        const notifs = this.getAll('notifications');
        const newNotif = {
            id: `NOT-${Date.now().toString().slice(-6)}`,
            title: title,
            message: message,
            date: new Date().toLocaleString(),
            isRead: false
        };
        notifs.unshift(newNotif);
        localStorage.setItem('yogastra_notifications', JSON.stringify(notifs));
        this.updateBadge();
    },
    
    updateBadge: function() {
        const notifs = this.getAll('notifications');
        const unreadCount = notifs.filter(n => !n.isRead).length;
        const badges = document.querySelectorAll('.badge-indicator');
        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.style.display = 'block';
                badge.textContent = unreadCount;
                badge.classList.add('bg-danger');
            } else {
                badge.style.display = 'none';
            }
        });
    }
};

// Initialize data when script loads
document.addEventListener('DOMContentLoaded', () => {
    YogastraData.init();
    YogastraData.updateBadge();
});

// Admin Auth Helper
const AdminAuth = {
    getLoginUrl: function() {
        return window.location.pathname.includes('/admin/') ? '../pages/login.html' : 'login.html';
    },

    logout: function() {
        // Clear all session storage
        sessionStorage.clear();
        
        // Clear specific local storage items related to admin session (not the actual data for this local app)
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        
        YogastraData.logAction('Logout', 'Admin logged out successfully');
        
        // Redirect to login page
        window.location.href = this.getLoginUrl();
    },
    
    checkAuth: function() {
        // Basic check - in a real app, validate token
        // For this local prototype, we just let them stay or redirect if not simulated login
    }
};

// Global utilities
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-bold">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}
