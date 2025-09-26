import axios from "axios";

// const API_BASE = "http://localhost:8000/api";
// Use env when provided; otherwise rely on Nginx proxy at /api
const API_BASE = import.meta.env?.VITE_API_BASE || "/api";

// Analytics / Health
export const fetchStats = async () => {
  const res = await axios.get(`${API_BASE}/analytics/summary`);
  return res.data;
};

export const fetchSentiment = async () => {
  const res = await axios.get(`${API_BASE}/analytics/sentiment`);
  return res.data;
};

export const testAPI = async () => {
  const res = await axios.get(`${API_BASE}/health`);
  return res.data;
};

// Reviews
export const createSampleReview = async (review) => {
  const res = await axios.post(`${API_BASE}/reviews`, review);
  return res.data;
};

export const fetchReviews = async () => {
  const res = await axios.get(`${API_BASE}/reviews`);
  return Array.isArray(res.data) ? res.data : res.data.reviews || [];
};

export const addReview = async (review) => {
  const res = await axios.post(`${API_BASE}/reviews`, review);
  return res.data;
};

export const analyzeReview = async (id) => {
  const res = await axios.post(`${API_BASE}/reviews/${id}/analyze`);
  return res.data;
};

// ------------------------
// AI Insights routes
// ------------------------

// Fetch all insights
export const fetchInsights = async (sentiment = null) => {
  let url = `${API_BASE}/insights/`;
  if (sentiment) url += `?sentiment=${sentiment}`;
  const res = await axios.get(url);
  return res.data;
};

// Fetch a single insight by ID
export const fetchInsightById = async (id) => {
  const res = await axios.get(`${API_BASE}/insights/${id}`);
  return res.data;
};

// Batch analyze multiple reviews
export const batchAnalyzeReviews = async (reviewIds = [], forceReanalysis = false) => {
  const res = await axios.post(`${API_BASE}/insights/batch-analyze`, {
    review_ids: reviewIds,
    force_reanalysis: forceReanalysis
  });
  return res.data;
};

// Fetch insights by sentiment
export const fetchInsightsBySentiment = async (sentiment) => {
  const res = await axios.get(`${API_BASE}/insights/by-sentiment/${sentiment}`);
  return res.data;
};

// Fetch insights by topic
export const fetchInsightsByTopic = async (topic) => {
  const res = await axios.get(`${API_BASE}/insights/by-topic/${topic}`);
  return res.data;
};

// Delete insight
export const deleteInsight = async (id) => {
  const res = await axios.delete(`${API_BASE}/insights/${id}`);
  return res.data;
};

// Enhanced stats with recent reviews
export const fetchEnhancedStats = async () => {
  try {
    const [statsRes, reviewsRes, insightsRes] = await Promise.all([
      axios.get(`${API_BASE}/analytics/summary`),
      axios.get(`${API_BASE}/reviews?limit=5`),
      axios.get(`${API_BASE}/insights?limit=10`)
    ]);
    
    return {
      ...statsRes.data,
      recent_reviews: reviewsRes.data,
      recent_insights: insightsRes.data
    };
  } catch (error) {
    console.error('Error fetching enhanced stats:', error);
    throw error;
  }
};

// Real-time analytics
export const fetchRealTimeAnalytics = async () => {
  const res = await axios.get(`${API_BASE}/analytics/real-time`);
  return res.data;
};