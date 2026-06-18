// --- CONFIGURAZIONE LOGICA DI TRADUZIONE ED INTERFACCIA ---
const traduzioni = {
    'it-IT': { inAscolto: "In ascolto:", attesaVoce: "In attesa della voce...", pronto: "Pronto ad ascoltare", ascoltando: "🔴 Microfono attivo...", btnMicrofono: "🎤 Trascrivi" },
    'en-US': { inAscolto: "Listening:", attesaVoce: "Waiting for voice...", pronto: "Ready to listen", ascoltando: "🔴 Microphone active...", btnMicrofono: "🎤 Transcribe" }
};

// Elementi del DOM
const btnAscolto = document.getElementById('btn-ascolto');
const btnCancella = document.getElementById('btn-cancella');
const btnDownload = document.getElementById('btn-download');
const areaAppunti = document.getElementById('area-appunti');
const boxAnteprima = document.getElementById('box-anteprima-ia');
const statoApp = document.getElementById('stato-app');
const selectLingua = document.getElementById('select-lingua');

// Stato dell'applicazione
let ascoltoAttivo = false;

// MEMORIA GLOBALE DI SESSIONE (Messa a inizio file per non perderla mai durante i riavvii)
let testoConsolidatoSessione = "";

// Inizializzazione Motore Vocale Cross-Browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
} else {
    console.warn("Riconoscimento vocale non supportato su questo browser.");
    statoApp.textContent = "Browser non supportato nativamente";
}

// Avvio / Arresto Microfono
if (recognition) {
    recognition.lang = selectLingua.value;

    selectLingua.addEventListener('change', () => {
        recognition.lang = selectLingua.value;
        if (ascoltoAttivo) {
            recognition.stop();
        }
    });

    btnAscolto.addEventListener('click', () => {
        if (!ascoltoAttivo) {
            recognition.start();
        } else {
            ascoltoAttivo = false;
            recognition.stop();
            disattivaGrafica();
        }
    });

    recognition.onstart = () => {
        ascoltoAttivo = true;
        btnAscolto.style.backgroundColor = "#ef4444";
        btnAscolto.textContent = "🛑 Ferma Ascolto";
        statoApp.textContent = traduzioni['it-IT'].ascoltando;
        statoApp.style.backgroundColor = "#fee2e2";
        statoApp.style.color = "#b91c1c";
    };

    // --- CUORE DEL MECCANISMO MOBILE ANTI-DUPLICAZIONE ---
    recognition.onresult = (event) => {
        let testoProvvisorio = '';
        let testoDefinitivoDellaSessione = '';

        // Ricostruiamo sempre partendo da ZERO (i = 0) per non farci ingannare dai finti indici di Android
        for (let i = 0; i < event.results.length; ++i) {
            const trascrizione = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                testoDefinitivoDellaSessione += trascrizione + ' ';
            } else {
                testoProvvisorio += trascrizione;
            }
        }

        // 1. Aggiorna il Box Azzurro (Anteprima Real-Time)
        if (testoProvvisorio) {
            if (boxAnteprima) boxAnteprima.innerHTML = `<strong>In ascolto:</strong> ${testoProvvisorio}`;
        } else {
            if (boxAnteprima) boxAnteprima.textContent = traduzioni['it-IT'].attesaVoce;
        }

        // 2. Gestione del Testo Confermato
        if (testoDefinitivoDellaSessione) {
            let pulito = testoDefinitivoDellaSessione.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
            
            // Se il blocco definitivo attuale è più lungo di quello che avevamo salvato prima, c'è testo nuovo!
            if (pulito.length > testoConsolidatoSessione.length) {
                // Estraiamo SOLO la novità reale sottraendo la vecchia stringa
                let testoNuovo REALE = pulito.substring(testoConsolidatoSessione.length).trim();
                
                if (testoNuovoREALE.length > 0) {
                    const stringaDaAggiungere = testoNuovoREALE + " ";
                    
                    // Memorizziamo lo stato attuale del blocco definitivo
                    testoConsolidatoSessione = pulito;

                    // Scrittura pulita nella Textarea
                    const haIlFocus = (document.activeElement === areaAppunti);
                    if (haIlFocus) {
                        const inizioSel = areaAppunti.selectionStart;
                        const fineSel = areaAppunti.selectionEnd;
                        const scrollTopSalvo = areaAppunti.scrollTop;
                        const lunghezzaAttuale = areaAppunti.value.length;

                        areaAppunti.setRangeText(stringaDaAggiungere, lunghezzaAttuale, lunghezzaAttuale, 'end');
                        areaAppunti.setSelectionRange(inizioSel, fineSel);
                        areaAppunti.scrollTop = scrollTopSalvo;
                    } else {
                        areaAppunti.value += stringaDaAggiungere;
                        areaAppunti.scrollTop = areaAppunti.scrollHeight;
                    }

                    if (btnDownload) btnDownload.style.display = "block";
                }
            }
        }
    };

    recognition.onend = () => {
        // Al reset della micro-sessione vocale, ripuliamo il vecchio blocco consolidato per essere pronti alla prossima frase
        testoConsolidatoSessione = "";
        
        if (ascoltoAttivo) {
            try { recognition.start(); } catch (e) { console.error(e); }
        } else {
            disattivaGrafica();
        }
    };

    recognition.onerror = (event) => {
        console.error("Errore riconoscimento:", event.error);
    };
}

function disattivaGrafica() {
    btnAscolto.style.backgroundColor = "";
    btnAscolto.textContent = "🎤 Trascrivi da Microfono";
    statoApp.textContent = traduzioni['it-IT'].pronto;
    statoApp.style.backgroundColor = "";
    statoApp.style.color = "";
}

// Tasto Cancella Tutto (Ora azzera correttamente anche le memorie di testo)
if (btnCancella) {
    btnCancella.addEventListener('click', () => {
        if (confirm("Vuoi davvero cancellare tutto il testo?")) {
            areaAppunti.value = '';
            testoConsolidatoSessione = ""; // AZZERAMENTO FONDAMENTALE
            if (btnDownload) btnDownload.style.display = "none";
        }
    });
}

// Tasto Download (.txt)
if (btnDownload) {
    btnDownload.addEventListener('click', () => {
        const blob = new Blob([areaAppunti.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'appunti_livespeech_mobile.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// --- GESTIONE DEI TAB (App, About, FAQ) ---
const links = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab-content');

links.forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href') !== '#') return;
        e.preventDefault();
        
        links.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        link.classList.add('active');
        
        const idSezione = link.id.replace('link-', 'sezione-');
        const sezioneTarget = document.getElementById(idSezione);
        if (sezioneTarget) sezioneTarget.classList.add('active');
    });
});
