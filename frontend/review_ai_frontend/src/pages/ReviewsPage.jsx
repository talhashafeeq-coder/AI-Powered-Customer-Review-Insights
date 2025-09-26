import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Badge,
  Button,
  ButtonGroup
} from "react-bootstrap"; // import Bootstrap components
import { fetchReviews } from "../services/api"; // import API service
import NavBar from "../components/NavBar"; // import NavBar component
import FilterSidebar, { FilterCard, FilterList, RatingFilter } from "../components/FilterSidebar"; // import FilterSidebar component
import "../components/Dashboard.css"; // import custom CSS

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedAnalysis, setSelectedAnalysis] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await fetchReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  const parseStars = (ratingStr) => {
    if (!ratingStr) return null;
    const match = ratingStr.match(/★/g);
    return match ? match.length : null;
  };

  const sources = ["All", ...new Set(reviews.map((r) => r.source).filter(Boolean))];
  const analysisFilters = ["All", "Analyzed", "Not Analyzed"];

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      const matchSource = selectedSource === "All" ? true : review.source === selectedSource;
      const stars = parseStars(review.rating);
      const matchRating = selectedRating === "All" ? true : stars === selectedRating;
      const matchAnalysis = selectedAnalysis === "All"
        ? true
        : selectedAnalysis === "Analyzed"
        ? review.is_analyzed
        : !review.is_analyzed;
      return matchSource && matchRating && matchAnalysis;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "rating":
          return parseStars(b.rating) - parseStars(a.rating);
        case "source":
          return a.source.localeCompare(b.source);
        default:
          return 0;
      }
    });

  const getRatingColor = (rating) => {
    const stars = parseStars(rating);
    if (stars >= 4) return "success";
    if (stars >= 3) return "warning";
    return "danger";
  };

  const getAnalysisBadge = (isAnalyzed) => {
    return isAnalyzed ? (
      <Badge bg="success" className="badge-custom">
        <i className="fas fa-check-circle me-1"></i>
        Analyzed
      </Badge>
    ) : (
      <Badge bg="secondary" className="badge-custom">
        <i className="fas fa-clock me-1"></i>
        Pending
      </Badge>
    );
  };

  // 🔥 Scroll-to-top handlers for filters
  const handleRatingSelect = (value) => {
    setSelectedRating(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSourceSelect = (value) => {
    setSelectedSource(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnalysisSelect = (value) => {
    setSelectedAnalysis(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Container fluid className="dashboard-container my-4 px-4">
          <div className="text-center mt-5">
            <Spinner animation="border" className="loading-spinner" />
            <p className="text-muted mt-3">Loading reviews...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container fluid className="dashboard-container my-4 px-4">
        <Row>
          {/* Sidebar Filters */}
          {showFilters && (
            <Col md={3} className="mb-3">
              <FilterSidebar 
                showFilters={showFilters} 
                setShowFilters={setShowFilters}
                title="Review Filters"
                isMobile={true}
              >
                <FilterCard title="Rating" icon="star">
                  <RatingFilter
                    selectedRating={selectedRating}
                    onSelect={handleRatingSelect} // 🔥 scroll-to-top
                  />
                </FilterCard>

                <FilterCard title="Analysis Status" icon="brain">
                  <FilterList
                    items={analysisFilters}
                    selectedItem={selectedAnalysis}
                    onSelect={handleAnalysisSelect} // 🔥 scroll-to-top
                    icon="chart-line"
                  />
                </FilterCard>

                <FilterCard title="Source" icon="tag">
                  <FilterList
                    items={sources}
                    selectedItem={selectedSource}
                    onSelect={handleSourceSelect} // 🔥 scroll-to-top
                    icon="globe"
                  />
                </FilterCard>
              </FilterSidebar>
            </Col>
          )}

          {/* Reviews Content */}
          <Col md={showFilters ? 9 : 12}>
            {/* Top controls: Filter Results + Sort Buttons */}
            <Row className="mb-3 align-items-center">
              <Col className="d-flex justify-content-end gap-2">
                <Card className="bg-light border-0 me-2">
                  <Card.Body className="p-2 text-center">
                    <h6 className="text-primary mb-1">
                      <i className="fas fa-filter me-1"></i>
                      Filter Results
                    </h6>
                    <div className="metric-card p-0">
                      <h5 className="text-white mb-0">{filteredAndSortedReviews.length}</h5>
                      <small className="text-white">Reviews Found</small>
                    </div>
                  </Card.Body>
                </Card>

                <ButtonGroup size="sm">
                  <Button
                    variant={sortBy === "date" ? "primary" : "outline-primary"}
                    onClick={() => setSortBy("date")}
                  >
                    <i className="fas fa-calendar me-1"></i>
                    Date
                  </Button>
                  <Button
                    variant={sortBy === "rating" ? "primary" : "outline-primary"}
                    onClick={() => setSortBy("rating")}
                  >
                    <i className="fas fa-star me-1"></i>
                    Rating
                  </Button>
                  <Button
                    variant={sortBy === "source" ? "primary" : "outline-primary"}
                    onClick={() => setSortBy("source")}
                  >
                    <i className="fas fa-tag me-1"></i>
                    Source
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>

            {/* Reviews Card */}
            <Card className="analytics-card">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-white">
                    <i className="fas fa-comments me-2"></i>
                    Customer Reviews ({filteredAndSortedReviews.length})
                  </h5>
                  <div className="d-flex gap-2">
                    <Badge bg="info" className="badge-custom">
                      {reviews.filter(r => r.is_analyzed).length} Analyzed
                    </Badge>
                    <Badge bg="secondary" className="badge-custom">
                      {reviews.filter(r => !r.is_analyzed).length} Pending
                    </Badge>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredAndSortedReviews.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-comments"></i>
                    <p>No reviews found matching your filters</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <div className="reviews-container">
                      {filteredAndSortedReviews.map((review, idx) => (
                        <div
                          key={review.id || idx}
                          className="review-item"
                          style={{
                            padding: "20px",
                            borderBottom: idx !== filteredAndSortedReviews.length - 1 ? "1px solid #e9ecef" : "none",
                            transition: "all 0.3s ease",
                            color: "#fff"
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="mb-2 text-primary">
                                <i className="fas fa-user me-2"></i>
                                Review #{idx + 1}
                              </h6>
                              <div className="d-flex gap-2 align-items-center">
                                <Badge bg={getRatingColor(review.rating)} className="badge-custom">
                                  <i className="fas fa-star me-1"></i>
                                  {review.rating}
                                </Badge>
                                {getAnalysisBadge(review.is_analyzed)}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="text-muted small">
                                <i className="fas fa-calendar me-1"></i>
                                {review.date}
                              </div>
                              <div className="text-muted small">
                                <i className="fas fa-tag me-1"></i>
                                {review.source}
                              </div>
                            </div>
                          </div>

                          <div className="review-content">
                            <p className="mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                              {review.text}
                            </p>
                          </div>

                          <div className="mt-3 d-flex justify-content-between align-items-center">
                            <div className="text-muted small">
                              <i className="fas fa-id-card me-1"></i>
                              ID: {review.id || 'N/A'}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              className="action-button"
                            >
                              <i className="fas fa-eye me-1"></i>
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
