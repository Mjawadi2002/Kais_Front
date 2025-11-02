import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import apiClient from '../config/apiClient';
import config from '../config/config';
import { BsBoxArrowInRight, BsPersonFill, BsEye, BsEyeSlash, BsLock } from 'react-icons/bs';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'client') navigate('/client');
      else if (user.role === 'delivery') navigate('/delivery');
    }
  }, [user, isLoading, navigate]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="app-login-bg d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await apiClient.post('/api/v1/auth/login', { email, password });
      const data = resp.data;
      // data: { accessToken, refreshToken, user, expiresIn }
      login(data.user, data.accessToken, data.refreshToken, data.expiresIn);
      toast.success(`Welcome ${data.user.name}! Session will last 1 hour.`);
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
