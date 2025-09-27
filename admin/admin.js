// Global variables
let allPrompts = [];
let currentEditId = null;
let currentDeleteId = null;

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminContainer = document.getElementById('admin-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminUsername = document.getElementById('admin-username');
const totalPrompts = document.getElementById('total-prompts');
const recentPrompts = document.getElementById('recent-prompts');
const addForm = document.getElementById('add-form');
const promptsTableBody = document.getElementById('prompts-table-body');
const editModal = document.getElementById('edit-modal');
const deleteModal = document.getElementById('delete-modal');
const toast = document.getElementById('toast');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    setupCharacterCounter();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Add form
    addForm.addEventListener('submit', handleAddPrompt);
    
    // Edit form
    document.getElementById('edit-form').addEventListener('submit', handleEditPrompt);
    
    // Modal close on backdrop click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// Setup character counter
function setupCharacterCounter() {
    const promptTextarea = document.getElementById('prompt_text');
    const charCount = document.getElementById('char-count');
    
    promptTextarea.addEventListener('input', () => {
        const count = promptTextarea.value.length;
        charCount.textContent = count;
        
        if (count > 1000) {
            charCount.style.color = '#ef4444';
        } else if (count > 800) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#64748b';
        }
    });
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            showAdminPanel();
            adminUsername.textContent = data.username || 'Admin User';
            loadPrompts();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginScreen();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnSpinner = loginBtn.querySelector('.btn-spinner');
    
    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
    hideLoginError();
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAdminPanel();
            adminUsername.textContent = data.user.username;
            loadPrompts();
        } else {
            showLoginError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Connection error. Please try again.');
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
    }
}

// Handle logout
async function logout() {
    try {
        await fetch('/api/login/logout', { method: 'POST' });
        showLoginScreen();
        // Clear form data
        loginForm.reset();
        addForm.reset();
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

// Show/hide screens
function showLoginScreen() {
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
}

function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
}

// Show/hide login error
function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function hideLoginError() {
    loginError.style.display = 'none';
}

// Load prompts
async function loadPrompts() {
    try {
        const response = await fetch('/api/prompts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const prompts = await response.json();
        allPrompts = prompts;
        
        updateStats();
        renderPromptsTable();
        
    } catch (error) {
        console.error('Error loading prompts:', error);
        showToast('Failed to load prompts', 'error');
    }
}

// Handle add prompt
async function handleAddPrompt(e) {
    e.preventDefault();
    
    const formData = new FormData(addForm);
    const promptData = {
        category: formData.get('category'),
        image_url: formData.get('image_url'),
        prompt_text: formData.get('prompt_text')
    };
    
    try {
        const response = await fetch('/api/prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(promptData),
        });
        
        if (response.ok) {
            showToast('Prompt added successfully!');
            addForm.reset();
            document.getElementById('char-count').textContent = '0';
            loadPrompts(); // Reload to get updated data
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add prompt');
        }
    } catch (error) {
        console.error('Error adding prompt:', error);
        showToast(error.message, 'error');
    }
}

// Handle edit prompt
async function handleEditPrompt(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const promptData = {
        category: formData.get('category'),
        image_url: formData.get('image_url'),
        prompt_text: formData.get('prompt_text')
    };
    
    try {
        const response = await fetch(`/api/prompts/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(promptData),
        });
        
        if (response.ok) {
            showToast('Prompt updated successfully!');
            closeEditModal();
            loadPrompts(); // Reload to get updated data
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update prompt');
        }
    } catch (error) {
        console.error('Error updating prompt:', error);
        showToast(error.message, 'error');
    }
}

// Update stats
function updateStats() {
    const total = allPrompts.length;
    const recent = allPrompts.filter(prompt => {
        const createdDate = new Date(prompt.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate >= weekAgo;
    }).length;
    
    totalPrompts.textContent = total;
    recentPrompts.textContent = recent;
}

// Render prompts table
function renderPromptsTable() {
    if (allPrompts.length === 0) {
        promptsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No prompts found. Add your first prompt above.
                </td>
            </tr>
        `;
        return;
    }
    
    promptsTableBody.innerHTML = allPrompts.map(prompt => `
        <tr>
            <td>${prompt.id}</td>
            <td>
                <img src="${escapeHtml(prompt.image_url)}" 
                     alt="${escapeHtml(prompt.category)}" 
                     class="table-image"
                     onerror="this.src='https://via.placeholder.com/60x60/667eea/ffffff?text=N/A'">
            </td>
            <td>
                <span style="background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                    ${escapeHtml(prompt.category)}
                </span>
            </td>
            <td>
                <div class="prompt-preview" title="${escapeHtml(prompt.prompt_text)}">
                    ${escapeHtml(prompt.prompt_text)}
                </div>
            </td>
            <td>
                <div class="table-date">
                    ${formatDate(prompt.created_at)}
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="edit-btn" onclick="openEditModal(${prompt.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="delete-btn" onclick="openDeleteModal(${prompt.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter table
function filterTable() {
    const filterCategory = document.getElementById('filter-category').value;
    
    let filteredPrompts = allPrompts;
    if (filterCategory) {
        filteredPrompts = allPrompts.filter(prompt => prompt.category === filterCategory);
    }
    
    // Re-render table with filtered data
    if (filteredPrompts.length === 0) {
        promptsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                    No prompts found for "${filterCategory}" category.
                </td>
            </tr>
        `;
    } else {
        promptsTableBody.innerHTML = filteredPrompts.map(prompt => `
            <tr>
                <td>${prompt.id}</td>
                <td>
                    <img src="${escapeHtml(prompt.image_url)}" 
                         alt="${escapeHtml(prompt.category)}" 
                         class="table-image"
                         onerror="this.src='https://via.placeholder.com/60x60/667eea/ffffff?text=N/A'">
                </td>
                <td>
                    <span style="background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                        ${escapeHtml(prompt.category)}
                    </span>
                </td>
                <td>
                    <div class="prompt-preview" title="${escapeHtml(prompt.prompt_text)}">
                        ${escapeHtml(prompt.prompt_text)}
                    </div>
                </td>
                <td>
                    <div class="table-date">
                        ${formatDate(prompt.created_at)}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="openEditModal(${prompt.id})">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="delete-btn" onclick="openDeleteModal(${prompt.id})">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Modal functions
function openEditModal(id) {
    const prompt = allPrompts.find(p => p.id === id);
    if (!prompt) return;
    
    currentEditId = id;
    
    // Populate form
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-category').value = prompt.category;
    document.getElementById('edit-image_url').value = prompt.image_url;
    document.getElementById('edit-prompt_text').value = prompt.prompt_text;
    
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
    currentEditId = null;
}

function openDeleteModal(id) {
    currentDeleteId = id;
    deleteModal.style.display = 'block';
}

function closeDeleteModal() {
    deleteModal.style.display = 'none';
    currentDeleteId = null;
}

async function confirmDelete() {
    if (!currentDeleteId) return;
    
    try {
        const response = await fetch(`/api/prompts/${currentDeleteId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            showToast('Prompt deleted successfully!');
            closeDeleteModal();
            loadPrompts(); // Reload to get updated data
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete prompt');
        }
    } catch (error) {
        console.error('Error deleting prompt:', error);
        showToast(error.message, 'error');
    }
}

// Toggle add section
function toggleAddSection() {
    const container = document.getElementById('add-form-container');
    const icon = document.getElementById('collapse-icon');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    } else {
        container.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastIcon = toast.querySelector('i');
    const toastText = toast.querySelector('span');
    
    // Update toast content
    toastText.textContent = message;
    
    // Update toast style based on type
    if (type === 'error') {
        toast.className = 'toast error';
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toast.className = 'toast';
        toastIcon.className = 'fas fa-check';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modals
    if (e.key === 'Escape') {
        closeEditModal();
        closeDeleteModal();
    }
    
    // Ctrl/Cmd + Enter submits forms
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.form) {
            activeElement.form.dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-refresh prompts every 30 seconds
setInterval(() => {
    if (adminContainer.style.display !== 'none') {
        loadPrompts();
    }
}, 30000);