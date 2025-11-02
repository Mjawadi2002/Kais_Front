import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsBox, BsTruck, BsCheckCircle } from 'react-icons/bs';

export default function ClientDashboard(){
  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h3>Client Dashboard</h3>
          <div className="small-muted">Manage your products and track deliveries</div>
        </Col>
      </Row>

      <Row>
        <Col md={4}><Card className="stat-card"><Card.Body><BsBox className="me-2"/> <strong>12</strong><div className="small-muted">Total products</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><BsTruck className="me-2"/> <strong>4</strong><div className="small-muted">In transit</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><BsCheckCircle className="me-2"/> <strong>8</strong><div className="small-muted">Delivered</div></Card.Body></Card></Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <p>Recent products and actions will appear here.</p>
        </Col>
      </Row>
    </Container>
  );
}
