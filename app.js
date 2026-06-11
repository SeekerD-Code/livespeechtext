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

// --- VARIABILI DI RIFERIMENTO PER IL PICTURE-IN-PICTURE ---
let pipWindow = null;
let areaAppuntiMini = null;
let boxAnteprimaMini = null;

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
statoAttivoCall: "💻 Traccrizione Call attiva...",
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
// Se la finestra PiP è aperta, giriamole lo stato del tema scuro
if (pipWindow) {
if (document.body.classList.contains('dark-mode')) {
pipWindow.document.body.classList.add('dark-mode');
} else {
pipWindow.document.body.classList.remove('dark-mode');
}
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

// --- FUNZIONAMENTO DELLO STATO GRAFICO ---
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
if (typeof paroleInviateDalloStart === 'undefined') {
var paroleInviateDalloStart = 0;
}

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

const immettiNuovoBlocco = (testoBlocco) => {
if (!testoBlocco) return;

// 🌟 SE SEI SU MOBILE, USA LA LOGICA SEPARATA DI MOBILE-PATCH E ESCI
                if (typeof MobilePatch !== 'undefined' && MobilePatch.isMobile()) {
                    MobilePatch.processaInserimentoMobile(areaAppunti, testoBlocco);
                    
                    // Sincronizza il PiP se attivo
                    if (areaAppuntiMini) {
                        areaAppuntiMini.value = areaAppunti.value;
                        areaAppuntiMini.scrollTop = areaAppuntiMini.scrollHeight;
                    }
                    if (btnDownload) btnDownload.style.display = "inline-block";
                    areaAppunti.scrollTop = areaAppunti.scrollHeight;
                    return; // Blocca il resto della funzione originale, così non duplica!
                }


let testoSenzaPunteggiatura = testoBlocco.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
let pulito = testoSenzaPunteggiatura.replace(/\s+/g, " ").trim();
if (!pulito) return;

const haIlFocus = (document.activeElement === areaAppunti);
const inizioSelezione = areaAppunti.selectionStart;
const fineSelezione = areaAppunti.selectionEnd;
const scrollAltezza = areaAppunti.scrollTop;

// Scrittura nell'area principale
areaAppunti.value += pulito + "\n";
if (btnDownload) btnDownload.style.display = "inline-block";

// 🌟 AGGIORNAMENTO PiP: Sincronizza ed esegue lo scroll automatico della minicompattata
if (areaAppuntiMini) {
areaAppuntiMini.value = areaAppunti.value;
areaAppuntiMini.scrollTop = areaAppuntiMini.scrollHeight;
}

if (haIlFocus) {
areaAppunti.setSelectionRange(inizioSelezione, fineSelezione);
areaAppunti.scrollTop = scrollAltezza;
} else {
areaAppunti.scrollTop = areaAppunti.scrollHeight;
}
};

if (testoProvvisorio) {
                let anteprimaPulita = "";

                // Controlliamo se siamo su mobile tramite la nostra patch
                if (typeof MobilePatch !== 'undefined' && MobilePatch.isMobile()) {
                    // Su mobile prendiamo il testo provvisorio in tempo reale bypassando i blocchi fissi
                    anteprimaPulita = MobilePatch.formatPreview(testoProvvisorio);
                } else {
                    // Logica PC originale
                    const tutteLeParole = testoProvvisorio.trim().split(/\s+/);
                    const paroleNuove = tutteLeParole.slice(paroleInviateDalloStart);

                    if (paroleNuove.length >= 20) {
                        const bloccoDaInviare = paroleNuove.join(" ");
                        immettiNuovoBlocco(bloccoDaInviare);
                        paroleInviateDalloStart += paroleNuove.length;
                    }

                    const paroleRimanentiAnteprima = tutteLeParole.slice(paroleInviateDalloStart).join(" ");
                    anteprimaPulita = paroleRimanentiAnteprima.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
                } // 🌟 QUESTA GRAFFA CHIUDE CORRETTAMENTE L'ELSE DEL PC

                // Questa parte deve stare FUORI dagli IF/ELSE del dispositivo, 
                // così funziona sia su PC che su Mobile!
                const testoInAscoltoCompleto = `<strong>${traduzioni[selectInterfaccia.value].inAscolto}</strong> ${anteprimaPulita}`;

                if (boxAnteprima) {
                    boxAnteprima.innerHTML = testoInAscoltoCompleto;
                }

                // 🌟 AGGIORNAMENTO PiP: Mostra in tempo reale l'anteprima vocale azzurra
                if (boxAnteprimaMini) {
                    boxAnteprimaMini.innerHTML = testoInAscoltoCompleto;
                }
            } else {
                if (boxAnteprima) boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
                if (boxAnteprimaMini) boxAnteprimaMini.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
            }

            if (testoDefinitivo) {
                const tutteLeParoleDef = testoDefinitivo.trim().split(/\s+/);
                const rimanentiDef = tutteLeParoleDef.slice(paroleInviateDalloStart).join(" ");

                if (rimanentiDef.trim().length > 0) {
                    immettiNuovoBlocco(rimanentiDef);
                }
                paroleInviateDalloStart = 0;
            }
        }

// --- RESET DI SICUREZZA VOCALE ---
recognition.onend = () => {
    // 🌟 LOGICA SEPARATA MOBILE: Aggiunge il distacco del paragrafo (\n\n) solo alla fine del parlato reale
            if (typeof MobilePatch !== 'undefined' && MobilePatch.isMobile() && areaAppunti.value.trim().length > 0) {
                if (!areaAppunti.value.endsWith("\n\n")) {
                    areaAppunti.value += "\n\n";
                    
                    // Sincronizza subito anche il mini-box PiP per evitare disallineamenti
                    if (areaAppuntiMini) {
                        areaAppuntiMini.value = areaAppunti.value;
                    }
                }
            }
paroleInviateDalloStart = 0;
if (boxAnteprima && !ascoltoAttivo) {
boxAnteprima.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
}
if (boxAnteprimaMini && !ascoltoAttivo) {
boxAnteprimaMini.textContent = traduzioni[selectInterfaccia.value].attesaVoce;
}

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
if (areaAppuntiMini) areaAppuntiMini.value = ''; // Svuota anche la miniapp se aperta
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

// --- GESTIONE NUOVA APERTURA COMPATTA PICTURE-IN-PICTURE (pip.html) ---
if (btnPip) {
btnPip.addEventListener('click', async () => {
if (!('documentPictureInPicture' in window)) {
alert("Il tuo browser non supporta il Document Picture-in-Picture. Usa Google Chrome o Microsoft Edge!");
return;
}

if (pipWindow) {
pipWindow.close();
return;
}

try {
pipWindow = await window.documentPictureInPicture.requestWindow({
width: 400,
height: 500,
});

// Carica il file html esterno
const risposta = await fetch('pip.html');
const htmlPip = await risposta.text();
pipWindow.document.body.innerHTML = htmlPip;

// Gestione del tema iniziale sulla finestra fluttuante
if (document.body.classList.contains('dark-mode')) {
pipWindow.document.body.classList.add('dark-mode');
}

// Clona stili CSS nell'head del PiP
[...document.styleSheets].forEach((styleSheet) => {
try {
const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
const style = pipWindow.document.createElement('style');
style.textContent = cssRules;
pipWindow.document.head.appendChild(style);
} catch (e) {
const link = pipWindow.document.createElement('link');
link.rel = 'stylesheet';
link.href = styleSheet.href;
pipWindow.document.head.appendChild(link);
}
});

// Riferimenti interni alla finestra PiP
areaAppuntiMini = pipWindow.document.getElementById('area-appunti-mini');
boxAnteprimaMini = pipWindow.document.getElementById('box-anteprima-mini');
const btnLinguaMini = pipWindow.document.getElementById('btn-lingua-mini');
const listaLingueMini = pipWindow.document.getElementById('lista-lingue-mini');
const statoAppMini = pipWindow.document.getElementById('stato-app-mini');

// Riferimenti ai tre bottoni mini appena aggiunti nel file HTML
const miniBtnMicrofono = pipWindow.document.getElementById('btn-ascolto-mini');
const miniBtnCall = pipWindow.document.getElementById('btn-call-mini');
const miniBtnCancella = pipWindow.document.getElementById('btn-cancella-mini');

// Se esistono nell'HTML, copiamo le classi CSS originali per mantenere lo stile grafico coerente
if (miniBtnMicrofono && btnAscolto) miniBtnMicrofono.className = btnAscolto.className + ' pip-btn-mini';
if (miniBtnCall && btnCatturaSistema) miniBtnCall.className = btnCatturaSistema.className + ' pip-btn-mini';
if (miniBtnCancella && btnCancella) miniBtnCancella.className = btnCancella.className + ' pip-btn-mini';

// Impostiamo i titoli descrittivi (tooltip) basati sulla lingua attiva
const tAttuale = traduzioni[selectInterfaccia.value];
if (miniBtnMicrofono) { miniBtnMicrofono.title = tAttuale.btnMicrofono; miniBtnMicrofono.addEventListener('click', () => btnAscolto.click()); }
if (miniBtnCall) { miniBtnCall.title = tAttuale.btnCall; miniBtnCall.addEventListener('click', () => btnCatturaSistema.click()); }
if (miniBtnCancella) { miniBtnCancella.title = tAttuale.btnCancella; 
miniBtnCancella.addEventListener('click', () => {
// 1. Riporta l'applicazione principale in primo piano
window.focus(); 

// 2. Attiva il pulsante cancella grande (che aprirà il tuo modale)
btnCancella.click();
});
}

// Allineamento immediato dei testi correnti
if (areaAppuntiMini && areaAppunti) areaAppuntiMini.value = areaAppunti.value;
if (boxAnteprimaMini && boxAnteprima) {
boxAnteprimaMini.innerHTML = boxAnteprima.style.display !== "none" ? boxAnteprima.innerHTML : traduzioni[selectInterfaccia.value].attesaVoce;
}

// Imposta la sigla della lingua iniziale sul bottone mini
if (btnLinguaMini && selectLingua) {
const langBreve = selectLingua.value.substring(0, 2).toUpperCase();
btnLinguaMini.innerHTML = `🌐 ${langBreve}`;
}

// Sincronizzazione dell'editing manuale Bidirezionale
if (areaAppuntiMini && areaAppunti) {
areaAppuntiMini.addEventListener('input', () => {
areaAppunti.value = areaAppuntiMini.value;
});
areaAppunti.addEventListener('input', () => {
areaAppuntiMini.value = areaAppunti.value;
});
}

// Gestione Menu a tendina della lingua nella finestra PiP
if (btnLinguaMini && listaLingueMini) {
btnLinguaMini.addEventListener('click', (e) => {
e.stopPropagation();
listaLingueMini.classList.toggle('menu-lingue-mostra');
});

listaLingueMini.querySelectorAll('span').forEach(opzione => {
opzione.addEventListener('click', (e) => {
const linguaSelezionata = e.currentTarget.getAttribute('data-lang');
const testoBreve = e.currentTarget.textContent.split(' ')[1].substring(0, 2).toUpperCase();

btnLinguaMini.innerHTML = `🌐 ${testoBreve}`;

if (selectLingua) {
selectLingua.value = linguaSelezionata;
selectLingua.dispatchEvent(new Event('change'));
}
listaLingueMini.classList.remove('menu-lingue-mostra');
});
});

pipWindow.document.addEventListener('click', () => {
listaLingueMini.classList.remove('menu-lingue-mostra');
});
}

// 🌟 NUOVO INTERVAL DI SINCRONIZZAZIONE STATI E ICONE BOTTONI MINI 🌟
const intervalSincronizzazione = setInterval(() => {
if (!pipWindow) return;

// Sincronizza lo stato della barra superiore fluttuante con quella principale
if (statoAppMini && statoApp) {
statoAppMini.textContent = statoApp.textContent;
if (statoApp.classList.contains('active')) {
statoAppMini.classList.add('active');
} else {
statoAppMini.classList.remove('active');
}
}

// Sincronizza lo stato grafico del pulsante MICROFONO Mini (se la principale ha classe .listening)
if (btnAscolto && btnAscolto.classList.contains('listening')) {
if (miniBtnMicrofono) {
miniBtnMicrofono.classList.add('listening');
miniBtnMicrofono.textContent = '🛑';
}
} else {
if (miniBtnMicrofono) {
miniBtnMicrofono.classList.remove('listening');
miniBtnMicrofono.textContent = '🎤';
}
}

// Sincronizza lo stato grafico del pulsante CALL Mini
if (ascoltoAttivo && btnCatturaSistema && btnCatturaSistema.textContent === traduzioni[selectInterfaccia.value].btnStop) {
if (miniBtnCall) {
miniBtnCall.textContent = '🛑';
miniBtnCall.style.backgroundColor = "#ef4444";
}
} else {
if (miniBtnCall) {
miniBtnCall.style.backgroundColor = "";
miniBtnCall.textContent = '💻';
}
}

// Disabilita o abilita i pulsanti mini a specchio della pagina principale
if (miniBtnMicrofono && btnAscolto) {
miniBtnMicrofono.disabled = btnAscolto.disabled && !btnAscolto.classList.contains('listening');
}
if (miniBtnCall && btnCatturaSistema) {
miniBtnCall.disabled = btnCatturaSistema.disabled && miniBtnCall.textContent !== '🛑';
}
}, 250);

// Reset puntatori e clearInterval alla chiusura della finestra fluttuante
pipWindow.addEventListener('pagehide', () => {
clearInterval(intervalSincronizzazione);
pipWindow = null;
areaAppuntiMini = null;
boxAnteprimaMini = null;
});

} catch (errore) {
console.error("Errore nell'apertura del Document PiP API:", errore);
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

// --- GESTIONE APERTURA/CHIUSURA FAQ (ACCORDION) ---
document.addEventListener('DOMContentLoaded', () => {
    const faqContainer = document.querySelector('#sezione-faq .accordion');
    
    if (faqContainer) {
        faqContainer.addEventListener('click', function(e) {
            // Intercetta il click sull'header (o sulle icone/testi al suo interno)
            const header = e.target.closest('.accordion-header');
            if (!header) return;

            const currentItem = header.parentElement;
            const isActive = currentItem.classList.contains('active');

            // Chiude tutti gli altri accordion aperti per mantenere l'ordine
            const allItems = faqContainer.querySelectorAll('.accordion-item');
            allItems.forEach(item => {
                item.classList.remove('active');
            });

            // Se l'elemento non era attivo, aggiunge la classe 'active' per espanderlo con il CSS
            if (!isActive) {
                currentItem.classList.add('active');
            }
        });
    }
});