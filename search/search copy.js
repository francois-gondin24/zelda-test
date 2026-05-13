const switchElement = document.querySelector('#theme-checkbox');
        const themeIcon = document.querySelector('#theme-icon');
        const corps = document.querySelectorAll('#header, .bouton, #firstPart, #secondPart, #thirdPart, #lastPart');

        // --- GESTION DU THÈME ---
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

            // Mise à jour dynamique de la recherche si elle est affichée
            const monsterTexts = document.querySelectorAll('#firstPart p, #firstPart strong');
            monsterTexts.forEach(txt => txt.style.color = textColor);
        }

        switchElement.addEventListener('change', updateTheme);
        window.onload = updateTheme;

        // --- FONCTION DE TRADUCTION ---
        async function traduireTexte(texte) {
            if (!texte) return "";
            try {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texte)}&langpair=en|fr`;
                const response = await fetch(url);
                const data = await response.json();
                return data.responseData.translatedText;
            } catch (error) {
                return texte; 
            }
        }

        // --- SYSTÈME DE RECHERCHE ---
        const traductionFr = {
            "lynel": "lynel", "bokoblin": "bokoblin", "lithorok": "stone talus",
            "chauve-souris": "keese", "chuchu": "chuchu", "hinox": "hinox",
            "moldarquor": "molduga", "lézalfos": "lizalfos", "sorcier": "wizzrobe",
            "gardien": "guardian", "griock": "gleeok", "troglon": "horriblin"
        };

        const searchInput = document.querySelector('#monsterSearch');
        const parts = ['#firstPart', '#secondPart', '#thirdPart', '#lastPart'];

        searchInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                let inputUser = searchInput.value.toLowerCase().trim();
                const monsterQuery = traductionFr[inputUser] || inputUser;
                const finalQuery = monsterQuery.replace(/\s+/g, '_');

                try {
                    // On affiche un message d'attente
                    const target = document.querySelector('#firstPart');
                    target.innerHTML = "<p style='text-align:center; padding: 50px; color:white;'>Analyse des données par la tablette Sheikah...</p>";

                    const response = await fetch(`https://botw-compendium.herokuapp.com/api/v3/compendium/entry/${finalQuery}`);
                    const data = await response.json();

                    if (!data.data || Object.keys(data.data).length === 0) throw new Error('Vide');

                    const monster = data.data;

                    // Traductions simultanées
                    const [descriptionFr, butinsFr] = await Promise.all([
                        traduireTexte(monster.description),
                        monster.drops ? traduireTexte(monster.drops.join(', ')) : Promise.resolve("Aucun")
                    ]);

                    // On vide les sections
                    parts.forEach(id => {
                        const el = document.querySelector(id);
                        if(el) el.innerHTML = "";
                    });

                    const textColor = switchElement.checked ? "white" : "rgba(44, 62, 80, 1)";

                    target.style.display = "block";
                    target.innerHTML = `
                        <div style="text-align: center; padding: 30px; animation: fadeIn 0.5s;">
                            <h2 style="font-family: 'hylia'; color: #00ccaa; font-size: 40px;">${inputUser.toUpperCase()}</h2>
                            <img src="${monster.image}" style="border-radius: 20px; box-shadow: 0 0 25px #000; max-width: 300px; margin: 20px auto; display: block;">
                            <p style="font-size: 1.2rem; color: ${textColor}; max-width: 600px; margin: 20px auto; line-height: 1.5;">
                                ${descriptionFr}
                            </p>
                            <p style="color: ${textColor}; font-size: 1.1rem; margin: 15px 0;">
                                <strong>Butins :</strong> ${butinsFr}
                            </p>
                            <button onclick="window.location.reload()" style="margin-top: 30px; padding: 12px 25px; cursor: pointer; border-radius: 12px; background: #00ccaa; border: none; font-weight: bold; color: black;">
                                RETOUR À HYRULE
                            </button>
                        </div>`;
                    
                    document.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
                } catch (error) {
                    alert("Monstre non trouvé. Essayez un nom comme 'Lynel' ou 'Bokoblin'.");
                    window.location.reload();
                }
            }
        });