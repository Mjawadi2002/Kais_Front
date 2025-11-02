import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BsBoxArrowInRight, BsPersonFill, BsEye, BsEyeSlash, BsLock } from 'react-icons/bs';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/api/v1/auth/login`, { email, password });
      const data = resp.data;
      // data: { token, user }
      login(data.user, data.token);
      toast.success('Logged in');
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'client') navigate('/client');
      else if (data.user.role === 'delivery') navigate('/delivery');
    } catch (err) {
      console.error('Login error', err?.response?.data || err.message || err);
      const msg = err?.response?.data?.message || err.message || 'Login error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-login-bg d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="login-logo mb-3">
                    <div className="brand-logo display-4">Kais Delivery</div>
                    <div className="small-muted fs-6">Delivery management system</div>
                  </div>
                </div>

                <Form onSubmit={submit} className="login-form">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                    <InputGroup className="login-input-group">
                      <InputGroup.Text className="login-input-icon"><BsPersonFill /></InputGroup.Text>
                      <Form.Control 
                        type="email" 
                        value={email} 
                        onChange={(e)=>setEmail(e.target.value)} 
                        required 
                        placeholder="Enter your email"
                        className="login-input"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <InputGroup className="login-input-group">
                      <InputGroup.Text className="login-input-icon"><BsLock /></InputGroup.Text>
                      <Form.Control 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e)=>setPassword(e.target.value)} 
                        required 
                        placeholder="Enter your password"
                        className="login-input"
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={()=>setShowPassword(s=>!s)} 
                        aria-label="Toggle password visibility"
                        className="login-eye-btn"
                      >
                        {showPassword ? <BsEye /> : <BsEyeSlash />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      variant="primary"
                      className="login-submit-btn"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <><BsBoxArrowInRight className="me-2"/> Sign in</>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
