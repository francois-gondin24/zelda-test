// filepath: d:\Visual Studio Code\Zelda\java.js
const carrousel = document.querySelector('.carrousel');
const images = document.querySelectorAll('.carrousel .img');
let currentIndex = 0;

// Fonction pour mettre à jour l'état du carrousel
function updateCarrousel() {
    images.forEach((img, index) => {
        img.classList.remove('active');
        if (index === currentIndex) {
            img.classList.add('active');
        }
    });

    // Centrer l'image active
    const offset = -currentIndex * images[0].offsetWidth;
    carrousel.style.transform = `translateX(${offset}px)`;
}

// Écouteurs pour les boutons de navigation
document.getElementById('prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarrousel();
});

document.getElementById('next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarrousel();
});

// Initialisation
updateCarrousel();