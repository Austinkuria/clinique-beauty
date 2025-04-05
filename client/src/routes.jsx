import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Home from './features/home/Home.jsx';
// import ProductList from './features/products/ProductList.jsx';
// import ProductDetail from './features/products/ProductDetail.jsx';
import Cart from './features/cart/Cart.jsx';
// import Checkout from './features/checkout/Checkout.jsx';
// import Login from './features/auth/Login.jsx';
// import Register from './features/auth/Register.jsx';
// import Profile from './features/profile/Profile.jsx';
// import Search from './features/search/Search.jsx';
// import NotFound from './pages/NotFound.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            // Uncomment routes as needed
            { path: '/', element: <Home /> },
            // { path: '/products', element: <ProductList /> },
            // { path: '/products/:id', element: <ProductDetail /> },
            { path: '/cart', element: <Cart /> },
            // { path: '/checkout', element: <Checkout /> },
            // { path: '/login', element: <Login /> },
            // { path: '/register', element: <Register /> },
            // { path: '/profile', element: <Profile /> },
            // { path: '/search', element: <Search /> },
            // { path: '*', element: <NotFound /> },
        ]
    }
]);

export default function Routes() {
    return (
        <RouterProvider router={router} />
    );
}
