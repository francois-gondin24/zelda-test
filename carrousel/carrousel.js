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

// Création de la lightbox dans le DOM
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
    gap: 40px;
    padding: 40px;
    box-sizing: border-box;
    animation: fadeIn 0.3s ease;
`;
lightbox.innerHTML = `
    <button id="lightbox-close" style="
        position: absolute; top: 20px; right: 30px;
        background: none; border: none; color: white;
        font-size: 36px; cursor: pointer; line-height: 1;
    ">✕</button>
    <img id="lightbox-img" style="
        max-width: 60%; max-height: 80vh;
        border-radius: 20px;
        box-shadow: 0 0 40px rgba(0,204,170,0.4);
        object-fit: contain;
    ">
    <div id="lightbox-desc" style="
        max-width: 300px; color: white;
        font-family: 'Georgia', serif; font-size: 1rem;
        line-height: 1.7;
    ">
        <p id="lightbox-text" style="margin: 0; font-style: italic; color: #ccc;"></p>
    </div>
`;
document.body.appendChild(lightbox);

// Ouvrir la lightbox au clic sur une image active
carrousel.addEventListener('click', (e) => {
    const img = e.target.closest('.img');
    if (!img || !img.classList.contains('active')) return;

    const src = img.src;
    const desc = img.dataset.description || '';

    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-text').textContent = desc;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // bloque le scroll
});

// Fermer la lightbox
function fermerLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('lightbox-close').addEventListener('click', fermerLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) fermerLightbox(); // clic en dehors de l'image
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fermerLightbox();
});