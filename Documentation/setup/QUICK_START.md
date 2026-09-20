# Invento Quick Start & Developer Setup Guide

Step-by-step local development setup instructions for Invento.

---

## 🚀 Quick Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sonigaurav1/stock-management-system.git
   cd Invento
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Clerk, Convex, EdgeStore, and SendGrid keys. (See [ENV-VARS.md](file:///Users/gaurav/Desktop/Invento/Documentation/setup/ENV-VARS.md)).

4. **Start Convex Backend**:
   ```bash
   pnpm run convex
   ```

5. **Start Next.js Development Server**:
   ```bash
   pnpm run dev
   ```

6. Open `http://localhost:3000` in your browser.

---

## 🔗 Related Links
- **Environment Variables**: [ENV-VARS.md](file:///Users/gaurav/Desktop/Invento/Documentation/setup/ENV-VARS.md)
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
