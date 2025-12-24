# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
#This is ShopHub, a full-stack e-commerce application.

Tech Stack
Frontend: React (Vite), Tailwind CSS, Framer Motion (for animations), Sonner (for notifications).
Backend: Node.js, Express, MongoDB (Mongoose).
Authentication: JWT-based auth.
Current Features
Product Browsing:
Home page with search and category filtering.
Product details view.
Note: Products are currently hardcoded (mock data) in the frontend App.jsx, not fetched from the DB.
Shopping Cart & Orders:
Add/remove items, update quantity.
Cart total calculation.
Order placement and history view.
Note: Orders are stored in local component state (lost on refresh), not the backend.
Authentication:
Functional Login and Register pages.
Connected to the backend (/api/auth/login & /register).
Uses MongoDB to store users.
The app is in a hybrid state: Authentication is full-stack, but product/order management is currently frontend-only mock data.

