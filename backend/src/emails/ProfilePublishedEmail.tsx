import React from "react";
import { BaseLayout } from "./BaseLayout";
import { Text, Button } from "@react-email/components";

interface ProfilePublishedEmailProps {
  leaderName: string;
  versionNumber: number;
  profileUrl: string;
}

export const ProfilePublishedEmail = ({
  leaderName,
  versionNumber,
  profileUrl,
}: ProfilePublishedEmailProps) => {
  return (
    <BaseLayout previewText="Your portfolio is now live!">
      <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
        Congratulations, {leaderName}!
      </Text>
      <Text style={{ color: "#dddddd", fontSize: "16px", lineHeight: "24px", marginBottom: "24px" }}>
        Your portfolio (Version {versionNumber}) has been approved by the administrators and is now live on the Global Leader Sphere.
      </Text>
      
      <Button 
        href={profileUrl}
        style={{
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold",
          display: "inline-block"
        }}
      >
        View Public Profile
      </Button>

      <Text style={{ color: "#aaaaaa", fontSize: "14px", marginTop: "32px" }}>
        If you need to make further updates, you can submit a new draft at any time from your Leader Dashboard.
      </Text>
    </BaseLayout>
  );
};
