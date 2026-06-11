/**
 * LiveSpeech Text - Mobile Device Patch
 * Gestione separata per correggere le righe ripetute e i duplicati su Android/iOS
 */

const MobilePatch = {
    // Rileva se l'utente è su un dispositivo mobile
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.matchMedia("(max-width: 768px)").matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    },

    // Pulisce il testo definitivo eliminando i blocchi di parole che si ripetono consecutivamente
    cleanDuplicates: function(currentText, newChunk) {
        if (!this.isMobile()) return newChunk;

        let testoPulito = newChunk.trim();
        
        // Se il testo attuale finisce già con la frase che sta arrivando, la scartiamo per evitare doppioni
        if (currentText.trim().endsWith(testoPulito)) {
            return ""; 
        }

        // Algoritmo di controllo sulle ultime parole per evitare duplicazioni parziali
        let paroleAttuali = currentText.trim().split(/\s+/);
        let paroleNuove = testoPulito.split(/\s+/);
        
        // Prendiamo le ultime parole (fino a un massimo di 5) per fare un confronto
        let checkLength = Math.min(parolesAttuali.length, 5);
        if (checkLength > 0) {
            let ultimeParoleAttuali = paroleAttuali.slice(-checkLength).join(" ").toLowerCase();
            let primeParoleNuove = paroleNuove.slice(0, checkLength).join(" ").toLowerCase();
            
            if (ultimeParoleAttuali === primeParoleNuove) {
                // Se combaciano perfettamente, rimuoviamo la parte duplicata dall'inizio del nuovo blocco
                paroleNuove = paroleNuove.slice(checkLength);
                testoPulito = paroleNuove.join(" ");
            }
        }

        return testoPulito;
    },

    // Ottimizza la visualizzazione dell'anteprima provvisoria su mobile
    formatPreview: function(testoProvvisorio) {
        if (!this.isMobile()) return testoProvvisorio;
        
        // Su mobile filtriamo l'anteprima per evitare che "sfarfalli" ripetendo le parole digitate
        let parole = testoProvvisorio.trim().split(/\s+/);
        let paroleUniche = [...new Set(parole)]; // Rimuove i duplicati immediati nella stringa provvisoria
        return paroleUniche.join(" ");
    }
};