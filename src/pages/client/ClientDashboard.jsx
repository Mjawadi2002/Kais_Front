import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { 
  BsBox, 
  BsTruck, 
  BsCheckCircle, 
  BsExclamationTriangle,
  BsClockHistory,
  BsBoxSeam,
  BsPerson,
  BsBarChart,
  BsGraphUp,
  BsCalendar,
  BsArrowUp,
  BsSearch,
  BsCheck2Circle,
  BsX
} from 'react-icons/bs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/apiClient';
import './ClientDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function StatCard({ icon, title, value, variant = "primary", loading = false, percentage = null, trend = null }) {
  return (
    <Card className="enhanced-stat-card h-100">
      <Card.Body className="p-4">
        <div className={`stat-icon-container bg-${variant} bg-opacity-10`}>
          {React.cloneElement(icon, { 
            size: 28, 
            className: `text-${variant}` 
          })}
        </div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">
          {loading ? (
            <div className="loading-spinner-enhanced"></div>
          ) : (
            value || 0
          )}
        </div>
        {percentage !== null && (
          <div className="stat-progress">
            <ProgressBar 
              now={percentage} 
              variant={variant}
              className="rounded-pill"
            />
            <small className="text-muted mt-1 d-block">{percentage.toFixed(1)}% of total</small>
          </div>
        )}
        {trend && (
          <div className={`stat-trend text-${trend.type === 'up' ? 'success' : trend.type === 'down' ? 'danger' : 'muted'}`}>
            <BsGraphUp className={trend.type === 'down' ? 'rotate-180' : ''} />
            <span>{trend.value}% {trend.period}</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

// Status Distribution Chart Component
const StatusDistributionChart = React.memo(function StatusDistributionChart({ data, loading }) {
  const chartData = useMemo(() => ({
    labels: ['In Stock', 'Picked', 'Out for Delivery', 'Delivered', 'Problem', 'Failed/Returned'],
    datasets: [
      {
        data: [
          data?.inStock || 0,
          data?.picked || 0,
          data?.inTransit || 0,
          data?.delivered || 0,
          data?.problem || 0,
          data?.failed || 0
        ],
        backgroundColor: [
          '#6c757d', // In Stock - secondary
          '#0dcaf0', // Picked - info
          '#0d6efd', // Out for Delivery - primary
          '#198754', // Delivered - success
          '#ffc107', // Problem - warning
          '#dc3545'  // Failed/Returned - danger
        ],
        borderWidth: 0,
      },
    ],
  }), [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
});

// Delivery Timeline Chart
const DeliveryTimelineChart = React.memo(function DeliveryTimelineChart({ data, loading }) {
  const chartData = {
    labels: ['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'All Time'],
    datasets: [
      {
        label: 'Delivered Products',
        data: [
          data?.timeline?.last7Days || 0,
          data?.timeline?.last14Days || 0,
          data?.timeline?.last30Days || 0,
          data?.delivered || 0
        ],
        backgroundColor: 'rgba(25, 135, 84, 0.8)',
        borderColor: '#198754',
        borderWidth: 2,
      },
      {
        label: 'Problem Products',
        data: [
          data?.timeline?.problems7Days || 0,
          data?.timeline?.problems14Days || 0,
          data?.timeline?.problems30Days || 0,
          data?.problem || 0
        ],
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: '#ffc107',
        borderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Delivery Performance Over Time'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
});

// Monthly Products Chart
const MonthlyProductsChart = React.memo(function MonthlyProductsChart({ data, loading }) {
  const last6Months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }

  const chartData = {
    labels: last6Months,
    datasets: [
      {
        label: 'Products Added',
        data: data?.monthlyData || [0, 0, 0, 0, 0, 0],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Monthly Product Additions'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '250px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
});

const getStatusVariant = (status) => {
  switch (status) {
    case 'In Stock': return 'secondary';
    case 'Picked': return 'info';
    case 'Out for Delivery': return 'primary';
    case 'Delivered': return 'success';
    case 'Problem': return 'warning';
    case 'Failed/Returned': return 'danger';
    default: return 'secondary';
  }
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/stats/client');
      
      // Use backend data directly as it now includes all analytics
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to load client stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (mounted) {
        await loadStats();
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchData, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [loadStats]);

  if (error) {
    return (
      <Container>
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">
              <BsExclamationTriangle className="me-2" />
              {t('errors.loadDataFailed')}
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="client-dashboard-container">
      {/* Enhanced Header Section */}
      <div className="client-dashboard-header">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="dashboard-title">
              <BsBarChart className="me-3" />
              Analytics Dashboard
            </h1>
            <p className="dashboard-subtitle">Track your product delivery performance and insights</p>
          </div>

        </div>
      </div>

      {/* Key Performance Indicators */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <StatCard 
            icon={<BsBox />} 
            title={t('dashboard.totalProducts')} 
            value={stats?.totalProducts} 
            variant="primary"
            loading={loading}
            percentage={100}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard 
            icon={<BsCheckCircle />} 
            title={t('dashboard.delivered')} 
            value={stats?.delivered} 
            variant="success"
            loading={loading}
            percentage={stats?.metrics?.deliveryRate}
            trend={{ 
              type: stats?.timeline?.last7Days > stats?.timeline?.last14Days - stats?.timeline?.last7Days ? 'up' : 'down', 
              value: Math.abs(stats?.timeline?.last7Days - (stats?.timeline?.last14Days - stats?.timeline?.last7Days)), 
              period: t('dashboard.thisWeek') 
            }}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard 
            icon={<BsTruck />} 
            title={t('dashboard.inTransit')} 
            value={stats?.inTransit} 
            variant="info"
            loading={loading}
            percentage={stats?.totalProducts > 0 ? (stats?.inTransit / stats?.totalProducts) * 100 : 0}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard 
            icon={<BsExclamationTriangle />} 
            title={t('dashboard.issues')} 
            value={stats?.problem} 
            variant="warning"
            loading={loading}
            percentage={stats?.metrics?.problemRate}
            trend={{ 
              type: stats?.timeline?.problems7Days < (stats?.timeline?.problems14Days - stats?.timeline?.problems7Days) ? 'down' : 'up', 
              value: Math.abs(stats?.timeline?.problems7Days - (stats?.timeline?.problems14Days - stats?.timeline?.problems7Days)), 
              period: t('dashboard.vsLastWeek') 
            }}
          />
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row className="g-3 mb-4">
        <Col lg={2} md={4} sm={6}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <BsBoxSeam size={24} className="text-secondary mb-2" />
              <div className="text-muted small">In Stock</div>
              <div className="h5 mb-0 fw-bold">{loading ? '...' : stats?.inStock || 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <BsClockHistory size={24} className="text-info mb-2" />
              <div className="text-muted small">Picked</div>
              <div className="h5 mb-0 fw-bold">{loading ? '...' : stats?.picked || 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <BsGraphUp size={24} className="text-success mb-2" />
              <div className="text-muted small">Success Rate</div>
              <div className="h5 mb-0 fw-bold">{loading ? '...' : `${stats?.metrics?.successRate || 0}%`}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <BsCalendar size={24} className="text-primary mb-2" />
              <div className="text-muted small">This Month</div>
              <div className="h5 mb-0 fw-bold">{loading ? '...' : stats?.monthlyData?.[5] || 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={8} sm={12}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Delivery Performance</h6>
                <Badge bg="primary" className="px-3 py-2">
                  {stats?.metrics?.deliveryRate || 0}% Success
                </Badge>
              </div>
              <ProgressBar className="mb-2" style={{ height: '8px' }}>
                <ProgressBar 
                  variant="success" 
                  now={stats?.metrics?.deliveryRate || 0} 
                  label={`${stats?.delivered || 0} delivered`}
                />
              </ProgressBar>
              <div className="d-flex justify-content-between text-muted small">
                <span>0%</span>
                <span>100%</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Analytics Charts */}
      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="chart-card h-100">
            <div className="chart-header">
              <h2 className="chart-title">
                <BsBox />
                Product Status Distribution
              </h2>
            </div>
            <div className="chart-body">
              <StatusDistributionChart data={stats} loading={loading} />
            </div>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="chart-card h-100">
            <div className="chart-header">
              <h2 className="chart-title">
                <BsGraphUp />
                Delivery Performance Timeline
              </h2>
            </div>
            <div className="chart-body">
              <DeliveryTimelineChart data={stats} loading={loading} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Monthly Trend and Recent Products */}
      <Row className="g-3 mb-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <BsCalendar className="me-2" />
                Product Addition Trend
              </h6>
            </Card.Header>
            <Card.Body>
              <MonthlyProductsChart data={stats} loading={loading} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <BsBox className="me-2" />
                  Recent Products
                </h6>
                <Badge bg="primary" pill>
                  {stats?.recentProducts?.length || 0} items
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="text-muted">Loading recent products...</div>
                </div>
              ) : stats?.recentProducts?.length > 0 ? (
                <Table className="mb-0" size="sm">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Delivery Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div>
                            <div className="fw-medium">{product.name}</div>
                            <small className="text-muted">{product.buyerName}</small>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-success">{product.price} TND</span>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(product.status)} size="sm">
                            {product.status}
                          </Badge>
                        </td>
                        <td>
                          {product.assignedTo ? (
                            <div>
                              <div className="small fw-medium">{product.assignedTo.username}</div>
                              <small className="text-muted">{product.assignedTo.email}</small>
                            </div>
                          ) : (
                            <Badge bg="secondary" size="sm">Unassigned</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <BsBox size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No products yet</h6>
                  <p className="text-muted mb-0">Start by adding your first product to see analytics.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Quick Actions</h6>
                  <small className="text-muted">Manage your products and deliveries</small>
                </div>
                <div className="d-flex gap-2">
                  <Badge bg="outline-primary" className="px-3 py-2" style={{ cursor: 'pointer' }}>
                    <BsBox className="me-1" />
                    Add Product
                  </Badge>
                  <Badge bg="outline-info" className="px-3 py-2" style={{ cursor: 'pointer' }}>
                    <BsTruck className="me-1" />
                    Track Delivery
                  </Badge>
                  <Badge bg="outline-success" className="px-3 py-2" style={{ cursor: 'pointer' }}>
                    <BsBarChart className="me-1" />
                    View Reports
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
