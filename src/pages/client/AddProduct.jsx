import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsBoxSeam, BsPlus } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import ProductForm from '../../components/forms/ProductForm';
import './AddProduct.css';

export default function AddProduct(){
  const { t } = useTranslation();

  return (
    <Container fluid className="add-product-container">
      {/* Enhanced Header Section */}
      <div className="add-product-header">
        <h1 className="page-title">
          <BsPlus className="me-3" />
          Add New Product
        </h1>
        <p className="page-subtitle">Fill in the product details to add it to your inventory</p>
      </div>

      <Row className="justify-content-center">
        <Col xl={6} lg={7} md={8} sm={10}>
          <Card className="product-form-card">
            <div className="form-container">
              <div className="form-title">
                <BsBoxSeam size={32} className="text-primary mb-3" />
                <h3>Product Information</h3>
              </div>
              <ProductForm onCreated={(p)=>{ /* future: maybe navigate to products list */ }} />
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
