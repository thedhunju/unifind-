// UNI-find Marketplace App - Main JavaScript
console.log('🎉 JavaScript file loaded!');

// ===== Global State =====
let marketplaceItems = [];
let currentFilter = "all";
let searchQuery = "";
let categoryFilter = "";

// ===== Mock Data (Fallback) =====
const mockData = [
  {
    id: 1,
    title: "MacBook Pro 2020",
    price: 85000,
    category: "Electronics",
    description: "Barely used MacBook Pro 13-inch, 8GB RAM, 256GB SSD. Perfect condition! Battery cycle count is only 45. Comes with original charger and box.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    status: "available",
    contact: "john@ku.edu.np",
    condition: "Like New",
    quantity: 1,
    sellerName: "John Doe",
    createdAt: new Date(2025, 0, 1).toISOString(),
    isFavorite: false
  },
  {
    id: 2,
    title: "Engineering Textbooks Set",
    price: 3500,
    category: "Books",
    description: "Complete set of first-year engineering books. Minimal highlighting. Includes Calculus, Physics, and C Programming.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
    status: "available",
    contact: "sarah@ku.edu.np",
    condition: "Used - Good",
    quantity: 1,
    sellerName: "Sarah Smith",
    createdAt: new Date(2024, 11, 28).toISOString(),
    isFavorite: true
  },
  {
    id: 3,
    title: "Study Desk with Chair",
    price: 4500,
    category: "Furniture",
    description: "Sturdy wooden desk with comfortable chair. Great for dorm room! Slight scratch on the left leg but barely visible.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80",
    status: "sold",
    contact: "mike@ku.edu.np",
    condition: "Used - Fair",
    quantity: 1,
    sellerName: "Mike Johnson",
    createdAt: new Date(2024, 11, 25).toISOString(),
    isFavorite: false
  },
  {
    id: 4,
    title: "Gaming Mouse & Keyboard",
    price: 2800,
    category: "Electronics",
    description: "RGB gaming peripherals, barely used. Original packaging included. Mechanical keyboard with Blue switches.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    status: "available",
    contact: "alex@ku.edu.np",
    condition: "Like New",
    quantity: 2,
    sellerName: "Alex Brown",
    createdAt: new Date(2024, 11, 30).toISOString(),
    isFavorite: false
  },
  {
    id: 5,
    title: "Scientific Calculator",
    price: 800,
    category: "Stationery",
    description: "Casio fx-991ES Plus calculator. Perfect for engineering students. Still in warranty.",
    image: "", // Placeholder test
    status: "available",
    contact: "priya@ku.edu.np",
    condition: "New",
    quantity: 10,
    sellerName: "Priya Sharma",
    createdAt: new Date(2025, 0, 2).toISOString(),
    isFavorite: false
  }
];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');

  // Load data from LocalStorage
  if (localStorage.getItem('marketplaceItems')) {
    marketplaceItems = JSON.parse(localStorage.getItem('marketplaceItems'));
    console.log('Loaded items from LocalStorage');
  } else {
    marketplaceItems = [...mockData];
    saveItems();
    console.log('Initialized with mock data');
  }

  renderMarketplaceItems();

  // Event Listeners
  const postBtn = document.getElementById('postItemBtn');
  const postForm = document.getElementById('postItemForm');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  if (postBtn) postBtn.addEventListener('click', openPostModal);
  if (postForm) postForm.addEventListener('submit', handlePostItem);
  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (categorySelect) categorySelect.addEventListener('change', handleCategoryFilter);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderMarketplaceItems();
    });
  });

  // Close modal on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModals();
    });
  });

  // Keyboard navigation for modals (ESC key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  console.log('✅ App initialized successfully!');
});

// ===== Logic Functions =====

function saveItems() {
  localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
}

function toggleFavorite(e, id) {
  e.stopPropagation(); // Prevent opening detail modal
  const item = marketplaceItems.find(i => i.id === id);
  if (item) {
    item.isFavorite = !item.isFavorite;
    saveItems();
    renderMarketplaceItems(); // Re-render to show updated icon

    if (item.isFavorite) {
      showToast('Added to favorites', 'success');
    }
  }
}

function deleteItem(e, id) {
  e.stopPropagation(); // Prevent opening detail modal
  if (confirm('Are you sure you want to delete this item?')) {
    marketplaceItems = marketplaceItems.filter(i => i.id !== id);
    saveItems();
    renderMarketplaceItems();
    showToast('Item deleted successfully', 'success');
  }
}

// ===== Render Functions =====
function renderMarketplaceItems() {
  console.log('Rendering items...');
  const grid = document.getElementById('marketplaceGrid');
  const loading = document.getElementById('marketplaceLoading');
  const empty = document.getElementById('marketplaceEmpty');

  if (!grid) return;

  // Filter items
  let filteredItems = marketplaceItems.filter(item => {
    const matchesFilter = currentFilter === 'all' || item.status === currentFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesFilter && matchesSearch && matchesCategory;
  });

  // Show/hide states
  if (loading) loading.style.display = 'none';

  if (filteredItems.length === 0) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';

    // Render items
    grid.innerHTML = filteredItems.map(item => `
      <div class="item-card" onclick="showItemDetail(${item.id})">
        <div class="item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<i class="fas fa-box" style="font-size:3rem; color:var(--gray-light);"></i>'}
          <div class="card-actions">
            <button class="action-btn favorite ${item.isFavorite ? 'active' : ''}" onclick="toggleFavorite(event, ${item.id})" aria-label="Toggle Favorite">
              <i class="${item.isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <button class="action-btn delete" onclick="deleteItem(event, ${item.id})" aria-label="Delete Item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="item-info">
          <div class="tags">
             <span class="tag tag-category">${item.category}</span>
             <span class="tag tag-status ${item.status}">${item.status === 'available' ? 'Available' : 'Sold'}</span>
          </div>
          <div class="item-header">
            <h3 class="item-title">${item.title}</h3>
          </div>
          <div class="item-price">NPR ${item.price.toLocaleString()}</div>
          <p class="item-desc">${item.description}</p>
          <div class="item-meta">
            <i class="far fa-clock"></i> ${formatDate(item.createdAt)}
          </div>
        </div>
      </div>
    `).join('');
  }
}

function confirmBuy(itemId) {
  if (confirm("Are you sure you want to buy this item?")) {
    const item = marketplaceItems.find(i => i.id === itemId);
    if (!item) return;

    // Reveal contact info
    const contactElement = document.getElementById('seller-contact-info');
    const blurElement = document.getElementById('seller-contact-blur');
    const buyBtn = document.getElementById('buy-action-btn');

    if (contactElement) contactElement.style.display = 'block';
    if (blurElement) blurElement.style.display = 'none';
    if (buyBtn) {
      buyBtn.textContent = 'Contact Revealed';
      buyBtn.classList.remove('btn-success');
      buyBtn.style.background = 'var(--gray)';
      buyBtn.disabled = true;
    }

    showToast("Seller contact revealed! You can now contact them.", "success");
  }
}

// ===== Modal Functions =====
function openPostModal() {
  const modal = document.getElementById('postModal');
  if (modal) {
    modal.classList.add('active');
    const titleInput = document.getElementById('itemTitle');
    if (titleInput) titleInput.focus();
  }
}

function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
  const form = document.getElementById('postItemForm');
  if (form) form.reset();
}

function showItemDetail(itemId) {
  const item = marketplaceItems.find(i => i.id === itemId);
  if (!item) return;

  const content = document.getElementById('detailContent');
  if (!content) return;

  content.innerHTML = `
      <button class="close-modal" onclick="closeModals()"><i class="fas fa-times"></i></button>
    <div style="margin-bottom: 2rem; border-radius: 12px; overflow: hidden; display: flex; justify-content: center; background: #f8fafc;">
      ${item.image ?
      `<img src="${item.image}" alt="${item.title}" style="max-height: 400px; width: 100%; object-fit: contain;">` :
      `<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--gray-light);"><i class="fas fa-box fa-3x"></i></div>`
    }
    </div>
    
    <button class="close-modal detail-close" onclick="closeModals()"><i class="fas fa-times"></i></button>
    
    <div class="detail-container">
      <!-- Left Column: Image & Actions -->
      <div class="detail-left">
        <div class="detail-image-container">
          ${item.image ?
      `<img src="${item.image}" alt="${item.title}" class="detail-image">` :
      `<div style="color: var(--gray-light);"><i class="fas fa-box fa-4x"></i></div>`
    }
        </div>
        
        <div class="detail-actions" style="display: flex; flex-direction: column; gap: 1rem;">
             <!-- Quantity Display -->
             <div style="display: flex; align-items: center; justify-content: center; background: #f1f5f9; padding: 0.8rem; border-radius: 12px; font-weight: 600; color: var(--dark-light);">
                <span style="margin-right: 0.5rem;">Quantity:</span>
                <span style="background: white; padding: 0.2rem 0.8rem; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${item.quantity || 1}</span>
            </div>

            <!-- Buy Button -->
            <button id="buy-action-btn" class="btn btn-success btn-lg" style="width: 100%;" onclick="confirmBuy(${item.id})">
                BUY / REVEAL CONTACT
            </button>
        </div>
      </div>

      <!-- Right Column: Info -->
        <div class="detail-header">
           <div class="detail-title">${item.title}</div>
           <div class="detail-price">Rs ${item.price.toLocaleString()}</div>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <label>Category</label>
                <div class="meta-badge">${item.category}</div>
            </div>
            <div class="meta-item">
                <label>Condition</label>
                <div class="meta-badge">
                   <i class="fas fa-tag" style="font-size:0.8rem;"></i> ${item.condition || 'Pre-owned'}
                </div>
            </div>
            <div class="meta-item">
                <label>Status</label>
                <div class="meta-badge status-badge">${item.status}</div>
            </div>
        </div>

        <div class="detail-description">
            <h4>Description</h4>
            <p>${item.description}</p>
        </div>

        <div class="detail-footer">
            <div style="font-size:0.9rem; color:var(--gray); margin-bottom:1rem;">
                <i class="far fa-calendar-alt"></i> Posted ${formatDate(item.createdAt)}
            </div>
            
            <div style="font-weight:600; font-size:1rem; margin-top: 1.5rem; margin-bottom: 0.5rem;">Seller Contact</div>
            <div class="seller-info" style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
                <div class="seller-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="seller-details">
                    <h5>${item.sellerName || 'Unknown Seller'}</h5>
                    <!-- Hidden Contact Info -->
                    <p id="seller-contact-info" style="display: none; color: var(--primary-color); font-weight: 600;">
                        <i class="fas fa-phone-alt"></i> ${item.contact}
                    </p>
                    <!-- Blurred Placeholder -->
                    <p id="seller-contact-blur" style="color: var(--gray-light); letter-spacing: 2px;">
                        <i class="fas fa-lock"></i> •••••••••••
                    </p>
                </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--gray); margin-top: 0.5rem; text-align: center;">Based on your request, contact info is hidden until you confirm purchase.</p>
        </div>
      </div>
    </div>
      `;

  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.add('active');
}

// ===== Form Handlers =====
function handlePostItem(e) {
  e.preventDefault();

  const newItem = {
    id: Date.now(),
    title: document.getElementById('itemTitle').value,
    price: parseFloat(document.getElementById('itemPrice').value),
    category: document.getElementById('itemCategory').value,
    condition: document.getElementById('itemCondition').value,
    description: document.getElementById('itemDescription').value,
    image: document.getElementById('itemImage').value,
    quantity: 1,
    status: 'available',
    sellerName: document.getElementById('itemSellerName').value,
    contact: document.getElementById('contactInfo').value,
    createdAt: new Date().toISOString(),
    isFavorite: false
  };

  marketplaceItems.unshift(newItem);
  saveItems();

  renderMarketplaceItems();
  closeModals();
  showToast('Item posted successfully!', 'success');
}

function handleSearch(e) {
  searchQuery = e.target.value;
  renderMarketplaceItems();
}

function handleCategoryFilter(e) {
  categoryFilter = e.target.value;
  renderMarketplaceItems();
}

// ===== Helper Functions =====
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}