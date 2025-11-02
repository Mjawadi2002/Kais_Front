import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, FormControl } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BsBell, BsPersonCircle } from 'react-icons/bs';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom">
      <Container fluid>
        <div className="d-flex align-items-center">
          <Navbar.Toggle />
          <div className="ms-3">
            <strong>Kais Delivery</strong>
          </div>
        </div>

        <Navbar.Collapse className="justify-content-end">
          <Form className="d-none d-md-flex me-3 topbar-search">
            <FormControl placeholder="Search deliveries, products..." />
          </Form>
          <Nav className="align-items-center">
            <Nav.Link><BsBell /></Nav.Link>
            <NavDropdown title={<span><BsPersonCircle className="me-1"/>{user ? user.name : 'Guest'}</span>} id="user-dropdown">
              <NavDropdown.Item>Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={doLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
