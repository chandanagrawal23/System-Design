const notesGrid = document.getElementById('notesGrid');
const searchInput = document.getElementById('search');
const resultCount = document.getElementById('resultCount');
const topicsCount = document.getElementById('topicsCount');
const featuredNotes = document.getElementById('featuredNotes');
const featuredCount = document.getElementById('featuredCount');
const themeToggle = document.getElementById('themeToggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Performance: Cache card metadata to avoid repeated DOM queries
let cards = [];
let cardMetadata = [];
let searchDebounceTimer = null;
const SEARCH_DEBOUNCE_MS = 300;
let lastScrollY = 0;

function applyTheme(theme) {
    document.documentElement.classList.toggle('light', theme === 'light');
    if (themeToggle) {
        themeToggle.classList.toggle('light', theme === 'light');
        themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
    localStorage.setItem('site-theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('site-theme');
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
    applyTheme(initialTheme);
}

function updateTopicsCount() {
    if (topicsCount) {
        topicsCount.textContent = notes.length;
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    if (themeToggle && !reducedMotion) {
        themeToggle.classList.add('active');
        setTimeout(() => themeToggle.classList.remove('active'), 420);
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

function updateResultCount(visibleCount, totalCount) {
    if (!resultCount) return;
    resultCount.textContent = visibleCount === totalCount
        ? `Showing ${totalCount} notes`
        : `Showing ${visibleCount} of ${totalCount} notes`;
}

function getFeaturedNotes() {
    return notes.filter(note => note.isFeatured);
}

function renderFeaturedNotes() {
    if (!featuredNotes || !featuredCount) return;

    const featuredItems = getFeaturedNotes();
    featuredCount.textContent = `${featuredItems.length} featured`;
    featuredNotes.innerHTML = featuredItems.map(note => `
        <a href="${note.href}" class="featured-note-card">
            <div class="featured-note-card__top">
                <span class="featured-note-card__label">${note.label}</span>
                <span class="featured-note-card__badge ${note.isNew ? 'featured-note-card__badge--new' : ''}">
                    ${note.isNew ? 'New' : 'Featured'}
                </span>
            </div>
            <h3>${note.title}</h3>
            <p>${note.description}</p>
            <div class="featured-note-card__tags">
                ${note.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
        </a>
    `).join('');
}

function renderNotes() {
    if (!notesGrid) return;

    renderFeaturedNotes();

    notesGrid.innerHTML = notes.map(note => {
        const newBadge = note.isNew ? '<span class="card-new">New</span>' : '';
        const featuredClass = note.isFeatured ? ' featured' : '';
        return `
            <a href="${note.href}" class="card${featuredClass}">
                <div class="card-meta">
                    <span class="card-label">${note.label}</span>
                    ${newBadge}
                </div>
                <h3>${note.title}</h3>
                <p>${note.description}</p>
            </a>
        `;
    }).join('');

    cards = Array.from(document.querySelectorAll('.card'));
    
    // Performance: Pre-cache card metadata to avoid repeated DOM queries during filtering
    cardMetadata = cards.map(card => ({
        element: card,
        title: (card.querySelector('h3')?.textContent || '').toLowerCase(),
        description: (card.querySelector('p')?.textContent || '').toLowerCase(),
        label: (card.querySelector('.card-label')?.textContent || '').toLowerCase()
    }));
}

// Performance: Debounce search to avoid excessive filtering on every keystroke
function debounceFilter() {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(filterNotes, SEARCH_DEBOUNCE_MS);
}

function filterNotes() {
    if (!searchInput || cardMetadata.length === 0) return;
    
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    // Performance: Batch DOM updates using visibility toggling instead of style.display
    cardMetadata.forEach(({ element, title, description, label }) => {
        const matches = !query || title.includes(query) || description.includes(query) || label.includes(query);
        element.classList.toggle('hidden', !matches);
        if (matches) visible++;
    });

    updateResultCount(visible, cards.length);
}

function animateCards() {
    // Performance: Skip animations if reduced-motion is preferred
    if (reducedMotion) return;
    
    // Performance: Use requestAnimationFrame to batch animations and avoid layout thrashing
    requestAnimationFrame(() => {
        cards.forEach((card, index) => {
            card.animate(
                [
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                {
                    duration: 420,
                    delay: index * 70,
                    fill: 'forwards',
                    easing: 'ease-out'
                }
            );
        });
    });
}

loadTheme();
updateTopicsCount();
renderNotes();
animateCards();
if (searchInput) {
    // Performance: Use debounced filter instead of filtering on every keystroke
    searchInput.addEventListener('input', debounceFilter);
}
filterNotes();

// Hide/show toggle button on scroll
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    
    if (currentScrollY > 100 && isScrollingDown) {
        // Scrolling down and past top - hide button
        themeToggle?.style.setProperty('pointer-events', 'none');
        themeToggle?.style.setProperty('opacity', '0');
        themeToggle?.style.setProperty('transform', 'scale(0.8)');
    } else {
        // At top or scrolling up - show button
        themeToggle?.style.setProperty('pointer-events', 'auto');
        themeToggle?.style.setProperty('opacity', '1');
        themeToggle?.style.setProperty('transform', 'scale(1)');
    }
    
    lastScrollY = currentScrollY;
}, { passive: true });
