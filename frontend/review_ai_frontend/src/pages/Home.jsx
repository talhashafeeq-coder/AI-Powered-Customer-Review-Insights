import React from "react";
import Header from "../components/Header"; // import Header component
import NavBar from "../components/NavBar"; // import NavBar component
import { Container, Card } from "react-bootstrap"; // import Bootstrap components

export default function Home() {

  return (
    <>
      <NavBar />
      <Container>
       
        <Header />

        {/* API Docs Embed */}
        <Card className="p-3 mt-4">
          <h4>📘 API Documentation</h4>
          <iframe
            src="http://localhost:8000/api/docs"
            title="API Docs"
            style={{ width: "100%", height: "80vh", border: "none" }}
          />
        </Card>
      </Container>
    </>
  );
}
