# Fadil Rafliansyah — Portfolio

Portofolio pribadi dengan tampilan 3D interaktif, dibangun dengan **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **three.js** (React Three Fiber).

## Fitur
- Background 3D (starfield + kristal melayang) yang bergerak mengikuti scroll & mouse
- Inti energi 3D di hero, bola skill 3D interaktif (bisa di-drag)
- Kartu tilt 3D dengan efek kilau, animasi reveal 3D saat scroll
- Fallback otomatis ke animasi 2D bila WebGL tidak tersedia

## Menjalankan secara lokal
```bash
npm install
npm run dev
```

## Build
```bash
npm run build   # output ke folder dist/
```

## Deploy
Di-deploy ke **Vercel** (preset Vite) dan otomatis ter-deploy ulang setiap ada push ke branch `main`.
