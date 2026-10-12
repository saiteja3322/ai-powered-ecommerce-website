# Enterprise AI-Powered E-Commerce Platform

A production-ready, full-stack enterprise e-commerce platform built with **React, Redux Toolkit, Node.js, Express, MongoDB/In-memory driver, Google Gemini API, and OpenAI API**.

![OmniStore AI Architecture](https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200)

---

## 🌟 Key Features

### 1. 🤖 AI Capabilities
- **Floating AI Shopping Assistant (OmniAI)**: Contextual customer support chatbot available on every page. Answers queries about products, shipping rules, return policy, and warranty.
- **Smart Natural Language Search**: Enter natural queries like *"Gaming laptop under $2000"* or *"Running shoes"* to automatically filter categories, prices, and keywords.
- **AI Product Comparison**: Select 2-4 products to generate a side-by-side technical specs matrix with AI recommendations (Best Overall, Best Value, Summary).
- **AI Customer Review Summarizer**: Instant breakdown of customer reviews into Key Pros, Things to Consider, and Sentiment Verdict.
- **Admin AI Description Generator**: Auto-generate marketing copy and descriptions for new product listings.

### 2. 🛒 E-Commerce & Checkout Funnel
- **Multi-Facet Catalog Filtering**: Filter by category, brand, price slider, rating, stock status, and active discounts.
- **Dynamic Shopping Cart**: Manage quantities, apply discount coupon codes (e.g. `SAVE20`, `FLAT50`), view tax and shipping fees.
- **Multi-Step Checkout**: Shipping address management, payment method selection (Stripe Credit Card, Razorpay UPI/Netbanking, Cash on Delivery), and order confirmation.

### 3. 🛡️ Dashboards & Role-Based Control
- **User Dashboard**: Track orders with status timeline (Pending → Confirmed → Packed → Shipped → Delivered), view saved wishlist, and download printable PDF Tax Invoices.
- **Admin Analytics Dashboard**: KPI metrics, Chart.js revenue & sales graphs, Product CRUD table with AI auto-description generator, and Order Status pipeline manager.
- **Demo Role Toggle**: Easily switch between **Customer View** and **Admin View** directly from the top navbar banner.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Redux Toolkit, React Router v6, Axios, Framer Motion, Chart.js, Lucide Icons, Canvas-Confetti.
- **Backend**: Node.js, Express.js, REST API architecture, JWT Authentication, bcryptjs, Helmet, CORS, Rate Limiting, Compression.
- **Database**: MongoDB with Mongoose driver + resilient in-memory fallback & instant seed data generator.
- **AI Integration**: Google Gemini API & OpenAI API integration with intelligent fallback engines.

---

## 🚀 Quick Start Guide

### 1. Install Server Dependencies & Start
```bash
cd server
npm install
npm run seed     # (Optional) Seed sample database
npm start        # Starts backend on http://localhost:5000
```

### 2. Install Client Dependencies & Start
```bash
cd client
npm install
npm run dev      # Starts frontend on http://localhost:5173
```

---

## 🔑 Demo Credentials

- **Admin Account**: `admin@ecommerce.com` / `adminpassword123`
- **Customer Account**: `customer@ecommerce.com` / `customerpassword123`
- **Promo Coupon Codes**: `SAVE20` (20% OFF), `FLAT50` ($50 OFF)
