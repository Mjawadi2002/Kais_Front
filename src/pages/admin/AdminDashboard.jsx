import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
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
          <h3>Admin Dashboard</h3>
          <div className="small-muted">Overview of products, deliveries and users</div>
        </Col>
      </Row>

      <Row>
        <Col md={3}><StatCard icon={<BsBoxSeam/>} title="Total Products" value={stats ? stats.totalProducts : '—'} /></Col>
        <Col md={3}><StatCard icon={<BsClockHistory/>} title="Total Deliveries" value={stats ? stats.totalDeliveries : '—'} /></Col>
        <Col md={3}><StatCard icon={<BsPeople/>} title="Total Clients" value={stats ? stats.totalClients : '—'} /></Col>
        <Col md={3}><StatCard icon={<BsTruck/>} title="Delivery Persons" value={stats ? stats.deliveryPersons : '—'} /></Col>
      </Row>

      <Row>
        <Col>
          <UserManagement />
        </Col>
      </Row>
    </Container>
  );
}
