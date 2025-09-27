// Global variables
let allPrompts = [];
let currentCategory = 'All';
let isLoading = false;

// DOM Elements
const galleryGrid = document.getElementById('gallery-grid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const promptCount = document.getElementById('prompt-count');
const showingCount = document.getElementById('showing-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadPrompts();
    setupEventListeners();
    
    // Auto-refresh every 30 seconds
    setInterval(loadPrompts, 30000);
});

// Setup event listeners
function setupEventListeners() {
    // Filter button clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setActiveFilter(category);
            filterPrompts(category);
        });
    });
}

// Load prompts from API
async function loadPrompts() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading(true);
        
        const response = await fetch('/api/prompts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const prompts = await response.json();
        allPrompts = prompts;
        
        updateCounts();
        renderPrompts(getFilteredPrompts(currentCategory));
        
    } catch (error) {
        console.error('Error loading prompts:', error);
        showError('Failed to load prompts. Please try again later.');
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

// Get filtered prompts based on category
function getFilteredPrompts(category) {
    if (category === 'All') {
        return allPrompts;
    }
    return allPrompts.filter(prompt => prompt.category === category);
}

// Filter prompts by category
function filterPrompts(category) {
    currentCategory = category;
    const filteredPrompts = getFilteredPrompts(category);
    renderPrompts(filteredPrompts);
    updateShowingCount(filteredPrompts.length);
}

// Set active filter button
function setActiveFilter(category) {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

// Render prompts in the gallery
function renderPrompts(prompts) {
    if (prompts.length === 0) {
        galleryGrid.innerHTML = '';
        showEmptyState(true);
        return;
    }
    
    showEmptyState(false);
    
    galleryGrid.innerHTML = prompts.map(prompt => `
        <div class="prompt-card" data-id="${prompt.id}">
            <div class="card-image">
                <img src="${escapeHtml(prompt.image_url)}" 
                     alt="${escapeHtml(prompt.category)} prompt" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x200/667eea/ffffff?text=Image+Not+Available'">
                <div class="category-tag">${escapeHtml(prompt.category)}</div>
            </div>
            <div class="card-content">
                <p class="prompt-text">${escapeHtml(prompt.prompt_text)}</p>
                <div class="card-actions">
                    <button class="copy-btn" onclick="copyPrompt('${escapeHtml(prompt.prompt_text).replace(/'/g, "\\'")}')">
                        <i class="fas fa-copy"></i>
                        Copy Prompt
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Copy prompt to clipboard
async function copyPrompt(promptText) {
    try {
        await navigator.clipboard.writeText(promptText);
        showToast('Prompt copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy prompt:', error);
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Prompt copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy prompt', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// Update counts
function updateCounts() {
    const totalCount = allPrompts.length;
    promptCount.textContent = totalCount;
    
    // Update filter button counts
    filterButtons.forEach(btn => {
        const category = btn.dataset.category;
        const count = category === 'All' ? totalCount : allPrompts.filter(p => p.category === category).length;
        const countSpan = btn.querySelector('.btn-count');
        if (countSpan) {
            countSpan.textContent = count;
        }
    });
    
    updateShowingCount(getFilteredPrompts(currentCategory).length);
}

// Update showing count
function updateShowingCount(count) {
    showingCount.textContent = count;
}

// Show/hide loading state
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
    galleryGrid.style.display = show ? 'none' : 'grid';
}

// Show/hide empty state
function showEmptyState(show) {
    emptyState.style.display = show ? 'block' : 'none';
    galleryGrid.style.display = show ? 'none' : 'grid';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastIcon = toast.querySelector('i');
    const toastText = toast.querySelector('span');
    
    // Update toast content
    toastText.textContent = message;
    
    // Update toast style based on type
    if (type === 'error') {
        toast.style.background = '#ef4444';
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toast.style.background = '#10b981';
        toastIcon.className = 'fas fa-check';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show error message
function showError(message) {
    showToast(message, 'error');
}

// Escape HTML to prevent XSS
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

// Backend info modal (for footer link)
function showBackendInfo() {
    alert(`
Backend Functionality Available!

This AI Prompt Gallery includes:
✅ PostgreSQL Database
✅ RESTful API Endpoints
✅ Admin Panel for Content Management
✅ Real-time Updates
✅ Secure Authentication
✅ Production-Ready Deployment

Admin Panel: /admin
Login with environment variables or database credentials.

The backend is fully functional and ready for production deployment on Heroku!
    `);
}

// Handle image loading errors
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/400x200/667eea/ffffff?text=Image+Not+Available';
        e.target.alt = 'Image not available';
    }
}, true);

// Performance optimization: Intersection Observer for lazy loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    // This will be used for future lazy loading optimization
    window.imageObserver = imageObserver;
}