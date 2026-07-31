import React from "react";
import { BaseLayout } from "./BaseLayout";
import { Text, Button, Container, Hr } from "@react-email/components";

interface ChangesRequestedEmailProps {
  leaderName: string;
  notes: string;
  dashboardUrl: string;
}

export const ChangesRequestedEmail = ({
  leaderName,
  notes,
  dashboardUrl,
}: ChangesRequestedEmailProps) => {
  return (
    <BaseLayout previewText="Action Required: Changes requested for your profile">
      <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
        Action Required, {leaderName}
      </Text>
      <Text style={{ color: "#dddddd", fontSize: "16px", lineHeight: "24px", marginBottom: "24px" }}>
        Our administrators have reviewed your submitted draft. Before we can publish it, we request the following changes:
      </Text>

      <Container style={{ backgroundColor: "#1e1e1e", padding: "16px", borderRadius: "6px", marginBottom: "24px" }}>
        <Text style={{ color: "#cccccc", fontSize: "15px", whiteSpace: "pre-wrap" }}>
          {notes}
        </Text>
      </Container>
      
      <Button 
        href={dashboardUrl}
        style={{
          backgroundColor: "#f59e0b",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold",
          display: "inline-block"
        }}
      >
        Update Draft
      </Button>

      <Text style={{ color: "#aaaaaa", fontSize: "14px", marginTop: "32px" }}>
        Please login to your dashboard, make the requested updates, and re-submit your profile for review.
      </Text>
    </BaseLayout>
  );
};
