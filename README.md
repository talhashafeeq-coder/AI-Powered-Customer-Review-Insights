# AI-Powered Customer Review Insights - Frontend

A professional React-based dashboard for analyzing customer reviews using AI-powered insights.

## Features

### 🎯 Professional Dashboard
- **Real-time Analytics**: Live updates every 30 seconds
- **Interactive Visualizations**: Charts, graphs, and data tables
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Professional gradient designs and animations

### 📊 Key Metrics
- Total Reviews count with animated counters
- Analysis progress tracking
- AI Insights generation
- Average confidence scores

### 📈 Advanced Analytics
- **Sentiment Analysis**: Pie charts showing positive/negative/neutral distribution
- **Top Issues**: Horizontal bar charts of most common problems
- **Popular Topics**: Trending topics across reviews
- **Actionable Insights**: AI-generated suggestions for business improvement

### 💡 Smart Features
- **Auto-refresh**: Dashboard updates automatically
- **Time Range Filtering**: View data for different periods
- **Detailed Tables**: Expandable insights table with filtering
- **Professional Styling**: Modern gradients and animations

## Technology Stack

- **React 19**: Latest React with modern features
- **React Bootstrap**: Professional UI components
- **Recharts**: Interactive data visualizations
- **Font Awesome**: Professional icons
- **React CountUp**: Animated number counters
- **React Router**: Multi-page navigation

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Setup

1. **Install Dependencies**
   ```bash
   cd frontend/review_ai_frontend
   npm install
   ```

2. **Install Font Awesome** (if not already installed)
   ```bash
   npm install @fortawesome/fontawesome-free
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Dashboard**
   - Open http://localhost:5173 in your browser
   - Dashboard will be available at the root path `/`

## Project Structure

```
src/
├── components/
│   ├── Dashboard.css          # Professional styling
│   ├── Header.jsx             # Enhanced header component
│   ├── NavBar.jsx             # Professional navigation
│   ├── SentimentCard.jsx      # Sentiment analysis card
│   └── ...
├── pages/
│   ├── Dashboard.jsx          # Main dashboard (enhanced)
│   ├── ReviewsPage.jsx        # Reviews management
│   ├── InsightsPage.jsx       # Insights display
│   ├── AnalyticsPage.jsx      # Advanced analytics
│   └── ...
├── services/
│   └── api.js                 # Enhanced API service
└── ...
```

## Dashboard Features

### 🎨 Professional Design
- **Gradient Backgrounds**: Modern color schemes
- **Card Animations**: Hover effects and transitions
- **Professional Typography**: Clean, readable fonts
- **Responsive Layout**: Adapts to all screen sizes

### 📊 Real-time Data
- **Live Updates**: Auto-refresh every 30 seconds
- **Progress Tracking**: Visual progress bars
- **Status Indicators**: Live/offline status badges
- **Error Handling**: User-friendly error messages

### 📈 Advanced Visualizations
- **Interactive Charts**: Click and hover interactions
- **Multiple Chart Types**: Pie, bar, and line charts
- **Responsive Charts**: Adapt to container size
- **Professional Colors**: Consistent color schemes

### 🔍 Smart Filtering
- **Time Range Filters**: 7 days, 30 days, all time
- **Sentiment Filters**: Filter by positive/negative/neutral
- **Topic Filters**: Filter by specific topics
- **Search Functionality**: Find specific insights

## API Integration

The frontend integrates with the FastAPI backend through these endpoints:

- `GET /api/analytics/summary` - Dashboard statistics
- `GET /api/analytics/sentiment` - Sentiment analysis data
- `GET /api/reviews` - Customer reviews
- `GET /api/insights` - AI-generated insights
- `POST /api/insights/batch-analyze` - Batch analysis

## Customization

### Styling
- Modify `src/components/Dashboard.css` for custom styles
- Update color schemes in CSS variables
- Add new animations and transitions

### Components
- Extend existing components in `src/components/`
- Add new pages in `src/pages/`
- Create reusable UI components

### API
- Add new endpoints in `src/services/api.js`
- Implement new data fetching logic
- Add error handling for new features

## Performance Features

- **Lazy Loading**: Components load on demand
- **Memoization**: Optimized re-rendering
- **Efficient Updates**: Minimal API calls
- **Responsive Images**: Optimized asset loading

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Create `.env.local` for custom configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_REFRESH_INTERVAL=30000
```

## Deployment

### Production Build
```bash
npm run build
```

### Deploy to Static Hosting
- Build files will be in `dist/` directory
- Upload to any static hosting service
- Configure API base URL for production

## Contributing

1. Follow React best practices
2. Use TypeScript for new components
3. Add tests for new features
4. Update documentation
5. Follow the existing code style

## License

This project is part of the AI-Powered Customer Review Insights system.

---

**Dashboard Preview**: Professional, responsive, and feature-rich analytics dashboard with real-time updates and modern UI design.
