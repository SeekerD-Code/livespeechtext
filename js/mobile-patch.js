/**
 * LiveSpeech Text - Mobile Device Patch
 * Gestione TOTALMENTE SEPARATA per evitare i duplicati e i troppi "a capo" su Android/iOS
 */

const MobilePatch = {
    // Rileva se è un telefono o tablet
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.matchMedia("(max-width: 768px)").matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    },

    // Sostituisce la logica di inserimento gestendo la continuità del testo senza andare sempre a capo
    processaInserimentoMobile: function(areaAppunti, testoNuovo) {
        if (!testoNuovo || !testoNuovo.trim()) return;

        // Pulizia base da punteggiatura del blocco in arrivo
        let pulito = testoNuovo.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
        if (!pulito) return;

        let testoAttuale = areaAppunti.value;

        // Se il testo negli appunti è vuoto, inseriamo direttamente la prima parola/frase
        if (!testoAttuale.trim()) {
            areaAppunti.value = pulito;
            return;
        }

        // --- ALGORITMO ANTI-DUPLICATO ADATTIVO ---
        let paroleAttuali = testoAttuale.trim().split(/\s+/);
        let paroleNuove = pulito.split(/\s+/);
        
        let sovrapposizioneMassima = 0;
        let limiteControllo = Math.min(paroleAttuali.length, paroleNuove.length, 12);

        for (let i = 1; i <= limiteControllo; i++) {
            let fineAttuale = paroleAttuali.slice(-i).join(" ").toLowerCase();
            let inizioNuovo = paroleNuove.slice(0, i).join(" ").toLowerCase();
            
            if (fineAttuale === inizioNuovo) {
                sovrapposizioneMassima = i;
            }
        }

        // Tagliamo via i duplicati rilevati
        if (sovrapposizioneMassima > 0) {
            paroleNuove = paroleNuove.slice(sovrapposizioneMassima);
        }

        let daAggiungere = paroleNuove.join(" ").trim();
        
        // Scriviamo solo se è rimasto del testo reale e non era un duplicato totale
        if (daAggiungere.length > 0) {
            // Se il testo attuale finisce già con un "a capo" o è l'inizio di una nuova sessione dopo una pausa lunga,
            // manteniamo la spaziatura pulita, altrimenti aggiungiamo semplicemente uno spazio per far scorrere la frase.
            if (testoAttuale.endsWith("\n\n") || testoAttuale.endsWith("\n")) {
                areaAppunti.value += daAggiungere;
            } else {
                areaAppunti.value += " " + daAggiungere;
            }
        }
    }
};