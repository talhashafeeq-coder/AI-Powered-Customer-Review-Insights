import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Badge,
  Button,
  ButtonGroup,
  ProgressBar,
  Collapse
} from "react-bootstrap"; // import Bootstrap components
import { fetchInsights } from "../services/api"; // import API service
import NavBar from "../components/NavBar"; // import NavBar component
import FilterSidebar, { FilterCard, FilterList } from "../components/FilterSidebar"; // import FilterSidebar component
import "../components/Dashboard.css"; // import custom CSS

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSentiment, setSelectedSentiment] = useState("All");
  const [selectedConfidence, setSelectedConfidence] = useState("All");
  const [sortBy, setSortBy] = useState("confidence");

  // Expand/collapse rows
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await fetchInsights();
        setInsights(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading insights:", error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  // Scroll to top whenever a filter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedTopic, selectedSentiment, selectedConfidence]);

  const allTopics = ["All", ...new Set(insights.flatMap(i => i.topics || []))];
  const allSentiments = ["All", ...new Set(insights.map(i => i.sentiment))];
  const confidenceRanges = ["All", "High (80%+)", "Medium (60-80%)", "Low (Below 60%)"];

  const filteredAndSortedInsights = insights
    .filter(i => {
      const matchTopic = selectedTopic === "All" ? true : (i.topics || []).includes(selectedTopic);
      const matchSentiment = selectedSentiment === "All" ? true : i.sentiment === selectedSentiment;
      const matchConfidence = selectedConfidence === "All" ? true :
        (selectedConfidence === "High (80%+)" && i.confidence >= 0.8) ||
        (selectedConfidence === "Medium (60-80%)" && i.confidence >= 0.6 && i.confidence < 0.8) ||
        (selectedConfidence === "Low (Below 60%)" && i.confidence < 0.6);
      return matchTopic && matchSentiment && matchConfidence;
    })
    .sort((a, b) => {
      switch(sortBy){
        case "confidence": return b.confidence - a.confidence;
        case "sentiment": return a.sentiment.localeCompare(b.sentiment);
        case "date": return new Date(b.created_at||0) - new Date(a.created_at||0);
        default: return 0;
      }
    });

  const toggleRowExpansion = idx => setExpandedRows(prev => ({...prev, [idx]: !prev[idx]}));

  const getSentimentColor = s => {
    switch(s?.toLowerCase()){
      case "positive": return "success";
      case "negative": return "danger";
      case "neutral": return "warning";
      default: return "secondary";
    }
  };

  const getConfidenceVariant = c => c >= 0.8 ? "success" : c >= 0.6 ? "warning" : "danger";

  if(loading){
    return <>
      <NavBar/>
      <Container fluid className="dashboard-container my-4 px-4">
        <div className="text-center mt-5">
          <Spinner animation="border"/>
          <p className="text-muted mt-3">Loading insights...</p>
        </div>
      </Container>
    </>;
  }

  return <>
    <NavBar/>
    <Container fluid className="dashboard-container my-4 px-4">
      <Row>
        {/* Sidebar */}
        {showFilters && <Col md={3} className="mb-3">
          <FilterSidebar showFilters={showFilters} setShowFilters={setShowFilters} title="Insight Filters" isMobile>
            <FilterCard title="Topics" icon="tags">
              <FilterList items={allTopics} selectedItem={selectedTopic} onSelect={setSelectedTopic} icon="tag"/>
            </FilterCard>
            <FilterCard title="Sentiment" icon="heart">
              <FilterList items={allSentiments} selectedItem={selectedSentiment} onSelect={setSelectedSentiment} icon="smile"/>
            </FilterCard>
            <FilterCard title="Confidence Level" icon="chart-line">
              <FilterList items={confidenceRanges} selectedItem={selectedConfidence} onSelect={setSelectedConfidence} icon="bullseye"/>
            </FilterCard>
          </FilterSidebar>
        </Col>}

        {/* Content */}
        <Col md={showFilters ? 9 : 12}>
          {/* Top controls */}
          <Row className="mb-3">
            <Col className="d-flex justify-content-end gap-2">
              <ButtonGroup size="sm">
                <Button variant={sortBy==="confidence"?"primary":"outline-primary"} onClick={()=>setSortBy("confidence")}><i className="fas fa-chart-line me-1"></i>Confidence</Button>
                <Button variant={sortBy==="sentiment"?"primary":"outline-primary"} onClick={()=>setSortBy("sentiment")}><i className="fas fa-heart me-1"></i>Sentiment</Button>
                <Button variant={sortBy==="date"?"primary":"outline-primary"} onClick={()=>setSortBy("date")}><i className="fas fa-calendar me-1"></i>Date</Button>
              </ButtonGroup>
              <Card className="bg-light border-0 me-2">
                <Card.Body className="p-2 text-center">
                  <h6 className="text-primary mb-1"><i className="fas fa-filter me-1"></i>Filtered</h6>
                  <div className="metric-card p-1"><h5 className="text-white mb-0">{filteredAndSortedInsights.length}</h5></div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Insights Cards */}
          <Card className="analytics-card">
            <Card.Body className="p-0">
              {filteredAndSortedInsights.length === 0 ? <div className="empty-state text-center mt-3"><i className="fas fa-lightbulb"></i><p>No insights found</p></div> :
                <div className="insights-container">
                  {filteredAndSortedInsights.map((i, idx)=>(
                    <div key={i.id||idx} className="insight-item p-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="text-primary mb-2"><i className="fas fa-brain me-2"></i>Insight #{idx+1}</h6>
                          <div className="d-flex gap-2 align-items-center">
                            <Badge bg={getSentimentColor(i.sentiment)}>{i.sentiment}</Badge>
                            <div style={{minWidth:'120px'}}><ProgressBar now={i.confidence*100} label={`${(i.confidence*100).toFixed(0)}%`} variant={getConfidenceVariant(i.confidence)}/></div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline-primary" onClick={()=>toggleRowExpansion(idx)}>
                          <i className={`fas fa-${expandedRows[idx]?"chevron-up":"chevron-down"} me-1`}></i>
                          {expandedRows[idx]?"Hide":"View"}
                        </Button>
                      </div>

                      <div><p>{i.summary}</p></div>

                      {i.topics?.length>0 && <div className="mb-2"><h6 className="text-info mb-1">Topics</h6>{i.topics.map((t,j)=><Badge key={j} bg="info">{t}</Badge>)}</div>}

                      <Collapse in={expandedRows[idx]}>
                        <div
                          className="insight-details mt-2 p-2 rounded"
                          style={{ backgroundColor: "#f8f9fa", color: "#212529" }}
                        >
                          <Row>
                            <Col md={6}>
                              {i.problems?.length>0 && <div className="mb-2"><h6 className="text-danger">Problems</h6><ul>{i.problems.map((p,j)=><li key={j}>{p}</li>)}</ul></div>}
                              {i.keywords?.length>0 && <div className="mb-2"><h6>Keywords</h6>{i.keywords.map((k,j)=><Badge key={j} bg="secondary">{k}</Badge>)}</div>}
                            </Col>
                            <Col md={6}>
                              {i.suggestions?.length>0 && <div className="mb-2"><h6 className="text-success">Suggestions</h6><ul>{i.suggestions.map((s,j)=><li key={j}>{s}</li>)}</ul></div>}
                              {i.positive_aspects?.length>0 && <div className="mb-2"><h6 className="text-success">Positive Aspects</h6><ul>{i.positive_aspects.map((a,j)=><li key={j}>{a}</li>)}</ul></div>}
                              {i.negative_aspects?.length>0 && <div className="mb-2"><h6 className="text-danger">Negative Aspects</h6><ul>{i.negative_aspects.map((a,j)=><li key={j}>{a}</li>)}</ul></div>}
                            </Col>
                          </Row>
                        </div>
                      </Collapse>
                    </div>
                  ))}
                </div>
              }
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </>;
}
