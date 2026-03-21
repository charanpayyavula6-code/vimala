// ============================================
// REAL API SERVICE (Connects to Flask Backend)
// ============================================

class ApiService {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:5000/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                timestamp: new Date().toISOString()
            };
        }
    }

    async getGalleryImages() { return this.request('/gallery'); }
    async updateGalleryImages(images) { return this.request('/gallery', { method: 'PUT', body: JSON.stringify(images) }); }
    
    async getEquipment() { return this.request('/equipment'); }
    async addEquipment(equipmentData) { return this.request('/equipment', { method: 'POST', body: JSON.stringify(equipmentData) }); }
    async deleteEquipment(id) { return this.request(`/equipment/${id}`, { method: 'DELETE' }); }
    
    async getBookings() { return this.request('/bookings'); }
    async getUserBookings(userEmail) { return this.request(`/bookings/user/${encodeURIComponent(userEmail)}`); }
    async createBooking(bookingData) { return this.request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }); }
    async updateBookingStatus(bookingId, status) { return this.request(`/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); }
    
    async getContactInfo() { return this.request('/contact'); }
    async updateContactInfo(contactData) { return this.request('/contact', { method: 'PUT', body: JSON.stringify(contactData) }); }
    
    async login(credentials) {
        const response = await this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
        if (response.success && response.data) {
            localStorage.setItem('cine_auth_token', response.data.token);
            localStorage.setItem('cine_current_user', JSON.stringify(response.data.user));
        }
        return response;
    }
    
    async adminLogin(credentials) {
        const response = await this.request('/auth/admin-login', { method: 'POST', body: JSON.stringify(credentials) });
        if (response.success && response.data) {
            localStorage.setItem('cine_auth_token', response.data.token);
            localStorage.setItem('cine_current_user', JSON.stringify(response.data.user));
        }
        return response;
    }
    
    async logout() {
        localStorage.removeItem('cine_auth_token');
        localStorage.removeItem('cine_current_user');
        return { success: true, message: 'Logout successful' };
    }
    
    async getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('cine_current_user'));
        if (!user) return { success: false, error: 'Not authenticated' };
        return { success: true, data: user };
    }
}

        // ============================================
        // FRONTEND APPLICATION
        // ============================================
        
        // Initialize API service
        const apiService = new ApiService();
        
        // Application state
        let cart = [];
        let currentUser = null;
        let contactInfo = null;
        let galleryImages = [];
        let newGalleryImages = [];
        
        // DOM Elements
        const equipmentContainer = document.getElementById('equipment-container');
        const cartModal = document.getElementById('cart-modal');
        const cartToggle = document.getElementById('cart-toggle');
        const closeCart = document.getElementById('close-cart');
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutBtn = document.getElementById('checkout-btn');
        const proceedToDetailsBtn = document.getElementById('proceed-to-details');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const equipmentLinks = document.querySelectorAll('.equipment-link');
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const adminPanel = document.getElementById('admin-panel');
        const adminToggle = document.getElementById('admin-toggle');
        const closeAdmin = document.getElementById('close-admin');
        const addEquipmentForm = document.getElementById('add-equipment-form');
        const adminEquipmentList = document.getElementById('admin-equipment-list');
        const adminTabs = document.querySelectorAll('.admin-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        const hamburgerMenu = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');
        const imageUpload = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const imageUploadContainer = document.getElementById('image-upload-container');
        const bookingsContainer = document.getElementById('bookings-container');
        const customerDetailsForm = document.getElementById('customer-details-form');
        const contactForm = document.getElementById('contact-form');
        const homeLink = document.getElementById('home-link');
        const footerLinks = document.querySelectorAll('.footer-link');
        const loadingSpinner = document.getElementById('loading-spinner');
        const imageScroller = document.getElementById('image-scroller');
        
        // Admin Login Modal Elements
        const adminLoginModal = document.getElementById('admin-login-modal');
        const adminUsernameInput = document.getElementById('admin-username');
        const adminPasswordInput = document.getElementById('admin-password');
        const adminLoginSubmit = document.getElementById('admin-login-submit');
        const adminLoginError = document.getElementById('admin-login-error');
        
        // Gallery Elements
        const galleryUpload = document.getElementById('gallery-upload');
        const galleryPreview = document.getElementById('gallery-preview');
        const galleryImagesList = document.getElementById('gallery-images-list');
        const saveGalleryBtn = document.getElementById('save-gallery');
        
        // User Profile Elements
        const userProfile = document.getElementById('user-profile');
        const loginButton = document.getElementById('login-button');
        const profileDropdown = document.getElementById('profile-dropdown');
        const profileHeader = document.getElementById('profile-header');
        const profileMenu = document.getElementById('profile-menu');
        
        // Receipt Elements
        const receiptModal = document.getElementById('receipt-modal');
        const receiptContent = document.getElementById('receipt-content');
        const closeReceipt = document.getElementById('close-receipt');
        const printReceiptBtn = document.getElementById('print-receipt');
        const downloadReceiptBtn = document.getElementById('download-receipt');
        
        // Admin Search and Filter Elements
        const adminSearch = document.getElementById('admin-search');
        const adminSearchBtn = document.getElementById('admin-search-btn');
        const filterStatus = document.getElementById('filter-status');
        const filterDate = document.getElementById('filter-date');
        const filterProject = document.getElementById('filter-project');
        const resetFiltersBtn = document.getElementById('reset-filters');
        
        // User Bookings Section
        const userBookingsSection = document.getElementById('user-bookings-section');
        const userBookingsContainer = document.getElementById('user-bookings-container');
        
        // Customer form elements
        const customerNameInput = document.getElementById('customer-name');
        const customerEmailInput = document.getElementById('customer-email');
        const customerPhoneInput = document.getElementById('customer-phone');
        const customerCompanyInput = document.getElementById('customer-company');
        const projectTypeInput = document.getElementById('project-type');
        const shootDateInput = document.getElementById('shoot-date');
        const specialRequirementsInput = document.getElementById('special-requirements');
        
        // Contact info elements
        const contactAddressInput = document.getElementById('contact-address');
        const contactPhoneInput = document.getElementById('contact-phone');
        const contactEmailInput = document.getElementById('contact-email');
        const contactHoursInput = document.getElementById('contact-hours');
        const currentContactInfo = document.getElementById('current-contact-info');
        
        // Footer elements
        const footerAddress = document.getElementById('footer-address');
        const footerPhone = document.getElementById('footer-phone');
        const footerEmail = document.getElementById('footer-email');
        const footerHours = document.getElementById('footer-hours');
        
        // ============================================
        // HELPER FUNCTIONS
        // ============================================
        
        // Show loading spinner
        function showLoading() {
            loadingSpinner.style.display = 'flex';
        }
        
        // Hide loading spinner
        function hideLoading() {
            loadingSpinner.style.display = 'none';
        }
        
        // Show notification
        function showNotification(message, type = 'success') {
            // Create notification element
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
        
        // Format price in Rupees
        function formatPrice(price) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price);
        }
        
        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
        
        // ============================================
        // GALLERY FUNCTIONS
        // ============================================
        
        // Fetch gallery images from API
        async function fetchGalleryImages() {
            showLoading();
            try {
                const response = await apiService.getGalleryImages();
                hideLoading();
                
                if (response.success) {
                    galleryImages = response.data;
                    renderGallery();
                    renderGalleryAdmin();
                } else {
                    showNotification('Failed to load gallery images', 'error');
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
            }
        }
        
        // Render gallery images in the scroller
        function renderGallery() {
            imageScroller.innerHTML = '';
            
            // Duplicate images for seamless scrolling
            const allImages = [...galleryImages, ...galleryImages];
            
            allImages.forEach((imgSrc, index) => {
                const img = document.createElement('img');
                img.className = 'scroller-image';
                img.src = imgSrc;
                img.alt = `Gallery Image ${index + 1}`;
                imageScroller.appendChild(img);
            });
        }
        
        // Render gallery images in admin panel
        function renderGalleryAdmin() {
            galleryImagesList.innerHTML = '';
            
            if (galleryImages.length === 0) {
                galleryImagesList.innerHTML = '<p>No gallery images uploaded yet.</p>';
                return;
            }
            
            galleryImages.forEach((imgSrc, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-preview-item';
                item.innerHTML = `
                    <img src="${imgSrc}" alt="Gallery Image ${index + 1}">
                    <button class="remove-gallery-item" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                galleryImagesList.appendChild(item);
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-gallery-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('button').getAttribute('data-index'));
                    removeGalleryImage(index);
                });
            });
        }
        
        // Remove gallery image
        function removeGalleryImage(index) {
            if (confirm('Are you sure you want to remove this image from the gallery?')) {
                galleryImages.splice(index, 1);
                renderGalleryAdmin();
                showNotification('Image removed from gallery (save to apply changes)');
            }
        }
        
        // Handle gallery image upload
        function handleGalleryUpload(e) {
            const files = e.target.files;
            if (!files.length) return;
            
            newGalleryImages = [];
            galleryPreview.innerHTML = '';
            
            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imgSrc = e.target.result;
                        newGalleryImages.push(imgSrc);
                        
                        // Add to preview
                        const item = document.createElement('div');
                        item.className = 'gallery-preview-item';
                        item.innerHTML = `
                            <img src="${imgSrc}" alt="New Gallery Image ${index + 1}">
                        `;
                        galleryPreview.appendChild(item);
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
            
            if (newGalleryImages.length > 0) {
                showNotification(`${newGalleryImages.length} images ready to add to gallery`);
            }
        }
        
        // Save gallery changes
        async function saveGalleryChanges() {
            if (newGalleryImages.length > 0) {
                galleryImages = [...galleryImages, ...newGalleryImages];
                newGalleryImages = [];
                galleryPreview.innerHTML = '';
            }
            
            showLoading();
            try {
                const response = await apiService.updateGalleryImages(galleryImages);
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    renderGallery();
                    renderGalleryAdmin();
                } else {
                    showNotification('Failed to save gallery', 'error');
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
            }
        }
        
        // ============================================
        // API WRAPPER FUNCTIONS
        // ============================================
        
        // Fetch equipment from API
        async function fetchEquipment() {
            showLoading();
            try {
                const response = await apiService.getEquipment();
                hideLoading();
                
                if (response.success) {
                    return response.data;
                } else {
                    showNotification('Failed to load equipment', 'error');
                    return [];
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return [];
            }
        }
        
        // Add equipment via API
        async function addEquipmentViaAPI(equipmentData) {
            showLoading();
            try {
                const response = await apiService.addEquipment(equipmentData);
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return response.data;
                } else {
                    showNotification(response.error, 'error');
                    return null;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return null;
            }
        }
        
        // Delete equipment via API
        async function deleteEquipmentViaAPI(id) {
            showLoading();
            try {
                const response = await apiService.deleteEquipment(id);
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return true;
                } else {
                    showNotification(response.error, 'error');
                    return false;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return false;
            }
        }
        
        // Fetch bookings from API
        async function fetchBookings() {
            showLoading();
            try {
                const response = await apiService.getBookings();
                hideLoading();
                
                if (response.success) {
                    return response.data;
                } else {
                    showNotification('Failed to load bookings', 'error');
                    return [];
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return [];
            }
        }
        
        // Fetch user bookings from API
        async function fetchUserBookings(userEmail) {
            showLoading();
            try {
                const response = await apiService.getUserBookings(userEmail);
                hideLoading();
                
                if (response.success) {
                    return response.data;
                } else {
                    showNotification('Failed to load your bookings', 'error');
                    return [];
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return [];
            }
        }
        
        // Create booking via API
        async function createBookingViaAPI(bookingData) {
            showLoading();
            try {
                const response = await apiService.createBooking(bookingData);
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return response.data;
                } else {
                    showNotification(response.error, 'error');
                    return null;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return null;
            }
        }
        
        // Update booking status via API
        async function updateBookingStatusViaAPI(bookingId, status) {
            showLoading();
            try {
                const response = await apiService.updateBookingStatus(bookingId, status);
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return true;
                } else {
                    showNotification(response.error, 'error');
                    return false;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return false;
            }
        }
        
        // Fetch contact info from API
        async function fetchContactInfo() {
            showLoading();
            try {
                const response = await apiService.getContactInfo();
                hideLoading();
                
                if (response.success) {
                    return response.data;
                } else {
                    showNotification('Failed to load contact info', 'error');
                    return null;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return null;
            }
        }
        
        // Update contact info via API
        async function updateContactInfoViaAPI(contactData) {
            showLoading();
            try {
                const response = await apiService.updateContactInfo(contactData);
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return response.data;
                } else {
                    showNotification(response.error, 'error');
                    return null;
                }
           } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return null;
            }
        }
        
        // Login via API
        async function loginViaAPI(email, password) {
            showLoading();
            try {
                const response = await apiService.login({ email, password });
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return response.data;
                } else {
                    showNotification(response.error, 'error');
                    return null;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return null;
            }
        }
        
        // Admin login via API
        async function adminLoginViaAPI(username, password) {
            showLoading();
            try {
                const response = await apiService.adminLogin({ username, password });
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return response.data;
                } else {
                    showNotification(response.error, 'error');
                    return null;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return null;
            }
        }
        
        // Logout via API
        async function logoutViaAPI() {
            showLoading();
            try {
                const response = await apiService.logout();
                hideLoading();
                
                if (response.success) {
                    showNotification(response.message);
                    return true;
                } else {
                    showNotification(response.error, 'error');
                    return false;
                }
            } catch (error) {
                hideLoading();
                showNotification('Network error: ' + error.message, 'error');
                return false;
            }
        }
        
        // Get current user from API
        async function getCurrentUserViaAPI() {
            try {
                const response = await apiService.getCurrentUser();
                
                if (response.success) {
                    return response.data;
                } else {
                    return null;
                }
            } catch (error) {
                return null;
            }
        }
        
        // ============================================
        // USER PROFILE MANAGEMENT
        // ============================================
        
        // Update user profile display
        async function updateUserProfile() {
            currentUser = await getCurrentUserViaAPI();
            
            if (currentUser) {
                // Update login button to show profile icon
                loginButton.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name || currentUser.email.split('@')[0]}`;
                loginButton.style.backgroundColor = '#28a745';
                
                // Update profile header
                profileHeader.innerHTML = `
                    <h4>Welcome, ${currentUser.name || currentUser.email}</h4>
                    <p>${currentUser.role === 'admin' ? 'Administrator' : 'Registered User'}</p>
                `;
                
                // Update profile menu
                let menuHTML = '';
                
                if (currentUser.role === 'admin') {
                    menuHTML = `
                        <button class="dropdown-item" id="view-admin-dashboard">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Admin Dashboard</span>
                        </button>
                        <div class="dropdown-divider"></div>
                    `;
                } else {
                    menuHTML = `
                        <button class="dropdown-item" id="view-my-bookings">
                            <i class="fas fa-calendar-alt"></i>
                            <span>My Bookings</span>
                        </button>
                        <div class="dropdown-divider"></div>
                    `;
                }
                
                menuHTML += `
                    <button class="dropdown-item" id="view-profile">
                        <i class="fas fa-user-circle"></i>
                        <span>My Profile</span>
                    </button>
                    <button class="dropdown-item" id="logout-user">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                `;
                
                profileMenu.innerHTML = menuHTML;
                
                // Show user bookings section if user has bookings
                if (currentUser.role !== 'admin') {
                    await loadUserBookings();
                    userBookingsSection.style.display = 'block';
                }
                
                // Auto-fill customer form with user data
                if (currentUser.email && !currentUser.role) {
                    customerNameInput.value = currentUser.name || '';
                    customerEmailInput.value = currentUser.email || '';
                    customerPhoneInput.value = currentUser.phone || '';
                    customerCompanyInput.value = currentUser.company || '';
                }
            } else {
                // Reset login button
                loginButton.innerHTML = `<i class="fas fa-user"></i> Login`;
                loginButton.style.backgroundColor = '';
                
                // Show login/signup form
                profileHeader.innerHTML = `
                    <h4>Welcome Guest!</h4>
                    <p>Login to access your bookings</p>
                `;
                
                profileMenu.innerHTML = `
                    <div class="auth-form">
                        <div class="form-tabs">
                            <button class="form-tab active" data-form="login">Login</button>
                            <button class="form-tab" data-form="signup">Sign Up</button>
                        </div>
                        
                        <div class="form-content active" id="login-form">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <input type="email" id="login-email" placeholder="Email Address" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <input type="password" id="login-password" placeholder="Password" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            </div>
                            <button class="submit-btn" id="login-btn" style="width: 100%; padding: 10px; font-size: 14px;">
                                Login
                            </button>
                        </div>
                        
                        <div class="form-content" id="signup-form">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <input type="text" id="signup-name" placeholder="Full Name" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <input type="email" id="signup-email" placeholder="Email Address" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <input type="password" id="signup-password" placeholder="Password" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            </div>
                            <button class="submit-btn" id="signup-btn" style="width: 100%; padding: 10px; font-size: 14px;">
                                Sign Up
                            </button>
                        </div>
                    </div>
                `;
                
                // Hide user bookings section
                userBookingsSection.style.display = 'none';
            }
            
            // Add event listeners to menu items
            setupProfileMenuListeners();
        }
        
        // Setup profile menu event listeners
        function setupProfileMenuListeners() {
            // Login/Signup tabs
            document.querySelectorAll('.form-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const formType = e.target.getAttribute('data-form');
                    
                    // Update active tab
                    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // Show corresponding form
                    document.querySelectorAll('.form-content').forEach(form => {
                        form.classList.remove('active');
                        if (form.id === `${formType}-form`) {
                            form.classList.add('active');
                        }
                    });
                });
            });
            
            // Login button
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', async () => {
                    const email = document.getElementById('login-email').value;
                    const password = document.getElementById('login-password').value;
                    
                    if (email && password) {
                        const result = await loginViaAPI(email, password);
                        if (result) {
                            currentUser = result.user;
                            profileDropdown.classList.remove('active');
                            await updateUserProfile();
                        }
                    } else {
                        showNotification('Please enter email and password', 'error');
                    }
                });
            }
            
            // Signup button
            const signupBtn = document.getElementById('signup-btn');
            if (signupBtn) {
                signupBtn.addEventListener('click', async () => {
                    const name = document.getElementById('signup-name').value;
                    const email = document.getElementById('signup-email').value;
                    const password = document.getElementById('signup-password').value;
                    
                    if (name && email && password) {
                        // For demo, we'll just login the user
                        const result = await loginViaAPI(email, password);
                        if (result) {
                            currentUser = result.user;
                            profileDropdown.classList.remove('active');
                            await updateUserProfile();
                        }
                    } else {
                        showNotification('Please fill all fields', 'error');
                    }
                });
            }
            
            // View my bookings
            const viewMyBookings = document.getElementById('view-my-bookings');
            if (viewMyBookings) {
                viewMyBookings.addEventListener('click', async (e) => {
                    e.preventDefault();
                    profileDropdown.classList.remove('active');
                    userBookingsSection.scrollIntoView({ behavior: 'smooth' });
                });
            }
            
            // View admin dashboard
            const viewAdminDashboard = document.getElementById('view-admin-dashboard');
            if (viewAdminDashboard) {
                viewAdminDashboard.addEventListener('click', async (e) => {
                    e.preventDefault();
                    profileDropdown.classList.remove('active');
                    adminPanel.style.display = 'block';
                    await renderBookings();
                    await loadContactFormData();
                });
            }
            
            // Logout
            const logoutUser = document.getElementById('logout-user');
            if (logoutUser) {
                logoutUser.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const success = await logoutViaAPI();
                    if (success) {
                        currentUser = null;
                        profileDropdown.classList.remove('active');
                        await updateUserProfile();
                        showNotification('Logged out successfully');
                    }
                });
            }
        }
        
        // ============================================
        // RENDER FUNCTIONS
        // ============================================
        
        // Render equipment cards
        async function renderEquipment(equipment = null) {
            if (!equipment) {
                equipment = await fetchEquipment();
                
                // If no equipment exists, initialize with sample data
                if (equipment.length === 0) {
                    const sampleEquipment = [
                        {
                            id: 1,
                            name: "Sony FX6 Cinema Camera",
                            type: "camera",
                            price: 13500,
                            image: "",
                            description: "Full-frame cinema camera with advanced autofocus and 4K 120p recording",
                            stock: 5,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: 2,
                            name: "ARRI SkyPanel S60-C",
                            type: "light",
                            price: 9000,
                            image: "",
                            description: "High-output LED soft light with full color spectrum control",
                            stock: 3,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: 3,
                            name: "Canon C70 Cinema Camera",
                            type: "camera",
                            price: 11250,
                            image: "",
                            description: "Compact cinema camera with RF mount and dual gain output",
                            stock: 4,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: 4,
                            name: "Kino Flo Celeb 200",
                            type: "light",
                            price: 6375,
                            image: "",
                            description: "LED fixture with high CRI and flicker-free operation",
                            stock: 7,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: 5,
                            name: "Sigma 18-35mm T2 Cine Lens",
                            type: "lens",
                            price: 6750,
                            image: "",
                            description: "High-speed zoom lens with consistent T-stop throughout range",
                            stock: 2,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        },
                        {
                            id: 6,
                            name: "Blackmagic Ursa Mini Pro 12K",
                            type: "camera",
                            price: 18750,
                            image: "",
                            description: "Professional cinema camera with 12K sensor and EF lens mount",
                            stock: 2,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }
                    ];
                    
                    localStorage.setItem('cine_equipment', JSON.stringify(sampleEquipment));
                    equipment = sampleEquipment;
                }
            }
            
            equipmentContainer.innerHTML = '';
            
            if (equipment.length === 0) {
                equipmentContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 40px; color: #666;">No equipment found. Add some equipment from the admin panel.</p>';
                return;
            }
            
            equipment.forEach(item => {
                const equipmentCard = document.createElement('div');
                equipmentCard.className = 'equipment-card';
                equipmentCard.setAttribute('data-type', item.type);
                
                const imageSrc = item.image || `https://via.placeholder.com/300x200/2c3e50/ffffff?text=${encodeURIComponent(item.name.substring(0, 20))}`;
                
                equipmentCard.innerHTML = `
                    <img src="${imageSrc}" alt="${item.name}" class="equipment-img">
                    <div class="equipment-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="equipment-meta">
                            <div class="price">${formatPrice(item.price)}<span style="font-size: 14px; color: #666;">/day</span></div>
                            <div class="availability ${item.stock === 0 ? 'out-of-stock' : ''}">
                                ${item.stock === 0 ? 'Out of Stock' : `${item.stock} Available`}
                            </div>
                        </div>
                        <button class="add-to-cart" data-id="${item.id}" ${item.stock === 0 ? 'disabled' : ''}>
                            ${item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                `;
                
                equipmentContainer.appendChild(equipmentCard);
            });
            
            // Add event listeners to add-to-cart buttons
            document.querySelectorAll('.add-to-cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    addToCart(id);
                });
            });
        }
        
        // Render admin equipment list
        async function renderAdminEquipmentList() {
            const equipment = await fetchEquipment();
            adminEquipmentList.innerHTML = '';
            
            if (equipment.length === 0) {
                adminEquipmentList.innerHTML = '<p>No equipment found. Add some equipment using the form above.</p>';
                return;
            }
            
            equipment.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'equipment-card';
                itemElement.style.marginBottom = '20px';
                
                const imageSrc = item.image || `https://via.placeholder.com/100x70/2c3e50/ffffff?text=${encodeURIComponent(item.type.charAt(0).toUpperCase())}`;
                
                itemElement.innerHTML = `
                    <div style="display: flex; gap: 20px; padding: 15px;">
                        <img src="${imageSrc}" alt="${item.name}" style="width: 100px; height: 70px; object-fit: cover; border-radius: 5px;">
                        <div style="flex: 1;">
                            <h4 style="margin-bottom: 5px;">${item.name}</h4>
                            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">${item.type.charAt(0).toUpperCase() + item.type.slice(1)} • ${formatPrice(item.price)}/day • ${item.stock} available</p>
                            <div style="display: flex; gap: 10px;">
                                <button class="remove-equipment" data-id="${item.id}" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
                
                adminEquipmentList.appendChild(itemElement);
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-equipment').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    if (confirm('Are you sure you want to remove this equipment?')) {
                        const success = await deleteEquipmentViaAPI(id);
                        if (success) {
                            await renderEquipment();
                            await renderAdminEquipmentList();
                        }
                    }
                });
            });
        }
        
        // Render bookings with search and filters
        async function renderBookings() {
            const bookings = await fetchBookings();
            bookingsContainer.innerHTML = '';
            
            if (bookings.length === 0) {
                bookingsContainer.innerHTML = '<p>No bookings found.</p>';
                return;
            }
            
            // Apply search filter
            let filteredBookings = [...bookings];
            const searchTerm = adminSearch.value.toLowerCase();
            if (searchTerm) {
                filteredBookings = filteredBookings.filter(booking => 
                    booking.customer.name.toLowerCase().includes(searchTerm) ||
                    booking.customer.email.toLowerCase().includes(searchTerm) ||
                    booking.bookingId.toLowerCase().includes(searchTerm) ||
                    booking.customer.phone.includes(searchTerm)
                );
            }
            
            // Apply status filter
            if (filterStatus.value) {
                filteredBookings = filteredBookings.filter(booking => booking.status === filterStatus.value);
            }
            
            // Apply project type filter
            if (filterProject.value) {
                filteredBookings = filteredBookings.filter(booking => 
                    booking.projectDetails.type === filterProject.value
                );
            }
            
            // Apply date filter
            if (filterDate.value) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                
                filteredBookings = filteredBookings.filter(booking => {
                    const bookingDate = new Date(booking.createdAt);
                    
                    switch (filterDate.value) {
                        case 'today':
                            return bookingDate >= today;
                        case 'week':
                            return bookingDate >= oneWeekAgo;
                        case 'month':
                            return bookingDate >= oneMonthAgo;
                        default:
                            return true;
                    }
                });
            }
            
            if (filteredBookings.length === 0) {
                bookingsContainer.innerHTML = '<p>No bookings match your filters.</p>';
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'bookings-table';
            
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Project</th>
                        <th>Equipment</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredBookings.map(booking => `
                        <tr>
                            <td>${booking.bookingId}</td>
                            <td>
                                <strong>${booking.customer.name}</strong><br>
                                <small>${booking.customer.email}</small><br>
                                <small>${booking.customer.phone}</small>
                            </td>
                            <td>${booking.projectDetails.type}<br><small>${booking.projectDetails.shootDate}</small></td>
                            <td>${booking.equipmentItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}</td>
                            <td>${formatPrice(booking.totalAmount)}</td>
                            <td><span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
                            <td>
                                <button class="view-booking" data-id="${booking.bookingId}" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-bottom: 5px;">View</button>
                                <button class="update-status" data-id="${booking.bookingId}" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Update</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            bookingsContainer.appendChild(table);
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-booking').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const bookingId = e.target.getAttribute('data-id');
                    const bookings = await fetchBookings();
                    const booking = bookings.find(b => b.bookingId === bookingId);
                    
                    if (booking) {
                        showReceipt(booking);
                    }
                });
            });
            
            // Add event listeners to update buttons
            document.querySelectorAll('.update-status').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const bookingId = e.target.getAttribute('data-id');
                    const newStatus = prompt('Enter new status (pending, confirmed, completed):', 'confirmed');
                    
                    if (newStatus && ['pending', 'confirmed', 'completed'].includes(newStatus.toLowerCase())) {
                        const success = await updateBookingStatusViaAPI(bookingId, newStatus.toLowerCase());
                        if (success) {
                            await renderBookings();
                        }
                    }
                });
            });
        }
        
        // Load user bookings
        async function loadUserBookings() {
            if (!currentUser || !currentUser.email) return;
            
            const bookings = await fetchUserBookings(currentUser.email);
            userBookingsContainer.innerHTML = '';
            
            if (bookings.length === 0) {
                userBookingsContainer.innerHTML = '<p>You have no bookings yet. Start by adding equipment to your cart!</p>';
                return;
            }
            
            bookings.forEach(booking => {
                const bookingCard = document.createElement('div');
                bookingCard.className = 'booking-card';
                
                bookingCard.innerHTML = `
                    <div class="booking-header">
                        <div>
                            <span class="booking-id">${booking.bookingId}</span>
                            <span class="status-badge status-${booking.status}" style="margin-left: 10px;">
                                ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                        </div>
                        <div>
                            <small>${formatDate(booking.createdAt)}</small>
                        </div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>Project:</strong> ${booking.projectDetails.type}<br>
                        <strong>Shoot Date:</strong> ${booking.projectDetails.shootDate}<br>
                        <strong>Equipment:</strong> ${booking.equipmentItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Total:</strong> ${formatPrice(booking.totalAmount)}
                        </div>
                        <button class="view-receipt-btn" data-id="${booking.bookingId}" style="background-color: var(--primary-color); color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                            View Receipt
                        </button>
                    </div>
                `;
                
                userBookingsContainer.appendChild(bookingCard);
            });
            
            // Add event listeners to view receipt buttons
            document.querySelectorAll('.view-receipt-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const bookingId = e.target.getAttribute('data-id');
                    const bookings = await fetchBookings();
                    const booking = bookings.find(b => b.bookingId === bookingId);
                    
                    if (booking) {
                        showReceipt(booking);
                    }
                });
            });
        }
        
        // Show receipt modal
        function showReceipt(booking) {
            receiptContent.innerHTML = `
                <div class="receipt-header">
                    <div class="receipt-logo">
                        <i class="fas fa-film"></i>
                    </div>
                    <h2>Vimala Enterprises</h2>
                    <p>Professional Cine Equipment Rental</p>
                    <p>Invoice: ${booking.bookingId}</p>
                </div>
                
                <div class="receipt-details">
                    <div class="receipt-row">
                        <div>
                            <strong>Booking Date:</strong><br>
                            ${formatDate(booking.createdAt)}
                        </div>
                        <div>
                            <strong>Status:</strong><br>
                            <span class="status-badge status-${booking.status}">
                                ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="receipt-row">
                        <div>
                            <strong>Customer Information:</strong><br>
                            ${booking.customer.name}<br>
                            ${booking.customer.email}<br>
                            ${booking.customer.phone}
                        </div>
                        <div>
                            <strong>Project Details:</strong><br>
                            Type: ${booking.projectDetails.type}<br>
                            Shoot Date: ${booking.projectDetails.shootDate}<br>
                            Company: ${booking.customer.company || 'N/A'}
                        </div>
                    </div>
                </div>
                
                <div class="receipt-items">
                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Price/Day</th>
                                <th>Qty</th>
                                <th>Days</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${booking.equipmentItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${formatPrice(item.price)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${booking.rentalDays}</td>
                                    <td>${formatPrice(item.price * item.quantity * booking.rentalDays)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="receipt-total">
                    <div class="receipt-row">
                        <div>Subtotal:</div>
                        <div>${formatPrice(booking.totalAmount)}</div>
                    </div>
                    <div class="receipt-row">
                        <div>Tax (18%):</div>
                        <div>${formatPrice(booking.totalAmount * 0.18)}</div>
                    </div>
                    <div class="receipt-row">
                        <div><strong>Grand Total:</strong></div>
                        <div><strong>${formatPrice(booking.totalAmount * 1.18)}</strong></div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                    <p><strong>Terms & Conditions:</strong></p>
                    <p style="font-size: 12px;">
                        1. Equipment must be returned in the same condition as rented.<br>
                        2. Late returns will incur additional charges.<br>
                        3. Damage to equipment will be charged at replacement cost.<br>
                        4. Booking can be cancelled up to 24 hours before rental period.<br>
                        5. 50% advance payment required for confirmation.
                    </p>
                </div>
            `;
            
            receiptModal.style.display = 'flex';
        }
        
        // Render cart items
        function renderCartItems() {
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
                cartTotal.textContent = formatPrice(0);
                return;
            }
            
            emptyCartMessage.style.display = 'none';
            
            let total = 0;
            const rentalDays = 3; // Default rental period
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity * rentalDays;
                total += itemTotal;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${item.image || `https://via.placeholder.com/80x60/2c3e50/ffffff?text=${encodeURIComponent(item.name.substring(0, 10))}`}" alt="${item.name}" class="cart-item-img">
                            <div>${item.name}</div>
                        </div>
                    </td>
                    <td>${formatPrice(item.price)}/day</td>
                    <td>${rentalDays} days</td>
                    <td>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td>${formatPrice(itemTotal)}</td>
                    <td><i class="fas fa-trash remove-item" data-id="${item.id}"></i></td>
                `;
                
                cartItems.appendChild(row);
            });
            
            // Update total
            cartTotal.textContent = formatPrice(total);
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    const isPlus = e.target.classList.contains('plus');
                    updateCartItemQuantity(id, isPlus);
                });
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }
        
        // Update footer contact info
        async function updateFooterContactInfo() {
            contactInfo = await fetchContactInfo();
            
            if (contactInfo) {
                footerAddress.textContent = contactInfo.address;
                footerPhone.innerHTML = `<i class="fas fa-phone"></i> ${contactInfo.phone}`;
                footerEmail.innerHTML = `<i class="fas fa-envelope"></i> ${contactInfo.email}`;
                footerHours.innerHTML = `<i class="fas fa-clock"></i> ${contactInfo.hours}`;
            }
        }
        
        // Update current contact info display
        function updateCurrentContactInfo() {
            if (contactInfo) {
                currentContactInfo.innerHTML = `
                    <p><strong>Address:</strong> ${contactInfo.address}</p>
                    <p><strong>Phone:</strong> ${contactInfo.phone}</p>
                    <p><strong>Email:</strong> ${contactInfo.email}</p>
                    <p><strong>Business Hours:</strong> ${contactInfo.hours}</p>
                `;
            }
        }
        
        // Load contact form data
        async function loadContactFormData() {
            contactInfo = await fetchContactInfo();
            
            if (contactInfo) {
                contactAddressInput.value = contactInfo.address;
                contactPhoneInput.value = contactInfo.phone;
                contactEmailInput.value = contactInfo.email;
                contactHoursInput.value = contactInfo.hours;
                
                updateCurrentContactInfo();
            }
        }
        
        // ============================================
        // CART MANAGEMENT
        // ============================================
        
        // Add item to cart
        async function addToCart(id) {
            const equipment = await fetchEquipment();
            const item = equipment.find(e => e.id === id);
            
            if (!item) return;
            
            // Check if item is already in cart
            const existingItem = cart.find(cartItem => cartItem.id === id);
            
            if (existingItem) {
                // Check if we have enough stock
                if (existingItem.quantity < item.stock) {
                    existingItem.quantity += 1;
                } else {
                    showNotification(`Only ${item.stock} units of ${item.name} are available.`, 'error');
                    return;
                }
            } else {
                // Add new item to cart
                cart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: 1
                });
            }
            
            updateCart();
            showNotification(`${item.name} added to cart`);
        }
        
        // Update cart UI
        function updateCart() {
            // Update cart count
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            renderCartItems();
        }
        
        // Update cart item quantity
        async function updateCartItemQuantity(id, isPlus) {
            const equipment = await fetchEquipment();
            const item = equipment.find(e => e.id === id);
            const cartItem = cart.find(item => item.id === id);
            
            if (!cartItem || !item) return;
            
            if (isPlus) {
                // Check if we have enough stock
                if (cartItem.quantity < item.stock) {
                    cartItem.quantity += 1;
                } else {
                    showNotification(`Only ${item.stock} units of ${item.name} are available.`, 'error');
                    return;
                }
            } else {
                if (cartItem.quantity > 1) {
                    cartItem.quantity -= 1;
                } else {
                    // Remove item if quantity becomes 0
                    cart = cart.filter(item => item.id !== id);
                }
            }
            
            updateCart();
        }
        
        // Remove item from cart
        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            updateCart();
            showNotification('Item removed from cart');
        }
        
        // Complete booking process
        async function completeBooking() {
            // Validate customer details
            if (!customerNameInput.value || !customerEmailInput.value || !customerPhoneInput.value || !projectTypeInput.value || !shootDateInput.value) {
                showNotification('Please fill all required fields marked with *', 'error');
                return;
            }
            
            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            
            // Calculate total
            const rentalDays = 3;
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity * rentalDays), 0);
            
            // Prepare booking data
            const bookingData = {
                customer: {
                    name: customerNameInput.value,
                    email: customerEmailInput.value,
                    phone: customerPhoneInput.value,
                    company: customerCompanyInput.value || '',
                    address: ''
                },
                projectDetails: {
                    type: projectTypeInput.value,
                    shootDate: shootDateInput.value,
                    specialRequirements: specialRequirementsInput.value || ''
                },
                equipmentItems: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: totalAmount,
                rentalDays: rentalDays
            };
            
            // Create booking via API
            const booking = await createBookingViaAPI(bookingData);
            
            if (booking) {
                // Clear cart and close modal
                cart = [];
                updateCart();
                cartModal.style.display = 'none';
                
                // Reset customer form
                customerNameInput.value = '';
                customerEmailInput.value = '';
                customerPhoneInput.value = '';
                customerCompanyInput.value = '';
                projectTypeInput.value = '';
                shootDateInput.value = '';
                specialRequirementsInput.value = '';
                
                // Hide customer form and show proceed button
                customerDetailsForm.style.display = 'none';
                checkoutBtn.style.display = 'none';
                proceedToDetailsBtn.style.display = 'block';
                
                // Show receipt
                showReceipt(booking);
                
                // Refresh equipment and bookings
                await renderEquipment();
                await renderBookings();
                
                // Update user bookings if logged in
                if (currentUser) {
                    await loadUserBookings();
                }
            }
        }
        
        // ============================================
        // ADMIN LOGIN FUNCTIONS
        // ============================================
        
        // Handle admin login
        async function handleAdminLogin() {
            const username = adminUsernameInput.value.trim();
            const password = adminPasswordInput.value.trim();
            
            if (!username || !password) {
                adminLoginError.textContent = 'Please enter both username and password';
                adminLoginError.style.display = 'block';
                return;
            }
            
            // Check credentials (vimala/vimala)
            if (username === 'vimala' && password === 'vimala') {
                const result = await adminLoginViaAPI(username, password);
                if (result) {
                    currentUser = result.user;
                    adminLoginModal.style.display = 'none';
                    adminPanel.style.display = 'block';
                    await updateUserProfile();
                    await renderBookings();
                    await loadContactFormData();
                    
                    // Clear form
                    adminUsernameInput.value = '';
                    adminPasswordInput.value = '';
                    adminLoginError.style.display = 'none';
                }
            } else {
                adminLoginError.textContent = 'Invalid username or password. Try "vimala" for both.';
                adminLoginError.style.display = 'block';
            }
        }
        
        // ============================================
        // INITIALIZATION AND EVENT LISTENERS
        // ============================================
        
        // Initialize the application
        async function init() {
            // Load gallery images
            await fetchGalleryImages();
            
            // Load equipment
            await renderEquipment();
            
            // Load contact info
            await updateFooterContactInfo();
            
            // Check if user is logged in
            await updateUserProfile();
            
            // Set minimum date for shoot date to today
            const today = new Date().toISOString().split('T')[0];
            shootDateInput.min = today;
            
            // Setup event listeners
            setupEventListeners();
        }
        
        // Setup all event listeners
        function setupEventListeners() {
            // Admin login modal
            adminToggle.addEventListener('click', (e) => {
                e.preventDefault();
                adminLoginModal.style.display = 'flex';
                // Close mobile menu if open
                navLinks.classList.remove('active');
            });
            
            // Admin login submit
            adminLoginSubmit.addEventListener('click', handleAdminLogin);
            
            // Admin login form submit on enter
            adminPasswordInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') handleAdminLogin();
            });
            
            // Close admin login modal when clicking outside
            adminLoginModal.addEventListener('click', (e) => {
                if (e.target === adminLoginModal) {
                    adminLoginModal.style.display = 'none';
                    adminLoginError.style.display = 'none';
                }
            });
            
            // Login button click
            loginButton.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    profileDropdown.classList.remove('active');
                }
                
                // Close modals when clicking outside
                if (e.target === cartModal) {
                    cartModal.style.display = 'none';
                }
                if (e.target === receiptModal) {
                    receiptModal.style.display = 'none';
                }
                if (e.target === adminLoginModal) {
                    adminLoginModal.style.display = 'none';
                }
            });
            
            // Cart modal toggle
            cartToggle.addEventListener('click', () => {
                cartModal.style.display = 'flex';
                renderCartItems();
                // Hide customer details form initially
                customerDetailsForm.style.display = 'none';
                checkoutBtn.style.display = 'none';
                proceedToDetailsBtn.style.display = 'block';
            });
            
            closeCart.addEventListener('click', () => {
                cartModal.style.display = 'none';
            });
            
            closeReceipt.addEventListener('click', () => {
                receiptModal.style.display = 'none';
            });
            
            // Print receipt
            printReceiptBtn.addEventListener('click', () => {
                window.print();
            });
            
            // Download receipt (simulated)
            downloadReceiptBtn.addEventListener('click', () => {
                showNotification('Receipt download started', 'success');
                // In a real app, this would generate and download a PDF
            });
            
            // Filter buttons
            filterBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    // Remove active class from all buttons
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    const filter = btn.getAttribute('data-filter');
                    const equipment = await fetchEquipment();
                    
                    if (filter === 'all') {
                        renderEquipment(equipment);
                    } else {
                        const filtered = equipment.filter(item => item.type === filter);
                        renderEquipment(filtered);
                    }
                });
            });
            
            // Equipment navigation links
            equipmentLinks.forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const filter = link.getAttribute('data-filter');
                    
                    // Update filter buttons
                    filterBtns.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-filter') === filter) {
                            btn.classList.add('active');
                        }
                    });
                    
                    const equipment = await fetchEquipment();
                    
                    if (filter === 'all') {
                        renderEquipment(equipment);
                    } else {
                        const filtered = equipment.filter(item => item.type === filter);
                        renderEquipment(filtered);
                    }
                    
                    // Close mobile menu if open
                    navLinks.classList.remove('active');
                });
            });
            
            // Footer links
            footerLinks.forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const filter = link.getAttribute('data-filter');
                    
                    // Update filter buttons
                    filterBtns.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-filter') === filter) {
                            btn.classList.add('active');
                        }
                    });
                    
                    const equipment = await fetchEquipment();
                    
                    if (filter === 'all') {
                        renderEquipment(equipment);
                    } else {
                        const filtered = equipment.filter(item => item.type === filter);
                        renderEquipment(filtered);
                    }
                    
                    // Scroll to equipment section
                    document.querySelector('.section-title').scrollIntoView({ behavior: 'smooth' });
                });
            });
            
            // Search functionality
            searchBtn.addEventListener('click', async () => {
                const query = searchInput.value.toLowerCase().trim();
                const equipment = await fetchEquipment();
                
                if (!query) {
                    renderEquipment(equipment);
                    return;
                }
                
                const filtered = equipment.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.description.toLowerCase().includes(query) ||
                    item.type.toLowerCase().includes(query)
                );
                
                renderEquipment(filtered);
            });
            
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') searchBtn.click();
            });
            
            closeAdmin.addEventListener('click', () => {
                adminPanel.style.display = 'none';
            });
            
            // Admin tabs
            adminTabs.forEach(tab => {
                tab.addEventListener('click', async () => {
                    const tabId = tab.getAttribute('data-tab');
                    
                    // Update active tab
                    adminTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Show corresponding content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === tabId) {
                            content.classList.add('active');
                        }
                    });
                    
                    // If bookings tab is clicked, refresh the bookings list
                    if (tabId === 'bookings-dashboard') {
                        await renderBookings();
                    }
                    
                    // If contact info tab is clicked, load current data
                    if (tabId === 'contact-info') {
                        await loadContactFormData();
                    }
                    
                    // If gallery management tab is clicked, load gallery images
                    if (tabId === 'gallery-management') {
                        renderGalleryAdmin();
                    }
                });
            });
            
            // Admin search and filters
            adminSearchBtn.addEventListener('click', renderBookings);
            adminSearch.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') renderBookings();
            });
            
            filterStatus.addEventListener('change', renderBookings);
            filterDate.addEventListener('change', renderBookings);
            filterProject.addEventListener('change', renderBookings);
            resetFiltersBtn.addEventListener('click', () => {
                adminSearch.value = '';
                filterStatus.value = '';
                filterDate.value = '';
                filterProject.value = '';
                renderBookings();
            });
            
            // Add equipment form
            addEquipmentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('equipment-name').value;
                const type = document.getElementById('equipment-type').value;
                const price = parseFloat(document.getElementById('equipment-price').value);
                const description = document.getElementById('equipment-description').value;
                const stock = parseInt(document.getElementById('equipment-stock').value);
                
                // Get uploaded image or use default
                let image = '';
                if (imagePreview.querySelector('img')) {
                    image = imagePreview.querySelector('img').src;
                }
                
                // Create equipment object
                const equipmentData = {
                    name,
                    type,
                    price,
                    image,
                    description,
                    stock
                };
                
                // Add via API
                const newEquipment = await addEquipmentViaAPI(equipmentData);
                
                if (newEquipment) {
                    // Update displays
                    await renderEquipment();
                    await renderAdminEquipmentList();
                    
                    // Reset form and image preview
                    addEquipmentForm.reset();
                    imagePreview.style.display = 'none';
                    imagePreview.innerHTML = '';
                }
            });
            
            // Image upload
            imageUpload.addEventListener('change', handleImageUpload);
            
            // Gallery upload
            galleryUpload.addEventListener('change', handleGalleryUpload);
            
            // Save gallery changes
            saveGalleryBtn.addEventListener('click', saveGalleryChanges);
            
            // Drag and drop for image upload
            imageUploadContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUploadContainer.style.borderColor = 'var(--primary-color)';
            });
            
            imageUploadContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                imageUploadContainer.style.borderColor = '#ddd';
            });
            
            imageUploadContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUploadContainer.style.borderColor = '#ddd';
                
                if (e.dataTransfer.files.length) {
                    imageUpload.files = e.dataTransfer.files;
                    handleImageUpload();
                }
            });
            
            // Click on container to trigger file input
            imageUploadContainer.addEventListener('click', () => {
                imageUpload.click();
            });
            
            // Hamburger menu for mobile
            hamburgerMenu.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            
            // Checkout flow
            proceedToDetailsBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    showNotification('Your cart is empty', 'error');
                    return;
                }
                
                // Show customer details form
                customerDetailsForm.style.display = 'block';
                proceedToDetailsBtn.style.display = 'none';
                checkoutBtn.style.display = 'block';
                
                // Scroll to the form
                customerDetailsForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            
            // Complete booking
            checkoutBtn.addEventListener('click', completeBooking);
            
            // Contact form submission
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Update contact info
                const contactData = {
                    address: contactAddressInput.value,
                    phone: contactPhoneInput.value,
                    email: contactEmailInput.value,
                    hours: contactHoursInput.value
                };
                
                const updated = await updateContactInfoViaAPI(contactData);
                if (updated) {
                    contactInfo = updated;
                    updateFooterContactInfo();
                    updateCurrentContactInfo();
                }
            });
            
            // Home link
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Reset filters
                filterBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-filter') === 'all') {
                        btn.classList.add('active');
                    }
                });
                // Close mobile menu if open
                navLinks.classList.remove('active');
                // Reload equipment
                renderEquipment();
            });
        }
        
        // Handle image upload
        function handleImageUpload() {
            const file = imageUpload.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
                imagePreview.style.display = 'block';
            };
            
            reader.readAsDataURL(file);
        }
        
        // Initialize the app
        window.addEventListener('DOMContentLoaded', init);
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @media print {
                body * {
                    visibility: hidden;
                }
                .modal, .modal * {
                    visibility: visible;
                }
                .modal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: auto;
                    background: white;
                }
                .receipt-actions {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);