document.addEventListener('DOMContentLoaded', () => {
    // Gestione dello scorrimento del carosello con le frecce
    const arrows = document.querySelectorAll('.arrow');

    arrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            const rowId = arrow.dataset.rowId;
            const moviesContainer = document.getElementById(rowId);
            // Assicurati che ci siano elementi film per calcolare la larghezza
            if (!moviesContainer || moviesContainer.children.length === 0) {
                console.warn(`Contenitore film con ID ${rowId} non trovato o vuoto.`);
                return;
            }
            const movieItemWidth = moviesContainer.querySelector('.movie-item').offsetWidth;
            const gap = 10; // Corrisponde al gap nel CSS
            const itemsToShow = 5; // Quanti film vuoi scorrere alla volta
            const scrollAmount = (movieItemWidth + gap) * itemsToShow; 

            if (arrow.classList.contains('left-arrow')) {
                moviesContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                moviesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    });

    // Gestione dell'effetto hover sui film
    const movieItems = document.querySelectorAll('.movie-item');
    let activeHoveredItem = null; // Tiene traccia dell'elemento attualmente in hover

    movieItems.forEach(item => {
        let hoverTimeout;
        let playTimeout;
        const video = item.querySelector('.preview-video');

        item.addEventListener('mouseover', () => {
            // Se c'è un elemento precedentemente in hover e non è questo, lo resettiamo immediatamente
            if (activeHoveredItem && activeHoveredItem !== item) {
                const prevVideo = activeHoveredItem.querySelector('.preview-video');
                if (prevVideo) {
                    prevVideo.pause();
                    prevVideo.currentTime = 0; // Torna all'inizio
                }
                activeHoveredItem.classList.remove('hovered');
            }

            // Cancella qualsiasi timeout pendente per questo item per evitare flickering
            clearTimeout(hoverTimeout);
            clearTimeout(playTimeout);

            // Imposta questo item come quello attualmente in hover
            activeHoveredItem = item;

            // Avvia un timeout per l'effetto hover dopo un breve ritardo (come Netflix)
            hoverTimeout = setTimeout(() => {
                // Applica la classe 'hovered' solo se è ancora l'elemento attivo
                if (activeHoveredItem === item) {
                    item.classList.add('hovered');

                    // Avvia un altro timeout per la riproduzione del video dopo che l'elemento si è ingrandito
                    playTimeout = setTimeout(() => {
                        if (video) {
                            // Tenta di riprodurre il video. Potrebbe fallire a causa delle politiche di autoplay
                            const playPromise = video.play();
                            if (playPromise !== undefined) {
                                playPromise.then(_ => {
                                    // Riproduzione avviata con successo
                                }).catch(error => {
                                    // Errore di riproduzione (es. autoplay bloccato, il video deve essere muto)
                                    console.warn("Errore durante la riproduzione del video (potrebbe essere blocco autoplay):", error);
                                });
                            }
                        }
                    }, 300); // Ritardo per l'avvio del video (dopo che l'ingrandimento è quasi completo)
                }
            }, 300); // Ritardo per l'ingrandimento (come Netflix)
        });

        item.addEventListener('mouseout', () => {
            // Cancella i timeout per questo item
            clearTimeout(hoverTimeout);
            clearTimeout(playTimeout);

            // Aggiungi un piccolo ritardo prima di rimuovere la classe 'hovered'
            // Questo aiuta a prevenire il flickering se il mouse si muove leggermente
            // La durata dovrebbe essere circa la stessa della transizione CSS per 'transform' e 'opacity'
            setTimeout(() => {
                // Rimuovi la classe 'hovered' solo se questo non è più l'elemento attivo
                // o se non c'è più nessun elemento attivo
                if (activeHoveredItem === item || activeHoveredItem === null) {
                    item.classList.remove('hovered');
                    if (video) {
                        video.pause();
                        video.currentTime = 0; // Riporta il video all'inizio
                    }
                    if (activeHoveredItem === item) {
                        activeHoveredItem = null; // Resetta l'elemento attivo se era questo
                    }
                }
            }, 100); // Piccolo ritardo (es. 100ms) per essere più "permissivo"
        });
    });
}); 