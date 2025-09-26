import React from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap"; // import Bootstrap components
import { Link, useLocation } from "react-router-dom"; // import routing components

export default function NavBar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { path: "/reviews", label: "Reviews", icon: "fas fa-comments" },
    { path: "/insights", label: "Insights", icon: "fas fa-lightbulb" },
    { path: "/analytics", label: "Analytics", icon: "fas fa-chart-line" },
    { path: "/add-review", label: "Add Review", icon: "fas fa-plus-circle" },
    { path: "/home", label: "API Docs", icon: "fas fa-book" }
  ];

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="navbar-professional mb-4 shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="fas fa-robot me-2"></i>
          ReviewAI
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map((item) => (
              <Nav.Link 
                key={item.path}
                as={Link} 
                to={item.path}
                className={`d-flex align-items-center ${location.pathname === item.path ? 'active' : ''}`}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
                {item.path === "/dashboard" && (
                  <Badge bg="light" text="dark" className="ms-2">Live</Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>
          <Nav>
            <Nav.Link href="#" className="text-white">
              <i className="fas fa-user-circle me-1"></i>
              Admin
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}