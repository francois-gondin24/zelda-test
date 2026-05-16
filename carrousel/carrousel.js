const carrousel = document.querySelector('.carrousel');
const originalImages = document.querySelectorAll('.carrousel .img');
let currentIndex = 0;

// --- CARROUSEL INFINI : on clone les images ---
// On clone toutes les images et on les ajoute avant et après
originalImages.forEach(img => {
    const cloneEnd = img.cloneNode(true);
    carrousel.appendChild(cloneEnd);
});
originalImages.forEach(img => {
    const cloneStart = img.cloneNode(true);
    carrousel.insertBefore(cloneStart, carrousel.firstChild);
});

const allImages = document.querySelectorAll('.carrousel .img');
const total = originalImages.length;
// On démarre à l'index "total" pour pointer sur la première vraie image (après les clones du début)
currentIndex = total;

function updateCarrousel(animate = true) {
    if (!animate) {
        carrousel.style.transition = 'none';
    } else {
        carrousel.style.transition = 'transform 0.5s ease-in-out';
    }

    allImages.forEach((img, index) => {
        img.classList.remove('active');
        if (index === currentIndex) {
            img.classList.add('active');
        }
    });

    const activeImg = allImages[currentIndex];
    const carrouselRect = carrousel.parentElement.getBoundingClientRect();
    const imgRect = activeImg.getBoundingClientRect();

    // Centrage de l'image active
    const offset = activeImg.offsetLeft - (carrousel.parentElement.offsetWidth / 2) + (activeImg.offsetWidth / 2);
    carrousel.style.transform = `translateX(-${offset}px)`;
}

document.getElementById('prev').addEventListener('click', () => {
    currentIndex--;
    updateCarrousel();

    // Si on est dans les clones du début, on saute en silence à la fin des vraies images
    if (currentIndex < total) {
        setTimeout(() => {
            currentIndex = currentIndex + total;
            updateCarrousel(false);
        }, 500);
    }
});

document.getElementById('next').addEventListener('click', () => {
    currentIndex++;
    updateCarrousel();

    // Si on est dans les clones de fin, on saute en silence au début des vraies images
    if (currentIndex >= total * 2) {
        setTimeout(() => {
            currentIndex = currentIndex - total;
            updateCarrousel(false);
        }, 500);
    }
});

// Initialisation : on attend que toutes les images soient chargées pour avoir leurs vraies dimensions
window.addEventListener('load', () => {
    updateCarrousel(false);
});

// =====================
// LIGHTBOX
// =====================

// On récupère les vraies images (sans clones) pour la navigation lightbox
function getOriginalImages() {
    return Array.from(document.querySelectorAll('.carrousel .img')).slice(total, total * 2);
}

let lightboxIndex = 0; // index dans les images originales

const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.style.cssText = `
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.88);
    z-index: 9999;
    justify-content: center;
    align-items: center;
    gap: 30px;
    padding: 60px 20px 40px;
    box-sizing: border-box;
`;
lightbox.innerHTML = `
    <!-- Bouton fermer -->
    <button id="lightbox-close" style="
        position: absolute; top: 20px; right: 30px;
        background: none; border: none; color: rgba(255,255,255,0.7);
        font-size: 32px; cursor: pointer; line-height: 1;
        transition: color 0.2s, transform 0.2s;
    " onmouseover="this.style.color='white'; this.style.transform='scale(1.2)'"
       onmouseout="this.style.color='rgba(255,255,255,0.7)'; this.style.transform='scale(1)'">✕</button>

    <!-- Flèche gauche -->
    <button id="lightbox-prev" style="
        background: none; border: none; color: rgba(255,255,255,0.5);
        font-size: 52px; cursor: pointer; line-height: 1;
        transition: color 0.2s, transform 0.2s;
        flex-shrink: 0; padding: 10px;
        user-select: none;
    " onmouseover="this.style.color='#00ccaa'; this.style.transform='scale(1.15)'"
       onmouseout="this.style.color='rgba(255,255,255,0.5)'; this.style.transform='scale(1)'">❮</button>

    <!-- Image + description -->
    <div style="display: flex; align-items: center; gap: 30px; max-width: 85%;">
        <img id="lightbox-img" style="
            max-width: 640px; max-height: 75vh;
            border-radius: 20px;
            box-shadow: 0 0 40px rgba(0,204,170,0.35);
            object-fit: contain;
            transition: opacity 0.25s ease;
        ">
        <div style="max-width: 260px; flex-shrink: 0;">
            <p id="lightbox-counter" style="
                color: #00ccaa; font-size: 0.85rem;
                margin: 0 0 10px 0; letter-spacing: 1px;
            "></p>
            <p id="lightbox-text" style="
                margin: 0; font-style: italic;
                color: #ccc; font-family: 'Georgia', serif;
                font-size: 1rem; line-height: 1.7;
            "></p>
        </div>
    </div>

    <!-- Flèche droite -->
    <button id="lightbox-next" style="
        background: none; border: none; color: rgba(255,255,255,0.5);
        font-size: 52px; cursor: pointer; line-height: 1;
        transition: color 0.2s, transform 0.2s;
        flex-shrink: 0; padding: 10px;
        user-select: none;
    " onmouseover="this.style.color='#00ccaa'; this.style.transform='scale(1.15)'"
       onmouseout="this.style.color='rgba(255,255,255,0.5)'; this.style.transform='scale(1)'">❯</button>
`;
document.body.appendChild(lightbox);

function mettreAJourLightbox() {
    const imgs = getOriginalImages();
    const img = imgs[lightboxIndex];
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = img.src;
        document.getElementById('lightbox-text').textContent = img.dataset.description || '';
        document.getElementById('lightbox-counter').textContent = `${lightboxIndex + 1} / ${imgs.length}`;
        lightboxImg.style.opacity = '1';
    }, 150);
}

function ouvrirLightbox(index) {
    lightboxIndex = index;
    mettreAJourLightbox();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fermerLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

// Ouvrir au clic sur l'image active du carrousel
carrousel.addEventListener('click', (e) => {
    const img = e.target.closest('.img');
    if (!img || !img.classList.contains('active')) return;

    // Trouver l'index dans les images originales
    const imgs = getOriginalImages();
    const idx = imgs.findIndex(i => i.src === img.src);
    ouvrirLightbox(idx !== -1 ? idx : 0);
});

// Navigation dans la lightbox
document.getElementById('lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    const imgs = getOriginalImages();
    lightboxIndex = (lightboxIndex - 1 + imgs.length) % imgs.length;
    mettreAJourLightbox();
});
document.getElementById('lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation();
    const imgs = getOriginalImages();
    lightboxIndex = (lightboxIndex + 1) % imgs.length;
    mettreAJourLightbox();
});

// Fermeture
document.getElementById('lightbox-close').addEventListener('click', fermerLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) fermerLightbox();
});
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') fermerLightbox();
        if (e.key === 'ArrowLeft') { const imgs = getOriginalImages(); lightboxIndex = (lightboxIndex - 1 + imgs.length) % imgs.length; mettreAJourLightbox(); }
        if (e.key === 'ArrowRight') { const imgs = getOriginalImages(); lightboxIndex = (lightboxIndex + 1) % imgs.length; mettreAJourLightbox(); }
    }
});