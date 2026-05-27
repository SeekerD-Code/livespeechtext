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
        const themeTextLabel = document.getElementById('theme-text-label');

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
                if (themeTextLabel) themeTextLabel.textContent = 'notte';
            } else {
                document.body.classList.remove('dark-mode');
                themeToggleBtn.textContent = '🌙';
                if (themeTextLabel) themeTextLabel.textContent = 'giorno';
            }
        }

        inizializzaTema();

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                themeToggleBtn.textContent = '☀️';
                if (themeTextLabel) themeTextLabel.textContent = 'notte';
                localStorage.setItem('theme', 'dark');
            } else {
                themeToggleBtn.textContent = '🌙';
                if (themeTextLabel) themeTextLabel.textContent = 'giorno';
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
                        audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true }
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
                console.error("Errore riconoscimento vocale:", event.error);
                if (event.error === 'not-allowed') {
                // Forziamo lo stop del loop e resettiamo l'interfaccia
                bloccoForzato = true;
                disattivaGraficaStato();
                // Mostriamo l'avviso personalizzato usando la tua modale custom
                const linguaAttuale = selectInterfaccia.value;
                if (linguaAttuale === 'it') {
                    mostraModaleAvviso("Permesso Negato", "Impossibile accedere al microfono. Controlla i permessi del browser cliccando sul lucchetto in alto accanto all'URL!");
                } else {
                    mostraModaleAvviso("Permission Denied", "Cannot access the microphone. Please check browser permissions by clicking the lock icon next to the URL!");
                }
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

        // --- FUNZIONALITÀ DOCUMENT PICTURE-IN-PICTURE ---
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
                    height: 480,
                });

                window.pipWindow = pipWindow;

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

                const pipContainer = document.createElement('div');
                pipContainer.style.padding = '15px';
                pipContainer.style.height = '100vh';
                pipContainer.style.display = 'flex';
                pipContainer.style.flexDirection = 'column';
                pipContainer.style.gap = '10px';
                pipContainer.style.boxSizing = 'border-box';
                pipContainer.style.justifyContent = 'space-between';

                const topBox = document.createElement('div');
                topBox.style.display = 'flex';
                topBox.style.flexDirection = 'column';
                topBox.style.gap = '10px';
                topBox.style.flexGrow = '1';

                const pipStato = document.createElement('div');
                pipStato.className = 'status-badge';
                pipStato.style.margin = '0';
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

                const pipButtonsRow = document.createElement('div');
                pipButtonsRow.className = 'pip-buttons-row';

                const t = traduzioni[selectInterfaccia.value];

                const miniBtnMicrofono = document.createElement('button');
                miniBtnMicrofono.className = btnAscolto.className + ' pip-btn-mini';
                miniBtnMicrofono.textContent = '🎤';
                miniBtnMicrofono.title = t.btnMicrofono; 
                miniBtnMicrofono.addEventListener('click', () => btnAscolto.click());

                const miniBtnCall = document.createElement('button');
                miniBtnCall.className = btnCatturaSistema.className + ' pip-btn-mini';
                miniBtnCall.textContent = '💻';
                miniBtnCall.title = t.btnCall;
                miniBtnCall.style.backgroundColor = btnCatturaSistema.style.backgroundColor;
                miniBtnCall.addEventListener('click', () => btnCatturaSistema.click());

                const miniBtnCancella = document.createElement('button');
                miniBtnCancella.className = btnCancella.className + ' pip-btn-mini';
                miniBtnCancella.textContent = '🗑️';
                miniBtnCancella.title = t.btnCancella;
                miniBtnCancella.addEventListener('click', () => btnCancella.click());

                pipButtonsRow.appendChild(miniBtnMicrofono);
                pipButtonsRow.appendChild(miniBtnCall);
                pipButtonsRow.appendChild(miniBtnCancella);

                topBox.appendChild(pipStato);
                topBox.appendChild(pipButtonsRow);
                topBox.appendChild(pipTextarea);

                const pipAdvSpace = document.createElement('div');
                pipAdvSpace.className = 'advertising-space';
                pipAdvSpace.style.marginTop = '10px';

                const pipBanner = document.createElement('div');
                pipBanner.id = 'banner-principale';
                pipBanner.style.lineHeight = '50px'; 
                pipBanner.style.height = '50px';
                pipBanner.textContent = 'Space Advertising';

                pipAdvSpace.appendChild(pipBanner);

                pipContainer.appendChild(topBox);
                pipContainer.appendChild(pipAdvSpace);
                pipWindow.document.body.appendChild(pipContainer);

                const intervalloSincro = setInterval(() => {
                    if (pipWindow.closed) {
                        clearInterval(intervalloSincro);
                        window.pipWindow = null;
                        return;
                    }
                    
                    pipTextarea.value = areaAppunti.value;
                    pipStato.textContent = statoApp.textContent;
                    
                    const currentLang = traduzioni[selectInterfaccia.value];

                    if (statoApp.classList.contains('active')) {
                        pipStato.classList.add('active');
                    } else {
                        pipStato.classList.remove('active');
                    }

                    if (btnAscolto.classList.contains('listening')) {
                        miniBtnMicrofono.classList.add('listening');
                        miniBtnMicrofono.textContent = '🛑';
                        miniBtnMicrofono.title = currentLang.btnStop;
                    } else {
                        miniBtnMicrofono.classList.remove('listening');
                        miniBtnMicrofono.textContent = '🎤';
                        miniBtnMicrofono.title = currentLang.btnMicrofono;
                    }

                    if (ascoltoAttivo && !btnAscolto.classList.contains('listening')) {
                        miniBtnCall.textContent = '🛑';
                        miniBtnCall.style.backgroundColor = "#ef4444";
                        miniBtnCall.title = currentLang.btnStop;
                    } else {
                        miniBtnCall.textContent = '💻';
                        miniBtnCall.style.backgroundColor = "";
                        miniBtnCall.title = currentLang.btnCall;
                    }

                    miniBtnMicrofono.disabled = btnAscolto.disabled && !btnAscolto.classList.contains('listening');
                    miniBtnCall.disabled = btnCatturaSistema.disabled && miniBtnCall.textContent !== '🛑';

                }, 100);

            } catch (err) {
                console.error("Impossibile aprire il Document PiP:", err);
            }
        });


        // --- LINGUETTE DI NAVIGAZIONE (CAMBIO PAGINA) ---
        const linkApp = document.getElementById('link-app');
        const linkAbout = document.getElementById('link-about');
        const linkFaq = document.getElementById('link-faq');

        const sezioneApp = document.getElementById('sezione-app') || document.querySelector('.container'); 
        const sezioneAbout = document.getElementById('sezione-about');
        const sezioneFaq = document.getElementById('sezione-faq');

        function mostraPagina(paginaDaMostrare, linkAttivo) {
            sezioneApp.style.display = 'none';
            sezioneAbout.style.display = 'none';
            sezioneFaq.style.display = 'none';
            
            linkApp.classList.remove('active');
            linkAbout.classList.remove('active');
            linkFaq.classList.remove('active');

            paginaDaMostrare.style.display = 'block';
            linkAttivo.classList.add('active');
        }

        linkApp.addEventListener('click', (e) => { e.preventDefault(); mostraPagina(sezioneApp, linkApp); });
        linkAbout.addEventListener('click', (e) => { e.preventDefault(); mostraPagina(sezioneAbout, linkAbout); });
        linkFaq.addEventListener('click', (e) => { e.preventDefault(); mostraPagina(sezioneFaq, linkFaq); });


        // --- LOGICA FUNZIONAMENTO ACCORDION (FAQ) ---
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                /* FIX: Usiamo e.currentTarget per intercettare stabilmente l'header a prescindere dallo span cliccato */
                const currentHeader = e.currentTarget;
                const itemCorrente = currentHeader.parentElement; 
                const eraAttivo = itemCorrente.classList.contains('active');
                
                document.querySelectorAll('.accordion-item').forEach(item => {
                    item.classList.remove('active');
                });

                if (!eraAttivo) {
                    itemCorrente.classList.add('active');
                }
            });
        });

        // --- INIZIALIZZAZIONE AUTOMATICA LINGUA (Spostata alla fine per sicurezza) ---
        rilevaEImpostaLinguaIniziale();
    });