import React from "react";
import { BaseLayout } from "./BaseLayout";
import { Text, Button } from "@react-email/components";

interface GenericActionEmailProps {
  title: string;
  previewText: string;
  greeting: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string;
}

export const GenericActionEmail = ({
  title,
  previewText,
  greeting,
  body,
  ctaText,
  ctaUrl,
  ctaColor = "#3b82f6"
}: GenericActionEmailProps) => {
  return (
    <BaseLayout previewText={previewText}>
      <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
        {title}
      </Text>
      
      {greeting && (
        <Text style={{ color: "#dddddd", fontSize: "16px", marginBottom: "16px" }}>
          {greeting}
        </Text>
      )}

      <Text style={{ color: "#cccccc", fontSize: "15px", lineHeight: "24px", marginBottom: "24px", whiteSpace: "pre-wrap" }}>
        {body}
      </Text>
      
      {ctaText && ctaUrl && (
        <Button 
          href={ctaUrl}
          style={{
            backgroundColor: ctaColor,
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "inline-block"
          }}
        >
          {ctaText}
        </Button>
      )}
    </BaseLayout>
  );
};
