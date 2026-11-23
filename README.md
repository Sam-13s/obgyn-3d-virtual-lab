# OB-GYN 3D Virtual Lab

A full-stack educational project starter for GNM third-year Obstetrics & Gynaecology. Frontend: React + Vite + Three.js (React Three Fiber). Backend: Django REST Framework + SQLite.

## Included
- Responsive dark medical dashboard
- Eight learning modules with topic outlines
- Interactive 3D viewer (rotate, zoom, select structures)
- Pregnancy timeline and four-stage labour learning flow
- Five-question MCQ quiz with answer explanations
- Django REST API, SQLite models, admin and seed command
- GLB/GLTF asset loading hook in the 3D viewer

> Clinical safety: This is an educational prototype, not a diagnostic or treatment system. Have all clinical content and procedures reviewed by your GNM faculty and use current approved guidelines. The built-in procedural meshes are illustrative placeholders, not anatomically validated organs. Replace them with properly licensed and faculty-reviewed GLB/GLTF models for realistic anatomy.

## Requirements
- Node.js 20+ and npm
- Python 3.10+

## 1. Start the Django backend

Windows PowerShell:
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py makemigrations lab
python manage.py migrate
python manage.py seed_lab
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8010
```

If `py` or `python` is not recognized on Windows, install Python from python.org and enable **Add python.exe to PATH**. If your project already has a virtual environment, use its interpreter directly, e.g. `..\.venv\Scripts\python.exe -m pip install -r requirements.txt` (adjust the path to your environment).

Backend URLs:
- `http://127.0.0.1:8010/api/health/`
- `http://127.0.0.1:8010/api/modules/`
- `http://127.0.0.1:8010/api/quiz/questions/`
- `http://127.0.0.1:8000/admin/`

## 2. Start the React frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

The Vite development server proxies `/api` requests to Django at `127.0.0.1:8010`.

## Accounts and administrator access

- Learners can create an account from the sign-up page. Passwords are validated and stored using Django's password hasher; the browser only receives a secure session cookie.
- Sign in with a username or email. Quiz attempts submitted while signed in are linked to that account; older unlinked attempts stay unassigned.
- Administrators must be provisioned by a Django superuser. Create the first administrator with `python manage.py createsuperuser`; additional staff accounts can be granted through Django Admin at `/admin/`.
- Staff accounts see **User Management** in the lab. It shows learner names, email, account status, join date and quiz activity. Staff can suspend or reactivate learner accounts; only a superuser can change another staff account. Passwords are never shown.
- **My Progress** records module visits, foreground time while a learning page is visible and focused, and quiz attempts scored by Django. It does not invent completion percentages or mark a module complete just because it was opened. Time is an engagement estimate, not proof of attention or understanding.
- Account creation and sign-in use CSRF protection. For deployment, set a unique `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`, and the HTTPS CORS/CSRF origins; serve the frontend and API over HTTPS.

## 3. 3D anatomy, rigged animation and annotation

The Female Reproductive Anatomy viewer uses a locally served, 27-part GLB based on the HuBMAP Human Reference Atlas 3D Reference Object Library. The model is adapted from OrganUI's commit-pinned copy and is licensed CC BY 4.0. Its attribution is shown in the viewer and recorded in `frontend/assets/ATTRIBUTION.md`.

- `Reference GLB` shows separately selectable uterine, cervical, tubal, ovarian, vessel, ligament and bladder structures. Small labels sit outside the main anatomy, use leader arrows, and highlight the associated mesh when selected.
- `Cutaway view` shows the endometrium and uterine cavity, which are not separate parts of the atlas GLB.
- The local GLB includes a four-joint skin and an explicitly illustrative uterine contraction/relaxation animation clip. The viewer provides play/pause and speed controls. The clip is not a clinical simulation.
- A procedural cutaway remains available if the GLB cannot be loaded. In production, the service worker caches the app shell, eager JavaScript/CSS assets and the GLB. It does not cache `/api/` responses or personal data; authentication, progress sync and assessments still need the backend.
- The source model is kept in `frontend/assets/reproductive-source.glb`. Run `python scripts/rig-reproductive-model.py` from `frontend/` to regenerate `public/models/reproductive-rigged.glb` after model changes. Obtain and attribute additional GLB models before replacing anatomy in other specialized lessons.

## 4. API integration notes

The frontend uses local starter module content and Django session authentication. The API also serves modules and quiz data. Authenticated quiz submissions are linked to the current learner. For example:
```js
import axios from 'axios';
const API = axios.create({ baseURL: '/api', withCredentials: true });
const modules = await API.get('/modules/');
```
Quiz submission:
```js
await API.post('/quiz/submit/', {
  answers: { '0': 1, '1': 2, '2': 1, '3': 0, '4': 1 }
});
```

## 5. Tests and production security

Run the frontend asset and animation tests, then build the production frontend:

```powershell
cd frontend
npm run test
npm run build
```

Run the backend security tests and full Django test suite:

```powershell
cd backend
..\.venv\Scripts\python.exe manage.py test
```

For production, configure at least:

```text
DJANGO_SECRET_KEY=<unique secret>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=api.example.org
DJANGO_CORS_ALLOWED_ORIGINS=https://app.example.org
DJANGO_CSRF_TRUSTED_ORIGINS=https://app.example.org
```

With `DJANGO_DEBUG=0`, Django enables HTTPS redirects by default, secure session/CSRF cookies, one-year HSTS, `nosniff`, a strict referrer policy, same-origin opener policy and `X-Frame-Options: DENY`. HSTS subdomains and preload remain off unless explicitly enabled. When TLS terminates at a reverse proxy, set `DJANGO_TRUST_X_FORWARDED_PROTO=1` only if that trusted proxy overwrites `X-Forwarded-Proto`. The frontend's `public/_headers` supplies common static-host security headers where the host supports that file; configure equivalent headers on other hosts.

## 6. Suggested next development tasks
- Add institution branding and faculty-reviewed course content.
- Add faculty-reviewed lesson text, citations and image/asset credits.
- Add more detailed quiz banks and module-specific assessments.
- Commission or source additional faculty-reviewed GLB models for the pregnancy, fetal, labour and specialty simulations, with suitable licenses and attribution.
- Expand keyboard and reduced-motion controls across each specialist lab.

## Folder structure
```text
obgyn-3d-virtual-lab/
??? README.md
??? frontend/
?   ??? assets/                     # Source GLB and attribution
?   ??? public/models/              # Optimized, served GLB
?   ??? public/sw.js                # Offline app/model cache
?   ??? scripts/                    # GLB rig builder and asset tests
?   ??? src/components/             # Reusable 3D scene components
?   ??? src/data/                   # Model annotations and learning data
?   ??? package.json
??? backend/
    ??? config/                     # Django settings, URLs and security tests
    ??? lab/                        # Models, API, admin, seed command
    ??? manage.py
    ??? requirements.txt
```
