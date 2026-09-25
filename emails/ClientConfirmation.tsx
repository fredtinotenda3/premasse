// emails/ClientConfirmation.tsx
// Sent to the client immediately after they submit a service request.
// Confirms receipt, shows reference ID, sets expectations.

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

type Props = {
  clientName:   string;
  serviceName:  string;
  requestId:    string;
  notes:        string;
  siteUrl:      string;
};

export default function ClientConfirmation({
  clientName   = "Tatenda",
  serviceName  = "Tax Clearance Certificate",
  requestId    = "clx1234567890",
  notes        = "I need my ITF263 for a government tender.",
  siteUrl      = "https://premasse.co.zw",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        Your {serviceName} request has been received — Premasse Business Services
      </Preview>

      <Body style={main}>
        <Container style={container}>

          {/* Header bar */}
          <Section style={header}>
            <Text style={logoText}>Premasse</Text>
            <Text style={logoSub}>Business Services</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h1}>Request received</Heading>

            <Text style={body}>
              Hi {clientName},
            </Text>
            <Text style={body}>
              Thank you for reaching out to Premasse Business Services. We&apos;ve
              received your request for <strong>{serviceName}</strong> and a
              registered practitioner will review it shortly.
            </Text>
            <Text style={body}>
              We aim to respond within <strong>one business day</strong>. We&apos;ll
              contact you at this email address to discuss next steps.
            </Text>

            {/* Reference box */}
            <Section style={refBox}>
              <Text style={refLabel}>Your reference number</Text>
              <Text style={refValue}>{requestId}</Text>
              <Text style={refHint}>
                Keep this for your records. Quote it if you contact us directly.
              </Text>
            </Section>

            {/* Summary table */}
            <Section style={summaryBox}>
              <Text style={summaryTitle}>Request summary</Text>
              <Hr style={divider} />
              <Row style={summaryRow}>
                <Column style={summaryKey}>Service</Column>
                <Column style={summaryVal}>{serviceName}</Column>
              </Row>
              <Hr style={thinDivider} />
              <Row style={summaryRow}>
                <Column style={summaryKey}>Your notes</Column>
                <Column style={summaryVal}>{notes}</Column>
              </Row>
            </Section>

            {/* What happens next */}
            <Text style={subheading}>What happens next</Text>
            {[
              { n: "1", t: "We review your request", b: "A registered practitioner will read your submission and assess what's needed." },
              { n: "2", t: "We contact you",         b: "Within one business day, we'll reach out via email or phone to discuss next steps and fees." },
              { n: "3", t: "We get it done",          b: "Once engaged, we handle all preparation, submission, and follow-up with ZIMRA or the relevant authority." },
            ].map(({ n, t, b }) => (
              <Row key={n} style={stepRow}>
                <Column style={stepNum}>{n}</Column>
                <Column>
                  <Text style={stepTitle}>{t}</Text>
                  <Text style={stepBody}>{b}</Text>
                </Column>
              </Row>
            ))}

            <Text style={body}>
              If you have any questions in the meantime, reply to this email or
              contact us at{" "}
              <Link href="mailto:info@premasse.co.zw" style={link}>
                info@premasse.co.zw
              </Link>
              .
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>
              Premasse Business Services · Harare, Zimbabwe
            </Text>
            <Text style={footerText}>
              <Link href={siteUrl} style={footerLink}>
                premasse.co.zw
              </Link>
              {" · "}
              <Link href="mailto:info@premasse.co.zw" style={footerLink}>
                info@premasse.co.zw
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              This email was sent because a service request was submitted on the
              Premasse website. If you did not submit this request, please ignore
              this email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#FAFAF8",
  fontFamily: "'DM Sans', Georgia, sans-serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
};

const header: React.CSSProperties = {
  backgroundColor: "#0A2540",
  padding: "28px 40px",
};

const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "0.02em",
};

const logoSub: React.CSSProperties = {
  color: "#C9A84C",
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  margin: "2px 0 0",
};

const content: React.CSSProperties = {
  padding: "40px 40px 32px",
};

const h1: React.CSSProperties = {
  color: "#0A2540",
  fontSize: "26px",
  fontWeight: "700",
  margin: "0 0 24px",
  fontFamily: "Georgia, serif",
};

const body: React.CSSProperties = {
  color: "#4A5568",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const subheading: React.CSSProperties = {
  color: "#0A2540",
  fontSize: "16px",
  fontWeight: "700",
  margin: "32px 0 16px",
  fontFamily: "Georgia, serif",
};

const refBox: React.CSSProperties = {
  backgroundColor: "#FDF6E3",
  border: "1px solid rgba(201,168,76,0.3)",
  borderLeft: "4px solid #C9A84C",
  borderRadius: "2px",
  padding: "16px 20px",
  margin: "24px 0",
};

const refLabel: React.CSSProperties = {
  color: "#C9A84C",
  fontSize: "10px",
  fontWeight: "600",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  margin: "0 0 4px",
};

const refValue: React.CSSProperties = {
  color: "#0A2540",
  fontSize: "14px",
  fontFamily: "monospace",
  fontWeight: "600",
  margin: "0 0 4px",
};

const refHint: React.CSSProperties = {
  color: "#4A5568",
  fontSize: "12px",
  margin: "0",
};

const summaryBox: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: "2px",
  padding: "16px 20px",
  margin: "24px 0",
};

const summaryTitle: React.CSSProperties = {
  color: "#0A2540",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 12px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const summaryRow: React.CSSProperties = {
  padding: "6px 0",
};

const summaryKey: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  width: "120px",
  verticalAlign: "top",
};

const summaryVal: React.CSSProperties = {
  color: "#0A2540",
  fontSize: "13px",
};

const divider: React.CSSProperties = {
  borderColor: "#E2E8F0",
  margin: "12px 0",
};

const thinDivider: React.CSSProperties = {
  borderColor: "#F3F4F6",
  margin: "4px 0",
};

const stepRow: React.CSSProperties = {
  marginBottom: "16px",
};

const stepNum: React.CSSProperties = {
  color: "#C9A84C",
  fontSize: "20px",
  fontFamily: "Georgia, serif",
  fontWeight: "700",
  width: "32px",
  verticalAlign: "top",
  paddingTop: "2px",
};

const stepTitle: React.CSSProperties = {
  color: "#0A2540",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 2px",
};

const stepBody: React.CSSProperties = {
  color: "#4A5568",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
};

const link: React.CSSProperties = {
  color: "#C9A84C",
};

const footer: React.CSSProperties = {
  padding: "0 40px 32px",
};

const footerText: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  textAlign: "center",
  margin: "4px 0",
};

const footerLink: React.CSSProperties = {
  color: "#9CA3AF",
};

const footerDisclaimer: React.CSSProperties = {
  color: "#CBD5E0",
  fontSize: "11px",
  textAlign: "center",
  margin: "16px 0 0",
  lineHeight: "1.5",
};
