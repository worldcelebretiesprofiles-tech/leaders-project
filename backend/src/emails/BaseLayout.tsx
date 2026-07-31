import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Link,
  Hr,
} from "@react-email/components";

interface BaseLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

const main = {
  backgroundColor: "#000000",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const logo = {
  margin: "0 auto",
  marginBottom: "20px",
};

const contentBox = {
  backgroundColor: "#111111",
  border: "1px solid #333",
  borderRadius: "8px",
  padding: "32px",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const footerText = {
  color: "#888888",
  fontSize: "12px",
  lineHeight: "16px",
};

export const BaseLayout = ({ children, previewText }: BaseLayoutProps) => {
  return (
    <Html>
      <Head>
        {previewText && <title>{previewText}</title>}
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={{ color: "#fff", fontSize: "24px", fontWeight: "bold", textAlign: "center", margin: "0" }}>
              Global Leader Sphere
            </Text>
          </Section>
          <Section style={contentBox}>
            {children}
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Global Leader Sphere. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://globalleadersphere.com" style={{ color: "#888", textDecoration: "underline" }}>
                globalleadersphere.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
