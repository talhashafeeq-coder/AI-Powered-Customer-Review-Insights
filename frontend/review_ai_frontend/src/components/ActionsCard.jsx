import React from "react";
import { Card, Button } from "react-bootstrap"; // import Bootstrap components

export default function ActionsCard({ testAPI, loadSampleData }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>🚀 Quick Actions</Card.Title>
        <Button variant="secondary" className="me-2" onClick={testAPI}>
          Test API
        </Button>
        <Button variant="success" onClick={loadSampleData}>
          Load Sample Data
        </Button>
        <a href="/api/docs" className="btn btn-info ms-2" target="_blank" rel="noreferrer">
          API Documentation
        </a>
      </Card.Body>
    </Card>
  );
}
