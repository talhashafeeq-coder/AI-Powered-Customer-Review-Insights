import React from "react";
import { Card, Button, ProgressBar } from "react-bootstrap"; // import Bootstrap components

export default function SentimentCard({ sentiment, refresh }) {
  const getColor = (s) => {
    switch(s) {
      case "positive": return "success";
      case "negative": return "danger";
      case "neutral": return "warning";
      default: return "secondary";
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>📈 Sentiment Overview</Card.Title>
        {sentiment?.sentiment_breakdown ? (
          sentiment.sentiment_breakdown.map((item, idx) => {
            const percentage = ((item.count / sentiment.total_insights) * 100).toFixed(1);
            return (
              <div key={idx} className="mb-2 d-flex justify-content-between align-items-center">
                <span style={{ textTransform: "capitalize" }}>{item._id}</span>
                <ProgressBar 
                  now={percentage} 
                  label={`${percentage}%`} 
                  variant={getColor(item._id)} 
                  style={{ width: "50%" }}
                />
                <span>{item.count}</span>
              </div>
            );
          })
        ) : (
          <p>Loading sentiment data...</p>
        )}
        <Button variant="primary" onClick={refresh}>Refresh Sentiment</Button>
      </Card.Body>
    </Card>
  );
}
