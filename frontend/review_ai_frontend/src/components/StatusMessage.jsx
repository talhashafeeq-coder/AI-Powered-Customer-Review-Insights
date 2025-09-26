import React from "react";
import { Alert } from "react-bootstrap"; // import Bootstrap components

export default function StatusMessage({ status }) {
  return (
    <Alert variant={status.type === "error" ? "danger" : "success"}>
      {status.msg}
    </Alert>
  );
}
