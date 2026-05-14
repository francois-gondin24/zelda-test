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