// On stocke toutes les infos dans un objet
const peuples = {
    piaf: {
        nom: "Peuple Piaf",
        description: "Un peuple d'oiseaux bipèdes vivant au Nord-Ouest d'Hyrule, dans la région de Tabanta.",
        lien: "../Piaf/piaf.html"
    },
    goron: {
        nom: "Peuple Goron",
        description: "Un peuple de pierre humanoïde vivant sur la Montagne de la Mort, au Nord-Est d'Hyrule.",
        lien: "../Goron/goron.html"
    },
    zora: {
        nom: "Peuple Zora",
        description: "Un peuple d'hommes-poissons vivant dans le Domaine Zora, au Nord-Est d'Hyrule.",
        lien: "../Zora/zora.html"
    },
    gerudo: {
        nom: "Peuple Gerudo",
        description: "Un peuple de femmes guerrières vivant dans le Désert Gerudo, au Sud-Ouest d'Hyrule.",
        lien: "../Gerudo/gerudo.html"
    }
};

// On récupère tous les éléments dont on a besoin
const fiche       = document.querySelector('#fiche');
const ficheNom    = document.querySelector('#fiche-nom');
const ficheDesc   = document.querySelector('#fiche-description');
const ficheLien   = document.querySelector('#fiche-lien');
const ficheClose  = document.querySelector('#fiche-close');

// querySelectorAll récupère TOUS les éléments avec cette classe
// C'est comme querySelector mais pour plusieurs éléments d'un coup
const zones = document.querySelectorAll('.zone');

// Une fonction c'est un bloc de code réutilisable
// On lui donne un nom et des "paramètres" (les infos dont elle a besoin)
function afficherFiche(peuple) {
    // On récupère les données du peuple cliqué
    const data = peuples[peuple];

    // On remplit la fiche avec ces données
    ficheNom.textContent  = data.nom;
    ficheDesc.textContent = data.description;
    ficheLien.href        = data.lien;

    // On affiche la fiche
    fiche.style.display = 'block';
}

// On parcourt TOUTES les zones avec forEach
// C'est comme une boucle — "pour chaque zone, fais ça"
zones.forEach(function(zone) {

    zone.addEventListener('click', function() {
        // On lit l'attribut data-peuple de la zone cliquée
        // ex: <div data-peuple="piaf"> → donne "piaf"
        const peuple = zone.dataset.peuple;

        // On appelle notre fonction avec ce peuple
        afficherFiche(peuple);
    });
});

// Au clic sur le ✕, on cache la fiche
ficheClose.addEventListener('click', function() {
    fiche.style.display = 'none';
});