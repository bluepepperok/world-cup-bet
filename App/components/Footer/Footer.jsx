import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Image, Row, Col } from "react-bootstrap";

export default function Footer() {
  return (
    <Container
      fluid
      className="pt-5 mt-5 pb-4"
      style={{ borderTop: "1px solid #ccc" }}
    ></Container>
  );
}
