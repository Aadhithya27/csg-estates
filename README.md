# C S G Estates — Enterprise Property & Rental Management ERP

A modern, high-performance web ERP for residential and commercial property management. Built with React 19, TypeScript, Vite, Tailwind CSS, and Google Identity Services.

---

## 🚀 Key Features

- **🔐 Google OAuth 2.0 & Owner Authentication**:
  - Official Google Identity Services 2.0 integration (`google.accounts.id`).
  - Decodes Google JWT tokens with verified avatar, email, and user ID.
  - Interactive configuration UI & instant testing fallback mode.
  - Session persistence with security sign-out and Google auto-select protection.

- **🏢 Properties & Rental Homes Management**:
  - Multi-property hierarchy (residential buildings, complexes, villas).
  - Room/Flat occupancy states (`Occupied`, `Vacant`, `Under Maintenance`).
  - Tenant contacts, monthly rent, deposits, and recurring utility charges.

- **🧾 Automated Billing & Arrears Engine**:
  - One-click batch monthly bill generation for all occupied units.
  - Automatic balance carryover (previous unpaid balances added to new bills).
  - Partial payment tracking, remaining dues calculation, and status badges (`Paid`, `Partial`, `Pending`, `Overdue`).

- **📄 Vector PDF Invoices & Thermal Printing**:
  - Professional PDF invoice downloads via `jspdf` & `jspdf-autotable`.
  - 80mm POS Thermal receipt print view with CSS print media formatting.

- **📲 WhatsApp Direct Invoice Dispatch**:
  - Formatted WhatsApp message generator with pre-filled breakdown in Tamil & English.
  - 1-click open directly into WhatsApp / WhatsApp Web with tenant phone number.

- **💾 Zero Data Loss Backup & Restore**:
  - Standalone JSON database export with timestamp.
  - JSON database restore tool with validation.
  - Factory reset protection.

---

## ⚡ Google OAuth 2.0 Setup (3 Steps)

To enable live Google Sign-In with your own Google Cloud project:

1. **Create Google Cloud Credentials**:
   - Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
   - Click **Create Credentials** &rarr; **OAuth client ID**.
   - Application type: **Web application**.

2. **Add Authorized JavaScript Origins**:
   - For local development: `http://localhost:5173` and `http://localhost:4173`
   - For production: `https://your-domain.com` (or your Vercel/Netlify URL)

3. **Configure in App**:
   - Option A: Create a `.env` file from `.env.example`:
     ```env
     VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
     ```
   - Option B: Click **⚙ System Settings** &rarr; **Google Authentication** inside the app and paste your Client ID directly into the input box!

---

## 🛠️ Development & Production Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run type-checking & production build
npm run build

# Preview production build locally
npm run preview

# Run fast Oxlint code analysis
npm run lint
```

---

## 🌐 Ready to Launch / Deployment

The application is completely static and ready to host anywhere:

### Deploy to Vercel
```bash
npx vercel
```
Or push to GitHub and connect repository to [Vercel](https://vercel.com) (Framework: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).

### Deploy to Netlify
```bash
npx netlify deploy --prod --dir=dist
```
Or drag-and-drop the generated `dist/` folder directly into [Netlify Drop](https://app.netlify.com/drop).

---

*C S G Estates — Engineered for seamless property operations.*
