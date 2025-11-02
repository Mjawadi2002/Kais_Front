import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ProductForm from '../../components/forms/ProductForm';
import './AddProduct.css';

export default function AddProduct(){
  const { t } = useTranslation();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h3 className="mb-1">{t('products.addNewProduct')}</h3>
          <p className="text-muted mb-0">{t('products.addProductSubtitle')}</p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 product-form-card">
            <Card.Body className="p-4">
              <ProductForm onCreated={(p)=>{ /* future: maybe navigate to products list */ }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
