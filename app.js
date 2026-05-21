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
    const themeToggleBtn = document.getElementById('theme-toggle'); // Spostato qui in cima per consistenza

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
            btnPip: "📺 Riduci in Primo Piano",
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
            btnPip: "📺 Picture-in-Picture",
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
        },
        es: {
            btnMicrofono: "🎤 Transcribir desde Micrófono",
            btnCall: "💻 Transcribir desde Llamada / Video",
            btnStop: "🛑 Detener",
            btnCancella: "🗑️ Borrar Todo",
            btnDownload: "💾 Descargar Texto",
            btnPip: "📺 Reducir a Primer Plano",
            statoPronto: "Listo para escuchar",
            statoAttivoMicrofono: "🎙️ Micrófono Activo (Pantalla Protegida)...",
            statoAttivoCall: "💻 Transcripción de llamada activa...",
            statoTerminato: "Escucha terminada",
            attesaVoce: "Esperando voz...",
            inAscolto: "✍️ Escuchando: ",
            modalCancellaTitolo: "¿Borrar todo?",
            modalCancellaMessaggio: "¿Seguro che quieres vaciar las notas?",
            modalAnnulla: "Cancelar",
            modalAvvisoTitolo: "⚠️ Atención",
            modalAudioMancanteTitolo: "Audio Faltante",
            modalAudioMancanteMessaggio: "¡Debes marcar la casilla 'Compartir audio de la pestaña'!"
        },
        fr: {
            btnMicrofono: "🎤 Transcrire le Micro",
            btnCall: "💻 Transcrire l'Appel / Vidéo",
            btnStop: "🛑 Arrêter",
            btnCancella: "🗑️ Tout Effacer",
            btnDownload: "💾 Télécharger le Texte",
            btnPip: "📺 Image dans l'Image",
            statoPronto: "Prêt à écouter",
            statoAttivoMicrofono: "🎙️ Micro Actif (Écran Allumé)...",
            statoAttivoCall: "💻 Transcription d'appel active...",
            statoTerminato: "Écoute terminée",
            attesaVoce: "En attente de la voix...",
            inAscolto: "✍️ En écoute: ",
            modalCancellaTitolo: "Tout effacer?",
            modalCancellaMessaggio: "Êtes-vous sûr de vouloir vider les notes?",
            modalAnnulla: "Annuler",
            modalAvvisoTitolo: "⚠️ Attention",
            modalAudioMancanteTitolo: "Audio Manquant",
            modalAudioMancanteMessaggio: "Vous devez cocher la case 'Partager l'audio de l'onglet'!"
        },
        de: {
            btnMicrofono: "🎤 Vom Mikrofon transkribieren",
            btnCall: "💻 Vom Anruf / Video transkribieren",
            btnStop: "🛑 Stopp",
            btnCancella: "🗑️ Alles löschen",
            btnDownload: "💾 Text herunterladen",
            btnPip: "📺 Bild-in-Bild",
            statoPronto: "Bereit zuzuhören",
            statoAttivoMicrofono: "🎙️ Mikrofon aktiv (Bildschirm an)...",
            statoAttivoCall: "💻 Anruftranskription aktiv...",
            statoTerminato: "Mitzuhören beendet",
            attesaVoce: "Warten auf Stimme...",
            inAscolto: "✍️ Hören: ",
            modalCancellaTitolo: "Alles löschen?",
            modalCancellaMessaggio: "Sind Sie sicher, dass Sie die Notizen löschen möchten?",
            modalAnnulla: "Abbrechen",
            modalAvvisoTitolo: "⚠️ Achtung",
            modalAudioMancanteTitolo: "Audio fehlt",
            modalAudioMancanteMessaggio: "Sie müssen das Kontrollkästchen 'Tab-Audio teilen' aktivieren!"
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

    // Esegui subito l'inizializzazione del tema per evitare l'icona iniziale errata
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
        btnDownload.textContent = t.btnDownload;
        btnPip.textContent = t.btnPip;
    }

    // --- AUTOMAZIONE: RILEVAMENTO REGIONE/LINGUA UTENTE ---
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
    let pipWindow = null; 
    let bloccoForzato = false; 
    let frasiGiaSalvate = new Set(); 
    let wakeLock = null; 

    // --- GESTIONE WAKE LOCK ---
    async function richiediWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.error(err);
            }
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
            frasiGiaSalvate.clear();
            if(areaAppunti.value.trim().length > 0) frasiGiaSalvate.add(areaAppunti.value.trim());
            
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