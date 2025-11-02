import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsSpeedometer2, BsPeople, BsBox, BsTruck, BsX } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const role = user.role;

  const handleNavClick = () => {
    // Close sidebar when navigation item is clicked on mobile
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className={`sidebar-custom ${
          isOpen ? 'sidebar-mobile-open' : 'd-none d-md-block'
        }`} 
        style={{ 
          width: isOpen && window.innerWidth < 768 ? '280px' : '240px',
          position: isOpen && window.innerWidth < 768 ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: '#fff',
          zIndex: 1050,
          transform: isOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          borderRight: '1px solid #e9ecef',
          boxShadow: isOpen && window.innerWidth < 768 ? '0 0 20px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        {/* Header Section */}
        <div className="sidebar-header p-4 border-bottom">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h4 className="mb-1 fw-bold text-primary">Kais Delivery</h4>
              <div className="d-flex align-items-center">
                <div className="user-avatar me-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                       style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div>
                  <div className="fw-medium" style={{ fontSize: '14px' }}>{user.name}</div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>{user.role}</div>
                </div>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              className="btn btn-sm btn-outline-secondary d-md-none ms-2" 
              onClick={onClose}
              aria-label="Close sidebar"
              style={{ padding: '4px 8px' }}
            >
              <BsX size={20} />
            </button>
          </div>
        </div>
        
        {/* Navigation Section */}
        <nav className="sidebar-nav px-3 py-2">
          {role === 'admin' && (
            <>
              <Nav.Link 
                as={Link} 
                to="/admin" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsSpeedometer2 size={18}/>
                </div>
                <span className="nav-text">{t('navigation.dashboard')}</span>
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/products" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsBox size={18}/>
                </div>
                <span className="nav-text">{t('navigation.manageProducts')}</span>
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/deliveries" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsTruck size={18}/>
                </div>
                <span className="nav-text">{t('navigation.deliveries')}</span>
              </Nav.Link>
            </>
          )}

          {role === 'client' && (
            <>
              <Nav.Link 
                as={Link} 
                to="/client" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsBox size={18}/>
                </div>
                <span className="nav-text">{t('navigation.analytics')}</span>
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/client/products" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsBox size={18}/>
                </div>
                <span className="nav-text">{t('navigation.products')}</span>
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/client/add-product" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsBox size={18}/>
                </div>
                <span className="nav-text">{t('navigation.addProduct')}</span>
              </Nav.Link>
            </>
          )}

          {role === 'delivery' && (
            <>
              <Nav.Link 
                as={Link} 
                to="/delivery" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsTruck size={18}/>
                </div>
                <span className="nav-text">{t('navigation.dashboard')}</span>
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/delivery/assigned" 
                className="sidebar-nav-item d-flex align-items-center py-3 px-3 mb-2 rounded-3 text-decoration-none"
                onClick={handleNavClick}
              >
                <div className="nav-icon me-3">
                  <BsTruck size={18}/>
                </div>
                <span className="nav-text">Assigned Deliveries</span>
              </Nav.Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
