import { Link } from 'react-router-dom';
function Navbar() { 
    return (
    <nav className='bg-white shadow p-4'>
        <div className='container mx-auto flex justify-between items-center'><Link to='/' className='text-2xl font-bold text-pink-600'>Clinique Beauty</Link><div className='space-x-4'><Link to='/products' className='text-gray-700 hover:text-pink-600'>Products</Link><Link to='/cart' className='text-gray-700 hover:text-pink-600'>Cart</Link><Link to='/profile' className='text-gray-700 hover:text-pink-600'>Profile</Link><Link to='/login' className='text-gray-700 hover:text-pink-600'>Login</Link></div></div></nav>); }export default Navbar;
