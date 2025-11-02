import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsSpeedometer2, BsPeople, BsBox, BsTruck } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  return (
    <div className="sidebar-custom border-end d-none d-md-block" style={{ width: 240 }}>
      <div className="p-3 border-bottom">
        <h5 className="mb-0">Kais Delivery</h5>
        <div className="small-muted">{user.name}</div>
      </div>
      <Nav className="flex-column p-2">
        {role === 'admin' && (
          <>
            <Nav.Link as={Link} to="/admin" className="d-flex align-items-center"><BsSpeedometer2 className="me-2"/> Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users" className="d-flex align-items-center"><BsPeople className="me-2"/> Manage Users</Nav.Link>
            <Nav.Link as={Link} to="/admin/products" className="d-flex align-items-center"><BsBox className="me-2"/> Manage Products</Nav.Link>
            <Nav.Link as={Link} to="/admin/deliveries" className="d-flex align-items-center"><BsTruck className="me-2"/> Manage Deliveries</Nav.Link>
          </>
        )}

        {role === 'client' && (
          <>
            <Nav.Link as={Link} to="/client" className="d-flex align-items-center"><BsBox className="me-2"/> Client Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/client/products" className="d-flex align-items-center"><BsBox className="me-2"/> My Products</Nav.Link>
            <Nav.Link as={Link} to="/client/add-product" className="d-flex align-items-center"><BsBox className="me-2"/> Add Product</Nav.Link>
          </>
        )}

        {role === 'delivery' && (
          <>
            <Nav.Link as={Link} to="/delivery" className="d-flex align-items-center"><BsTruck className="me-2"/> Delivery Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/delivery/assigned" className="d-flex align-items-center"><BsTruck className="me-2"/> Assigned Deliveries</Nav.Link>
          </>
        )}
      </Nav>
    </div>
  );
}
