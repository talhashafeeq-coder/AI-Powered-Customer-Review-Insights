import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Badge,
} from "react-bootstrap";
import { fetchInsights } from "../services/api";

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSentiment, setSelectedSentiment] = useState("All");
  const [showFilters, setShowFilters] = useState(true);

  const [expanded, setExpanded] = useState({}); // track expanded text

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await fetchInsights();
        setInsights(Array.isArray(data) ? data : []); // safe default
      } catch (err) {
        console.error("Error loading insights:", err);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  if (loading) return <Spinner animation="border" className="m-4" />;

  // Extract topics + sentiments
  const allTopics = ["All", ...new Set(insights.flatMap((i) => i.topics || []))];
  const allSentiments = ["All", ...new Set(insights.map((i) => i.sentiment))];

  // Filtering
  const filteredInsights = insights.filter((i) => {
    const matchTopic =
      selectedTopic === "All" ? true : (i.topics || []).includes(selectedTopic);
    const matchSentiment =
      selectedSentiment === "All" ? true : i.sentiment === selectedSentiment;
    return matchTopic && matchSentiment;
  });

  // Fields to hide
  const hiddenKeys = [
    "id",
    "review_id",
    "created_at",
    "updated_at",
    "processing_time",
    "ai_model",
  ];

  // toggle expand/collapse text
  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
    <NavBar/>
    <Container fluid className="my-3">
      <Row>
        {/* Sidebar toggle (mobile) */}
        <div className="d-md-none text-center mb-2">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Sidebar */}
        {showFilters && (
          <Col
            md={3}
            className="mb-3"
            style={{ position: "sticky", top: "10px", height: "100vh" }}
          >
            {/* Topic Filter */}
            <Card className="shadow-sm mb-3">
              <Card.Body className="p-2">
                <h6 className="mb-2 text-center">Filter by Topic</h6>
                <ul className="list-unstyled mb-0">
                  {allTopics.map((t) => (
                    <li
                      key={t}
                      onClick={() => setSelectedTopic(t)}
                      style={{
                        cursor: "pointer",
                        fontWeight: selectedTopic === t ? "600" : "400",
                        color: selectedTopic === t ? "#0d6efd" : "#555",
                        padding: "4px 0",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>

            {/* Sentiment Filter */}
            <Card className="shadow-sm">
              <Card.Body className="p-2">
                <h6 className="mb-2 text-center">Filter by Sentiment</h6>
                <ul className="list-unstyled mb-0 text-center">
                  {allSentiments.map((s) => (
                    <li
                      key={s}
                      onClick={() => setSelectedSentiment(s)}
                      style={{
                        cursor: "pointer",
                        fontWeight: selectedSentiment === s ? "600" : "400",
                        color: selectedSentiment === s ? "#0d6efd" : "#555",
                        padding: "4px 0",
                        fontSize: "0.9rem",
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Insights Container */}
        <Col md={showFilters ? 9 : 12}>
          <h5 className="mb-3 text-center text-primary fw-bold">
            💡 AI Insights ({filteredInsights.length})
          </h5>

          <Card className="shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body style={{ padding: "12px" }}>
              {filteredInsights.length === 0 && (
                <p className="text-center text-muted">No insights found</p>
              )}

              {filteredInsights.map((insight, idx) => {
                const entries = Object.entries(insight).filter(
                  ([key]) => !hiddenKeys.includes(key)
                );

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "16px 10px",
                      borderBottom:
                        idx !== filteredInsights.length - 1
                          ? "1px solid #eee"
                          : "none",
                    }}
                  >
                    {/* Title */}
                    <h6
                      style={{
                        marginBottom: "12px",
                        fontWeight: "600",
                        color: "#0d6efd",
                      }}
                    >
                      Insight #{idx + 1}
                    </h6>

                    {/* Render fields */}
                    {entries.map(([key, value]) => (
                      <div
                        key={key}
                        className="mb-2"
                        style={{
                          fontSize: "0.9rem",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <strong
                          style={{
                            textTransform: "capitalize",
                            color: "#444",
                            display: "inline-block",
                            minWidth: "120px",
                          }}
                        >
                          {key.replace(/_/g, " ")}:
                        </strong>{" "}
                        {key === "text" ? (
                          <>
                            <div
                              style={{
                                maxHeight: expanded[idx] ? "none" : "70px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {String(value)}
                            </div>
                            {String(value).length > 120 && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 mt-1"
                                onClick={() => toggleExpand(idx)}
                              >
                                {expanded[idx] ? "Show less" : "Read more"}
                              </Button>
                            )}
                          </>
                        ) : Array.isArray(value) ? (
                          key === "problems" || key === "suggestions" ? (
                            value.length > 0 ? (
                              <span className="text-muted">
                                {value.join(", ")}
                              </span>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )
                          ) : value.length > 0 ? (
                            value.map((v, i) => (
                              <Badge
                                key={i}
                                bg="secondary"
                                className="me-1"
                                style={{
                                  fontSize: "0.75rem",
                                  wordWrap: "break-word",
                                  overflowWrap: "break-word",
                                }}
                              >
                                {v}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted">N/A</span>
                          )
                        ) : typeof value === "boolean" ? (
                          value ? (
                            <Badge bg="success">Yes</Badge>
                          ) : (
                            <Badge bg="danger">No</Badge>
                          )
                        ) : (
                          <span
                            className="text-muted"
                            style={{
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {String(value)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );
}
