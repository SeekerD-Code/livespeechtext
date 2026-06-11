/**
 * LiveSpeech Text - Mobile Device Patch
 * Gestione TOTALMENTE SEPARATA per evitare i duplicati su Android/iOS
 */

const MobilePatch = {
    // Rileva se è un telefono o tablet
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.matchMedia("(max-width: 768px)").matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    },

    // Sostituisce completamente la logica di inserimento per evitare ripetizioni
    processaInserimentoMobile: function(areaAppunti, testoNuovo) {
        if (!testoNuovo || !testoNuovo.trim()) return;

        // Pulizia base da punteggiatura del blocco in arrivo
        let pulito = testoNuovo.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
        if (!pulito) return;

        let testoAttuale = areaAppunti.value;

        // Se il testo negli appunti è vuoto, inseriamo direttamente
        if (!testoAttuale.trim()) {
            areaAppunti.value = pulito + "\n\n";
            return;
        }

        // --- ALGORITMO ANTI-DUPLICATO ADATTIVO ---
        let paroleAttuali = testoAttuale.trim().split(/\s+/);
        let paroleNuove = pulito.split(/\s+/);
        
        let sovrapposizioneMassima = 0;
        let limiteControllo = Math.min(paroleAttuali.length, paroleNuove.length, 12); // Controlla fino a 12 parole indietro

        // Cerchiamo se la fine del testo attuale coincide con l'inizio del testo nuovo
        for (let i = 1; i <= limiteControllo; i++) {
            let fineAttuale = paroleAttuali.slice(-i).join(" ").toLowerCase();
            let inizioNuovo = paroleNuove.slice(0, i).join(" ").toLowerCase();
            
            if (fineAttuale === inizioNuovo) {
                sovrapposizioneMassima = i; // Trovato un duplicato di 'i' parole!
            }
        }

        // Se abbiamo trovato una sovrapposizione, tagliamo via i duplicati dall'inizio del nuovo testo
        if (sovrapposizioneMassima > 0) {
            paroleNuove = paroleNuove.slice(sovrapposizioneMassima);
        }

        let daAggiungere = paroleNuove.join(" ").trim();
        
        // Scriviamo solo se è rimasto qualcosa e non era un duplicato totale
        if (daAggiungere.length > 0) {
            // Controlla se l'ultimo carattere è già uno spazio o a capo per evitare formattazione errata
            if (areaAppunti.value.endsWith("\n\n") || areaAppunti.value.endsWith(" ")) {
                areaAppunti.value += daAggiungere + "\n\n";
            } else {
                areaAppunti.value += " " + daAggiungere + "\n\n";
            }
        }
    }
};