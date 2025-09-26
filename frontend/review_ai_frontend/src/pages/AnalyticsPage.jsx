import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar"; // import NavBar component
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  ProgressBar,
} from "react-bootstrap"; // import Bootstrap components
import axios from "axios"; // for API calls
import CountUp from "react-countup"; // for animated counting
import "../components/Dashboard.css"; // import custom CSS

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    total_reviews: 0,
    analyzed_reviews: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPendingReviews, setShowPendingReviews] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, reviewsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/analytics/summary"),
        axios.get("http://localhost:8000/api/reviews"),
      ]);
      setStats(statsRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const pendingReviews = reviews.filter((r) => !r.is_analyzed);

  const handleBatchAnalyze = async () => {
    try {
      if (!pendingReviews.length) {
        alert("✅ No pending reviews to analyze.");
        return;
      }

      const res = await axios.post(
        "http://localhost:8000/api/insights/batch-analyze",
        { review_ids: pendingReviews.map((r) => r.id), force_reanalysis: false }
      );

      alert(res.data.message || "Batch analysis started successfully!");
      fetchAnalytics();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSingleAnalyze = async (reviewId) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/insights/batch-analyze",
        { review_ids: [reviewId], force_reanalysis: true }
      );
      alert(
        res.data.message ||
          `AI NRI triggered for Review ${reviewId}. Success: ${res.data.successful_analyses}, Failed: ${res.data.failed_analyses}`
      );
      fetchAnalytics();
    } catch (err) {
      alert(
        `Error triggering AI NRI for Review ${reviewId}: ${
          err.response?.data?.detail || err.message
        }`
      );
    }
  };

  if (loading)
    return (
      <Container fluid className="dashboard-container my-4 px-4">
        <div className="text-center mt-5">
          <Spinner animation="border" className="loading-spinner" />
        </div>
      </Container>
    );
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <>
      <NavBar />

      <Container fluid className="dashboard-container my-4 px-4">
        <h2 className="text-center text-primary mb-4 fw-bold">
          <i className="fas fa-chart-bar me-2"></i>
          Analytics
        </h2>

        {/* Quick Stats */}
        <Row className="mb-4 text-center g-3">
          <Col md={4}>
            <Card className="metric-card h-100">
              <Card.Body>
                <Card.Title>Total Reviews</Card.Title>
                <h3 className="text-light">
                  <CountUp end={stats.total_reviews} duration={1.5} />
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="metric-card h-100">
              <Card.Body>
                <Card.Title>Analyzed Reviews</Card.Title>
                <h3 className="text-light">
                  <CountUp end={stats.analyzed_reviews} duration={1.5} />
                </h3>
                <ProgressBar
                  now={(stats.analyzed_reviews / stats.total_reviews) * 100}
                  variant={(stats.analyzed_reviews / Math.max(1, stats.total_reviews)) * 100 > 80 ? 'success' : (stats.analyzed_reviews / Math.max(1, stats.total_reviews)) * 100 > 50 ? 'warning' : 'danger'}
                  className="progress-custom mt-2"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="metric-card h-100">
              <Card.Body>
                <Card.Title>⏳ Pending Reviews</Card.Title>
                <h3 className="text-warning">
                  <CountUp
                    end={stats.total_reviews - stats.analyzed_reviews}
                    duration={1.5}
                  />
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Reviews Card */}
        <Card className="analytics-card mb-4">
          <Card.Body>
            <Card.Title className="mb-3">Pending Reviews</Card.Title>
            <p>
              <strong>{pendingReviews.length}</strong> reviews waiting for AI
              analysis
            </p>
            {pendingReviews.length > 0 && (
              <>
                <Button
                  variant="primary"
                  onClick={handleBatchAnalyze}
                  className="me-2"
                >
                  🚀 Analyze All Pending Reviews
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPendingReviews(!showPendingReviews)}
                >
                  {showPendingReviews
                    ? "Hide Pending Reviews"
                    : "Show Pending Reviews"}
                </Button>
              </>
            )}
          </Card.Body>
        </Card>

{/* Pending Reviews Cards */}
{showPendingReviews && pendingReviews.length > 0 && (
  <Row className="mb-4 g-3">
    {pendingReviews.map((review) => (
      <Col md={4} key={review.id} className="mb-3">
        <Card className="shadow-sm h-100">
          <Card.Body className="p-3">
            {/* Date */}
            <p style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: "0.5rem" }}>
              <strong>Date:</strong> {new Date(review.created_at).toLocaleString()}
            </p>

            {/* Source */}
            {review.source && (
              <p style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: "0.5rem" }}>
                <strong>Source:</strong> {review.source}
              </p>
            )}

            {/* Rating */}
            {review.rating && (
              <p style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: "0.5rem" }}>
                <strong>Rating:</strong> {review.rating}
              </p>
            )}

            {/* Content */}
            <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              <strong>Content:</strong> {review.text}
            </p>

            {/* Trigger AI Button */}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleSingleAnalyze(review.id)}
            >
              Trigger AI NRI
            </Button>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
)}


        {/* Bottom Test API Button */}
        <Row className="mb-4 text-center">
          <Col>
            <Button
              variant="outline-primary"
              onClick={async () => {
                try {
                  const res = await axios.get(
                    "http://localhost:8000/api/health"
                  );
                  alert("API Status: " + res.data.status);
                } catch (err) {
                  alert("API Error: " + err.message);
                }
              }}
            >
              Test API
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}
