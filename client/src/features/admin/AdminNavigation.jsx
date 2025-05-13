import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AdminNavigation = () => {
  const location = useLocation();
  
  return (
    <Nav className="flex-column admin-sidebar">
      <Nav.Link
        as={Link}
        to="/admin/dashboard"
        active={location.pathname === '/admin/dashboard'}
      >
        Dashboard
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/products"
        active={location.pathname.startsWith('/admin/products')}
      >
        Products
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/orders"
        active={location.pathname.startsWith('/admin/orders')}
      >
        Orders
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/customers"
        active={location.pathname.startsWith('/admin/customers')}
      >
        Customers
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/sellers"
        active={location.pathname.startsWith('/admin/sellers')}
      >
        Seller Management
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/seller-performance"
        active={location.pathname.startsWith('/admin/seller-performance')}
      >
        Seller Performance
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/payouts"
        active={location.pathname.startsWith('/admin/payouts')}
      >
        Payout Processing
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/compliance"
        active={location.pathname.startsWith('/admin/compliance')}
      >
        Compliance Monitoring
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/commissions"
        active={location.pathname.startsWith('/admin/commissions')}
      >
        Commission Structure
      </Nav.Link>
      <Nav.Link
        as={Link}
        to="/admin/settings"
        active={location.pathname.startsWith('/admin/settings')}
      >
        Settings
      </Nav.Link>
    </Nav>
  );
};

export default AdminNavigation;
