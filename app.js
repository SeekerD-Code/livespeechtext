window.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTI INTERFACCIA PRINCIPALE ---
    const btnAscolto = document.getElementById('btn-ascolto');
    const btnCatturaSistema = document.getElementById('btn-cattura-sistema');
    const btnCancella = document.getElementById('btn-cancella');
    const btnDownload = document.getElementById('btn-download');
    const areaAppunti = document.getElementById('area-appunti');
    const statoApp = document.getElementById('stato-app');
    const boxAnteprima = document.getElementById('box-anteprima-ia');
    const btnPip = document.getElementById('btn-pip');
    const selectLingua = document.getElementById('select-lingua');
    const selectInterfaccia = document.getElementById('select-interfaccia');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // --- ELEMENTI MODALE CUSTOM ---
    const modal = document.getElementById('custom-modal');
    const modalTitolo = document.getElementById('modal-titolo');
    const modalMessaggio = document.getElementById('modal-messaggio');
    const modalBtnAnnulla = document.getElementById('modal-btn-annulla');
    const modalBtnConferma = document.getElementById('modal-btn-conferma');
    
    let azioneDaConfermare = null; 

    // --- DIZIONARIO TRADUZIONI INTERFACCIA (i18n) ---
    const traduzioni = {
        it: {
            btnMicrofono: "🎤 Trascrivi da Microfono",
            btnCall: "💻 Trascrivi da Call / Video",
            btnStop: "🛑 Ferma",
            btnCancella: "🗑️ Cancella Tutto",
            btnDownload: "💾 Scarica Testo",
            btnPip: "🔲 Riduci in Primo Piano",
            statoPronto: "Pronto ad ascoltare",
            statoAttivoMicrofono: "🎙️ Microfono Attivo (Schermo Protetto)...",
            statoAttivoCall: "💻 Trascrizione Call attiva...",
            statoTerminato: "Ascolto terminato",
            attesaVoce: "In attesa della voce...",
            inAscolto: "✍️ In ascolto: ",
            modalCancellaTitolo: "Vuoi cancellare tutto?",
            modalCancellaMessaggio: "Sei sicura di voler svuotare l'area appunti?",
            modalAnnulla: "Annulla",
            modalAvvisoTitolo: "⚠️ Attenzione",
            modalAudioMancanteTitolo: "Audio Mancante",
            modalAudioMancanteMessaggio: "Devi spuntare la casella 'Condividi audio della scheda'!"
        },
        en: {
            btnMicrofono: "🎤 Transcribe from Microphone",
            btnCall: "💻 Transcribe from Call / Video",
            btnStop: "🛑 Stop",
            btnCancella: "🗑️ Clear All",
            btnDownload: "💾 Download Text",
            btnPip: "🔲 Picture-in-Picture",
            statoPronto: "Ready to listen",
            statoAttivoMicrofono: "🎙️ Microphone Active (Screen Awake)...",
            statoAttivoCall: "💻 Call Transcription active...",
            statoTerminato: "Listening ended",
            attesaVoce: "Waiting for voice...",
            inAscolto: "✍️ Listening: ",
            modalCancellaTitolo: "Clear everything?",
            modalCancellaMessaggio: "Are you sure you want to clear your notes?",
            modalAnnulla: "Cancel",
            modalAvvisoTitolo: "⚠️ Warning",
            modalAudioMancanteTitolo: "Missing Audio",
            modalAudioMancanteMessaggio: "You must check the 'Share tab audio' box!"
        }
    };

    // --- FUNZIONE INIZIALIZZAZIONE TEMA ---
    function inizializzaTema() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙';
        }
    }

    inizializzaTema();

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggleBtn.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleBtn.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });

    // --- FUNZIONE APPLICA TRADUZIONE GRAFICA ---
    function applicaLinguaInterfaccia(lang) {
        const t = traduzioni[lang] || traduzioni.en;
        if(!ascoltoAttivo) {
            btnAscolto.textContent = t.btnMicrofono;
            btnCatturaSistema.textContent = t.btnCall;
            statoApp.textContent = t.statoPronto;
        }
        btnCancella.textContent = t.btnCancella;
        if(areaAppunti.value.trim().length > 0) btnDownload.style.display = "inline-block";
        btnDownload.textContent = t.btnDownload;
        btnPip.textContent = t.btnPip;
    }

    // --- AUTOMAZIONE LINGUA UTENTE ---
    function rilevaEImpostaLinguaIniziale() {
        const linguaBrowser = navigator.language || navigator.userLanguage;
        const codiceCorto = linguaBrowser.substring(0, 2);

        if (traduzioni[codiceCorto]) {
            selectInterfaccia.value = codiceCorto;
        } else {
            selectInterfaccia.value = "en";
        }
        
        const opzioneMicrofono = Array.from(selectLingua.options).find(opt => opt.value.startsWith(codiceCorto));
        if (opzioneMicrofono) {
            selectLingua.value = opzioneMicrofono.value;
        }
        applicaLinguaInterfaccia(selectInterfaccia.value);
    }

    selectInterfaccia.addEventListener('change', () => {
        applicaLinguaInterfaccia(selectInterfaccia.value);
    });

    // --- CONFIGURAZIONE MOTORE VOCALE ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ops! Browser non supportato. Usa Google Chrome!");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;         
    recognition.interimResults = true;     

    let ascoltoAttivo = false;
    let streamSistema = null; 
    let bloccoForzato = false; 
    let wakeLock = null; 

    // --- GESTIONE WAKE LOCK ---
    async function richiediWakeLock() {
        if ('wakeLock' in navigator) {
            try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) { console.error(err); }
        }
    }

    function rilasciaWakeLock() {
        if (wakeLock !== null) {
            wakeLock.release().then(() => { wakeLock = null; });
        }
    }

    // --- MODALE CUSTOM ---
    function mostraModaleConferma(titolo, messaggio, callback) {
        modalTitolo.textContent = titolo; 
        modalMessaggio.textContent = messaggio;
        modalBtnConferma.style.display = "block"; 
        modalBtnAnnulla.textContent = traduzioni[selectInterfaccia.value].modalAnnulla;
        azioneDaConfermare = callback;
        modal.classList.add('show');
    }

    function mostraModaleAvviso(titolo, messaggio) {
        modalTitolo.textContent = titolo;
        modalMessaggio.textContent = messaggio;
        modalBtnConferma.style.display = "none"; 
        modalBtnAnnulla.textContent = "Ok";
        azioneDaConfermare = null;
        modal.classList.add('show');
    }

    modalBtnAnnulla.addEventListener('click', () => { modal.classList.remove('show'); });
    modalBtnConferma.addEventListener('click', () => { if (azioneDaConfermare) azioneDaConfermare(); modal.classList.remove('show'); });

    // --- FUNZIONI GRAFICHE ---
    function attivaGraficaStato(messaggio) {
        ascoltoAttivo = true;
        btnAscolto.disabled = true;
        btnCatturaSistema.disabled = true;
        statoApp.textContent = messaggio; 
        statoApp.classList.add('active');
        boxAnteprima.style.display = "block";
        boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
    }

    function disattivaGraficaStato() {
        ascoltoAttivo = false;
        btnAscolto.disabled = false;
        btnCatturaSistema.disabled = false;
        btnCatturaSistema.style.backgroundColor = "#8b5cf6";
        btnAscolto.classList.remove('listening');
        statoApp.classList.remove('active');
        boxAnteprima.style.display = "none";
        
        applicaLinguaInterfaccia(selectInterfaccia.value);

        if (streamSistema) {
            streamSistema.getTracks().forEach(track => track.stop());
            streamSistema = null;
        }
        rilasciaWakeLock(); 
    }

    function fermaQualsiasiAscolto() {
        bloccoForzato = true;
        recognition.stop();
        disattivaGraficaStato();
    }

    // --- EVENTI MICROFONO ---
    btnAscolto.addEventListener('click', async () => {
        if (!ascoltoAttivo) {
            bloccoForzato = false;
            recognition.lang = selectLingua.value; 
            
            const t = traduzioni[selectInterfaccia.value];
            attivaGraficaStato(t.statoAttivoMicrofono);
            btnAscolto.disabled = false;
            btnAscolto.textContent = t.btnStop;
            btnAscolto.classList.add('listening');
            
            await richiediWakeLock(); 
            try { recognition.start(); } catch (err) { console.error(err); }
        } else {
            fermaQualsiasiAscolto();
        }
    });

    // --- EVENTI CALL ---
    btnCatturaSistema.addEventListener('click', async () => {
        if (!ascoltoAttivo) {
            try {
                bloccoForzato = false;
                streamSistema = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: { autoGainControl: true, echoCancellation: false, noiseSuppression: false }
                });
                
                const tracceAudio = streamSistema.getAudioTracks();
                if (tracceAudio.length === 0) {
                    const t = traduzioni[selectInterfaccia.value];
                    mostraModaleAvviso(t.modalAudioMancanteTitolo, t.modalAudioMancanteMessaggio);
                    streamSistema.getTracks().forEach(track => track.stop());
                    return;
                }

                recognition.lang = selectLingua.value;
                attivaGraficaStato(traduzioni[selectInterfaccia.value].statoAttivoCall);
                btnCatturaSistema.disabled = false;
                btnCatturaSistema.textContent = traduzioni[selectInterfaccia.value].btnStop;
                btnCatturaSistema.style.backgroundColor = "#ef4444";

                await richiediWakeLock();
                try { recognition.start(); } catch (err) { console.error(err); }

            } catch (err) {
                console.error("Accesso allo schermo negato o errore:", err);
                disattivaGraficaStato();
            }
        } else {
            fermaQualsiasiAscolto();
        }
    });

    // --- LOGICA DI RICEZIONE E DICTATION ---
    recognition.onresult = (event) => {
        let testoProvvisorio = '';
        let testoDefinitivo = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                testoDefinitivo += event.results[i][0].transcript + ' ';
            } else {
                testoProvvisorio += event.results[i][0].transcript;
            }
        }

        if (testoDefinitivo) {
            areaAppunti.value += testoDefinitivo;
            btnDownload.style.display = "inline-block";
        }

        if (testoProvvisorio) {
            boxAnteprima.textContent = traduzioni[selectInterfaccia.value].inAscolto + testoProvvisorio;
        } else {
            boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
        }
    };

    recognition.onend = () => {
        if (!bloccoForzato) {
            try { recognition.start(); } catch (err) { console.error(err); }
        } else {
            disattivaGraficaStato();
        }
    };

    recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Errore riconoscimento vocale:", event.error);
        }
    };

    // --- FUNZIONE CANCELLA TUTTO ---
    btnCancella.addEventListener('click', () => {
        const t = traduzioni[selectInterfaccia.value];
        mostraModaleConferma(t.modalCancellaTitolo, t.modalCancellaMessaggio, () => {
            areaAppunti.value = '';
            btnDownload.style.display = "none";
        });
    });

    // --- FUNZIONE DOWNLOAD .TXT ---
    btnDownload.addEventListener('click', () => {
        const blob = new Blob([areaAppunti.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'appunti_livespeech.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

// --- FUNZIONALITÀ DOCUMENT PICTURE-IN-PICTURE (CON PULSANTI E BANNER) ---
    btnPip.addEventListener('click', async () => {
        if (!('documentPictureInPicture' in window)) {
            alert("Il tuo browser non supporta il Document Picture-in-Picture. Usa Google Chrome o Edge!");
            return;
        }

        if (window.pipWindow) {
            window.pipWindow.close();
            return;
        }

        try {
            const pipWindow = await window.documentPictureInPicture.requestWindow({
                width: 450,
                height: 480, // Aumentato leggermente per fare spazio al banner in basso
            });

            window.pipWindow = pipWindow;

            // Iniezione degli stili nel PiP
            Array.from(document.styleSheets).forEach((styleSheet) => {
                try {
                    const cssRules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pipWindow.document.head.appendChild(style);
                } catch (e) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = styleSheet.href;
                    pipWindow.document.head.appendChild(link);
                }
            });

            if (document.body.classList.contains('dark-mode')) {
                pipWindow.document.body.classList.add('dark-mode');
            }

            // Contenitore principale del PiP
            const pipContainer = document.createElement('div');
            pipContainer.style.padding = '15px';
            pipContainer.style.height = '100vh';
            pipContainer.style.display = 'flex';
            pipContainer.style.flexDirection = 'column';
            pipContainer.style.gap = '10px';
            pipContainer.style.boxSizing = 'border-box';
            pipContainer.style.justifyContent = 'space-between';

            // Parte superiore (Stato + Testo)
            const topBox = document.createElement('div');
            topBox.style.display = 'flex';
            topBox.style.flexDirection = 'column';
            topBox.style.gap = '10px';
            topBox.style.flexGrow = '1';

            const pipStato = document.createElement('div');
            pipStato.className = 'status-badge';
            pipStato.style.marginRule = '0';
            pipStato.style.width = '100%';
            pipStato.style.textAlign = 'center';
            pipStato.textContent = statoApp.textContent;
            if (statoApp.classList.contains('active')) pipStato.classList.add('active');

            const pipTextarea = document.createElement('textarea');
            pipTextarea.value = areaAppunti.value;
            pipTextarea.style.flexGrow = '1';
            pipTextarea.style.height = '160px';
            pipTextarea.style.width = '100%';
            pipTextarea.disabled = true;

            // --- NUOVA RIGA PULSANTI RIDOTTI (SOLO ICONE + TOOLTIP) ---
            const pipButtonsRow = document.createElement('div');
            pipButtonsRow.className = 'pip-buttons-row';

            const t = traduzioni[selectInterfaccia.value];

            // 1. Pulsante Microfono Mini
            const miniBtnMicrofono = document.createElement('button');
            miniBtnMicrofono.className = btnAscolto.className + ' pip-btn-mini';
            miniBtnMicrofono.textContent = '🎤';
            miniBtnMicrofono.title = t.btnMicrofono; 
            miniBtnMicrofono.addEventListener('click', () => btnAscolto.click());

            // 2. Pulsante Call Mini
            const miniBtnCall = document.createElement('button');
            miniBtnCall.className = btnCatturaSistema.className + ' pip-btn-mini';
            miniBtnCall.textContent = '💻';
            miniBtnCall.title = t.btnCall;
            miniBtnCall.style.backgroundColor = btnCatturaSistema.style.backgroundColor;
            miniBtnCall.addEventListener('click', () => btnCatturaSistema.click());

            // 3. Pulsante Cancella Mini
            const miniBtnCancella = document.createElement('button');
            miniBtnCancella.className = btnCancella.className + ' pip-btn-mini';
            miniBtnCancella.textContent = '🗑️';
            miniBtnCancella.title = t.btnCancella;
            miniBtnCancella.addEventListener('click', () => btnCancella.click());

            pipButtonsRow.appendChild(miniBtnMicrofono);
            pipButtonsRow.appendChild(miniBtnCall);
            pipButtonsRow.appendChild(miniBtnCancella);

            // Costruzione blocco superiore
            topBox.appendChild(pipStato);
            topBox.appendChild(pipButtonsRow);
            topBox.appendChild(pipTextarea);

            // --- NUOVO BANNER PUBBLICITARIO IN BASSO DENTRO IL PIP ---
            const pipAdvSpace = document.createElement('div');
            pipAdvSpace.className = 'advertising-space';
            pipAdvSpace.style.marginTop = '10px';

            const pipBanner = document.createElement('div');
            pipBanner.id = 'banner-principale';
            pipBanner.style.lineHeight = '50px'; // Più basso per stare nella finestrina
            pipBanner.style.height = '50px';
            pipBanner.textContent = 'Space Advertising';

            pipAdvSpace.appendChild(pipBanner);

            // Assemblaggio finale all'interno del PiP
            pipContainer.appendChild(topBox);
            pipContainer.appendChild(pipAdvSpace);
            pipWindow.document.body.appendChild(pipContainer);

            // Sincronizzazione dinamica continua (Stato, Testi e animazioni dei pulsanti)
            const intervalloSincro = setInterval(() => {
                if (pipWindow.closed) {
                    clearInterval(intervalloSincro);
                    window.pipWindow = null;
                    return;
                }
                
                // Aggiorna testo e badge di stato
                pipTextarea.value = areaAppunti.value;
                pipStato.textContent = statoApp.textContent;
                
                const currentLang = traduzioni[selectInterfaccia.value];

                // Sincronizza lo stato attivo/disattivo delle grafiche e i tooltip dinamici
                if (statoApp.classList.contains('active')) {
                    pipStato.classList.add('active');
                } else {
                    pipStato.classList.remove('active');
                }

                // Sincronizza l'aspetto del pulsante microfono (se sta registrando diventa Stop 🛑)
                if (btnAscolto.classList.contains('listening')) {
                    miniBtnMicrofono.classList.add('listening');
                    miniBtnMicrofono.textContent = '🛑';
                    miniBtnMicrofono.title = currentLang.btnStop;
                } else {
                    miniBtnMicrofono.classList.remove('listening');
                    miniBtnMicrofono.textContent = '🎤';
                    miniBtnMicrofono.title = currentLang.btnMicrofono;
                }

                // Sincronizza l'aspetto del pulsante Call
                if (ascoltoAttivo && !btnAscolto.classList.contains('listening')) {
                    miniBtnCall.textContent = '🛑';
                    miniBtnCall.style.backgroundColor = "#ef4444";
                    miniBtnCall.title = currentLang.btnStop;
                } else {
                    miniBtnCall.textContent = '💻';
                    miniBtnCall.style.backgroundColor = "";
                    miniBtnCall.title = currentLang.btnCall;
                }

                // Aggiorna costantemente lo stato "disabled" per evitare conflitti d'uso
                miniBtnMicrofono.disabled = btnAscolto.disabled && !btnAscolto.classList.contains('listening');
                miniBtnCall.disabled = btnCatturaSistema.disabled && miniBtnCall.textContent !== '🛑';

            }, 100);

        } catch (err) {
            console.error("Impossibile aprire il Document PiP:", err);
        }
    });

    // --- INIZIALIZZAZIONE AUTOMATICA ---
    rilevaEImpostaLinguaIniziale();
});
