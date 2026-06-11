const notes = [
    { title: 'JWT Notes', href: 'JWT_Notes.pdf', description: 'Authentication & Authorization', label: 'Auth', tags: ['Auth', 'Security'] },
    { title: 'API Notes', href: 'API_Notes.pdf', description: 'REST APIs & Design Principles', label: 'API', tags: ['API', 'Design'] },
    { title: 'Password Hashing', href: 'PasswordHashing_Notes.pdf', description: 'Password Security Fundamentals', label: 'Security', tags: ['Encryption'] },
    { title: 'Bcrypt vs Argon2', href: 'BcryptArgon2_Notes.pdf', description: 'Modern Password Hashing', label: 'Hashing', tags: ['Hashing'] },
    { title: 'XML Notes', href: 'XML.pdf', description: 'Structure & Internals', label: 'Formats', tags: ['XML', 'Markup'] },
    { title: 'JSON Notes', href: 'JSON_Notes.pdf', description: 'Data Exchange Format', label: 'Formats', tags: ['JSON', 'Data'] },
    { title: 'BSON Notes', href: 'BSON_Notes.pdf', description: 'MongoDB Internals & Binary Encoding', label: 'Database', tags: ['MongoDB', 'Binary'], isNew: true }
];

const notesGrid = document.getElementById('notesGrid');
const searchInput = document.getElementById('search');
const resultCount = document.getElementById('resultCount');
const featuredLink = document.getElementById('featuredLink');
const featuredTitle = document.getElementById('featuredTitle');
const featuredDescription = document.getElementById('featuredDescription');
const featuredTags = document.getElementById('featuredTags');
const featuredNew = document.getElementById('featuredNew');
const themeToggle = document.getElementById('themeToggle');
const bulbPull = document.querySelector('.bulb-pull');

let cards = [];
let isDraggingPull = false;
let pullStartY = 0;
let pullDistance = 0;
let skipNextClick = false;
const pullThreshold = 26;

function applyTheme(theme) {
    document.documentElement.classList.toggle('light', theme === 'light');
    if (themeToggle) {
        themeToggle.classList.toggle('active', theme === 'light');
        themeToggle.classList.toggle('theme-light', theme === 'light');
        themeToggle.classList.toggle('theme-dark', theme === 'dark');
        themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
    localStorage.setItem('site-theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('site-theme');
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
    applyTheme(initialTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    themeToggle?.classList.add('active');
    setTimeout(() => themeToggle?.classList.remove('active'), 320);
}

function updatePull(distance) {
    pullDistance = Math.max(0, Math.min(distance, 46));
    themeToggle.style.setProperty('--pull-distance', `${pullDistance}px`);
    themeToggle.classList.toggle('dragging', pullDistance > 4);
}

function resetPull() {
    pullDistance = 0;
    updatePull(0);
    isDraggingPull = false;
}

if (themeToggle) {
    themeToggle.addEventListener('click', (event) => {
        if (skipNextClick) {
            skipNextClick = false;
            event.preventDefault();
            return;
        }
        toggleTheme();
    });
}

if (bulbPull) {
    bulbPull.addEventListener('pointerdown', (event) => {
        isDraggingPull = true;
        pullStartY = event.clientY;
        pullDistance = 0;
        updatePull(0);
        bulbPull.setPointerCapture(event.pointerId);
    });

    bulbPull.addEventListener('pointermove', (event) => {
        if (!isDraggingPull) return;
        const distance = event.clientY - pullStartY;
        if (distance <= 0) {
            updatePull(0);
            return;
        }
        updatePull(distance);
    });

    bulbPull.addEventListener('pointerup', () => {
        if (isDraggingPull && pullDistance >= pullThreshold) {
            toggleTheme();
            skipNextClick = true;
        }
        resetPull();
    });

    bulbPull.addEventListener('pointercancel', () => {
        resetPull();
    });
}

function updateResultCount(visibleCount, totalCount) {
    if (!resultCount) return;
    resultCount.textContent = visibleCount === totalCount
        ? `Showing ${totalCount} notes`
        : `Showing ${visibleCount} of ${totalCount} notes`;
}

function renderFeatured(note) {
    if (!featuredLink || !featuredTitle || !featuredDescription || !featuredTags) return;

    featuredLink.href = note.href;
    featuredTitle.textContent = note.title;
    featuredDescription.textContent = note.description;
    featuredTags.innerHTML = note.tags.map(tag => `<span>${tag}</span>`).join('');
    featuredNew.hidden = !note.isNew;
}

function renderNotes() {
    if (!notesGrid) return;

    const featuredNote = notes[notes.length - 1];
    renderFeatured(featuredNote);

    notesGrid.innerHTML = notes.map(note => {
        const newBadge = note.isNew ? '<span class="card-new">New</span>' : '';
        const featuredClass = note === featuredNote ? ' featured' : '';
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
}

function filterNotes() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent?.toLowerCase() ?? '';
        const description = card.querySelector('p')?.textContent?.toLowerCase() ?? '';
        const label = card.querySelector('.card-label')?.textContent?.toLowerCase() ?? '';
        const matches = !query || title.includes(query) || description.includes(query) || label.includes(query);

        card.style.display = matches ? 'block' : 'none';
        if (matches) visible += 1;
    });

    updateResultCount(visible, cards.length);
}

function animateCards() {
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
}

loadTheme();
renderNotes();
animateCards();
if (searchInput) {
    searchInput.addEventListener('input', filterNotes);
}
filterNotes();
