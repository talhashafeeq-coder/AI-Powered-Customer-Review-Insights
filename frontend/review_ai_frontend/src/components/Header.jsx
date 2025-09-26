import React from "react";
import { Navbar, Container, Badge } from "react-bootstrap"; // import Bootstrap components

export default function Header() {
  return (
    <Navbar bg="dark" variant="dark" className="header-professional py-3">
      <Container fluid>
        <Navbar.Brand className="d-flex align-items-center">
          <div className="me-3">
            <i className="fas fa-brain fa-2x text-primary"></i>
          </div>
          <div>
            <h4 className="mb-0">AI-Powered Customer Review Insights</h4>
            <small className="text-muted">Transform feedback into actionable business intelligence</small>
          </div>
        </Navbar.Brand>
        <div className="d-flex align-items-center">
          <Badge bg="success" className="me-3">
            <i className="fas fa-circle me-1" style={{fontSize: '8px'}}></i>
            Live Analytics
          </Badge>
          <Badge bg="info">
            <i className="fas fa-clock me-1"></i>
            Auto-refresh: 30s
          </Badge>
        </div>
      </Container>
    </Navbar>
  );
}