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
                if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
                if (themeTextLabel) themeTextLabel.textContent = 'notte';
            } else {
                document.body.classList.remove('dark-mode');
                if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
                if (themeTextLabel) themeTextLabel.textContent = 'giorno';
            }
        }

        inizializzaTema();

        if (themeToggleBtn) {
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
        }

        // --- FUNZIONE APPLICA TRADUZIONE GRAFICA ---
        function applicaLinguaInterfaccia(lang) {
            const t = traduzioni[lang] || traduzioni.en;
            if(!ascoltoAttivo) {
                if (btnAscolto) btnAscolto.textContent = t.btnMicrofono;
                if (btnCatturaSistema) btnCatturaSistema.textContent = t.btnCall;
                if (statoApp) statoApp.textContent = t.statoPronto;
            }
            if (btnCancella) btnCancella.textContent = t.btnCancella;
            if (areaAppunti && btnDownload) {
                if(areaAppunti.value.trim().length > 0) btnDownload.style.display = "inline-block";
                btnDownload.textContent = t.btnDownload;
            }
            if (btnPip) btnPip.textContent = t.btnPip;
        }

        // --- ABILITAZIONE SELETTORE MANUAL LINGUA ACQUISIZIONE ---
        function rilevaEImpostaLinguaIniziale() {
            const linguaBrowser = navigator.language || navigator.userLanguage;
            const codiceCorto = linguaBrowser.substring(0, 2);

            if (selectInterfaccia && traduzioni[codiceCorto]) {
                selectInterfaccia.value = codiceCorto;
            } else if (selectInterfaccia) {
                selectInterfaccia.value = "en";
            }
            
            if (selectLingua) {
                const opzioneMicrofono = Array.from(selectLingua.options).find(opt => opt.value.startsWith(codiceCorto));
                if (opzioneMicrofono) {
                    selectLingua.value = opzioneMicrofono.value;
                } else {
                    selectLingua.value = "it-IT";
                }
            }
            applicaLinguaInterfaccia(selectInterfaccia ? selectInterfaccia.value : "it");
        }

        if (selectInterfaccia) {
            selectInterfaccia.addEventListener('change', () => {
                applicaLinguaInterfaccia(selectInterfaccia.value);
            });
        }

        // --- CONFIGURAZIONE MOTORE VOCALE ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Ops! Browser non supportato. Usa Google Chrome!");
            return;
        }

        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;         
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
            if (!modal) return;
            modalTitolo.textContent = titolo; 
            modalMessaggio.textContent = messaggio;
            modalBtnConferma.style.display = "block"; 
            modalBtnAnnulla.textContent = traduzioni[selectInterfaccia.value].modalAnnulla;
            azioneDaConfermare = callback; 
            modal.classList.add('show');
        }

        function mostraModaleAvviso(titolo, messaggio) {
            if (!modal) return;
            modalTitolo.textContent = titolo;
            modalMessaggio.textContent = messaggio;
            modalBtnConferma.style.display = "none"; 
            modalBtnAnnulla.textContent = "Ok";
            azioneDaConfermare = null;
            modal.classList.add('show');
        }

        if (modalBtnAnnulla) modalBtnAnnulla.addEventListener('click', () => { modal.classList.remove('show'); });
        if (modalBtnConferma) modalBtnConferma.addEventListener('click', () => { if (azioneDaConfermare) azioneDaConfermare(); modal.classList.remove('show'); });

        // --- FUNZIONI GRAFICHE ---
        function attivaGraficaStato(messaggio) {
            ascoltoAttivo = true;
            if (btnAscolto) btnAscolto.disabled = true;
            if (btnCatturaSistema) btnCatturaSistema.disabled = true;
            if (statoApp) {
                statoApp.textContent = messaggio; 
                statoApp.classList.add('active');
            }
            if (boxAnteprima) {
                boxAnteprima.style.display = "block";
                boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
            }
        }

        function disattivaGraficaStato() {
            ascoltoAttivo = false;
            if (btnAscolto) {
                btnAscolto.disabled = false;
                btnAscolto.classList.remove('listening');
            }
            if (btnCatturaSistema) {
                btnCatturaSistema.disabled = false;
                btnCatturaSistema.style.backgroundColor = "#8b5cf6";
            }
            if (statoApp) statoApp.classList.remove('active');
            if (boxAnteprima) boxAnteprima.style.display = "none";
            
            applicaLinguaInterfaccia(selectInterfaccia ? selectInterfaccia.value : "it");

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
        if (btnAscolto) {
            btnAscolto.addEventListener('click', async () => {
                if (!ascoltoAttivo) {
                    bloccoForzato = false;
                    recognition.lang = selectLingua ? selectLingua.value : "it-IT"; 
                    
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
        }

        // --- EVENTI CALL ---
        if (btnCatturaSistema) {
            btnCatturaSistema.addEventListener('click', async () => {
                if (!ascoltoAttivo) {
                    try {
                        bloccoForzato = false;
                        
                        // AGGIORNAMENTO MODULO CATTURA AUDIO (Filtri hardware attivi ed aggressivi)
                        streamSistema = await navigator.mediaDevices.getDisplayMedia({
                            video: true,
                            audio: { 
                                autoGainControl: true, 
                                echoCancellation: true, 
                                noiseSuppression: true 
                            }
                        });
                        
                        const tracceAudio = streamSistema.getAudioTracks();
                        if (tracceAudio.length === 0) {
                            const t = traduzioni[selectInterfaccia.value];
                            mostraModaleAvviso(t.modalAudioMancanteTitolo, t.modalAudioMancanteMessaggio);
                            streamSistema.getTracks().forEach(track => track.stop());
                            return;
                        }

                        recognition.lang = selectLingua ? selectLingua.value : "it-IT";
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
        }

// --- LOGICA DI RICEZIONE E DICTATION ---
// Variabili di controllo fuori o all'inizio del blocco di inizializzazione
        if (typeof paroleInviateDalloStart === 'undefined') {
            var paroleInviateDalloStart = 0;
        }

        recognition.onresult = (event) => {
            let testoProvvisorio = '';
            let testoDefinitivo = '';

            // 1. Separazione nativa del motore vocale
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    testoDefinitivo += event.results[i][0].transcript + ' ';
                } else {
                    testoProvvisorio += event.results[i][0].transcript;
                }
            }

            // FUNZIONE INTERNA: Pulisce via TUTTA la punteggiatura
            const immettiNuovoBlocco = (testoBlocco) => {
                if (!testoBlocco) return;

                // Rimuove la punteggiatura
                let testoSenzaPunteggiatura = testoBlocco.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                
                // Rimuove eventuali doppi spazi rimasti
                let pulito = testoSenzaPunteggiatura.replace(/\s+/g, " ").trim();
                if (!pulito) return;

                const haIlFocus = (document.activeElement === areaAppunti);
                const inizioSelezione = areaAppunti.selectionStart;
                const fineSelezione = areaAppunti.selectionEnd;
                const scrollAltezza = areaAppunti.scrollTop;

                // Inserisce il testo puro e va a capo due volte
                areaAppunti.value += pulito + "\n\n";
                if (btnDownload) btnDownload.style.display = "inline-block";

                if (haIlFocus) {
                    areaAppunti.setSelectionRange(inizioSelezione, fineSelezione);
                    areaAppunti.scrollTop = scrollAltezza;
                } else {
                    areaAppunti.scrollTop = areaAppunti.scrollHeight;
                }
            };

            // 2. LOGICA DI TAGLIO FLUIDO A BLOCCHI DI 20 PAROLE
            if (testoProvvisorio) {
                const tutteLeParole = testoProvvisorio.trim().split(/\s+/);
                const paroleNuove = tutteLeParole.slice(paroleInviateDalloStart);

                if (paroleNuove.length >= 20) {
                    const bloccoDaInviare = paroleNuove.join(" ");
                    immettiNuovoBlocco(bloccoDaInviare);
                    
                    paroleInviateDalloStart += paroleNuove.length;
                }

                // L'anteprima in basso mostra le parole correnti pulite
                const paroleRimanentiAnteprima = tutteLeParole.slice(paroleInviateDalloStart).join(" ");
                let anteprimaPulita = paroleRimanentiAnteprima.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
                
                if (boxAnteprima) {
                    boxAnteprima.innerHTML = `<strong>${traduzioni[selectInterfaccia.value].inAscolto}</strong> ${anteprimaPulita}`;
                }
            }

            // 3. LOGICA DI CHIUSURA (Sistemata la variabile con il refuso)
            if (testoDefinitivo) {
                const tutteLeParoleDef = testoDefinitivo.trim().split(/\s+/);
                const rimanentiDef = tutteLeParoleDef.slice(paroleInviateDalloStart).join(" ");
                
                if (rimanentiDef.trim().length > 0) {
                    immettiNuovoBlocco(rimanentiDef);
                }
                
                paroleInviateDalloStart = 0;
            }
        };

        // 🌟 RESET DI SICUREZZA SEMPLIFICATO (Evita blocchi sui pulsanti)
        recognition.onend = () => {
            paroleInviateDalloStart = 0;
            if (boxAnteprima && !riconoscimentoAttivo) {
                boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
            }
        };

        // RESET DI SICUREZZA: All'interruzione manuale o fine della sessione vocale
        if (typeof recognition.onend_original === 'undefined') {
            recognition.onend = () => {
                paroleInviateDalloStart = 0;
                if (boxAnteprima && !riconoscimentoAttivo) {
                    boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
                }
            };
        }
        

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
                bloccoForzato = true;
                disattivaGraficaStato();
                const linguaAttuale = selectInterfaccia ? selectInterfaccia.value : "it";
                if (linguaAttuale === 'it') {
                    mostraModaleAvviso("Permesso Negato", "Impossibile accedere al microfono. Controlla i permessi del browser cliccando sul lucchetto in alto accanto all'URL!");
                } else {
                    mostraModaleAvviso("Permission Denied", "Cannot access the microphone. Please check browser permissions by clicking the lock icon next to the URL!");
                }
            }
        };

        // --- FUNZIONE CANCELLA TUTTO ---
        if (btnCancella) {
            btnCancella.addEventListener('click', () => {
                const t = traduzioni[selectInterfaccia.value];
                mostraModaleConferma(t.modalCancellaTitolo, t.modalCancellaMessaggio, () => {
                    if (areaAppunti) areaAppunti.value = '';
                    if (btnDownload) btnDownload.style.display = "none";
                });
            });
        }

        // --- FUNZIONE DOWNLOAD .TXT ---
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                if (!areaAppunti) return;
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
        }

        // --- FUNZIONALITÀ DOCUMENT PICTURE-IN-PICTURE ---
        if (btnPip) {
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
                    pipStato.textContent = statoApp ? statoApp.textContent : '';
                    if (statoApp && statoApp.classList.contains('active')) pipStato.classList.add('active');

                    const pipTextarea = document.createElement('textarea');
                    pipTextarea.value = areaAppunti ? areaAppunti.value : '';
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
                        
                        if (areaAppunti) pipTextarea.value = areaAppunti.value;
                        if (statoApp) pipStato.textContent = statoApp.textContent;
                        
                        const currentLang = traduzioni[selectInterfaccia.value];

                        if (statoApp && statoApp.classList.contains('active')) {
                            pipStato.classList.add('active');
                        } else {
                            pipStato.classList.remove('active');
                        }

                        if (btnAscolto && btnAscolto.classList.contains('listening')) {
                            miniBtnMicrofono.classList.add('listening');
                            miniBtnMicrofono.textContent = '🛑';
                            miniBtnMicrofono.title = currentLang.btnStop;
                        } else {
                            miniBtnMicrofono.classList.remove('listening');
                            miniBtnMicrofono.textContent = '🎤';
                            miniBtnMicrofono.title = currentLang.btnMicrofono;
                        }

                        if (ascoltoAttivo && btnAscolto && !btnAscolto.classList.contains('listening')) {
                            miniBtnCall.textContent = '🛑';
                            miniBtnCall.style.backgroundColor = "#ef4444";
                            miniBtnCall.title = currentLang.btnStop;
                        } else {
                            miniBtnCall.style.backgroundColor = "";
                            miniBtnCall.textContent = '💻';
                            miniBtnCall.title = currentLang.btnCall;
                        }

                        miniBtnMicrofono.disabled = btnAscolto && btnAscolto.disabled && !btnAscolto.classList.contains('listening');
                        miniBtnCall.disabled = btnCatturaSistema && btnCatturaSistema.disabled && miniBtnCall.textContent !== '🛑';

                    }, 100);

                } catch (err) {
                    console.error("Impossibile aprire il Document PiP:", err);
                }
            });
        }

        // --- LINGUETTE DI NAVIGAZIONE (CAMBIO PAGINA) ---
        const linkApp = document.getElementById('link-app');
        const linkAbout = document.getElementById('link-about');
        const linkFaq = document.getElementById('link-faq');

        const sezioneApp = document.getElementById('sezione-app') || document.querySelector('.container'); 
        const sezioneAbout = document.getElementById('sezione-about');
        const sezioneFaq = document.getElementById('sezione-faq');

        function mostraPagina(paginaDaMostrare, linkAttivo) {
            if (sezioneApp) sezioneApp.style.display = 'none';
            if (sezioneAbout) sezioneAbout.style.display = 'none';
            if (sezioneFaq) sezioneFaq.style.display = 'none';
            
            if (linkApp) linkApp.classList.remove('active');
            if (linkAbout) linkAbout.classList.remove('active');
            if (linkFaq) linkFaq.classList.remove('active');

            if (paginaDaMostrare) paginaDaMostrare.style.display = 'block';
            if (linkAttivo) linkAttivo.classList.add('active');
        }

        if (linkApp) linkApp.addEventListener('click', (e) => { e.preventDefault(); mostraPagina(sezioneApp, linkApp); });
        if (linkAbout) linkAbout.addEventListener('click', (e) => { e.preventDefault(); mostraPagina(sezioneAbout, linkAbout); });
        if (linkFaq) linkFaq.addEventListener('click', (e) => { e.preventDefault(); mostraPagina(sezioneFaq, linkFaq); });

        // --- LOGICA FUNZIONAMENTO ACCORDION (FAQ) ---
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
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

        // --- INIZIALIZZAZIONE AUTOMATICA LINGUA ---
        rilevaEImpostaLinguaIniziale();
});
