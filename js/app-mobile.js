// --- CONFIGURAZIONE LOGICA DI TRADUZIONE ED INTERFACCIA ---
const traduzioni = {
    'it-IT': { inAscolto: "In ascolto:", attesaVoce: "In attesa della voce...", pronto: "Pronto ad ascoltare", ascoltando: "🔴 Microfono attivo...", btnMicrofono: "🎤 Trascrivi" },
    'en-US': { inAscolto: "Listening:", attesaVoce: "Waiting for voice...", pronto: "Ready to listen", ascoltando: "🔴 Microphone active...", btnMicrofono: "🎤 Transcribe" }
    // Aggiungi le altre lingue se le usi, per ora teniamo le principali per il test
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

// Inizializzazione Motore Vocale Cross-Browser senza alert bloccanti
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

// --- CUORE DEL MECCANISMO MOBILE (Flusso continuo corretto anti-duplicazione) ---
    recognition.onresult = (event) => {
        let testovProvvisorio = '';
        let testoDefinitivo = '';

        // Scorriamo tutti i risultati accumulati dall'inizio della sessione corrente
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const risultato = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                testoDefinitivo += risultato + ' ';
            } else {
                testovProvvisorio += risultato;
            }
        }

        // 1. Gestione Testo In Tempo Reale (Provvisorio) -> Box Azzurro
        if (testovProvvisorio) {
            if (boxAnteprima) {
                boxAnteprima.innerHTML = `<strong>In ascolto:</strong> ${testovProvvisorio}`;
            }
        } else {
            if (boxAnteprima) boxAnteprima.textContent = traduzioni['it-IT'] ? traduzioni['it-IT'].attesaVoce : "In attesa della voce...";
        }

        // 2. Gestione Testo Confermato (Definitivo) -> Inserimento Non-Invasivo nella Textarea
        if (testoDefinitivo) {
            // Pulizia del testo mantenendo solo spazi singoli
            let pulito = testoDefinitivo.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
            
            if (pulito.length > 0) {
                // CONTROLLO ANTI-DUPLICAZIONE EXTREMO: 
                // Se la textarea contiene già esattamente questa frase alla fine, non aggiungerla di nuovo
                const testoAttuale = areaAppunti.value;
                if (!testoAttuale.endsWith(pulito + " ")) {
                    
                    const haIlFocus = (document.activeElement === areaAppunti);
                    
                    if (haIlFocus) {
                        const inizioSel = areaAppunti.selectionStart;
                        const fineSel = areaAppunti.selectionEnd;
                        const scrollTopSalvo = areaAppunti.scrollTop;
                        const lunghezzaAttuale = areaAppunti.value.length;

                        areaAppunti.setRangeText(pulito + " ", lunghezzaAttuale, lunghezzaAttuale, 'end');
                        areaAppunti.setSelectionRange(inizioSel, fineSel);
                        areaAppunti.scrollTop = scrollTopSalvo;
                    } else {
                        areaAppunti.value += pulito + " ";
                        areaAppunti.scrollTop = areaAppunti.scrollHeight;
                    }

                    if (btnDownload) btnDownload.style.display = "block";
                }
            }
        }
    };

    recognition.onend = () => {
        // Se l'utente non ha premuto "Ferma", il motore si riavvia da solo (Anti-timeout mobile)
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

// Tasto Cancella Tutto
if (btnCancella) {
    btnCancella.addEventListener('click', () => {
        if (confirm("Vuoi davvero cancellare tutto il testo?")) {
            areaAppunti.value = '';
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
        if (link.getAttribute('href') !== '#') return; // Lascia passare il tasto Home Page esterno
        e.preventDefault();
        
        links.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        link.classList.add('active');
        
        const idSezione = link.id.replace('link-', 'sezione-');
        const sezioneTarget = document.getElementById(idSezione);
        if (sezioneTarget) sezioneTarget.classList.add('active');
    });
});
