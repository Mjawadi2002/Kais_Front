import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsTruck, BsClock, BsCheck } from 'react-icons/bs';

export default function DeliveryDashboard(){
  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h3>Delivery Dashboard</h3>
          <div className="small-muted">Your assigned deliveries and history</div>
        </Col>
      </Row>

      <Row>
        <Col md={4}><Card className="stat-card"><Card.Body><BsTruck className="me-2"/> <strong>7</strong><div className="small-muted">Assigned</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><BsClock className="me-2"/> <strong>3</strong><div className="small-muted">Out for delivery</div></Card.Body></Card></Col>
        <Col md={4}><Card className="stat-card"><Card.Body><BsCheck className="me-2"/> <strong>24</strong><div className="small-muted">Delivered</div></Card.Body></Card></Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <p>Assigned deliveries list and actions will appear here.</p>
        </Col>
      </Row>
    </Container>
  );
}
