import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import UserManagement from './UserManagement';
import { BsBoxSeam, BsClockHistory, BsPeople, BsTruck } from 'react-icons/bs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function StatCard({ icon, title, value, variant }){
  return (
    <Card className="mb-3 stat-card">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 display-6 text-primary">{icon}</div>
        <div>
          <div className="small-muted">{title}</div>
          <h4 className="mb-0">{value}</h4>
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
    <Container fluid>
      <Row className="mb-3 align-items-center">
        <Col>
          <h3>{t('admin.title')}</h3>
          <div className="small-muted">{t('admin.overview')}</div>
        </Col>
      </Row>

      <Row>
        <Col md={3}><StatCard icon={<BsBoxSeam/>} title={t('admin.totalProducts')} value={stats ? stats.totalProducts : '—'} /></Col>
        <Col md={3}><StatCard icon={<BsClockHistory/>} title={t('admin.totalDeliveries')} value={stats ? stats.totalDeliveries : '—'} /></Col>
        <Col md={3}><StatCard icon={<BsPeople/>} title={t('admin.totalClients')} value={stats ? stats.totalClients : '—'} /></Col>
        <Col md={3}><StatCard icon={<BsTruck/>} title={t('admin.deliveryPersons')} value={stats ? stats.deliveryPersons : '—'} /></Col>
      </Row>

      {/* Product Status Breakdown */}
      {stats?.breakdown && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h6 className="mb-0">{t('admin.productStatusBreakdown')}</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1">{stats.breakdown.picked}</div>
                      <div className="small text-muted">{t('admin.picked')}</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1">{stats.breakdown.outForDelivery}</div>
                      <div className="small text-muted">{t('admin.outForDelivery')}</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1">{stats.breakdown.delivered}</div>
                      <div className="small text-muted">{t('admin.delivered')}</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <div className="h4 mb-1">{stats.breakdown.problem}</div>
                      <div className="small text-muted">{t('admin.problems')}</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <UserManagement />
        </Col>
      </Row>
    </Container>
  );
}
