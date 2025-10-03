import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Spinner, 
  Alert, 
  Table, 
  Button, 
  Badge,
  ProgressBar,
  Dropdown,
  ButtonGroup,
  Modal,
  Form,
  InputGroup,
  Collapse,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap"; // Bootstrap components
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"; // Recharts for data visualization
import CountUp from "react-countup"; // for animated counting
import Header from "../components/Header"; // import Header component
import SentimentCard from "../components/SentimentCard"; // import SentimentCard component
import { fetchStats, fetchSentiment, fetchEnhancedStats } from "../services/api"; // import API service
import NavBar from "../components/NavBar"; // import NavBar component
import "../components/Dashboard.css"; // import custom CSS

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    total_reviews: 0, 
    analyzed_reviews: 0, 
    insights: [],
    recent_reviews: []
  });
  const [sentiment, setSentiment] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  // Pagination and filter states for Actionable Insights
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 insights per page (2 rows of 3)
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, positive, negative, neutral

  const COLORS = {
    positive: "#28a745",
    negative: "#dc3545", 
    neutral: "#ffc107",
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
    info: "#17a2b8"
  };

  // Auto-refresh functionality
  useEffect(() => {
    loadStats();
    loadSentiment();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
      loadSentiment();
    }, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange]);

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 5000);
  };

  const toggleRowExpansion = (idx) => {
    setExpandedRows(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchEnhancedStats();
      setStats({
        total_reviews: data.total_reviews || 0,
        analyzed_reviews: data.analyzed_reviews || 0,
        insights: data.insights || [],
        recent_reviews: data.recent_reviews || []
      });
    } catch (err) {
      showStatus("❌ " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const loadSentiment = async () => {
    try {
      const data = await fetchSentiment();
      setSentiment(data);
    } catch (err) {
      showStatus("❌ " + err.message, "danger");
    }
  };

  // Calculate analysis progress
  const analysisProgress = stats.total_reviews > 0 
    ? (stats.analyzed_reviews / stats.total_reviews) * 100 
    : 0;

  // Memoize data processing to prevent infinite loops
  const { topSuggestions, topProblems, topTopics } = useMemo(() => {
    const problemCounts = {};
    const suggestionCounts = {};
    const topicCounts = {};

    stats.insights.forEach(insight => {
      // Problems
      insight.problems?.forEach(problem => {
        problemCounts[problem] = (problemCounts[problem] || 0) + 1;
      });
      
      // Suggestions
      insight.suggestions?.forEach(suggestion => {
        suggestionCounts[suggestion] = (suggestionCounts[suggestion] || 0) + 1;
      });
      
      // Topics
      insight.topics?.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    // Sort and limit data for better visualization
    const topProblems = Object.entries(problemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([problem, count]) => ({ problem, count }));

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count }));

    const topSuggestions = Object.entries(suggestionCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([suggestion, count]) => ({ suggestion, count }));

    return { topSuggestions, topProblems, topTopics };
  }, [stats.insights]);

  // Filter suggestions based on sentiment
  useEffect(() => {
    let filtered = topSuggestions;
    
    if (selectedFilter !== 'all') {
      // Filter insights by sentiment and then get suggestions from those insights
      const filteredInsights = stats.insights.filter(insight => insight.sentiment === selectedFilter);
      const filteredSuggestionCounts = {};
      
      filteredInsights.forEach(insight => {
        insight.suggestions?.forEach(suggestion => {
          filteredSuggestionCounts[suggestion] = (filteredSuggestionCounts[suggestion] || 0) + 1;
        });
      });
      
      filtered = Object.entries(filteredSuggestionCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([suggestion, count]) => ({ suggestion, count }));
    }
    
    setFilteredSuggestions(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedFilter, stats.insights, topSuggestions]);

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSuggestions = filteredSuggestions.slice(startIndex, endIndex);
    
    return { totalPages, startIndex, endIndex, currentSuggestions };
  }, [filteredSuggestions, currentPage, itemsPerPage]);

  const { totalPages, startIndex, endIndex, currentSuggestions } = paginationData;

  // Memoize pagination handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
  }, []);

  // Get sentiment distribution
  const sentimentData = sentiment?.sentiment_breakdown?.map(item => ({
    sentiment: item._id,
    count: item.count,
    percentage: ((item.count / stats.analyzed_reviews) * 100).toFixed(1)
  })) || [];

  return (
    <>
      <NavBar />
      <Header />
      <Container fluid className="dashboard-container my-4 px-4">
        {/* Status Alert */}
        {status && (
          <Alert 
            variant={status.type} 
            className="text-center shadow-sm mb-4"
            dismissible
            onClose={() => setStatus(null)}
          >
            {status.msg}
          </Alert>
        )}

        {/* Dashboard Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1  text-light">📊 Analytics Dashboard</h2>
                <p className="text-light  mb-0">Real-time insights from customer reviews</p>
              </div>
              <div className="d-flex gap-2">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" size="sm">
                    📅 {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'All Time'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setTimeRange('7d')}>Last 7 Days</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTimeRange('30d')}>Last 30 Days</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTimeRange('all')}>All Time</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => {
                    loadStats();
                    loadSentiment();
                    showStatus("🔄 Dashboard refreshed!", "success");
                  }}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "🔄 Refresh"}
                </Button>
              </div>
            </div>
            </Col>
        </Row>

        {/* Key Metrics Cards */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="metric-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="fas fa-comments fa-2x"></i>
                </div>
                <h6 className="mb-2">Total Reviews</h6>
                <h2 className="mb-0">
                  <CountUp end={stats.total_reviews} duration={1} />
                </h2>
                <small>All time</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="metric-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="fas fa-brain fa-2x"></i>
                </div>
                <h6 className="mb-2">Analyzed</h6>
                <h2 className="mb-0">
                  <CountUp end={stats.analyzed_reviews} duration={1} />
                </h2>
                <ProgressBar 
                  now={analysisProgress} 
                  className="progress-custom mt-2"
                  variant={analysisProgress > 80 ? 'success' : analysisProgress > 50 ? 'warning' : 'danger'}
                />
                <small>{analysisProgress.toFixed(1)}% complete</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="metric-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="fas fa-lightbulb fa-2x"></i>
                </div>
                <h6 className="mb-2">AI Insights</h6>
                <h2 className="mb-0">
                  <CountUp end={stats.insights.length} duration={1} />
                </h2>
                <small>Generated</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="metric-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
                <h6 className="mb-2">Avg. Confidence</h6>
                <h2 className="mb-0">
                  {stats.insights.length > 0 ? (
                    <CountUp 
                      end={stats.insights.reduce((acc, insight) => acc + insight.confidence, 0) / stats.insights.length * 100} 
                      duration={1}
                      decimals={1}
                      suffix="%"
                    />
                  ) : (
                    "0%"
                  )}
                </h2>
                <small>AI accuracy</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Analytics Row */}
        <Row className="mb-4 g-3">
          {/* Sentiment Overview */}
          <Col lg={4}>
            <Card className="analytics-card h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">📊 Sentiment Analysis</h5>
                  <Badge bg="light" text="dark" className="status-badge">Live</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {sentimentData.length > 0 ? (
                  <div className="text-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={sentimentData}
                      cx="50%"
                      cy="50%"
                          nameKey="sentiment"
                          label={({ sentiment, percentage }) => `${sentiment} (${percentage}%)`}
                          labelLine={false}
                          outerRadius={70}
                      fill="#8884d8"
                      dataKey="count"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[entry.sentiment] || COLORS.secondary} 
                            />
                      ))}
                    </Pie>
                        <RechartsTooltip />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                  </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="fas fa-chart-pie fa-3x mb-3"></i>
                    <p>No sentiment data available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
{/* Popular Topics (Horizontal Bar) */}
<Col lg={4}>
  <Card className="analytics-card h-100">
    <Card.Header>
      <h5 className="mb-0">📌 Popular Topics</h5>
    </Card.Header>
    <Card.Body className="p-4">
      {topTopics.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart 
            data={topTopics} 
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="topic" 
              type="category" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip 
              formatter={(value) => [value, 'Mentions']}
              labelFormatter={(label) => `Topic: ${label}`}
            />
            <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="empty-state">
          <i className="fas fa-tags"></i>
          <p>No topics identified yet</p>
        </div>
      )}
    </Card.Body>
  </Card>
</Col>
              
          </Row>

        {/* Actionable Insights */}
          <Row className="mb-4">
            <Col>
            <Card className="analytics-card">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">💡 Actionable Insights</h5>
                  <div className="d-flex gap-2">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-info" size="sm">
                        🎯 Filter by Sentiment
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleFilterChange('all')}>
                          All Sentiments ({topSuggestions.length})
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleFilterChange('positive')}>
                          😊 Positive ({stats.insights.filter(i => i.sentiment === 'positive').length})
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleFilterChange('negative')}>
                          😞 Negative ({stats.insights.filter(i => i.sentiment === 'negative').length})
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleFilterChange('neutral')}>
                          😐 Neutral ({stats.insights.filter(i => i.sentiment === 'neutral').length})
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <ButtonGroup size="sm">
                      <Button 
                        className="action-button"
                        variant={showFilters ? "primary" : "outline-primary"}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        🔍 Filters
                      </Button>
                      <Button 
                        className="action-button"
                        variant={showTable ? "danger" : "outline-secondary"}
                        onClick={() => setShowTable(!showTable)}
                      >
                        {showTable ? "Hide Table" : "Show Table"}
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {/* Filter Status */}
                <div className="mb-3">
                  <small className="text-muted">
                    Showing {currentSuggestions.length} of {filteredSuggestions.length} insights
                    {selectedFilter !== 'all' && ` (filtered by ${selectedFilter} sentiment)`}
                  </small>
                </div>

                {currentSuggestions.length > 0 ? (
                  <>
                    <Row className="g-3">
                      {currentSuggestions.map((item, idx) => (
                        <Col md={4} key={startIndex + idx}>
                          <div className="insight-card p-3">
                            <h6 className="mb-2 text-white">
                              💡 {item.suggestion}
                            </h6>
                            <Badge bg="light" text="dark" className="badge-custom">{item.count} mentions</Badge>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <nav>
                          <ul className="pagination pagination-sm">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                <button 
                                  className="page-link" 
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-lightbulb"></i>
                    <p>
                      {selectedFilter !== 'all' 
                        ? `No ${selectedFilter} sentiment insights available` 
                        : 'No suggestions available yet'
                      }
                    </p>
                  </div>
                )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

        {/* Enhanced Detailed Insights Table */}
        {showTable && stats.insights.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="analytics-card">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📋 Detailed Insights</h5>
                    <small className="text-muted">{stats.insights.length} insights found</small>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table striped hover className="table-professional mb-0">
                <thead className="table-dark">
                  <tr>
                          <th style={{ width: '100px' }}>Sentiment</th>
                          <th style={{ width: '120px' }}>Confidence</th>
                          <th style={{ width: '150px' }}>Topics</th>
                          <th style={{ width: '200px' }}>Summary</th>
                          <th style={{ width: '120px' }}>Problems</th>
                          <th style={{ width: '120px' }}>Suggestions</th>
                          <th style={{ width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.insights.map((insight, idx) => (
                          <React.Fragment key={idx}>
                            <tr>
                              <td>
                                <Badge 
                                  bg={insight.sentiment === 'positive' ? 'success' : 
                                      insight.sentiment === 'negative' ? 'danger' : 'warning'}
                                  className="badge-custom"
                                >
                                  {insight.sentiment}
                                </Badge>
                              </td>
                              <td>
                                <div style={{ minWidth: '100px' }}>
                                  <ProgressBar 
                                    now={insight.confidence * 100} 
                                    label={`${(insight.confidence * 100).toFixed(1)}%`}
                                    variant={insight.confidence > 0.8 ? 'success' : insight.confidence > 0.6 ? 'warning' : 'danger'}
                                    className="progress-custom"
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {insight.topics?.slice(0, 2).map((topic, i) => (
                                    <OverlayTrigger
                                      key={i}
                                      placement="top"
                                      overlay={<Tooltip>{topic}</Tooltip>}
                                    >
                                      <Badge bg="info" className="badge-custom">
                                        {topic.length > 15 ? `${topic.substring(0, 15)}...` : topic}
                                      </Badge>
                                    </OverlayTrigger>
                                  ))}
                                  {insight.topics?.length > 2 && (
                                    <Badge bg="secondary" className="badge-custom">
                                      +{insight.topics.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>{insight.summary}</Tooltip>}
                                >
                                  <div className="text-truncate" style={{ maxWidth: '180px', cursor: 'pointer' }}>
                                    {insight.summary}
                                  </div>
                                </OverlayTrigger>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {insight.problems?.slice(0, 1).map((problem, i) => (
                                    <OverlayTrigger
                                      key={i}
                                      placement="top"
                                      overlay={<Tooltip>{problem}</Tooltip>}
                                    >
                                      <Badge bg="danger" className="badge-custom">
                                        {problem.length > 15 ? `${problem.substring(0, 15)}...` : problem}
                                      </Badge>
                                    </OverlayTrigger>
                                  ))}
                                  {insight.problems?.length > 1 && (
                                    <Badge bg="secondary" className="badge-custom">
                                      +{insight.problems.length - 1}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {insight.suggestions?.slice(0, 1).map((suggestion, i) => (
                                    <OverlayTrigger
                                      key={i}
                                      placement="top"
                                      overlay={<Tooltip>{suggestion}</Tooltip>}
                                    >
                                      <Badge bg="success" className="badge-custom">
                                        {suggestion.length > 15 ? `${suggestion.substring(0, 15)}...` : suggestion}
                                      </Badge>
                                    </OverlayTrigger>
                                  ))}
                                  {insight.suggestions?.length > 1 && (
                                    <Badge bg="secondary" className="badge-custom">
                                      +{insight.suggestions.length - 1}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td>
                                <Button 
                                  size="sm" 
                                  variant="outline-primary" 
                                  className="action-button"
                                  onClick={() => toggleRowExpansion(idx)}
                                >
                                  {expandedRows[idx] ? 'Hide' : 'View'}
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="7" className="p-0">
                                <Collapse in={expandedRows[idx]}>
                                  <div className="p-3 bg-light border-top">
                                    <Row>
                                      <Col md={6}>
                                        <h6 className="text-primary mb-2">📝 Full Summary</h6>
                                        <p className="mb-3">{insight.summary}</p>
                                        
                                        <h6 className="text-danger mb-2">⚠️ All Problems</h6>
                                        <div className="mb-3">
                                          {insight.problems?.map((problem, i) => (
                                            <Badge key={i} bg="danger" className="me-2 mb-1 badge-custom">
                                              {problem}
                                            </Badge>
                                          ))}
                                        </div>
                                      </Col>
                                      <Col md={6}>
                                        <h6 className="text-success mb-2">💡 All Suggestions</h6>
                                        <div className="mb-3">
                                          {insight.suggestions?.map((suggestion, i) => (
                                            <Badge key={i} bg="success" className="me-2 mb-1 badge-custom">
                                              {suggestion}
                                            </Badge>
                                          ))}
                                        </div>
                                        
                                        <h6 className="text-info mb-2">🏷️ All Topics</h6>
                                        <div className="mb-3">
                                          {insight.topics?.map((topic, i) => (
                                            <Badge key={i} bg="info" className="me-2 mb-1 badge-custom">
                                              {topic}
                                            </Badge>
                                          ))}
                                        </div>
                                        
                                        <h6 className="text-secondary mb-2">🔑 Keywords</h6>
                                        <div>
                                          {insight.keywords?.map((keyword, i) => (
                                            <Badge key={i} bg="secondary" className="me-2 mb-1 badge-custom">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>
                                </Collapse>
                              </td>
                    </tr>
                          </React.Fragment>
                  ))}
                </tbody>
              </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" className="loading-spinner" />
            <p className="text-muted mt-2">Updating dashboard...</p>
          </div>
        )}
      </Container>
    </>
  );
}
