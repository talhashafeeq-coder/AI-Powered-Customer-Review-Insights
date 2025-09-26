import React from "react";
import { Card } from "react-bootstrap"; // import Bootstrap components

export default function StatsCard({ stats }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="d-flex justify-content-around">
        <div>
          <h5>Total Reviews</h5>
          <h3>{stats.total_reviews}</h3>
        </div>
        <div>
          <h5>Analyzed</h5>
          <h3>{stats.analyzed_reviews}</h3>
        </div>
        <div>
          <h5>Insights</h5>
          <h3>{stats.insights}</h3>
        </div>
      </Card.Body>
    </Card>
  );
}
