import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { 
  BsTruck, 
  BsClock, 
  BsCheck, 
  BsBoxSeam,
  BsPerson,
  BsBarChart,
  BsGraphUp,
  BsExclamationTriangle,
  BsCalendar,
  BsArrowRight,
  BsCheckCircle,
  BsClockHistory
} from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './DeliveryDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function DeliveryStatCard({ icon, title, value, variant = "primary", loading = false, trend = null }) {
  return (
    <Card className="enhanced-delivery-stat-card h-100">
      <Card.Body className="p-4">
        <div className={`delivery-stat-icon-container bg-${variant} bg-opacity-10`}>
          {React.cloneElement(icon, { 
            size: 28, 
            className: `text-${variant}` 
          })}
        </div>
        <div className="delivery-stat-title">{title}</div>
        <div className="delivery-stat-value">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            value || 0
          )}
        </div>
        {trend && (
          <div className={`delivery-stat-trend text-${trend.type === 'up' ? 'success' : trend.type === 'down' ? 'danger' : 'muted'}`}>
            <BsGraphUp className={trend.type === 'down' ? 'rotate-180' : ''} />
            <span>{trend.value}% {trend.period}</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default function DeliveryDashboard(){
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  const headers = useCallback(() => ({ headers: { Authorization: `Bearer ${user?.token}` } }), [user?.token]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      // Get delivery person's assigned products
      const resp = await axios.get(`${API_BASE}/api/v1/products`, headers());
      const products = resp.data.products || [];
      
      // Filter products assigned to current delivery person
      const assignedProducts = products.filter(p => p.assignedTo?._id === user?.id);
      
      // Calculate metrics
      const totalAssigned = assignedProducts.length;
      const outForDelivery = assignedProducts.filter(p => p.status === 'Out for Delivery').length;
      const delivered = assignedProducts.filter(p => p.status === 'Delivered').length;
      const picked = assignedProducts.filter(p => p.status === 'Picked').length;
      const problems = assignedProducts.filter(p => p.status === 'Problem').length;
      
      // Calculate performance metrics
      const completionRate = totalAssigned > 0 ? ((delivered / totalAssigned) * 100).toFixed(1) : 0;
      const problemRate = totalAssigned > 0 ? ((problems / totalAssigned) * 100).toFixed(1) : 0;
      
      setStats({
        totalAssigned,
        outForDelivery,
        delivered,
        picked,
        problems,
        completionRate,
        problemRate
      });

      // Create recent activities from recent status changes
      const activities = assignedProducts
        .filter(p => p.updatedAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(p => ({
          id: p._id,
          title: `${p.name} - ${p.status}`,
          description: `Updated status to ${p.status}`,
          time: new Date(p.updatedAt).toLocaleTimeString(),
          status: p.status,
          icon: getActivityIcon(p.status)
        }));

      setRecentActivities(activities);
    } catch (err) {
      console.error('Failed to load delivery stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.token]);

  const getActivityIcon = (status) => {
    switch (status) {
      case 'Delivered': return <BsCheckCircle className="text-success" />;
      case 'Out for Delivery': return <BsTruck className="text-primary" />;
      case 'Picked': return <BsClockHistory className="text-info" />;
      case 'Problem': return <BsExclamationTriangle className="text-warning" />;
      default: return <BsBoxSeam className="text-secondary" />;
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id, loadStats]);

  return (
    <Container fluid className="delivery-dashboard-container">
      {/* Enhanced Header Section */}
      <div className="delivery-dashboard-header">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="dashboard-title">
              <BsTruck className="me-3" />
              Delivery Dashboard
            </h1>
            <p className="dashboard-subtitle">Your assigned deliveries and performance overview</p>
          </div>

        </div>
      </div>

      {/* Key Performance Indicators */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <DeliveryStatCard 
            icon={<BsBoxSeam />} 
            title="Total Assigned" 
            value={stats?.totalAssigned} 
            variant="primary"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6}>
          <DeliveryStatCard 
            icon={<BsTruck />} 
            title="Out for Delivery" 
            value={stats?.outForDelivery} 
            variant="info"
            loading={loading}
          />
        </Col>
        <Col lg={3} md={6}>
          <DeliveryStatCard 
            icon={<BsCheckCircle />} 
            title="Delivered" 
            value={stats?.delivered} 
            variant="success"
            loading={loading}
            trend={{ 
              type: 'up', 
              value: stats?.completionRate || 0, 
              period: 'completion rate' 
            }}
          />
        </Col>
        <Col lg={3} md={6}>
          <DeliveryStatCard 
            icon={<BsExclamationTriangle />} 
            title="Problems" 
            value={stats?.problems} 
            variant="warning"
            loading={loading}
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Performance Overview */}
        <Col lg={8} md={6}>
          <Card className="performance-overview-card h-100">
            <div className="performance-header">
              <h2 className="performance-title">
                <BsBarChart />
                Performance Overview
              </h2>
            </div>
            <div className="performance-body">
              <div className="performance-metric">
                <span className="metric-label">Completion Rate</span>
                <Badge className="metric-badge bg-success">{stats?.completionRate || 0}%</Badge>
              </div>
              <div className="performance-metric">
                <span className="metric-label">Problem Rate</span>
                <Badge className="metric-badge bg-warning">{stats?.problemRate || 0}%</Badge>
              </div>
              <div className="performance-metric">
                <span className="metric-label">Currently Picked</span>
                <span className="metric-value">{stats?.picked || 0} items</span>
              </div>
              <div className="performance-metric">
                <span className="metric-label">Active Deliveries</span>
                <span className="metric-value">{stats?.outForDelivery || 0} items</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col>
          <Card className="recent-activities-card">
            <div className="performance-header">
              <h2 className="performance-title">
                <BsClockHistory />
                Recent Activities
              </h2>
            </div>
            <Card.Body className="p-3">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading recent activities...</p>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="empty-state">
                  <BsBoxSeam size={48} className="empty-state-icon" />
                  <h5 className="empty-state-title">No recent activities</h5>
                  <p className="empty-state-subtitle">Your recent delivery updates will appear here</p>
                </div>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon bg-light">
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <p className="activity-description">{activity.description}</p>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
      </Row>

 
    </Container>
  );
}
