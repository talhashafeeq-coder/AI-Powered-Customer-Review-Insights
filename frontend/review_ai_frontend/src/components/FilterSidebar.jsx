import React from "react";
import { Card, Button, OverlayTrigger, Tooltip } from "react-bootstrap"; // import Bootstrap components

export default function FilterSidebar({ 
  showFilters, 
  setShowFilters, 
  children,
  title = "Filters",
  isMobile = false 
}) {
  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <div className="d-md-none text-center mb-3">
          <Button
            size="sm"
            variant="outline-primary"
            className="action-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`fas fa-${showFilters ? 'times' : 'filter'} me-2`}></i>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      {showFilters && (
        <div
          className={`mb-3 ${isMobile ? 'col-12' : 'col-md-3'}`}
          style={{
            position: isMobile ? "relative" : "sticky",
            top: "80px",
            alignSelf: "flex-start",
            height: "fit-content",
            zIndex: 1000
          }}
        >
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-gradient-primary text-white">
              <h6 className="mb-0 d-flex align-items-center">
                <i className="fas fa-filter me-2"></i>
                {title}
              </h6>
            </Card.Header>
            <Card.Body className="p-3">
              {children}
            </Card.Body>
          </Card>
        </div>
      )}
    </>
  );
}

// Individual Filter Components
export function FilterCard({ title, icon, children }) {
  return (
    <Card className="shadow-sm border-0 mb-3">
      <Card.Header className="bg-light border-0">
        <h6 className="mb-0 d-flex align-items-center">
          <i className={`fas fa-${icon} me-2 text-primary`}></i>
          {title}
        </h6>
      </Card.Header>
      <Card.Body className="p-3">
        {children}
      </Card.Body>
    </Card>
  );
}

export function FilterList({ items, selectedItem, onSelect, icon = null }) {
  return (
    <ul className="list-unstyled mb-0">
      {items.map((item, index) => (
        <li
          key={item}
          onClick={() => onSelect(item)}
          className={`filter-item ${selectedItem === item ? 'active' : ''}`}
          style={{
            cursor: "pointer",
            padding: "8px 12px",
            margin: "4px 0",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: selectedItem === item ? "600" : "400",
            color: selectedItem === item ? "#fff" : "#555",
            background: selectedItem === item 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : "transparent",
            transition: "all 0.3s ease",
            border: selectedItem === item ? "none" : "1px solid #e9ecef"
          }}
        >
          {icon && <i className={`fas fa-${icon} me-2`}></i>}
          {item}
        </li>
      ))}
    </ul>
  );
}

export function RatingFilter({ selectedRating, onSelect, ratingFilters = [1, 2, 3, 4, 5] }) {
  return (
    <>
      <div
        onClick={() => onSelect("All")}
        className={`filter-item ${selectedRating === "All" ? 'active' : ''}`}
        style={{
          cursor: "pointer",
          padding: "8px 12px",
          margin: "4px 0",
          borderRadius: "6px",
          fontSize: "0.9rem",
          fontWeight: selectedRating === "All" ? "600" : "400",
          color: selectedRating === "All" ? "#fff" : "#555",
          background: selectedRating === "All" 
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
            : "transparent",
          transition: "all 0.3s ease",
          border: selectedRating === "All" ? "none" : "1px solid #e9ecef",
          textAlign: "center"
        }}
      >
        <i className="fas fa-star me-2"></i>
        All Ratings
      </div>
      
      <div
        style={{
          display: "flex",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          overflow: "hidden",
          marginTop: "8px"
        }}
      >
        {ratingFilters.map((star) => (
          <OverlayTrigger
            key={star}
            placement="top"
            overlay={<Tooltip>{star} Star Reviews</Tooltip>}
          >
            <div
              onClick={() => onSelect(selectedRating === star ? "All" : star)}
              className="rating-filter-item"
              style={{
                flex: 1,
                padding: "10px 4px",
                fontSize: "0.8rem",
                fontWeight: selectedRating === star ? "600" : "400",
                color: selectedRating === star ? "#fff" : "#333",
                background: selectedRating === star
                  ? "linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textAlign: "center",
                borderRight: star < 5 ? "1px solid #dee2e6" : "none"
              }}
            >
              {star}⭐
            </div>
          </OverlayTrigger>
        ))}
      </div>
    </>
  );
}














