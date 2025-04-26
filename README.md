# Clinique Beauty - E-commerce Shop

A full-stack e-commerce application built with the PERN stack (PostgreSQL, Express, React, Node.js) for a fictional beauty shop.

## Features

*   **Product Catalog:** Browse products by category.
*   **Product Details:** View detailed information, images, and pricing.
*   **User Authentication:** Secure sign-up, sign-in, and profile management (potentially using a service like Clerk or custom implementation).
*   **Shopping Cart:** Add/remove items, view cart summary.
*   **Wishlist:** Save favorite items.
*   **Theming:** Light/Dark mode support.
*   **Responsive Design:** Adapts to various screen sizes.
*   **(Planned/Optional):** Search, Reviews, Order History, Checkout Process.

## Tech Stack

*   **Frontend:**
    *   React (likely with Vite)
    *   React Router
    *   State Management (e.g., Context API, Redux, Zustand)
    *   Styling (e.g., Material UI, Tailwind CSS, CSS Modules)
    *   Authentication Client (e.g., Clerk React)
*   **Backend:**
    *   Node.js
    *   Express
    *   Authentication Middleware (e.g., Clerk Node)
*   **Database:**
    *   PostgreSQL
    *   ORM/Query Builder (e.g., Prisma, Sequelize, node-postgres)
*   **Package Manager:**
    *   pnpm (as indicated by `pnpm-lock.yaml`)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   pnpm (Install via `npm install -g pnpm`)
*   PostgreSQL database running
*   (If using Clerk) Clerk Account for API keys

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd clinique-beauty
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server # Or your backend directory name
    pnpm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client # Or your frontend directory name
    pnpm install
    ```

4.  **Environment Variables:**

    *   **Server (`server/.env`):** Create a `.env` file in the `server` directory. Add necessary variables like:
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
        # Add Clerk Secret Key if using Clerk
        # CLERK_SECRET_KEY="sk_test_..."
        # Add JWT Secret if using custom JWT auth
        # JWT_SECRET="your_jwt_secret"
        PORT=5000 # Or your preferred server port
        ```

    *   **Client (`client/.env`):** Create a `.env` file in the `client` directory. Add necessary variables like:
        ```env
        # Add Clerk Publishable Key if using Clerk
        # VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
        # Base URL for your backend API
        VITE_API_BASE_URL="http://localhost:5000/api" # Adjust port/path as needed
        ```
        *(Replace placeholders with your actual credentials, keys, and URLs)*

5.  **Database Setup:**
    *   Ensure your PostgreSQL server is running.
    *   Connect to your database and create the specified database (`DATABASE_NAME`).
    *   Run database migrations if applicable (e.g., `npx prisma migrate dev` if using Prisma). Add specific instructions based on your ORM setup.

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd server
    pnpm run dev # Or your specific start script (e.g., pnpm start)
    ```

2.  **Start the Frontend Client:**
    ```bash
    cd ../client
    pnpm run dev
    ```

The client should now be accessible (commonly `http://localhost:5173` for Vite) and the server should be running (e.g., `http://localhost:5000`).

## Contributing

(Optional: Add guidelines for contributing to the project).

## License

(Optional: Specify the license for your project, e.g., MIT).
