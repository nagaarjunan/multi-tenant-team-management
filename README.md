# Multi-Tenant Team Management Platform (Nexus Web)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

**Enterprise-grade client application for the Multi-Tenant Team Management SaaS platform, featuring sprint roadmaps, kanban execution, organization management, and dynamic role-based access control (RBAC).**

</div>

---

## 📌 Overview

**Nexus Web** is the modern frontend interface of the **Multi-Tenant Team Management** B2B SaaS platform. Built on **React 19**, **Vite**, **shadcn/ui**, and **TypeScript**, it delivers an ultra-fast, responsive dashboard for cross-functional product and engineering teams.

---

## ⚡ Key Frontend Features

- 🏢 **Multi-Tenant Organization Switcher**: Instantly toggle between Personal Workspaces and Organization Workspaces without re-authenticating.
- 📋 **Agile Sprint Boards**: Interactive Kanban board pipelines with drag-and-drop task lifecycle management.
- 👥 **Team & Member Management**: Role matrices (`ORG_OWNER`, `ORG_ADMIN`, `PROJECT_LEAD`, `MEMBER`, `GUEST`), invite link generators, and seat allocation.
- 🎨 **Adaptive Design & Theming**: Built-in dark/light mode system with custom primary palette presets and fluid micro-interactions.
- 🔐 **Secure Auth Flows**: Credentials login, Google OAuth SSO, and password recovery interfaces with client-side validation.
- 🛡 **Route-Level Permission Guards**: Fine-grained RBAC wrappers preventing unauthorized access to administrative views.

---

## 💻 Tech Stack

- **Framework**: React 19 (Hooks, Concurrent Features)
- **Language**: TypeScript 5.7 (Strict Mode)
- **Build Tool**: Vite 6
- **UI Components**: shadcn/ui & Radix UI primitives
- **Styling**: Tailwind CSS & CSS Variables
- **Icons**: Lucide React & Iconify
- **State Management**: Zustand
- **Server Cache**: TanStack React Query v5
- **Routing**: React Router v7

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 2. Configure Environment
Create `.env`:
```env
VITE_APP_PUBLIC_PATH=/
VITE_APP_DEFAULT_ROUTE=/workbench
VITE_APP_API_BASE_URL=/api
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3001`.

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
