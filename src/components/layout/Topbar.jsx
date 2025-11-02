import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BsBell, BsPersonCircle, BsList } from 'react-icons/bs';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom px-3">
      <div className="d-flex align-items-center w-100">
        {/* Mobile menu button */}
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-md-none me-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <BsList size={20} />
        </Button>

        {/* Brand/Title */}
        <div className="me-auto">
          <strong className="d-none d-md-block">Kais Delivery</strong>
          <strong className="d-md-none">Dashboard</strong>
        </div>

        {/* Search bar (desktop only) */}
        <Form className="d-none d-lg-flex me-3" style={{ width: '300px' }}>
          <FormControl 
            placeholder="Search deliveries, products..." 
            size="sm"
          />
        </Form>

        {/* Right side navigation */}
        <Nav className="align-items-center">
          <Nav.Link className="p-2">
            <BsBell size={18} />
          </Nav.Link>
          <NavDropdown 
            title={
              <span className="d-flex align-items-center">
                <BsPersonCircle className="me-1" size={18}/>
                <span className="d-none d-sm-inline">
                  {user ? user.name : 'Guest'}
                </span>
              </span>
            } 
            id="user-dropdown"
            align="end"
          >
            <NavDropdown.Item>Profile</NavDropdown.Item>
            <NavDropdown.Item>Settings</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={doLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </div>
    </Navbar>
  );
}
