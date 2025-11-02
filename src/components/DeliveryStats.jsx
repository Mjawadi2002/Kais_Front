import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { 
  BsTruck, 
  BsBox, 
  BsClock, 
  BsCheckCircle, 
  BsXCircle,
  BsExclamationTriangle,
  BsPerson,
  BsGraphUp,
  BsCurrencyDollar 
} from 'react-icons/bs';
import apiClient from '../config/apiClient';

export default function DeliveryStats() {
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    deliveredDeliveries: 0,
    cancelledDeliveries: 0,
    failedDeliveries: 0,
    totalRevenue: 0,
    averageDeliveryFee: 0,
    deliveryPersonCount: 0,
    activeDeliveryPersons: 0,
    highPriorityDeliveries: 0,
    urgentDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/deliveries/stats');
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to load delivery stats:', error);
      setError('Failed to load delivery statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted">Loading delivery statistics...</div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <BsExclamationTriangle className="me-2" />
        {error}
      </Alert>
    );
  }

  const deliveryStatusCards = [
    {
      title: 'Total Deliveries',
      value: stats.totalDeliveries,
      icon: BsTruck,
      color: 'primary',
      bgColor: 'bg-primary'
    },
    {
      title: 'Pending',
      value: stats.pendingDeliveries,
      icon: BsClock,
      color: 'warning',
      bgColor: 'bg-warning'
    },
    {
      title: 'In Transit',
      value: stats.inTransitDeliveries,
      icon: BsTruck,
      color: 'info',
      bgColor: 'bg-info'
    },
    {
      title: 'Delivered',
      value: stats.deliveredDeliveries,
      icon: BsCheckCircle,
      color: 'success',
      bgColor: 'bg-success'
    },
    {
      title: 'Cancelled',
      value: stats.cancelledDeliveries,
      icon: BsXCircle,
      color: 'danger',
      bgColor: 'bg-danger'
    },
    {
      title: 'Failed',
      value: stats.failedDeliveries,
      icon: BsExclamationTriangle,
      color: 'dark',
      bgColor: 'bg-dark'
    }
  ];

  const performanceCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: BsCurrencyDollar,
      color: 'success',
      bgColor: 'bg-success'
    },
    {
      title: 'Avg Delivery Fee',
      value: `$${stats.averageDeliveryFee?.toFixed(2) || '0.00'}`,
      icon: BsGraphUp,
      color: 'info',
      bgColor: 'bg-info'
    },
    {
      title: 'Delivery Persons',
      value: stats.deliveryPersonCount || 0,
      icon: BsPerson,
      color: 'primary',
      bgColor: 'bg-primary'
    },
    {
      title: 'High Priority',
      value: stats.highPriorityDeliveries || 0,
      icon: BsExclamationTriangle,
      color: 'warning',
      bgColor: 'bg-warning'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center">
          <div 
            className={`rounded-circle p-3 me-3 ${bgColor} bg-opacity-10`}
            style={{ width: '60px', height: '60px' }}
          >
            <Icon 
              size={24} 
              className={`text-${color} d-flex align-items-center justify-content-center w-100 h-100`} 
            />
          </div>
          <div className="flex-grow-1">
            <div className="text-muted small mb-1">{title}</div>
            <div className="h4 mb-0 fw-bold">{value}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const completionRate = stats.totalDeliveries > 0 
    ? ((stats.deliveredDeliveries / stats.totalDeliveries) * 100).toFixed(1)
    : 0;

  const cancelRate = stats.totalDeliveries > 0 
    ? (((stats.cancelledDeliveries + stats.failedDeliveries) / stats.totalDeliveries) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Delivery Statistics</h5>
        <div className="d-flex gap-2">
          <Badge bg="success">
            {completionRate}% Success Rate
          </Badge>
          {parseFloat(cancelRate) > 0 && (
            <Badge bg="warning">
              {cancelRate}% Cancel Rate
            </Badge>
          )}
        </div>
      </div>

      {/* Delivery Status Overview */}
      <Row className="g-3 mb-4">
        {deliveryStatusCards.map((card, index) => (
          <Col key={index} lg={2} md={4} sm={6}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      {/* Performance Metrics */}
      <Row className="g-3">
        {performanceCards.map((card, index) => (
          <Col key={index} lg={3} md={6}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      {/* Quick Insights */}
      {stats.totalDeliveries > 0 && (
        <Row className="mt-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0">Quick Insights</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <div className="text-center p-3 bg-light rounded">
                      <BsBox size={32} className="text-primary mb-2" />
                      <div className="h5 mb-1">{stats.urgentDeliveries || 0}</div>
                      <div className="small text-muted">Urgent Deliveries</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3 bg-light rounded">
                      <BsPerson size={32} className="text-success mb-2" />
                      <div className="h5 mb-1">{stats.activeDeliveryPersons || 0}</div>
                      <div className="small text-muted">Active Drivers</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3 bg-light rounded">
                      <BsGraphUp size={32} className="text-info mb-2" />
                      <div className="h5 mb-1">
                        {((stats.inTransitDeliveries + stats.pendingDeliveries) || 0)}
                      </div>
                      <div className="small text-muted">Active Deliveries</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}