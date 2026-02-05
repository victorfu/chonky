# Chonky

Chonky is an AI-powered screenshot and image analysis web app built with React, TypeScript, and Firebase. It uses Firebase AI (Gemini) to explain images, extract or translate text, and generate background cutouts with streaming results.

## ✨ Features

- **Multi-mode Analysis**:
  - **Explain**: Describe image content and UI elements.
  - **OCR**: Extract text while preserving structure.
  - **Translate**: Translate text within images.
  - **Remove Background**: Generate a transparent cutout of the main subject.
- **Model Selection**: Choose Gemini 2.5 Flash, Pro, or Flash Lite.
- **Streaming Results**: Reanalyze, copy output, and download processed images.
- **Smart Uploads**: Drag-and-drop, file selection, and clipboard paste with preview.
- **Sign-in on Demand**: Browse and prepare before signing in; analysis requires Google login.
- **Settings Sync**: Language (en-US, ja-JP, zh-TW), theme (light/dark/system), and profile preferences synced via Firestore.
- **Productivity UX**: Command palette, collapsible sidebar, and keyboard shortcuts.

## 🚀 Tech Stack

- **Frontend**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Zustand
- **Routing**: React Router
- **AI Engine**: Firebase AI (Gemini)
- **Auth/Security**: Firebase Auth (Google), optional Firebase App Check
- **i18n**: i18next + react-i18next
- **Icons**: Lucide React

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Firebase project with:
  - Firebase AI (Gemini) enabled
  - Google sign-in enabled in Firebase Auth
  - (Optional) App Check key for production use

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chonky
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` (recommended).
   - Fill in your Firebase configuration.

### Environment Variables

Required:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Common optional settings:
- `VITE_APP_NAME`
- `VITE_FIREBASE_APPCHECK_KEY` (enable App Check)
- `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` (local dev)
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_FIRESTORE_DATABASE_NAME`

`VITE_API_BASE_URL` is used by the Vite dev server proxy (`vite.config.ts`).

### Firestore Rules

This app stores user settings in Firestore collection `user_settings/{uid}`.

1. Deploy the bundled security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Ensure authenticated users can only read/write their own settings document.

The repository includes:
- `firestore.rules`
- `firebase.json` (points Firestore to the rules file)

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build locally:
```bash
npm run preview
```

## 📂 Project Structure

```text
src/
├── components/      # UI components (auth, layout, screenshots, settings, common, ui)
├── constants/       # Global constants and configuration
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization setup and translations
├── services/        # Firebase + AI services and Firestore-backed settings
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

## 📐 Spec-driven Development

This project follows a spec-driven development approach. Detailed requirements, design documents, and tasks are maintained in the `openspec/` directory:

- **`openspec/specs/`**: Core feature specifications.
- **`openspec/changes/`**: Change proposals and implementation tasks.

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + B`: Toggle sidebar
- `Ctrl/Cmd + K`: Open command palette
- `Ctrl/Cmd + ,`: Open settings
- `Ctrl/Cmd + V`: Paste image from clipboard
- `Escape`: Close modal/panel

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
