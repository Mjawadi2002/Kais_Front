import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import UserManagement from './UserManagement';
import { BsBoxSeam, BsClockHistory, BsPeople, BsTruck, BsGraphUp } from 'react-icons/bs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function StatCard({ icon, title, value, variant }){
  return (
    <Card className="stat-card">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 stat-icon">{icon}</div>
        <div className="flex-grow-1">
          <div className="stat-title">{title}</div>
          <h4 className="stat-value">{value}</h4>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try{
        const resp = await axios.get(`${API_BASE}/api/v1/stats`, { headers: { Authorization: `Bearer ${user?.token}` } });
        setStats(resp.data);
      }catch(err){ console.error('load stats', err); }
    };
    if (user) load();
  }, [user]);

  return (
    <div className="admin-dashboard-container">
      <Container fluid>
        {/* Enhanced Header Section */}
        <div className="dashboard-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="dashboard-title">{t('admin.title')}</h1>
              <p className="dashboard-subtitle">{t('admin.overview')}</p>
            </div>
            <div className="text-end">
              <BsGraphUp size={60} style={{ opacity: 0.3 }} />
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <Row className="g-4 mb-5">
          <Col lg={3} md={6}>
            <StatCard 
              icon={<BsBoxSeam/>} 
              title={t('admin.totalProducts')} 
              value={stats ? stats.totalProducts : (
                <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #667eea' }}></div>
              )} 
            />
          </Col>
          <Col lg={3} md={6}>
            <StatCard 
              icon={<BsClockHistory/>} 
              title={t('admin.totalDeliveries')} 
              value={stats ? stats.totalDeliveries : (
                <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #667eea' }}></div>
              )} 
            />
          </Col>
          <Col lg={3} md={6}>
            <StatCard 
              icon={<BsPeople/>} 
              title={t('admin.totalClients')} 
              value={stats ? stats.totalClients : (
                <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #667eea' }}></div>
              )} 
            />
          </Col>
          <Col lg={3} md={6}>
            <StatCard 
              icon={<BsTruck/>} 
              title={t('admin.deliveryPersons')} 
              value={stats ? stats.deliveryPersons : (
                <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid #667eea' }}></div>
              )} 
            />
          </Col>
        </Row>

        {/* Enhanced Product Status Breakdown */}
        {stats?.breakdown && (
          <Row className="mb-5">
            <Col>
              <Card className="status-breakdown-card">
                <div className="status-breakdown-header">
                  <h2 className="status-breakdown-title">{t('admin.productStatusBreakdown')}</h2>
                </div>
                <div className="status-breakdown-body">
                  <Row className="g-4">
                    <Col lg={3} md={6}>
                      <div className="status-item success-indicator">
                        <div className="status-number">{stats.breakdown.picked}</div>
                        <div className="status-label">{t('admin.picked')}</div>
                      </div>
                    </Col>
                    <Col lg={3} md={6}>
                      <div className="status-item info-indicator">
                        <div className="status-number">{stats.breakdown.outForDelivery}</div>
                        <div className="status-label">{t('admin.outForDelivery')}</div>
                      </div>
                    </Col>
                    <Col lg={3} md={6}>
                      <div className="status-item success-indicator">
                        <div className="status-number">{stats.breakdown.delivered}</div>
                        <div className="status-label">{t('admin.delivered')}</div>
                      </div>
                    </Col>
                    <Col lg={3} md={6}>
                      <div className="status-item warning-indicator">
                        <div className="status-number">{stats.breakdown.problem}</div>
                        <div className="status-label">{t('admin.problems')}</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* User Management Section */}
        <Row className="mb-5">
          <Col>
            <div className="user-management-section">
              <h2 className="section-title">User Management</h2>
              <div className="user-management-container">
                <UserManagement />
              </div>
            </div>
          </Col>
        </Row>
    </Container>
    </div>
  );
}
