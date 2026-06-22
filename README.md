# 🔧 AutoPro Parts — Next.js + Supabase

ระบบร้านขายอะไหล่รถยนต์ออนไลน์ครบวงจร พร้อม AI Agent

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Anthropic Claude API |
| Hosting | Vercel |
| State | Zustand |

## Project Structure

```
src/
├── app/
│   ├── (shop)/          # Customer-facing pages
│   │   ├── page.tsx          # Homepage
│   │   ├── catalog/          # Product listing
│   │   ├── products/[slug]/  # Product detail
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout
│   │   ├── account/          # My orders, loyalty, profile
│   │   └── ai-assistant/     # AI shopping assistant
│   ├── admin/           # Admin panel
│   │   ├── page.tsx          # Dashboard
│   │   ├── products/         # Product management
│   │   ├── orders/           # Order management
│   │   ├── customers/        # Customer management
│   │   ├── analytics/        # Reports & charts
│   │   └── ai/               # AI admin agent
│   ├── api/             # API routes
│   │   ├── auth/             # Login, register, logout
│   │   ├── products/         # CRUD products
│   │   ├── cart/             # Cart operations
│   │   ├── orders/           # Order management
│   │   ├── loyalty/          # Points & rewards
│   │   ├── ai/               # AI chat endpoint
│   │   └── admin/stats/      # Dashboard statistics
│   ├── login/           # Login page
│   └── register/        # Register page
├── components/
│   ├── ui/              # Reusable UI components
│   ├── shop/            # ProductCard, etc.
│   ├── Navbar.tsx
│   └── AIChat.tsx
├── hooks/               # Custom React hooks
├── lib/
│   ├── supabase/        # Supabase clients
│   └── store.ts         # Zustand stores
└── types/               # TypeScript types
```

## Features

### Customer
- 🛍️ Product catalog with search & filters
- 📦 Product detail with specs, reviews, compatible cars
- 🛒 Shopping cart (persisted)
- 💳 Checkout: PromptPay, Card, COD, Bank transfer
- ⭐ Loyalty Points — earn & redeem
- 🏷️ Coupon codes
- 📋 Order history & tracking
- 🤖 AI shopping assistant (Claude)

### Admin
- 📊 Real-time dashboard
- 📦 Product & inventory management
- 🛒 Order management with status updates
- 👥 Customer management
- 📈 Analytics & charts
- 🔔 Notification center
- 🤖 AI business intelligence agent (Claude + live DB data)

---

## 🚀 Deployment (Step-by-step)

### Step 1: Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note down:
   - Project URL
   - `anon` key
   - `service_role` key (Settings → API)
3. Go to **SQL Editor** → paste entire contents of `supabase/migrations/001_schema.sql` → Run

### Step 2: Set up Supabase Auth

1. Supabase Dashboard → Authentication → Settings
2. Enable Email provider
3. Set Site URL to your Vercel URL (after deploy)

### Step 3: Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/autopro-parts.git
git push -u origin main

# 2. Go to vercel.com → Import from GitHub
# 3. Set environment variables (see below)
# 4. Deploy
```

### Step 4: Environment Variables in Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-32-char-random-secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional: Payment
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
```

### Step 5: Create Admin User

After deploying, run this SQL in Supabase SQL Editor:

```sql
-- After registering with email/password, promote to admin:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
```

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local
# Fill in your Supabase & Anthropic keys

# Run dev server
npm run dev
# Open http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Create product (admin) |
| PATCH | `/api/products/:id` | Update product (admin) |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add to cart |
| PATCH | `/api/cart` | Update quantity |
| DELETE | `/api/cart` | Remove item |
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order (checkout) |
| PATCH | `/api/orders/:id` | Update status (admin) |
| GET | `/api/loyalty` | Points & rewards |
| POST | `/api/loyalty` | Redeem reward |
| POST | `/api/ai` | AI chat (admin/customer) |
| GET | `/api/admin/stats` | Dashboard stats (admin) |
| POST | `/api/auth?action=login` | Login |
| POST | `/api/auth?action=register` | Register |

---

## Points System

| Action | Points |
|--------|--------|
| ซื้อสินค้า ฿100 | +1 แต้ม |
| Silver tier | 2,000+ แต้ม |
| Gold tier | 5,000+ แต้ม |
| Platinum tier | 10,000+ แต้ม |
| แลกส่วนลด ฿50 | -500 แต้ม |
| แลกส่งฟรี | -300 แต้ม |
