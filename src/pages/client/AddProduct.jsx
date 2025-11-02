import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ProductForm from '../../components/forms/ProductForm';

export default function AddProduct(){
  return (
    <Container>
      <Row className="mb-3">
        <Col><h3>Add New Product</h3></Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <ProductForm onCreated={(p)=>{ /* future: maybe navigate to products list */ }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
