# How to run Charter locally

## First time setup

1. Open Terminal (or Git Bash / Command Prompt)
2. Navigate to this folder:
   ```
   cd "C:\Users\kelvi\Documents\Claude\Projects\Charter"
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Run the app

```
npm run dev
```

The app will open automatically at **http://localhost:3000**

## Build for production (optional)

```
npm run build
```

This creates a `dist/` folder you can deploy anywhere (Netlify, Vercel, GitHub Pages).

To preview the production build locally:
```
npm run preview
```

## Notes

- All data is saved in your browser's localStorage — no internet needed
- The demo squad (Riverside FC, 12 players) loads automatically on first launch
- Clearing browser data will reset the app
- The app is installable as a PWA — look for "Install" in your browser's address bar
- Works on Chrome, Edge, Firefox, and Safari
