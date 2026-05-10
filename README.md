🗺️ Il Masterplan: Libreria Giochi ad Alte Prestazioni
Questo è il piano architetturale diviso per fasi di sviluppo. Seguendo questo ordine, eviterai di dover riscrivere codice in futuro.

FASE 1: Setup e Preservazione (La "Capsula del Tempo")
L'obiettivo iniziale è preparare l'ambiente di lavoro con gli strumenti giusti e prepararsi al backup futuro.

- Motore: Installa l'ultima versione LTS di Node.js (e conserva l'eseguibile di installazione in una cartella sicura).

- Inizializzazione: Usa Vite per creare il progetto React (npm create vite@latest). È fondamentale scegliere React e JavaScript (o TypeScript, se lo preferisci).

- Styling: Installa Tailwind CSS seguendo la documentazione ufficiale per Vite.

- Librerie Core: Esegui l'installazione delle librerie fondamentali: npm install framer-motion @tanstack/react-virtual lucide-react.

- Regola d'oro del Backup: Ricorda che, a progetto finito, farai uno ZIP contenente il tuo codice sorgente, la cartella public, la cartella node_modules e l'installer di Node.js.

FASE 2: Struttura Dati e Mocking (Il Falso Online)
Per simulare un'esperienza online mantenendo i file in locale, costruiremo un sistema di caricamento fittizio.

- Organizzazione Asset: Crea una struttura rigida dentro la cartella public del tuo progetto (es. public/assets/covers/ e public/assets/videos/). Inserisci qui le tue copertine ottimizzate (WebP/AVIF) e i video leggeri (MP4 compressi).

- Il Database JSON: Crea un file data.json che farà da "server". Ogni gioco sarà un oggetto con proprietà chiare: id, title, description, coverUrl (es. /assets/covers/game1.webp), videoUrl, releaseYear.

- Logica di Ritardo: Crea una funzione in React (un Custom Hook) per caricare i dati. Invece di importarli e mostrarli subito, usa un setTimeout di 500-1000 millisecondi. Questo ti obbligherà a disegnare dei bellissimi "Skeleton Loader" (rettangoli grigi animati) durante l'attesa, rendendo l'interfaccia molto professionale.

FASE 3: Il Motore Grafico (La Griglia Virtualizzata)
Questa è la fase critica per i 60fps. Se sbagli questa, l'app scatterà.

- Il Container: Crea un div principale che occuperà tutto lo schermo e avrà la proprietà di scorrimento verticale.

- TanStack Virtual: Implementa l'hook useVirtualizer. Gli passerai il numero totale di giochi e l'elemento HTML che funge da scroll.

- Rendering Assoluto: La virtualizzazione funziona calcolando matematicamente la posizione. I tuoi elementi <Card> non staranno uno sotto l'altro naturalmente, ma avranno un posizionamento absolute, e TanStack ti fornirà i valori esatti di top e left per posizionarli sullo schermo istante per istante mentre scrolli.

Fase 4: Micro-Interazioni (L'Hover)
Rendiamo le copertine vive quando l'utente le esplora con il mouse.

- Animazione Base: Usa il componente <motion.div> di Framer Motion per la card. Applica un leggero ingrandimento (scale: 1.05) o un sollevamento sull'asse Y al passaggio del mouse.

- Logica Anti-Spam (Debounce): Non caricare il video appena il mouse tocca la copertina, altrimenti impallerai il browser muovendo il cursore a caso sulla griglia. Usa un setTimeout di circa 300 millisecondi: se il mouse rimane sulla card per quel tempo, fai partire la transizione al video.

- Gestione Video: Il tag <video> deve essere in autoplay, muto e in loop. Fallo apparire in dissolvenza (fade-in) sopra la copertina usando l'opacità.

FASE 5: Macro-Interazioni (Il Click e l'Espansione)
L'effetto "wow" finale: la transizione fluida dalla griglia alla scheda dettaglio.

- Stato Condizionale: Crea una variabile di stato React (es. selectedGame). Se è null, mostri la griglia. Se contiene un gioco, mostri l'interfaccia di dettaglio.

- La Magia del LayoutId: Framer Motion ha una funzione potentissima. Se dai alla copertina nella griglia la proprietà layoutId="cover-123" e dai la STESSA proprietà all'immagine grande nella pagina di dettaglio, Framer Motion calcolerà da solo la traiettoria e farà "volare" l'immagine da una posizione all'altra.

- Layout della Scheda Dettaglio: Progetta lo schermo diviso. L'immagine volerà e si posizionerà sulla sinistra. Sulla destra, farai apparire (con una leggera dissolvenza dal basso) il titolo, la descrizione estesa e le statistiche del gioco. Aggiungi un pulsante "Chiudi" o "Torna indietro" per invertire l'animazione e far tornare l'immagine al suo posto nella griglia.