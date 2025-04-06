# Stock Management System

Effortlessly manage your business inventory with our intuitive and powerful tools.

## Features

- **Product Management**: Add, update, and delete products with detailed information such as name, SKU, barcode, category, description, brand, purchase price, selling price, stock level, and more.
- **Supplier Management**: Manage your suppliers with ease. Add, update, and delete supplier information including name, phone, email, address, and more.
- **Category Management**: Organize your products into categories for better management and reporting.
- **Stock Movements**: Track stock movements such as purchases, sales, damages, and returns.
- **Sales Management**: Record and manage sales transactions with detailed information.
- **Tax Invoice Bill**: Generate tax invoice bills to make your business go digital and keep records of sales transactions.
- **Ledger Feature**: Maintain a record of financial transactions with suppliers and shopkeepers.

## Technologies Used

This project leverages the following technologies:

- **Frontend**: React, Next.js, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: Zustand
- **Backend**: Convex
- **Database**: Convex Database
- **Authentication**: Clerk
- **Utilities**: Zod, React Hook Form, clsx, Tailwind Merge
- **Charts**: Recharts
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **Date Handling**: date-fns, Bikram Sambat JS
- **Other Tools**: ESLint, Prettier, Husky, Lint-Staged

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/sonigaurav1/stock-management-system.git
    cd stock-management-system
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Set up environment variables:
    - Copy `.env.example` to `.env` and update the values as needed.

4. Start the development server:
    ```sh
    pnpm run dev
    ```

## Scripts

- `pnpm run dev`: Start the development server.
- `pnpm run build`: Build the project for production.
- `pnpm run start`: Start the production server.
- `pnpm run lint`: Run ESLint to check for linting errors.
- `pnpm run lint:fix`: Fix linting errors.
- `pnpm run format`: Format the code using Prettier.
- `pnpm run format:check`: Check the code formatting using Prettier.

## Folder Structure

- `.next/`: Next.js build output.
- `convex/`: Convex server functions and schema.
- `public/`: Static assets.
- `src/`: Source code.
  - `components/`: Reusable UI components.
  - `features/`: Feature-specific code (e.g., products, suppliers).
  - `lib/`: Utility functions and libraries.
  - `pages/`: Next.js pages.
  - `styles/`: Global styles.
  - `types/`: TypeScript type definitions.