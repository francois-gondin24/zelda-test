const switchElement = document.querySelector('#theme-checkbox');
const themeIcon = document.querySelector('#theme-icon');
const corps = document.querySelectorAll('#header, .bouton, #firstPart, #secondPart, #thirdPart, #lastPart');
const searchInput = document.querySelector('#monsterSearch');
const parts = ['#firstPart', '#secondPart', '#thirdPart', '#lastPart'];

let baseDeDonnees = {};

// =====================
// 1. CHARGEMENT DU JSON
// =====================
fetch('search/monstres.json')
    .then(response => response.json())
    .then(data => {
        baseDeDonnees = data;
        console.log("Base de données chargée avec succès.");
    })
    .catch(err => console.error("Erreur lors du chargement du JSON :", err));

// =====================
// 2. GESTION DU THÈME
// =====================
function getTextColor() {
    return switchElement.checked ? "white" : "rgba(44, 62, 80, 1)";
}

function updateTheme() {
    const isDark = switchElement.checked;
    const bgColor = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
    const textColor = getTextColor();
    const bgImage = isDark ? "url('style/fondSombre.jpg')" : "url('style/fondClair.webp')";

    document.body.style.backgroundImage = bgImage;
    corps.forEach(part => {
        part.style.backgroundColor = bgColor;
        part.style.color = textColor;
    });

    if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";

    const dynamicTexts = document.querySelectorAll('#firstPart p, #firstPart strong, #firstPart h2');
    dynamicTexts.forEach(txt => {
        if (txt.tagName !== 'H2' && !txt.classList.contains('hp-text')) {
            txt.style.color = textColor;
        }
    });
}

switchElement.addEventListener('change', updateTheme);
window.addEventListener('load', updateTheme);

// =============================================
// 3. RÉCUPÉRER TOUS LES MONSTRES À PLAT
// =============================================
// Retourne un tableau [{nom, ...données}] de tous les monstres finaux (ceux qui ont des PV)
function tousLesMonstres(objet, resultats = []) {
    for (let cle in objet) {
        const valeur = objet[cle];
        if (valeur && typeof valeur === 'object') {
            if (valeur.PV !== undefined) {
                resultats.push({ nom: cle, ...valeur });
            } else {
                tousLesMonstres(valeur, resultats);
            }
        }
    }
    return resultats;
}

// Retourne tous les monstres dont le nom contient la saisie
function chercherMonstres(saisie) {
    const saisieLower = saisie.toLowerCase().trim();
    if (!saisieLower) return [];
    return tousLesMonstres(baseDeDonnees).filter(m =>
        m.nom.toLowerCase().includes(saisieLower)
    );
}

// =============================================
// 4. SUGGESTIONS EN TEMPS RÉEL (style Google)
// =============================================
// Crée ou récupère le conteneur de suggestions
function getSuggestionsBox() {
    let box = document.getElementById('search-suggestions');
    if (!box) {
        box = document.createElement('div');
        box.id = 'search-suggestions';
        box.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 999;
            max-height: 220px;
            overflow-y: auto;
            margin-top: 5px;
        `;
        // On positionne par rapport au label .search
        const searchLabel = document.querySelector('.search');
        searchLabel.style.position = 'relative';
        searchLabel.appendChild(box);
    }
    return box;
}

function fermerSuggestions() {
    const box = document.getElementById('search-suggestions');
    if (box) box.innerHTML = '';
}

searchInput.addEventListener('input', () => {
    const saisie = searchInput.value.trim();
    const box = getSuggestionsBox();

    if (!saisie) {
        box.innerHTML = '';
        return;
    }

    const resultats = chercherMonstres(saisie).slice(0, 8); // max 8 suggestions

    if (resultats.length === 0) {
        box.innerHTML = `<div style="padding: 10px 15px; color: #888; font-size: 13px;">Aucun résultat...</div>`;
        return;
    }

    box.innerHTML = resultats.map(m => `
        <div class="suggestion-item"
             style="padding: 10px 15px; cursor: pointer; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0; transition: background 0.15s;"
             onmouseover="this.style.background='#f0fff9'"
             onmouseout="this.style.background='white'"
             onclick="lancerRecherche('${m.nom.replace(/'/g, "\\'")}')">
            ${m.nom}
        </div>
    `).join('');
});

// Fermer les suggestions si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) fermerSuggestions();
});

// =============================================
// 5. AFFICHAGE STYLE <details> (lignes dépliables)
// =============================================

// On garde en mémoire la dernière recherche pour le bouton retour
let derniereSaisie = '';

function afficherGrille(monstres, titre) {
    parts.forEach(id => {
        const el = document.querySelector(id);
        if (el) el.innerHTML = '';
    });

    const target = document.querySelector('#firstPart');
    const textColor = getTextColor();
    target.style.display = 'block';

    let html = `
        <div style="padding: 20px 10px; animation: fadeIn 0.4s;">
            <h2 style="font-family: 'hylia'; color: #00ccaa; font-size: 32px; margin-bottom: 5px; text-align:center;">${titre}</h2>
            <p style="color: ${textColor}; margin-bottom: 20px; font-size: 14px; text-align:center;">${monstres.length} résultat(s)</p>
    `;

    monstres.forEach(m => {
        html += `
            <details style="border: 2px solid #00ccaa; border-radius: 14px; margin-bottom: 10px;
                            background: rgba(0,204,170,0.06); overflow: hidden;">
                <summary style="padding: 14px 20px; cursor: pointer; font-size: 16px;
                                font-weight: bold; color: ${textColor}; list-style: none;
                                display: flex; align-items: center; justify-content: space-between;
                                user-select: none;">
                    <span>⚔️ ${m.nom}</span>
                    <span style="color: #ff4545; font-size: 14px;">❤️ ${m.PV} PV</span>
                </summary>
                <div style="padding: 15px 20px; border-top: 1px solid rgba(0,204,170,0.3);">
                    <img src="${m.image === 0 ? 'search/petitChuchu.jpg' : m.image}"
                         style="border-radius: 14px; box-shadow: 0 0 15px #000; max-width: 180px; margin: 0 auto 15px; display: block;">
                    <p style="font-size: 1rem; color: ${textColor}; line-height: 1.6; margin-bottom: 10px;">
                        ${m.description || "Description non disponible."}
                    </p>
                    <p style="color: ${textColor}; font-size: 0.95rem;">
                        <strong>⚔️ Butins :</strong> ${m.butins || "Inconnus"}
                    </p>
                </div>
            </details>
        `;
    });

    html += `
        <div style="text-align:center; margin-top: 20px;">
            <button onclick="window.location.reload()"
                    style="padding: 10px 22px; cursor: pointer; border-radius: 12px;
                           background: #00ccaa; border: none; font-weight: bold; color: black;">
                ↩ Retour à Hyrule
            </button>
        </div>
    </div>`;

    target.innerHTML = html;
    document.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
}

// =============================================
// 6. AFFICHAGE DE LA FICHE DÉTAILLÉE
// =============================================
function afficherFiche(nomMonstre) {
    const monstres = tousLesMonstres(baseDeDonnees);
    const m = monstres.find(x => x.nom === nomMonstre);
    if (!m) return;

    const target = document.querySelector('#firstPart');
    const textColor = getTextColor();

    target.innerHTML = `
        <div style="text-align: center; padding: 30px; animation: fadeIn 0.4s;">
            <h2 style="font-family: 'hylia'; color: #00ccaa; font-size: 38px; margin-bottom: 10px;">${m.nom.toUpperCase()}</h2>
            <div style="padding: 8px 20px; border-radius: 50px; display: inline-block; margin-bottom: 20px; border: 1px solid #ff4545;">
                <p class="hp-text" style="color: #ff4545; font-weight: bold; font-size: 1.3rem; margin: 0;">❤️ PV : ${m.PV}</p>
            </div>
            <img src="${m.image === 0 ? 'search/petitChuchu.jpg' : m.image}"
                 style="border-radius: 20px; box-shadow: 0 0 25px #000; max-width: 280px; margin: 0 auto 20px; display: block;">
            <p style="font-size: 1.1rem; color: ${textColor}; max-width: 600px; margin: 0 auto 20px; line-height: 1.6;">
                ${m.description || "Description non disponible dans le compendium actuel."}
            </p>
            <p style="color: ${textColor}; font-size: 1rem; margin-bottom: 25px;">
                <strong>⚔️ Butins :</strong> ${m.butins || "Inconnus"}
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button onclick="lancerRecherche(derniereSaisie)"
                        style="padding: 10px 22px; cursor: pointer; border-radius: 12px;
                               background: rgba(0,204,170,0.15); border: 2px solid #00ccaa;
                               font-weight: bold; color: ${textColor};">
                    ← Retour aux résultats
                </button>
                <button onclick="window.location.reload()"
                        style="padding: 10px 22px; cursor: pointer; border-radius: 12px;
                               background: #00ccaa; border: none; font-weight: bold; color: black;">
                    ↩ Retour à Hyrule
                </button>
            </div>
        </div>`;
}

// =============================================
// 7. LANCER UNE RECHERCHE (depuis suggestion ou Entrée)
// =============================================
function lancerRecherche(saisie) {
    searchInput.value = saisie;
    fermerSuggestions();
    derniereSaisie = saisie;

    const resultats = chercherMonstres(saisie);

    if (resultats.length === 0) {
        alert("Entrée non trouvée dans les archives royales.");
        return;
    }

    if (resultats.length === 1) {
        // Un seul résultat → fiche directe
        parts.forEach(id => { const el = document.querySelector(id); if (el) el.innerHTML = ''; });
        afficherFiche(resultats[0].nom);
        document.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
    } else {
        // Plusieurs résultats → grille
        afficherGrille(resultats, saisie.charAt(0).toUpperCase() + saisie.slice(1));
    }
}

// Entrée clavier
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const saisie = searchInput.value.trim();
        if (!saisie) return;
        lancerRecherche(saisie);
    }
});