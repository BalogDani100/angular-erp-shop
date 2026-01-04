# ERP Shop (Angular)

Mini web shop: product list with search + **infinite scroll**, details page, order form with validation, mock login. State management: **NgRx** (cache + page concatenation).

## ✅ Key features

* **Responsive UI** (mobile → desktop), sticky header + "Back to top" button
* **Product list:** search, client-side filters (price, stock, category), **infinite scroll** (server-side paging), NgRx cache + page concatenation
* **Product details:** image fallback, price formatting
* **Order form:** Reactive Forms, strict validation (email, phone number), cart in `localStorage`, summary
* **Auth:** mock login + guard for the `/order` page, **Auth interceptor** (Bearer token)
* **Testing:** basic unit tests (ProductService, OrderService, Products/Orders effects)

## 🧰 Requirements

* Node 18+
* npm 9+
* (optional) Angular CLI

## 📦 Installation

```bash
npm install
```

## 🧪 Mock API (Postman) – quick guide

**Importable files in the repo:** `postman/erp_mock_collection.json` and `postman/erp_mock_environment.json`
Create a mock server in Postman (official tutorial):

* [https://learning.postman.com/docs/design-apis/mock-apis/set-up-mock-servers/](https://learning.postman.com/docs/design-apis/mock-apis/set-up-mock-servers/)

## 🔧 API setup

Set the API URL here: `src/app/environments/environments.ts`

```ts
export const environment = {
  apiBaseUrl: 'https://<postman-mock-base-url>'
};
```

**Expected endpoints**

```text
GET  /products?page={n}&pageSize={n}&search={text}   -> { page, pageSize, total, products: Product[] }
GET  /products/{id}                                   (fallback: /product/{id})
POST /orders                                          -> { orderId, status, total, timestamp }
POST /auth/login                                      -> { id, name, role, token }
```

## 🚀 Run

```bash
npm start
# then open: http://localhost:4200
```

## ℹ️ Notes

* The mock API URL is not secret; it’s baked into the frontend build.
* Infinite scroll: `IntersectionObserver` loads the next page when you reach the end of the list.

---

## 🧠 AI contribution

* The README was written and edited by the author **with AI assistance**.
* A **significant portion of the CSS/styles is AI-generated**, with manual fine-tuning to fit the project’s needs.
