const switchElement = document.querySelector('#theme-checkbox');
        const themeIcon = document.querySelector('#theme-icon');
        const corps = document.querySelectorAll('#header, .bouton, #firstPart, #secondPart, #thirdPart, #lastPart');
        const searchInput = document.querySelector('#monsterSearch');
        const parts = ['#firstPart', '#secondPart', '#thirdPart', '#lastPart'];

        let baseDeDonnees = {};

        // 1. CHARGEMENT DU JSON
        fetch('search/monstres.json')
            .then(response => response.json())
            .then(data => {
                baseDeDonnees = data;
                console.log("Base de données chargée avec succès.");
            })
            .catch(err => console.error("Erreur lors du chargement du JSON :", err));

        // 2. GESTION DU THÈME
        function updateTheme() {
            const isDark = switchElement.checked;
            const bgColor = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
            const textColor = isDark ? "white" : "rgba(44, 62, 80, 1)";
            const bgImage = isDark ? "url('style/fondSombre.jpg')" : "url('style/fondClair.webp')";

            document.body.style.backgroundImage = bgImage;
            corps.forEach(part => {
                part.style.backgroundColor = bgColor;
                part.style.color = textColor;
            });

            if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";

            // Mise à jour des textes générés dynamiquement
            const dynamicTexts = document.querySelectorAll('#firstPart p, #firstPart strong, #firstPart h2');
            dynamicTexts.forEach(txt => {
                if (txt.tagName !== 'H2' && !txt.classList.contains('hp-text')) {
                    txt.style.color = textColor;
                }
            });
        }

        switchElement.addEventListener('change', updateTheme);
        window.onload = updateTheme;

        // 3. LOGIQUE DE RECHERCHE RÉCURSIVE ET NAVIGATION
        function explorerBase(objet, saisie) {
            let saisieLower = saisie.toLowerCase();

            // Recherche directe au niveau actuel
            for (let cle in objet) {
                if (cle.toLowerCase() === saisieLower || cle.toLowerCase() === saisieLower + "s") {
                    let cible = objet[cle];
                    // Si la cible a des PV, c'est un monstre final
                    if (cible.PV !== undefined) {
                        return { type: "solo", donnees: { ...cible, nom: cle } };
                    } 
                    // Sinon, c'est une catégorie ou sous-catégorie
                    else {
                        return { type: "liste", donnees: cible, titre: cle };
                    }
                }
            }

            // Recherche profonde (récursion)
            for (let cle in objet) {
                if (typeof objet[cle] === 'object' && objet[cle] !== null) {
                    let resultat = explorerBase(objet[cle], saisie);
                    if (resultat) return resultat;
                }
            }
            return null;
        }

        // 4. ÉVÉNEMENT DE RECHERCHE
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                let inputUser = searchInput.value.trim();
                if (!inputUser) return;

                const resultat = explorerBase(baseDeDonnees, inputUser);

                if (resultat) {
                    parts.forEach(id => {
                        const el = document.querySelector(id);
                        if(el) el.innerHTML = "";
                    });

                    const target = document.querySelector('#firstPart');
                    const textColor = switchElement.checked ? "white" : "rgba(44, 62, 80, 1)";
                    target.style.display = "block";

                    if (resultat.type === "liste") {
                        // AFFICHAGE GRILLE DE CHOIX
                        let htmlGrille = `
                            <div style="text-align: center; padding: 30px; animation: fadeIn 0.5s;">
                                <h2 style="font-family: 'hylia'; color: #00ccaa; font-size: 35px;">${resultat.titre}</h2>
                                <p style="color: ${textColor}; margin-bottom: 20px;">Sélectionnez une catégorie ou un spécimen :</p>
                                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
                        `;

                        for (let nom in resultat.donnees) {
                            htmlGrille += `
                                <div onclick="lancerRechercheDirecte('${nom.replace(/'/g, "\\'")}')" 
                                     style="background: rgba(0,204,170,0.1); border: 2px solid #00ccaa; padding: 15px; border-radius: 15px; cursor: pointer; width: 220px; transition: 0.3s;"
                                     onmouseover="this.style.transform='scale(1.05)'; this.style.background='rgba(0,204,170,0.3)'" 
                                     onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(0,204,170,0.1)'">
                                    <strong style="color: ${textColor};">${nom}</strong>
                                </div>
                            `;
                        }
                        htmlGrille += `</div></div>`;
                        target.innerHTML = htmlGrille;
                    } 
                    else {
                        // AFFICHAGE FICHE MONSTRE FINALE
                        const m = resultat.donnees;
                        target.innerHTML = `
                            <div style="text-align: center; padding: 30px; animation: fadeIn 0.5s;">
                                <h2 style="font-family: 'hylia'; color: #00ccaa; font-size: 40px; margin-bottom: 10px;">${m.nom.toUpperCase()}</h2>
                                <div style="padding: 10px 20px; border-radius: 50px; display: inline-block; margin-bottom: 20px; border: 1px solid #ff4545;">
                                    <p class="hp-text" style="color: #ff4545; font-weight: bold; font-size: 1.4rem; margin: 0;">❤️ PV : ${m.PV}</p>
                                </div>
                                <img src="${m.image === 0 ? 'style/placeholder.png' : m.image}" style="border-radius: 20px; box-shadow: 0 0 25px #000; max-width: 300px; margin: 0 auto 20px; display: block;">
                                <p style="font-size: 1.2rem; color: ${textColor}; max-width: 600px; margin: 0 auto 20px; line-height: 1.5;">${m.description || "Description non disponible dans le compendium actuel."}</p>
                                <p style="color: ${textColor}; font-size: 1.1rem; margin-bottom: 25px;"><strong>Butins :</strong> ${m.butins || "Inconnus"}</p>
                                <button onclick="window.location.reload()" style="padding: 12px 25px; cursor: pointer; border-radius: 12px; background: #00ccaa; border: none; font-weight: bold; color: black;">RETOUR</button>
                            </div>`;
                    }
                    document.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
                } else {
                    alert("Entrée non trouvée dans les archives royales.");
                }
            }
        });

        // Fonction pour déclencher une recherche via le clic sur une carte
        function lancerRechercheDirecte(nom) {
            searchInput.value = nom;
            const event = new KeyboardEvent('keypress', { key: 'Enter' });
            searchInput.dispatchEvent(event);
        }