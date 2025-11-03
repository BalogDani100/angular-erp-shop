# ERP Shop (Angular)

Mini webshop: terméklista kereséssel + **infinite scroll**, részletező oldal, rendelés űrlap validációval, mock login. Állapotkezelés: **NgRx** (cache + lapok összefűzése).

## ✅ Fő funkciók
- Terméklista kereséssel, **infinite scroll** (server-side paging, NgRx cache)
- Termék részletező (kép fallback)
- Rendelés űrlap (Reactive Forms, validáció, összegzés; kosár: `localStorage`)
- Mock login + guard az `/order` oldalra
- „Back to top” lebegő gomb

## 🧰 Követelmények
- Node 18+
- npm 9+
- (opcionális) Angular CLI

## 📦 Telepítés
```bash
npm install
```

## 🧪 Mock API (Postman) – gyors útmutató
**Importálható fájlok a repóban:** `postman/erp_mock_collection.json` és `postman/erp_mock_environment.json`  
Mock szerver létrehozása Postmanben (hivatalos tutorial):
- https://learning.postman.com/docs/design-apis/mock-apis/set-up-mock-servers/

## 🔧 API beállítás
Állítsd be az API URL-t itt: `src/app/environments/environments.ts`

```ts
export const environment = {
  apiBaseUrl: 'https://<postman-mock-base-url>'
};
```

**Elvárt végpontok**
```text
GET  /products?page={n}&pageSize={n}&search={text}   -> { page, pageSize, total, products: Product[] }
GET  /products/{id}                                   (fallback: /product/{id})
POST /orders                                          -> { orderId, status, total, timestamp }
POST /auth/login                                      -> { id, name, role, token }
```

## 🚀 Futtatás
```bash
npm start
# majd nyisd meg: http://localhost:4200
```

## ℹ️ Megjegyzések
- A mock API URL nem titok; a frontend buildbe beég.
- Infinite scroll: `IntersectionObserver` tölti a következő oldalt, amikor a lista aljára érsz.

---

## 🧠 AI közreműködés
- A README a szerző által **AI segítségével** készült és került szerkesztésre.
- A megírt unit tesztek (services & effects) **AI támogatással** készültek, emberi felülvizsgálattal.
- A CSS/stílusok **jelentős része AI-generált**, a projekt igényeihez igazítva kézi finomhangolással.
