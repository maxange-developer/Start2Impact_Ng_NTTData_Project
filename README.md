# UrbanMind - Start2Impact NTTData Project

Applicazione Angular full-stack per la gestione di utenti, post e commenti utilizzando l'API GoREST. Questo progetto è stato sviluppato come parte del percorso **Start2Impact x NTTData**.

![Angular](https://img.shields.io/badge/Angular-17.3.12-red?style=flat&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-blue?style=flat&logo=typescript)
![PrimeNG](https://img.shields.io/badge/PrimeNG-17.18.11-orange?style=flat)
![Express](https://img.shields.io/badge/Express-4.21.2-green?style=flat&logo=express)

## 📋 Indice

- [Panoramica del Progetto](#-panoramica-del-progetto)
- [Funzionalità Principali](#-funzionalità-principali)
- [Architettura dell'Applicazione](#-architettura-dellapplicazione)
- [Tecnologie e Librerie](#-tecnologie-e-librerie)
- [Prerequisiti](#-prerequisiti)
- [Installazione e Configurazione](#-installazione-e-configurazione)
- [Configurazione dell'API](#-configurazione-dellapi)
- [Avvio dell'Applicazione](#-avvio-dellapplicazione)
- [Testing](#-testing)
- [Build e Deploy](#-build-e-deploy)
- [Struttura del Progetto](#-struttura-del-progetto)
- [API e Servizi](#-api-e-servizi)
- [Componenti Principali](#-componenti-principali)
- [Troubleshooting](#-troubleshooting)
- [Sviluppo e Contribuzioni](#-sviluppo-e-contribuzioni)

## 🚀 Panoramica del Progetto

**UrbanMind** è una piattaforma social moderna che consente agli utenti di gestire profili, creare e visualizzare post, e interagire attraverso commenti. L'applicazione è costruita con Angular 17 e utilizza PrimeNG per l'interfaccia utente, implementando il pattern architetturale moderno con lazy loading e guard di autenticazione.

### Caratteristiche Principali

- 🔐 **Sistema di autenticazione** basato su token GoREST
- 👥 **Gestione completa degli utenti** (CRUD operations)
- 📝 **Sistema di posting** con creazione, modifica ed eliminazione
- 💬 **Sistema di commenti** interattivo
- 📱 **Design responsive** e moderno
- 🚀 **Server-Side Rendering (SSR)** per performance ottimali
- 🧪 **Test coverage completo** con Jasmine e Karma
- 🎨 **UI professionale** con PrimeNG e PrimeFlex

## ✨ Funzionalità Principali

### 1. Sistema di Autenticazione

- **Login con Token GoREST**: Inserimento sicuro del token API
- **Registrazione Guidata**: Creazione assistita di nuovi utenti con validazione
- **Session Management**: Gestione persistente delle sessioni utente
- **Route Protection**: Guard di autenticazione per proteggere le route

### 2. Gestione Utenti

- **Visualizzazione Utenti**: Lista paginata con filtri e ricerca
- **Creazione Utenti**: Form completo con validazione in tempo reale
- **Modifica Profili**: Aggiornamento di informazioni utente esistenti
- **Eliminazione**: Rimozione sicura con conferma
- **Dettaglio Utente**: Vista dedicata con post dell'utente

### 3. Sistema di Post

- **Creazione Post**: Editor rich per contenuti con anteprima
- **Gestione Completa**: Modifica ed eliminazione post esistenti
- **Associazione Autori**: Selezione dell'autore dal database utenti
- **Filtri Avanzati**: Ricerca per titolo, autore o contenuto
- **Paginazione**: Navigazione efficiente di grandi dataset

### 4. Sistema di Commenti

- **Commenti Interattivi**: Visualizzazione e creazione in tempo reale
- **Validazione Form**: Controlli su nome, email e contenuto
- **Loading States**: Feedback visivo durante le operazioni
- **Gestione Errori**: Messaggi informativi per l'utente

### 5. Interfaccia Utente Avanzata

- **Design Responsive**: Ottimizzazione per desktop, tablet e mobile
- **Tooltip Informativi**: Guida contestuale per l'utente
- **Messaggi di Stato**: Notifiche toast per feedback operazioni
- **Temi Personalizzabili**: Supporto per temi scuri e chiari
- **Animazioni Fluide**: Transizioni smooth tra le viste

## 🏗️ Architettura dell'Applicazione

L'applicazione segue un'architettura modulare Angular con pattern best practices:

```
src/app/
├── @core/                 # Servizi core e modelli condivisi
│   ├── interceptors/      # HTTP interceptors per auth
│   ├── models/           # Interfacce TypeScript per API
│   └── services/         # Servizi business logic
├── components/           # Componenti riutilizzabili
│   ├── main-layout/     # Layout principale con navigation
│   ├── posts/           # Gestione post e commenti
│   ├── users/           # Gestione utenti
│   └── user-detail/     # Dettaglio singolo utente
└── pages/               # Pagine principali
    ├── home/            # Dashboard principale
    └── login/           # Autenticazione
```

### Pattern Architetturali Implementati

- **Lazy Loading**: Caricamento moduli on-demand
- **Guard Pattern**: Protezione route con AuthGuard
- **Service Layer**: Separazione business logic
- **Interceptor Pattern**: Gestione centralizzata HTTP
- **Observer Pattern**: Gestione reattiva con RxJS

## 🛠️ Tecnologie e Librerie

### Framework e Librerie Core

- **Angular 17.3.12** - Framework principale
- **TypeScript 5.4.2** - Linguaggio di programmazione
- **RxJS 7.8.0** - Programmazione reattiva
- **Express 4.21.2** - Server backend per SSR

### UI e Styling

- **PrimeNG 17.18.11** - Libreria componenti UI
- **PrimeFlex 3.3.1** - Sistema CSS Flexbox
- **PrimeIcons 7.0.0** - Set di icone
- **PostCSS 8.4.47** - Processore CSS
- **Autoprefixer 10.4.20** - Vendor prefixes automatici

### Testing e Development

- **Jasmine 5.1.0** - Framework di testing
- **Karma 6.4.0** - Test runner
- **Angular DevKit** - Strumenti di sviluppo
- **Angular CDK 17.3.10** - Component Development Kit

### Server e Build

- **Angular SSR** - Server-Side Rendering
- **Node.js** - Runtime JavaScript
- **Angular CLI 17.3.10** - Strumenti build

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

### Software Richiesto

- **Node.js** (versione 18.18.0 o superiore)
- **npm** (versione 8.0.0 o superiore)
- **Angular CLI** (versione 17.3.10)

### Verifiche Prerequisiti

Verifica le versioni installate:

```bash
# Verifica Node.js
node --version

# Verifica npm
npm --version

# Verifica Angular CLI
ng version
```

### Token GoREST (Opzionale)

Per utilizzare l'API reale invece dei dati mock:

1. Visita [GoREST.co.in](https://gorest.co.in/)
2. Crea un account gratuito
3. Genera un access token

## 🔧 Installazione e Configurazione

### 1. Clone del Repository

```bash
# Clona il repository
git clone https://github.com/maxange-developer/Start2Impact_Ng_NTTData_Project.git

# Naviga nella directory del progetto
cd Start2Impact_Ng_NTTData_Project
```

### 2. Installazione delle Dipendenze

```bash
# Installa tutte le dipendenze
npm install

# Verifica l'installazione
npm list --depth=0
```

### 3. Installazione Angular CLI (se necessario)

```bash
# Installazione globale Angular CLI
npm install -g @angular/cli@17.3.10

# Verifica installazione
ng version
```

## ⚙️ Configurazione dell'API

L'applicazione supporta due modalità di funzionamento:

### Modalità Mock Data (Default)

Utilizza dati di test locali per sviluppo rapido:

```typescript
// src/app/@core/services/config.service.ts
private readonly config = {
  useMockData: true,  // Usa dati mock
  apiTimeout: 5000,
  retryAttempts: 3,
  development: true,
};
```

### Modalità API Reale

Per utilizzare l'API GoREST:

1. **Modifica la configurazione**:

```typescript
// src/app/@core/services/config.service.ts
private readonly config = {
  useMockData: false,  // Usa API reale
  apiTimeout: 5000,
  retryAttempts: 3,
  development: false,
};
```

2. **Ottieni un token GoREST**:
   - Registrati su [GoREST.co.in](https://gorest.co.in/)
   - Copia il tuo access token
   - Usa il token durante il login nell'applicazione

## 🚀 Avvio dell'Applicazione

### Modalità Sviluppo

```bash
# Avvia il server di sviluppo
npm start
# oppure
ng serve

# L'applicazione sarà disponibile su:
# http://localhost:4200
```

### Modalità Sviluppo con Watch

```bash
# Build automatico al cambio dei file
npm run watch
# oppure
ng build --watch --configuration development
```

### Modalità Server-Side Rendering

```bash
# Build per SSR
ng build

# Avvia il server SSR
npm run serve:ssr:Start2Impact_NTTData_Angular
# oppure
node dist/start2-impact-nttdata-angular/server/server.mjs
```

### Configurazioni Avanzate

#### Porta Personalizzata

```bash
# Avvia su porta specifica
ng serve --port 4300
```

#### Host Personalizzato

```bash
# Accessibile da rete locale
ng serve --host 0.0.0.0
```

#### Modalità Produzione Locale

```bash
# Build di produzione
ng build --configuration production

# Servire build di produzione
npx http-server dist/start2-impact-nttdata-angular/browser
```

## 🧪 Testing

### Test Unitari

```bash
# Esegui tutti i test una volta
npm test
# oppure
ng test --watch=false

# Esegui test in modalità watch
ng test

# Test con coverage
ng test --code-coverage
```

### Test Coverage Report

```bash
# Genera report di coverage
ng test --code-coverage --watch=false

# I report sono disponibili in:
# coverage/Start2Impact_NTTData_Angular/index.html
```

### Test Specifici

```bash
# Test di un singolo file
ng test --include='**/users.component.spec.ts'

# Test con browser headless
ng test --browsers=ChromeHeadless --watch=false
```

### Test di Integrazione

```bash
# Verifica build di produzione
ng build --configuration production

# Test del server SSR
npm run serve:ssr:Start2Impact_NTTData_Angular
```

## 📦 Build e Deploy

### Build di Sviluppo

```bash
# Build per sviluppo
ng build
# Output: dist/start2-impact-nttdata-angular/
```

### Build di Produzione

```bash
# Build ottimizzato per produzione
ng build --configuration production

# Build con analisi bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/start2-impact-nttdata-angular/browser/stats.json
```

### Deploy Static

```bash
# Build per hosting statico
ng build --configuration production --base-href="/your-app-path/"

# I file sono pronti in:
# dist/start2-impact-nttdata-angular/browser/
```

### Deploy Server

```bash
# Build completo per server
ng build --configuration production

# Avvia il server di produzione
node dist/start2-impact-nttdata-angular/server/server.mjs
```

## 📁 Struttura del Progetto

```
Start2Impact_Ng_NTTData_Project/
├── src/
│   ├── app/
│   │   ├── @core/                    # Core module
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts        # HTTP auth interceptor
│   │   │   │   └── auth.interceptor.spec.ts
│   │   │   ├── models/
│   │   │   │   ├── users.ts                   # User interfaces
│   │   │   │   ├── posts.ts                   # Post interfaces
│   │   │   │   └── comments.ts                # Comment interfaces
│   │   │   └── services/
│   │   │       ├── auth/
│   │   │       │   ├── auth.service.ts        # Authentication service
│   │   │       │   └── auth.guard.ts          # Route guard
│   │   │       ├── users.service.ts           # Users API service
│   │   │       ├── posts.service.ts           # Posts API service
│   │   │       ├── comments.service.ts        # Comments API service
│   │   │       ├── config.service.ts          # App configuration
│   │   │       └── tooltip.service.ts         # Tooltip management
│   │   ├── components/
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts   # Main navigation layout
│   │   │   │   ├── main-layout.component.html
│   │   │   │   ├── main-layout.component.css
│   │   │   │   └── main-layout.module.ts
│   │   │   ├── users/
│   │   │   │   ├── users.component.ts         # Users management
│   │   │   │   ├── users.component.html
│   │   │   │   ├── users.component.css
│   │   │   │   └── users.module.ts
│   │   │   ├── user-detail/
│   │   │   │   ├── user-detail.component.ts   # Single user view
│   │   │   │   ├── user-detail.component.html
│   │   │   │   ├── user-detail.component.css
│   │   │   │   └── user-detail.module.ts
│   │   │   └── posts/
│   │   │       ├── posts.component.ts         # Posts & comments
│   │   │       ├── posts.component.html
│   │   │       ├── posts.component.css
│   │   │       └── posts.module.ts
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts          # Dashboard
│   │   │   │   ├── home.component.html
│   │   │   │   ├── home.component.css
│   │   │   │   └── home.module.ts
│   │   │   └── login/
│   │   │       ├── login.component.ts         # Authentication
│   │   │       ├── login.component.html
│   │   │       ├── login.component.css
│   │   │       └── login.module.ts
│   │   ├── app-routing.module.ts              # Main routing
│   │   ├── app.component.ts                   # Root component
│   │   ├── app.module.ts                      # Root module
│   │   └── app.module.server.ts               # SSR module
│   ├── assets/                                # Static assets
│   ├── styles.css                             # Global styles
│   ├── index.html                             # Main HTML template
│   ├── main.ts                                # Bootstrap file
│   └── main.server.ts                         # SSR bootstrap
├── coverage/                                  # Test coverage reports
├── dist/                                      # Build output
├── angular.json                               # Angular workspace config
├── karma.conf.js                              # Testing configuration
├── package.json                               # Dependencies
├── server.ts                                  # Express server setup
├── tsconfig.json                              # TypeScript config
└── README.md                                  # Questo file
```

## 🔌 API e Servizi

### UsersService

Gestisce tutte le operazioni CRUD per gli utenti:

```typescript
// Esempi di utilizzo
await this.usersService.getUsers(page, limit, search);
await this.usersService.createUser(userData);
await this.usersService.updateUser(userId, userData);
await this.usersService.deleteUser(userId);
await this.usersService.getUserById(userId);
```

### PostsService

Gestisce post e la loro relazione con gli utenti:

```typescript
// Esempi di utilizzo
await this.postsService.getPosts(page, limit, filters);
await this.postsService.createPost(postData);
await this.postsService.updatePost(postId, postData);
await this.postsService.deletePost(postId);
await this.postsService.getPostsByUser(userId);
```

### CommentsService

Gestisce i commenti associati ai post:

```typescript
// Esempi di utilizzo
await this.commentsService.getCommentsByPost(postId);
await this.commentsService.createComment(commentData);
await this.commentsService.deleteComment(commentId);
```

### AuthService

Gestisce autenticazione e autorizzazione:

```typescript
// Esempi di utilizzo
this.authService.login(token);
this.authService.logout();
this.authService.isAuthenticated();
this.authService.getToken();
```

### ConfigService

Gestisce la configurazione globale dell'applicazione:

```typescript
// Configurazione centralizzata
this.configService.useMockData;
this.configService.apiTimeout;
this.configService.development;
```

## 🧩 Componenti Principali

### LoginComponent

- **Scopo**: Gestione autenticazione utente
- **Funzionalità**:
  - Input token GoREST con validazione
  - Registrazione guidata nuovi utenti
  - Gestione errori di autenticazione
  - Redirect automatico post-login

### MainLayoutComponent

- **Scopo**: Layout principale con navigazione
- **Funzionalità**:
  - Menu sidebar responsive
  - Gestione route attive
  - Logout e gestione sessione
  - Breadcrumb navigation

### UsersComponent

- **Scopo**: Gestione completa utenti
- **Funzionalità**:
  - Lista paginata con filtri
  - Form creazione/modifica
  - Eliminazione con conferma
  - Ricerca in tempo reale
  - Export/Import dati

### PostsComponent

- **Scopo**: Gestione post e commenti
- **Funzionalità**:
  - Creazione post con editor
  - Gestione commenti per post
  - Filtri avanzati
  - Associazione autori
  - Anteprima contenuti

### UserDetailComponent

- **Scopo**: Vista dettagliata singolo utente
- **Funzionalità**:
  - Informazioni complete utente
  - Lista post dell'utente
  - Statistiche attività
  - Azioni rapide

### HomeComponent

- **Scopo**: Dashboard principale
- **Funzionalità**:
  - Panoramica statistiche
  - Azioni rapide
  - Navigazione facilitata
  - Widget informativi

## 🚨 Troubleshooting

### Problemi Comuni

#### Errore: Module not found

```bash
# Pulisci e reinstalla dipendenze
rm -rf node_modules
rm package-lock.json
npm install
```

#### Errore: Port already in use

```bash
# Trova e termina processo sulla porta 4200
npx kill-port 4200

# Oppure usa una porta diversa
ng serve --port 4300
```

#### Errore: Angular CLI version mismatch

```bash
# Aggiorna Angular CLI globalmente
npm uninstall -g @angular/cli
npm install -g @angular/cli@17.3.10

# Aggiorna CLI locale
ng update @angular/cli @angular/core
```

#### Errore: Cannot find module '@angular/...'

```bash
# Reinstalla Angular dependencies
npm install @angular/core @angular/common @angular/forms @angular/router
```

#### Problemi con l'API GoREST

1. **Verifica la configurazione**:

   ```typescript
   // config.service.ts
   useMockData: false; // Per API reale
   ```

2. **Controlla il token**:

   - Token valido su GoREST.co.in
   - Token non scaduto
   - Permessi sufficienti

3. **Fallback ai dati mock**:
   ```typescript
   // config.service.ts
   useMockData: true; // Per sviluppo
   ```

#### Errori di Build

```bash
# Build con dettagli errori
ng build --verbose

# Controlla sintassi TypeScript
npx tsc --noEmit

# Pulisci cache Angular
ng cache clean
```

#### Problemi di Performance

```bash
# Analizza bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/start2-impact-nttdata-angular/browser/stats.json

# Controlla memory leaks
ng serve --memory-limit=4096
```

### Log e Debug

#### Abilitare log dettagliati

```typescript
// main.ts
import { enableProdMode } from "@angular/core";
import { environment } from "./environments/environment";

if (!environment.production) {
  // Abilita debug mode
  console.log("Debug mode enabled");
}
```

#### Console del browser

- **F12** per aprire DevTools
- **Console** per log applicazione
- **Network** per chiamate API
- **Application** per storage

### Supporto e Risorse

- **Documentazione Angular**: [angular.io](https://angular.io)
- **PrimeNG Docs**: [primefaces.org/primeng](https://primefaces.org/primeng)
- **GoREST API**: [gorest.co.in](https://gorest.co.in)
- **TypeScript Docs**: [typescriptlang.org](https://www.typescriptlang.org)

## 👨‍💻 Sviluppo e Contribuzioni

### Setup Ambiente di Sviluppo

1. **Fork il repository**
2. **Clone del fork**:

   ```bash
   git clone https://github.com/tuo-username/Start2Impact_Ng_NTTData_Project.git
   ```

3. **Installa dipendenze**:

   ```bash
   npm install
   ```

4. **Crea branch feature**:
   ```bash
   git checkout -b feature/nome-feature
   ```

### Standard di Codice

#### Convenzioni Naming

- **Componenti**: PascalCase (`UserDetailComponent`)
- **Servizi**: PascalCase + Service (`UsersService`)
- **File**: kebab-case (`user-detail.component.ts`)
- **Variabili**: camelCase (`currentUser`)
- **Costanti**: UPPER_SNAKE_CASE (`API_BASE_URL`)

#### Struttura File

```typescript
// Imports ordinati
import { Component } from "@angular/core";
import { Service } from "./service";

// Decoratori con configurazione
@Component({
  selector: "app-component",
  templateUrl: "./component.html",
  styleUrls: ["./component.css"],
})

// Classe con JSDoc
/**
 * Descrizione componente
 */
export class ComponentName {
  // Proprietà pubbliche
  // Proprietà private
  // Constructor
  // Lifecycle hooks
  // Metodi pubblici
  // Metodi privati
}
```

### Testing Guidelines

#### Test Unitari

```typescript
describe("ComponentName", () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentName],
      imports: [HttpClientTestingModule],
      providers: [ServiceName],
    });
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

#### Coverage Minimo

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Processo di Contribuzione

1. **Crea Issue** per nuove features
2. **Sviluppa** in branch dedicato
3. **Testa** completamente le modifiche
4. **Documenta** i cambiamenti
5. **Crea Pull Request** con descrizione dettagliata

### Release Notes

Mantieni il file `CHANGELOG.md` aggiornato con:

- **Added**: Nuove funzionalità
- **Changed**: Modifiche a funzionalità esistenti
- **Deprecated**: Funzionalità deprecate
- **Removed**: Funzionalità rimosse
- **Fixed**: Bug fix
- **Security**: Correzioni di sicurezza

---

## 📄 Licenza

Questo progetto è sviluppato per scopi educativi come parte del percorso **Start2Impact x NTTData**.

## 👥 Autore

Sviluppato da **Massimiliano Angelone** per il progetto Start2Impact NTTData.

---

**🎯 Ready to start? Segui le istruzioni di installazione e inizia a esplorare UrbanMind!**
