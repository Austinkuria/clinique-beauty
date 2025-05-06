# Clinique Beauty - E-commerce Shop

A full-stack e-commerce application built with the PERN stack (PostgreSQL, Express, React, Node.js) for a beauty shop.

## Features

*   **Product Catalog:** Browse products by category.
*   **Product Details:** View detailed information, images, and pricing.
*   **User Authentication:** Secure sign-up, sign-in, and profile management
*   **Shopping Cart:** Add/remove items, view cart summary.
*   **Wishlist:** Save favorite items.
*   **Responsive Design:** Adapts to various screen sizes.
*   **Others:** Search, Reviews, Order History, Checkout Process.

## Tech Stack

*   **Frontend:**
    *   React with Vite
    *   React Router
    *   State Management (Context API, Redux)
    *   Styling (Material UI, Tailwind CSS,Custom CSS)
    *   Authentication Client (Clerk React)
*   **Backend:**
    *   Node.js
    *   Express
    *   Authentication Middleware (e.g., Clerk Node)
*   **Database:**
    *   PostgreSQL
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

## Running the Application Online

With ngrok installed, you can make the application available online:

```bash
# Start the application and expose it with ngrok
npm run online
```

This will:
1. Start your server on port 5000
2. Create a secure tunnel using your reserved ngrok domain
3. Configure the M-Pesa callback URL automatically

Your site will be available at: https://deer-equal-blowfish.ngrok-free.app

## Developing Locally

```bash
# Start both client and server in development mode
npm start

# Run just the client
cd client && npm run dev

# Run just the server
cd server && npm run dev
```

## Testing M-Pesa Integration

For testing M-Pesa integration in the sandbox environment:
- Phone Number: 254708374149
- PIN: 12345678

## Contributing

We welcome contributions to improve Clinique Beauty! Here's how you can help:

1. **Report Bugs**: Found a bug? Please open an issue with detailed information.
2. **Feature Suggestions**: Have an idea? Let us know by creating a new issue or starting a discussion.
3. **Code Contributions**: Fork the repository, create a new branch for your feature or fix, and submit a pull request. Ensure your code follows the project's style guidelines.

### Steps to Contribute:
- Fork this repository.
- Create a new branch: `git checkout -b feature-name`.
- Commit your changes: `git commit -m "Add feature/fix bug"`.
- Push your branch: `git push origin feature-name`.
- Open a Pull Request for review.

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software in compliance withthe license terms.

Thank you for your contributions!
