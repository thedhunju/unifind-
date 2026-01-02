// UNI-find Marketplace App - Main JavaScript
console.log('🎉 JavaScript file loaded!');

// ===== Global State =====
let marketplaceItems = [];
let currentFilter = "all";
let searchQuery = "";
let categoryFilter = "";

// ===== Mock Data =====
const mockData = [
  {
    id: 1,
    title: "MacBook Pro 2020",
    price: 85000,
    category: "Electronics",
    description: "Barely used MacBook Pro 13-inch, 8GB RAM, 256GB SSD. Perfect condition!",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    status: "available",
    contact: "john@ku.edu.np",
    createdAt: new Date(2025, 0, 1)
  },
  {
    id: 2,
    title: "Engineering Textbooks Set",
    price: 3500,
    category: "Books",
    description: "Complete set of first-year engineering books. Minimal highlighting.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    status: "available",
    contact: "sarah@ku.edu.np",
    createdAt: new Date(2024, 11, 28)
  },
  {
    id: 3,
    title: "Study Desk with Chair",
    price: 4500,
    category: "Furniture",
    description: "Sturdy wooden desk with comfortable chair. Great for dorm room!",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
    status: "sold",
    contact: "mike@ku.edu.np",
    createdAt: new Date(2024, 11, 25)
  },
  {
    id: 4,
    title: "Gaming Mouse & Keyboard",
    price: 2800,
    category: "Electronics",
    description: "RGB gaming peripherals, barely used. Original packaging included.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    status: "available",
    contact: "alex@ku.edu.np",
    createdAt: new Date(2024, 11, 30)
  },
  {
    id: 5,
    title: "Scientific Calculator",
    price: 800,
    category: "Stationery",
    description: "Casio fx-991ES Plus calculator. Perfect for engineering students.",
    image: "",
    status: "available",
    contact: "priya@ku.edu.np",
    createdAt: new Date(2025, 0, 2)
  }
];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Load mock data
  marketplaceItems = [...mockData];
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

// ===== Render Functions =====
function renderMarketplaceItems() {
  console.log('Rendering items...');
  const grid = document.getElementById('marketplaceGrid');
  const loading = document.getElementById('marketplaceLoading');
  const empty = document.getElementById('marketplaceEmpty');

  if (!grid) {
    console.error('marketplaceGrid element not found!');
    return;
  }

  // Filter items
  let filteredItems = marketplaceItems.filter(item => {
    const matchesFilter = currentFilter === 'all' || item.status === currentFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesFilter && matchesSearch && matchesCategory;
  });

  console.log(`Found ${filteredItems.length} items`);

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
          ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<i class="fas fa-box"></i>'}
        </div>
        <div class="item-info">
          <h3 class="item-title">${item.title}</h3>
          <div class="item-price">NPR ${item.price.toLocaleString()}</div>
          <span class="item-category">${item.category}</span>
          <span class="item-status ${item.status}">${item.status === 'available' ? '✓ Available' : '✕ Sold'}</span>
          <p class="item-desc">${item.description}</p>
          <div class="item-meta">
            <i class="fas fa-clock"></i> ${formatDate(item.createdAt)}
          </div>
        </div>
      </div>
    `).join('');
  }
}

// ===== Modal Functions =====
function openPostModal() {
  console.log('Opening post modal...');
  const modal = document.getElementById('postModal');
  if (modal) {
    modal.classList.add('active');
    const titleInput = document.getElementById('itemTitle');
    if (titleInput) titleInput.focus();
  }
}

function closeModals() {
  console.log('Closing modals...');
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
  const form = document.getElementById('postItemForm');
  if (form) form.reset();
}

function showItemDetail(itemId) {
  console.log('Showing item detail:', itemId);
  const item = marketplaceItems.find(i => i.id === itemId);
  if (!item) return;

  const content = document.getElementById('detailContent');
  if (!content) return;

  content.innerHTML = `
    <button class="close-modal" aria-label="Close Modal" onclick="closeModals()">&times;</button>
    <div style="text-align: center; margin-bottom: 1.5rem;">
      ${item.image ? `<img src="${item.image}" alt="${item.title}" style="max-width: 100%; border-radius: var(--border-radius); max-height: 300px; object-fit: cover;">` : '<div style="font-size: 5rem; color: var(--gray-light);"><i class="fas fa-box"></i></div>'}
    </div>
    <h2>${item.title}</h2>
    <div style="margin: 1rem 0;">
      <span class="item-price" style="font-size: 1.5rem;">NPR ${item.price.toLocaleString()}</span>
      <span class="item-status ${item.status}" style="margin-left: 1rem;">${item.status === 'available' ? '✓ Available' : '✕ Sold'}</span>
    </div>
    <p style="margin: 1rem 0;"><strong>Category:</strong> ${item.category}</p>
    <p style="margin: 1rem 0;"><strong>Description:</strong></p>
    <p style="color: var(--dark-light); line-height: 1.8;">${item.description}</p>
    <p style="margin: 1.5rem 0;"><strong>Contact:</strong> ${item.contact}</p>
    <p style="color: var(--gray); font-size: 0.9rem;"><i class="fas fa-clock"></i> Posted ${formatDate(item.createdAt)}</p>
  `;
  
  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.add('active');
}

// ===== Form Handlers =====
function handlePostItem(e) {
  e.preventDefault();
  console.log('Posting new item...');
  
  const newItem = {
    id: Date.now(),
    title: document.getElementById('itemTitle').value,
    price: parseFloat(document.getElementById('itemPrice').value),
    category: document.getElementById('itemCategory').value,
    description: document.getElementById('itemDescription').value,
    image: document.getElementById('itemImage').value,
    status: 'available',
    contact: document.getElementById('contactInfo').value,
    createdAt: new Date()
  };

  marketplaceItems.unshift(newItem);
  renderMarketplaceItems();
  closeModals();
  showToast('Item posted successfully!');
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
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}