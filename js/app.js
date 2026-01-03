// UNI-find Marketplace App - Main JavaScript
console.log('🎉 JavaScript file loaded!');

// ===== Global State =====
let marketplaceItems = [];
let currentFilter = "all";
let searchQuery = "";
let categoryFilter = "";
let pendingBuyId = null; // Store ID for confirmation modal

// ===== Mock Data (Fallback) =====
const mockData = [
  {
    id: 1,
    title: "MacBook Pro 2020",
    price: 85000,
    category: "Electronics",
    description: "Barely used MacBook Pro 13-inch, 8GB RAM, 256GB SSD. Perfect condition! Battery cycle count is only 45. Comes with original charger and box.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    contact: {
      phone: "9841XXXXXX",
      email: "john@ku.edu.np",
      social: "Instagram",
      handle: "john_doe"
    },
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
  const categorySelect = document.getElementById('categorySelect');
  const confirmBuyBtn = document.getElementById('confirmBuyBtn');
  const contactSupportForm = document.getElementById('contactSupportForm');

  if (postBtn) postBtn.addEventListener('click', openPostModal);
  if (postForm) postForm.addEventListener('submit', handlePostItem);
  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (categorySelect) categorySelect.addEventListener('change', handleCategoryFilter);
  if (confirmBuyBtn) confirmBuyBtn.addEventListener('click', handleConfirmBuy);
  if (contactSupportForm) contactSupportForm.addEventListener('submit', handleContactSupport);

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
  pendingBuyId = itemId;
  const modal = document.getElementById('confirmModal');
  if (modal) modal.classList.add('active');
}

function handleConfirmBuy() {
  if (!pendingBuyId) return;

  const item = marketplaceItems.find(i => i.id === pendingBuyId);
  if (!item) return;

  // Reveal contact info
  const contactElement = document.getElementById('seller-contact-info');
  const blurElement = document.getElementById('seller-contact-blur');
  const buyBtn = document.getElementById('buy-action-btn');

  if (contactElement) contactElement.style.display = 'inline'; /* Changed to inline for new layout */
  if (blurElement) blurElement.style.display = 'none';
  if (buyBtn) {
    buyBtn.textContent = 'Purchased';
    buyBtn.classList.remove('btn-success');
    buyBtn.style.background = 'var(--gray)';
    buyBtn.disabled = true;
  }

  // Populate and open Contact Revealed Modal
  const revealedContact = document.getElementById('revealedContactInfo');
  const revealedSeller = document.getElementById('revealedSellerName');

  if (revealedSeller) revealedSeller.textContent = item.sellerName || 'Unknown Seller';

  if (revealedContact) {
    let contactHTML = '';
    const c = item.contact;

    // Handle legacy string contact vs new object contact
    if (typeof c === 'string') {
      contactHTML = `<div><i class="fas fa-phone-alt"></i> ${c}</div>`;
    } else {
      if (c.phone) contactHTML += `<div style="margin-bottom:0.5rem;"><i class="fas fa-phone-alt" style="width:20px;"></i> ${c.phone}</div>`;
      if (c.email) contactHTML += `<div style="margin-bottom:0.5rem;"><i class="fas fa-envelope" style="width:20px;"></i> ${c.email}</div>`;
      if (c.social && c.handle) {
        let icon = 'hashtag';
        if (c.social === 'Instagram') icon = 'instagram';
        if (c.social === 'Facebook') icon = 'facebook';
        if (c.social === 'Twitter') icon = 'twitter';
        if (c.social === 'LinkedIn') icon = 'linkedin';

        contactHTML += `<div style="color:var(--dark); font-size:1.1rem; margin-top:0.8rem;">
                  <i class="fab fa-${icon}" style="width:20px;"></i> <span style="font-weight:600">${c.handle}</span>
              </div>`;
      }
    }
    revealedContact.innerHTML = contactHTML;
  }

  // Close confirmation modal
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) confirmModal.classList.remove('active');

  // Open Contact Revealed modal
  const contactModal = document.getElementById('contactRevealedModal');
  if (contactModal) contactModal.classList.add('active');

  pendingBuyId = null;
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

function openContactModal() {
  const modal = document.getElementById('contactUsModal');
  if (modal) modal.classList.add('active');
}

function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
  const forms = document.querySelectorAll('form');
  forms.forEach(form => form.reset());
}

function showItemDetail(itemId) {
  const item = marketplaceItems.find(i => i.id === itemId);
  if (!item) return;

  const content = document.getElementById('detailContent');
  if (!content) return;

  content.innerHTML = `
    <button class="close-modal detail-close" onclick="closeModals()"><i class="fas fa-times"></i></button>
    
    <div class="detail-container">
      <!-- Left Column: Image -->
      <div class="detail-left">
        <div class="detail-image-container">
          ${item.image ?
      `<img src="${item.image}" alt="${item.title}" class="detail-image">` :
      `<div style="color: var(--gray-light);"><i class="fas fa-box fa-4x"></i></div>`
    }
        </div>
      </div>

      <!-- Right Column: Info -->
      <div class="detail-right">
        
        <div class="detail-header">
           <div class="tags" style="margin-bottom: 0.5rem;">
             <span class="tag tag-category">${item.category}</span>
             <span class="tag tag-status ${item.status}">${item.status === 'available' ? 'Available' : 'Sold'}</span>
             <span class="tag" style="background: #f1f5f9; color: var(--dark-light);"><i class="fas fa-tag" style="font-size:0.8rem;"></i> ${item.condition || 'Pre-owned'}</span>
           </div>
           <h2 class="detail-title">${item.title}</h2>
           <div class="detail-price">Rs ${item.price.toLocaleString()}</div>
        </div>

        <div class="detail-description">
            <h4 style="font-weight: 600; color: var(--dark); margin-bottom: 0.5rem;">About this item</h4>
            <p>${item.description}</p>
        </div>

        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9;">
            <!-- Actions Row -->
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
                <!-- Quantity -->
                 <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--gray); font-size: 0.9rem;">
                    <span>Quantity:</span>
                    <span style="font-weight: 600; color: var(--dark);">${item.quantity || 1}</span>
                </div>
            </div>

            <!-- Buy Button -->
            <button id="buy-action-btn" class="btn btn-success btn-lg" style="width: 100%; margin-bottom: 1.5rem;" onclick="confirmBuy(${item.id})">
                Buy Now
            </button>

            <!-- Seller Info (Simple) -->
            <div class="seller-simple" style="display: flex; align-items: center; gap: 0.8rem;">
                <div class="seller-avatar-sm" style="width: 40px; height: 40px; background: #e0e7ff; color: #4338ca; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div>
                     <div style="font-weight: 600; font-size: 0.95rem; color: var(--dark);">${item.sellerName || 'Unknown Seller'}</div>
                     <div style="font-size: 0.85rem; margin-top: 2px;">
                        <span id="seller-contact-blur" style="color: var(--gray); letter-spacing: 1px;">••••••••••</span>
                        <span id="seller-contact-info" style="display: none; color: var(--primary-color); font-weight: 500;">
                            ${item.contact}
                        </span>
                     </div>
                </div>
                <div style="margin-left: auto; font-size: 0.8rem; color: var(--gray-light);">
                    Posted ${formatDate(item.createdAt)}
                </div>
            </div>
            
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
    contact: {
      phone: document.getElementById('itemPhone').value,
      email: document.getElementById('itemEmail').value,
      social: document.getElementById('itemSocialPlatform').value,
      handle: document.getElementById('itemSocialHandle').value
    },
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

function handleContactSupport(e) {
  e.preventDefault();
  // Here you would typically send the data to a backend
  showToast('Message sent to support! We will reply via email.', 'success');
  closeModals();
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