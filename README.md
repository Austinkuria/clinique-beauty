# Clinique Beauty - E-commerce Shop

A full-stack e-commerce application built with the PERN stack (PostgreSQL, Express, React, Node.js) for a beauty shop, featuring M-Pesa integration for payments.

![Clinique Beauty Screenshot](./client/src/assets/images/app-screenshot.png)

## Features

### User-Facing Features
* **Product Catalog:** Browse products by category, subcategory, and brand
* **Advanced Product Details:** View high-resolution images, ingredients, benefits, and shades
* **User Authentication:** Secure sign-up and sign-in via Clerk Authentication
* **Shopping Cart:** Add/remove items, update quantities, view cart summary
* **Checkout Process:** Multi-step checkout with address validation and order summary
* **M-Pesa Integration:** Direct mobile payments through Safaricom's M-Pesa service
* **Wishlist:** Save favorite items for future purchase
* **Order History:** View past orders with status tracking
* **User Profiles:** Manage personal information, addresses, and payment methods
* **Responsive Design:** Optimized for mobile, tablet, and desktop devices

### Admin Features
* **Admin Dashboard:** Analytics dashboard with sales, revenue, and user metrics
* **Product Management:** Add, edit, delete products with image uploads
* **Order Management:** View, process, and update order statuses
* **User Management:** View and manage user accounts and permissions
* **Inventory Control:** Manage product stock levels and availability
* **Analytics:** View sales trends, popular products, and customer demographics

## Tech Stack

### Frontend
* **Framework:** React 19 with Vite
* **Routing:** React Router 7
* **State Management:** React Context API
* **UI Components:** Material UI 7, custom components with Tailwind CSS 4
* **Authentication:** Clerk React SDK
* **Data Visualization:** Recharts
* **Form Handling:** React Hook Form
* **Styling:** Tailwind CSS, Emotion styled components

### Backend
* **Server:** Node.js with Express
* **Database:** PostgreSQL via Supabase
* **Authentication:** Clerk Node SDK with JWT verification
* **File Storage:** Supabase Storage
* **API Tunneling:** ngrok for M-Pesa callback URLs

### Payment Processing
* **M-Pesa Integration:** Safaricom Daraja API for mobile payments
* **Callback Handling:** Express routes for processing payment notifications

### Development Tools
* **Package Manager:** pnpm
* **Linting:** ESLint
* **Environment Variables:** dotenv
* **Deployment:** Vercel (frontend), Supabase Functions (serverless)

## Getting Started

### Prerequisites
* Node.js (v18 or later recommended)
* pnpm (Install via `npm install -g pnpm`)
* Supabase account for database
* Clerk account for authentication
* Safaricom Daraja API account for M-Pesa integration
* ngrok account for development tunneling

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/clinique-beauty.git
   cd clinique-beauty
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies
   pnpm install
   
   # Install server dependencies
   cd server
   pnpm install
   
   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. **Set up environment variables:**

   **Server (.env):**
   ```bash
   cd server
   pnpm run setup-env
   ```
   This interactive setup will guide you through configuring:
   - Server port
   - Supabase credentials
   - ngrok domain
   - M-Pesa API credentials

   **Client (.env):**
   Create a `.env` file in the client directory with:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
   VITE_MPESA_ENABLED=true
   ```

4. **Database setup:**
   - Create necessary tables in your Supabase project
   - Run the seeding script to populate the database:
   ```bash
   cd server
   pnpm run seed
   ```

5. **Start the development servers:**
   ```bash
   # In the root directory
   pnpm start
   ```
   This will start both the client (port 5173) and server (port 5000).

## M-Pesa Integration Setup

### Local Development with ngrok

1. **Start the ngrok tunnel for M-Pesa callbacks:**
   ```bash
   cd server
   pnpm run mpesa:ngrok
   ```
   This will:
   - Start an ngrok tunnel to your local server
   - Configure the M-Pesa callback URL in your .env file
   - Display the public URL for your callbacks

2. **Test the M-Pesa integration:**
   ```bash
   cd server
   pnpm run check:mpesa
   ```
   This will verify that your M-Pesa configuration is working correctly.

### Using M-Pesa in Development

For testing M-Pesa in the sandbox environment:
- Phone Number: 254708374149
- PIN: 12345678

### Production Deployment

For production deployment of the M-Pesa integration:
1. Set up your M-Pesa callback URL to point to your production server
2. Configure the M-Pesa API credentials in your production environment variables
3. Ensure your server has HTTPS enabled for secure communication

## Project Structure

```
clinique-beauty/
├── client/                     # React frontend
│   ├── public/                 # Static assets and favicon
│   ├── index.html              # HTML entry point 
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── api/                # API client and service functions
│       ├── assets/             # Images, icons, and static resources
│       │   ├── images/         # Product and UI images
│       │   └── icons/          # SVG icons
│       ├── components/         # Reusable UI components
│       │   ├── auth/           # Authentication related components
│       │   ├── cart/           # Shopping cart components
│       │   ├── checkout/       # Checkout flow components
│       │   ├── common/         # Shared UI elements (buttons, inputs)
│       │   ├── layout/         # Layout components (header, footer)
│       │   └── product/        # Product related components
│       ├── config/             # Configuration files
│       ├── contexts/           # React context providers
│       ├── hooks/              # Custom React hooks
│       ├── pages/              # Page components
│       │   ├── admin/          # Admin dashboard pages
│       │   ├── auth/           # Authentication pages
│       │   ├── cart/           # Cart and checkout pages
│       │   ├── product/        # Product listing and detail pages
│       │   └── user/           # User profile and account pages
│       ├── types/              # TypeScript type definitions
│       ├── utils/              # Utility functions
│       ├── App.jsx             # Main app component
│       └── main.jsx            # Application entry point
│
├── server/                     # Express backend
│   ├── config/                 # Server configuration
│   │   └── database.js         # Database connection setup
│   ├── controllers/            # Request handlers
│   │   ├── productController.js# Product-related controllers
│   │   ├── orderController.js  # Order-related controllers
│   │   └── paymentController.js# Payment-related controllers
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # Authentication middleware
│   │   └── errorHandler.js     # Error handling middleware
│   ├── models/                 # Data models
│   ├── routes/                 # API route definitions
│   │   ├── product.js          # Product routes
│   │   ├── order.js            # Order routes
│   │   └── payment.js          # Payment routes
│   ├── services/               # Business logic
│   │   └── mpesa.js            # M-Pesa integration service
│   ├── utils/                  # Server utility functions
│   ├── .env                    # Environment variables (gitignored)
│   ├── index.js                # Server entry point
│   └── package.json            # Server dependencies
│
├── docs/                       # Documentation files
│   ├── api/                    # API documentation
│   ├── mpesa-setup.md          # M-Pesa integration guide
│   └── deployment.md           # Deployment guide
│
├── .gitignore                  # Git ignore file
├── package.json                # Root package.json for scripts
├── README.md                   # Project documentation
└── pnpm-workspace.yaml         # Workspace configuration
```

## Running the Application Online

With ngrok installed, you can make the application available online:

```bash
# Start the application and expose it with ngrok
pnpm run online
```

This will:
1. Start your server on port 5000
2. Create a secure tunnel using your reserved ngrok domain
3. Configure the M-Pesa callback URL automatically

## Scripts Reference

### Root Scripts
- `pnpm start` - Start both client and server in development mode
- `pnpm run online` - Start the application with ngrok tunneling
- `pnpm run build` - Build the client application for production

### Server Scripts
- `pnpm run dev` - Start the server in development mode
- `pnpm run setup-env` - Interactive environment setup wizard
- `pnpm run mpesa:ngrok` - Start ngrok tunnel for M-Pesa callbacks
- `pnpm run check:mpesa` - Test M-Pesa integration
- `pnpm run mpesa:dev` - Start server and ngrok tunnel together

### Client Scripts
- `pnpm run dev` - Start the client in development mode
- `pnpm run build` - Build the client for production
- `pnpm run preview` - Preview the production build locally

## Contributing

We welcome contributions to improve Clinique Beauty! Here's how you can help:

1. **Report Bugs**: Found a bug? Please open an issue with detailed information.
2. **Feature Suggestions**: Have an idea? Let us know by creating a new issue or starting a discussion.
3. **Code Contributions**: Fork the repository, create a new branch for your feature or fix, and submit a pull request.

### Steps to Contribute:
- Fork this repository.
- Create a new branch: `git checkout -b feature-name`.
- Commit your changes: `git commit -m "Add feature/fix bug"`.
- Push your branch: `git push origin feature-name`.
- Open a Pull Request for review.

## Troubleshooting

If you encounter issues:

1. **Check environment variables** - Make sure all required variables are set correctly
2. **Verify Supabase connection** - Test your Supabase credentials
3. **Check ngrok status** - For M-Pesa issues, verify ngrok is running and configured
4. **Review server logs** - Check the server console for error messages
5. **Consult the docs** - See documentation in the `/docs` directory for specific guides

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software in compliance with the license terms.

## Contact

For questions or support, please open an issue in the GitHub repository or contact the project maintainers.
