# Stock Management System

Effortlessly manage your business inventory with our intuitive and powerful tools.

## Features

- **Product Management**: Add, update, and delete products with detailed information such as name, SKU, barcode, category, description, brand, purchase price, selling price, stock level, and more.
- **Supplier Management**: Manage your suppliers with ease. Add, update, and delete supplier information including name, phone, email, address, and more.
- **Category Management**: Organize your products into categories for better management and reporting.
- **Stock Movements**: Track stock movements such as purchases, sales, damages, and returns.
- **Sales Management**: Record and manage sales transactions with detailed information.
- **Kanban Board**: Visualize and manage tasks using a Kanban board.

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
    - Copy  to  and update the values as needed.

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
- : Format the code using Prettier.
- : Check the code formatting using Prettier.

## Folder Structure

- : Next.js build output.
- : Convex server functions and schema.
- : Static assets.
- : Source code.
  - `components/`: Reusable UI components.
  - `features/`: Feature-specific code (e.g., products, suppliers, kanban).
  - `lib/`: Utility functions and libraries.
  - : Next.js pages.
  - `styles/`: Global styles.
  - : TypeScript type definitions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.