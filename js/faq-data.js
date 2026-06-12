const faqData = [
    {
        question: "🚀 Come funziona il riconoscimento vocale in tempo reale?",
        answer: "L'applicazione semiautomatica sfrutta la tecnologia nativa di riconoscimento vocale del browser. Quando parli o catturi l'audio, il motore analizza i suoni, isola la frequenza della voce e trasforma il parlato in testo definitivo all'interno dell'area di modifica non appena rileva una pausa naturale nel discorso. Al termine della sessione, puoi salvare e scaricare tutto sul tuo dispositivo."
    },
    {
        question: "💾 Dove salva il file l'app quando premo su 'Salva Testo'?",
        answer: "L'applicazione salva in automatico il file nella cartella Download."
    },
    {
        question: "🌍 Come fa l'app ad adattarsi alla mia lingua e cosa serve la tendina \"Lingua Lezione\"?",
        answer: "L'interfaccia dell'applicazione rileva automaticamente la lingua del tuo dispositivo (PC o smartphone) all'avvio per mostrarti i menu nella tua lingua nativa. La tendina <strong>\"🎤 Lingua Lezione / Input\"</strong> serve invece a indicare al motore vocale quale lingua deve ascoltare e trascrivere. Se l'interfaccia dell'app è in inglese ma stai ascoltando una lezione in italiano, imposta manualmente la tendina su \"Italiano\" prima di avviare la registrazione."
    },
    {
        question: "💻 Cos'è la funzione \"Trascrivi da Call / Video\" e perché non la vedo su smartphone?",
        answer: "Questa funzione permette di catturare l'audio interno del computer (ad esempio da una scheda del browser, un video o una chiamata su Zoom/Meet) e trascriverlo automaticamente. È disponibile <strong>esclusivamente su PC/Laptop</strong> perché i sistemi operativi mobile (iOS e Android) bloccano la cattura dell'audio di sistema per rigidi motivi di sicurezza e privacy. Per evitare confusione, l'app la nasconde automaticamente quando ti colleghi da uno smartphone."
    },
    {
        question: "🎵 Posso trascrivere una canzone da YouTube o Spotify?",
        answer: "Il motore di trascrizione è addestrato specificamente per il <em>parlato umano lineare</em> (lezioni, conferenze, dettati). Le canzoni allungano le vocali, alterano il ritmo naturale del discorso e contengono strumenti musicali di sottofondo; l'algoritmo tende a scartare o a confondere questi flussi considerandoli semplicemente come \"rumore\"."
    },
    {
        question: "🔊 Perché sento un effetto eco o il testo si confonde se trascrivo una Call?",
        answer: "Se riproduci l'audio dalle casse del PC e usi contemporaneamente il microfono ambientale, si crea un loop acustico (un corto circuito audio). Per trascrivere video o chiamate senza interferenze usa sempre le <strong>cuffie</strong>, oppure su Windows attiva e seleziona la funzione nativa <strong>\"Missaggio Stereo\"</strong> (Stereo Mix) nelle impostazioni audio di sistema."
    },
    {
        question: "🎤 Il microfono risulta attivo ma l'app non scrive nulla. Cosa faccio?",
        answer: "Se il badge indica che l'app è in ascolto ma il testo non appare nell'area appunti, verifica questi due dettagli:<br>1. <strong>Permessi del browser:</strong> Controlla l'icona del lucchetto nella barra degli indirizzi in alto e assicurati di avant concesso l'uso del microfono a questo sito.<br>2. <strong>Rumore ambientale:</strong> Un ambiente eccessivamente rumoroso o la voce troppo lontana possono confondere l'algoritmo. Prova ad avvicinarti al microfono o a utilizzare un auricolare con microfono integrato."
    },
    {
        question: "⏱️ La trascrizione si interrompe da sola dopo qualche minuto. È normale?",
        answer: "Sì, è un comportamento standard dei servizi Speech-to-Text dei browser. Se rilevano lunghi periodi di silenzio o se la connessione ha un micro-stacco, tendono ad andare in pausa automatica (timeout) per risparmiare risorse. Ti basta cliccare nuovamente sul pulsante di accensione per riprendere il dettato: il testo già presente non verrà toccato o cancellato."
    },
    {
        question: "📲 Come posso installare questa applicazione su smartphone o PC?",
        answer: "Live Speech Text è una <strong>PWA (Progressive Web App)</strong>. Se accedi da un browser supportato (como Chrome o Edge), vedrai apparire una comoda indicazione fluttuante per l'installazione快速. Una volta aggiunta alla schermata Home del telefono o al desktop del PC, potrai avviarla a tutto schermo perdendo la barra del browser, comportandosi a tutti gli effetti come un'applicazione reale."
    },
    {
        question: "🔄 L'applicazione si aggiorna da sola dopo che l'ho aggiunta alla Home?",
        answer: "Sì, l'aggiornamento è completamente automatico. Ogni volta che apri l'app dal tuo smartphone o dal computer, il sistema verifica silenziosamente in background se sono stati rilasciati miglioramenti del codice su GitHub. Se sono presenti novità, queste verranno caricate ed applicate al successivo avvio in modo del tutto invisibile."
    },
    {
        question: "🔒 Come vengono gestiti i miei dati personali e la privacy?",
        answer: "La tua sicurezza è al centro del nostro progetto: i testi che trascrivi non passano e non vengono mai salvati su server esterni, ma rimangono confinati localmente nel browser del tuo dispositivo. Per mantenere lo strumento gratuito, utilizziamo il servizio <strong>Google AdSense</strong> che mostra annunci pubblicitari basati su cookie di profilazione. Puoi personalizzare, accettare o rifiutare questi tracciamenti in ogni momento tramite il banner di consenso o i link legali in fondo alla pagina."
    },
    {
        question: "🐛 Ho riscontrato un bug o un errore visivo. Come posso segnalarlo?",
        answer: "Ci teniamo moltissimo a rendere l'applicazione stabile e fluida! Se noti un blocco del testo, una sovrapposizione nel layout o un comportamento anomalo, puoi scriverci direttamente via e-mail all'indirizzo ufficiale <strong>seekerdcode@gmail.com</strong> (che trovi anche nella sezione About Us)."
    },
    {
        question: "📋 Quali dettagli devo includere nella segnalazione di un errore?",
        answer: "Per aiutarci a isolare e correggere il problema nel minor tempo possibile, quando ci invii una segnalazione ricordati di specificare:<br>• Il dispositivo utilizzato (es. PC Windows 11, MacBook, iPhone 15, smartphone Android).<br>• Il browser web con cui hai aperto l'app (es. Google Chrome, Safari, Mozilla Firefox, Microsoft Edge).<br>• I passaggi precisi che stavi facendo prima che si verificasse l'errore.<br>• Un'eventuale descrizione visiva o uno screenshot del problema allegato all'e-mail."
    }
];

// Questa funzione prende l'array sopra e LO TRASFORMA NEI DIV CHE VUOI TU
function renderizzaLeFaq() {
    const accordionContainer = document.querySelector('#sezione-faq .accordion');
    if (!accordionContainer) return;

    // Svuota il contenitore (se c'era rimasto qualcosa)
    accordionContainer.innerHTML = '';

    // Cicla l'array e ricostruisce la struttura IDENTICA a quella che avevi prima nell'index
    faqData.forEach(item => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        accordionItem.innerHTML = `
            <button class="accordion-header">
                <span>${item.question}</span>
                <span class="icon">▼</span>
            </button>
            <div class="accordion-content">
                <p>${item.answer}</p>
            </div>
        `;
        accordionContainer.appendChild(accordionItem);
    });

    // Una volta creati i div, gli colleghiamo la logica di apertura
    attivaClickFaq(accordionContainer);
}

// Questa funzione gestisce l'apertura e chiusura quando clicchi
function attivaClickFaq(container) {
    container.addEventListener('click', function(e) {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Chiude gli altri per fare un lavoro pulito
        container.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));

        // Se non era attivo, aggiunge .active (che accende il tuo base.css)
        if (!isActive) {
            item.classList.add('active');
        }
    });
}

// Forziamo l'esecuzione immediata non appena lo script viene letto
renderizzaLeFaq();

// E per sicurezza, rieseguiamo se il DOM non era ancora totalmente pronto
document.addEventListener('DOMContentLoaded', renderizzaLeFaq);