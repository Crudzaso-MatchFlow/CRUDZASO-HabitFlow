# CRUDZASO-HabitFlow Project Structure

## 📁 Carpetas Principales

### `/script/` - JavaScript Files
Todos los archivos JavaScript de la aplicación están centralizados aquí:
- **app.js** - Main application entry point, navigation logic, view management
- **showOferts.js** - Core rendering functions (loadDb, renderCandidates, renderOffers, renderMatches)
- **createOffer.js** - Job offer form submission handler
- **login.js** - User authentication, sign-up/login forms, session management (in-memory)
- **findFilter.js** - Search and filter candidates functionality

### `/css/` - Stylesheets
- **styles.css** - Main stylesheet (243 lines) with:
  - CSS variables for theming (:root)
  - Layout system (flexbox, grid)
  - Component library (cards, badges, buttons)
  - Animations (pulse, slideIn, fadeInUp)
  - Dark mode support
- **login.css** - Login/register page styles (empty, pending implementation)

### `/findFilterUser/` - Feature Module
- **userSearch.html** - Candidate search interface
- **findFilter.js** (original) - May be consolidated to script/ in future

## 📄 Root HTML Files
- **index.html** - Landing page (239 lines)
- **login.html** - Authentication page (124 lines) - references `./script/login.js`
- **register.html** - Registration page (empty)
- **createOffer.html** - Create job offer form (87 lines) - references `./script/createOffer.js`
- **dashboard_user.html** - User dashboard (239 lines) - references `./script/app.js` as module

## 📊 Data Files
- **db.json** - JSON database with candidates, jobOffers, companies, and matches data
- **package.json** - Project dependencies (Bootstrap 5.3.0, etc.)

## 🔄 File Organization Changes (Latest)

### ✅ Completed
- Moved `app.js` → `script/app.js`
- Moved `showOferts.js` → `script/showOferts.js`
- Moved `createOffer.js` → `script/createOffer.js`
- Moved `styles.css` → `css/styles.css`
- Moved `js/login.js` → `script/login.js`
- Created `script/findFilter.js` (copy from findFilterUser/)
- Updated all HTML file script references
- Deleted old duplicate files from root
- Deleted `js/` folder (consolidated to script/)

### Current Status
```
CRUDZASO-HabitFlow/
├── .git/
├── .github/
├── .vscode/
├── css/
│   ├── login.css
│   └── styles.css
├── findFilterUser/
│   ├── findFilter.js
│   └── userSearch.html
├── node_modules/
├── script/
│   ├── app.js
│   ├── createOffer.js
│   ├── findFilter.js
│   ├── login.js
│   └── showOferts.js
├── createOffer.html
├── dashboard_user.html
├── db.json
├── index.html
├── login.html
├── package-lock.json
├── package.json
├── register.html
└── PROJECT_STRUCTURE.md
```

## 🔗 Module Dependencies

### app.js
- Imports: `./showOferts.js`
- Uses: db.json endpoint, DOM elements

### createOffer.js
- Backend API: `http://localhost:3000/jobOffers` (POST)
- Form elements: #formCreateOffer, #titleOffer, #descriptionOffer, etc.

### login.js
- Uses in-memory user storage (currentUserJSON, usersJSON)
- Bootstrap 5.3.0 Tab component

### showOferts.js
- Fetches: `./db.json`
- Pure data-to-HTML rendering functions

### findFilter.js
- Backend API: `http://localhost:3000/candidates` (GET)
- DOM elements: .resultados, #formFilter, #search, #searchForm

## 📱 Bootstrap Integration
All pages reference Bootstrap 5.3.0 via CDN:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

## ⚙️ Setup Instructions

1. Install dependencies: `npm install`
2. Start backend server: `npm start` (if configured)
3. Open `index.html` in browser or serve with local server

## 🚀 Development Notes

- All JS files use ES6 syntax
- CSS uses CSS custom properties (--primary, --sidebar-dark, etc.)
- In-memory session management (no localStorage/backend persistence currently)
- API endpoints configured for localhost:3000
- Git tracking enabled (.git/ directory present)
