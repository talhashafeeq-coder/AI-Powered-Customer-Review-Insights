import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";    // import Bootstrap components
import { addReview } from "../services/api";  // import API service
import NavBar from "../components/NavBar";  // import NavBar component
import "../components/Dashboard.css"; // import custom CSS

export default function AddReviewPage() {
  const [form, setForm] = useState({
    text: "",
    rating: "★★★☆☆ (3 stars)",
    date: new Date().toISOString().slice(0, 10),
    source: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Bulk JSON import state
  const [bulkJson, setBulkJson] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null); // {total, success, failed, errors: []}
  const [bulkSuccess, setBulkSuccess] = useState(null);

  const ratingOptions = [
    "★★★★★ (5 stars)",
    "★★★★☆ (4 stars)",
    "★★★☆☆ (3 stars)",
    "★★☆☆☆ (2 stars)",
    "★☆☆☆☆ (1 star)"
  ];

  // No predefined sources; user types any source

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await addReview(form);
      setSuccess("✅ Review added successfully!");
      setForm({
        text: "",
        rating: "★★★☆☆ (3 stars)",
        date: new Date().toISOString().slice(0, 10),
        source: ""
      });
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getRatingStars = (rating) => {
    const match = rating.match(/★/g);
    return match ? match.length : 0;
  };

  const getRatingColor = (rating) => {
    const stars = getRatingStars(rating);
    if (stars >= 4) return "success";
    if (stars >= 3) return "warning";
    return "danger";
  };

  // Bulk import handler
  const handleBulkImport = async () => {
    setBulkLoading(true);
    setBulkResult(null);
    setBulkSuccess(null);
    try {
      // Expect an array of objects with fields: text, rating, date, source
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of review objects");
      }
      let successCount = 0;
      const errors = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i] || {};
        // Basic validation
        if (!item.text || !item.rating || !item.date || !item.source) {
          errors.push({ index: i, message: "Missing required fields (text, rating, date, source)" });
          continue;
        }
        try {
          await addReview({
            text: String(item.text),
            rating: String(item.rating),
            date: String(item.date),
            source: String(item.source)
          });
          successCount += 1;
        } catch (e) {
          errors.push({ index: i, message: e.message || "submit failed" });
        }
      }
      setBulkResult({ total: parsed.length, success: successCount, failed: parsed.length - successCount, errors });
      if (successCount > 0 && errors.length === 0) {
        setBulkSuccess(`✅ Imported ${successCount} review(s) successfully.`);
        setBulkJson("");
      }
    } catch (e) {
      setBulkResult({ total: 0, success: 0, failed: 0, errors: [{ index: -1, message: e.message }] });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Container fluid className="dashboard-container my-4 px-4">
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h2 className="mb-2">➕ Add New Review</h2>
              <p className="text-muted">Submit a single review or import multiple reviews at once</p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="analytics-card">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <i className="fas fa-plus-circle me-2"></i>
                  Review Submission
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Tabs defaultActiveKey="single" id="review-tabs" className="mb-3">
                  
                  {/* Single Review Tab */}
                  <Tab eventKey="single" title="Single Review">
                    {/* Status Messages */}
                    {success && (
                      <Alert variant="success" className="d-flex align-items-center">
                        <i className="fas fa-check-circle me-2"></i>
                        {success}
                      </Alert>
                    )}
                    {error && (
                      <Alert variant="danger" className="d-flex align-items-center">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      {/* Review Text */}
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-comment-dots me-2 text-primary"></i>
                          Review Text *
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={form.text}
                          onChange={(e) => handleInputChange('text', e.target.value)}
                          placeholder="Share your experience with the product or service..."
                          className="form-control-lg"
                          style={{
                            border: '2px solid #e9ecef',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            lineHeight: '1.6'
                          }}
                          required
                        />
                        <Form.Text className="text-dark">
                          <i className="fas fa-info-circle me-1"></i>
                          Provide detailed feedback for better AI analysis
                        </Form.Text>
                      </Form.Group>

                      {/* Rating Selection */}
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-star me-2 text-warning"></i>
                          Rating *
                        </Form.Label>
                        <div className="rating-selection">
                          {ratingOptions.map((rating) => (
                            <div
                              key={rating}
                              className={`rating-option ${form.rating === rating ? 'selected' : ''}`}
                              onClick={() => handleInputChange('rating', rating)}
                              style={{
                                padding: '12px 16px',
                                margin: '4px 0',
                                border: `2px solid ${form.rating === rating ? '#667eea' : '#e9ecef'}`,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                background: form.rating === rating
                                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  : '#fff',
                                color: form.rating === rating ? '#fff' : '#333',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                                {rating}
                              </span>
                              {form.rating === rating && (
                                <Badge bg="light" text="dark" className="badge-custom">
                                  <i className="fas fa-check me-1"></i>
                                  Selected
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </Form.Group>

                      {/* Date and Source Row */}
                      <Row className="mb-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              <i className="fas fa-calendar me-2 text-info"></i>
                              Date *
                            </Form.Label>
                            <Form.Control
                              type="date"
                              value={form.date}
                              onChange={(e) => handleInputChange('date', e.target.value)}
                              className="form-control-lg"
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '10px'
                              }}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              <i className="fas fa-tag me-2 text-secondary"></i>
                              Source *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={form.source}
                              onChange={(e) => handleInputChange('source', e.target.value)}
                              className="form-control-lg"
                              placeholder="e.g., Google Play Store, Website, Email..."
                              style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '10px'
                              }}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Preview Section */}
                      {form.text && (
                        <Card className="bg-light border-0 mb-4">
                          <Card.Header className="bg-light border-0">
                            <h6 className="mb-0 text-primary">
                              <i className="fas fa-eye me-2"></i>
                              Preview
                            </h6>
                          </Card.Header>
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <Badge bg={getRatingColor(form.rating)} className="badge-custom">
                                <i className="fas fa-star me-1"></i>
                                {form.rating}
                              </Badge>
                              <div className="text-muted small">
                                <i className="fas fa-calendar me-1"></i>
                                {form.date} |
                                <i className="fas fa-tag ms-2 me-1"></i>
                                {form.source}
                              </div>
                            </div>
                            <p className="mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                              {form.text}
                            </p>
                          </Card.Body>
                        </Card>
                      )}

                      {/* Submit Button */}
                      <div className="text-center">
                        <Button
                          type="submit"
                          size="lg"
                          disabled={loading}
                          className="action-button px-5 py-3"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                          }}
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>
                              Submit Review
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Tab>

                  {/* Bulk Import Tab */}
                  <Tab eventKey="bulk" title="Bulk Import JSON">
                    {bulkSuccess && (
                      <Alert variant="success" dismissible onClose={() => setBulkSuccess(null)}>
                        {bulkSuccess}
                      </Alert>
                    )}
                    <p className="text-dark mb-2">Paste a JSON array of reviews. Required fields per item: <code>text</code>, <code>rating</code>, <code>date</code> (YYYY-MM-DD), <code>source</code>.</p>
                    <div className="bg-dark p-2 rounded small mb-3">
                      <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{`[
  {
    "text": "I love the discount program...",
    "rating": "★★★☆☆ (3 stars)",
    "date": "2025-01-01",
    "source": "Google Play Store"
  },
  {
    "text": "Search results are irrelevant...",
    "rating": "★★☆☆☆ (2 stars)",
    "date": "2025-01-03",
    "source": "Website"
  }
]`}</pre>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={8}
                        value={bulkJson}
                        onChange={(e) => setBulkJson(e.target.value)}
                        placeholder="Paste JSON array here..."
                        className="form-control-lg"
                        style={{ border: '2px solid #e9ecef', borderRadius: '12px' }}
                      />
                    </Form.Group>
                    <div className="d-flex align-items-center gap-2">
                      <Button onClick={handleBulkImport} disabled={bulkLoading || !bulkJson.trim()} className="action-button">
                        {bulkLoading ? <Spinner size="sm" className="me-2" /> : <i className="fas fa-upload me-2"></i>}
                        {bulkLoading ? 'Importing...' : 'Import'}
                      </Button>
                      {bulkResult && (
                        <span className="small text-muted">
                          Total: {bulkResult.total} • Success: {bulkResult.success} • Failed: {bulkResult.failed}
                        </span>
                      )}
                    </div>
                    {bulkResult?.errors?.length > 0 && (
                      <div className="mt-3">
                        <h6 className="text-danger mb-2"><i className="fas fa-exclamation-triangle me-1"></i>Errors</h6>
                        <ul className="small mb-0">
                          {bulkResult.errors.map((e, idx) => (
                            <li key={idx}>Row {e.index >= 0 ? e.index + 1 : 'N/A'}: {e.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>

            {/* Help Section - Only show for Single Review tab */}
            <Card className="analytics-card mt-4">
              <Card.Header>
                <h6 className="mb-0 text-primary">
                  <i className="fas fa-question-circle me-2"></i>
                  Need Help?
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <Row>
                  <Col md={6}>
                    <h6 className="text-success mb-2">
                      <i className="fas fa-lightbulb me-2"></i>
                      Tips for Better Reviews
                    </h6>
                    <ul className="list-unstyled small">
                      <li><i className="fas fa-check text-success me-2"></i>Be specific about your experience</li>
                      <li><i className="fas fa-check text-success me-2"></i>Mention both positive and negative aspects</li>
                      <li><i className="fas fa-check text-success me-2"></i>Include details about the product/service</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-info mb-2">
                      <i className="fas fa-robot me-2"></i>
                      AI Analysis
                    </h6>
                    <ul className="list-unstyled small">
                      <li><i className="fas fa-check text-info me-2"></i>Sentiment analysis</li>
                      <li><i className="fas fa-check text-info me-2"></i>Topic extraction</li>
                      <li><i className="fas fa-check text-info me-2"></i>Actionable insights</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}