// lib/invoice.ts
// Generates professional PDF invoices using @react-pdf/renderer.
// Called from /api/invoice/[id] which is admin-only.
//
// Install: npm install @react-pdf/renderer
//          npm install -D @types/react-pdf

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvoiceData = {
  invoiceNumber: string;      // e.g. "PRE-2024-001"
  issueDate:     string;      // e.g. "15 January 2025"
  dueDate?:      string;
  status:        "PAID" | "PENDING" | "OVERDUE";

  // Billed to
  clientName:    string;
  clientEmail:   string;
  clientPhone?:  string;

  // Line items
  items: {
    description: string;
    quantity:    number;
    unitPrice:   number;
  }[];

  subtotal:      number;
  taxRate?:      number;      // e.g. 15 for 15% VAT. Optional.
  taxAmount?:    number;
  total:         number;
  currency:      string;      // "USD"

  // Payment info
  paymentMethod?: string;     // "EcoCash / Paynow"
  paidAt?:        string;     // Date paid (if PAID)
  notes?:         string;     // e.g. "Thank you for your business."

  requestId:     string;      // For reference
};

// ── Styles ────────────────────────────────────────────────────────────────────

const NAVY = "#0A2540";
const GOLD = "#C9A84C";
const SLATE = "#4A5568";
const LIGHT_GRAY = "#F8FAFC";
const BORDER = "#E2E8F0";

const styles = StyleSheet.create({
  page: {
    fontFamily:   "Helvetica",
    fontSize:     10,
    color:        NAVY,
    paddingTop:   48,
    paddingBottom:48,
    paddingLeft:  56,
    paddingRight: 56,
    lineHeight:   1.5,
  },

  // Header
  header: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   40,
    paddingBottom:  24,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  logoBlock: {
    flexDirection: "column",
  },
  logoText: {
    fontSize:   22,
    fontFamily: "Helvetica-Bold",
    color:      NAVY,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize:      8,
    color:         GOLD,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop:     2,
  },
  invoiceTitle: {
    flexDirection:  "column",
    alignItems:     "flex-end",
  },
  invoiceTitleText: {
    fontSize:   24,
    fontFamily: "Helvetica-Bold",
    color:      NAVY,
  },
  invoiceNumber: {
    fontSize: 11,
    color:    SLATE,
    marginTop: 4,
  },
  statusBadge: {
    marginTop:    8,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius: 2,
  },
  statusText: {
    fontSize:   8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Meta row (dates)
  metaRow: {
    flexDirection:  "row",
    marginBottom:   32,
    gap:            40,
  },
  metaBlock: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize:      8,
    color:         SLATE,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom:  3,
  },
  metaValue: {
    fontSize:   11,
    color:      NAVY,
    fontFamily: "Helvetica-Bold",
  },

  // Parties (Billed From / Billed To)
  partiesRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginBottom:   32,
    gap:            40,
  },
  partyBlock: {
    flexDirection: "column",
    flex:          1,
  },
  partySectionLabel: {
    fontSize:      8,
    color:         GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom:  8,
    fontFamily:    "Helvetica-Bold",
  },
  partyName: {
    fontSize:   12,
    fontFamily: "Helvetica-Bold",
    color:      NAVY,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 10,
    color:    SLATE,
  },

  // Items table
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection:   "row",
    backgroundColor: NAVY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius:    2,
    marginBottom:    1,
  },
  tableHeaderText: {
    fontSize:   8,
    color:      "#C9A84C",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  colDescription: { flex: 4 },
  colQty:         { flex: 1, textAlign: "center" },
  colPrice:       { flex: 2, textAlign: "right" },
  colTotal:       { flex: 2, textAlign: "right" },
  cellText: {
    fontSize: 10,
    color:    NAVY,
  },
  cellTextMuted: {
    fontSize: 10,
    color:    SLATE,
  },

  // Totals
  totalsBlock: {
    alignSelf:    "flex-end",
    width:        220,
    marginBottom: 32,
  },
  totalRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  totalLabel: {
    fontSize: 10,
    color:    SLATE,
  },
  totalValue: {
    fontSize: 10,
    color:    NAVY,
  },
  grandTotalRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop:      4,
    borderTopWidth: 2,
    borderTopColor: NAVY,
  },
  grandTotalLabel: {
    fontSize:   13,
    fontFamily: "Helvetica-Bold",
    color:      NAVY,
  },
  grandTotalValue: {
    fontSize:   13,
    fontFamily: "Helvetica-Bold",
    color:      NAVY,
  },

  // Payment info
  paymentBox: {
    backgroundColor: LIGHT_GRAY,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    padding:         12,
    marginBottom:    24,
    borderRadius:    2,
  },
  paymentLabel: {
    fontSize:      8,
    color:         GOLD,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily:    "Helvetica-Bold",
    marginBottom:  6,
  },
  paymentText: {
    fontSize: 10,
    color:    NAVY,
  },

  // Notes
  notesBlock: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize:      8,
    color:         SLATE,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom:  4,
  },
  notesText: {
    fontSize: 10,
    color:    SLATE,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position:       "absolute",
    bottom:         40,
    left:           56,
    right:          56,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop:     12,
    flexDirection:  "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color:    SLATE,
  },
});

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  PAID:    { bg: "#D1FAE5", text: "#065F46" },
  PENDING: { bg: "#FEF3C7", text: "#92400E" },
  OVERDUE: { bg: "#FEE2E2", text: "#991B1B" },
};

// ── Invoice Document Component ────────────────────────────────────────────────

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const statusStyle = STATUS_STYLE[data.status];

  return React.createElement(
    Document,
    {
      title:    `Invoice ${data.invoiceNumber} — Premasse`,
      author:   "Premasse Business Services",
      subject:  `Invoice for ${data.clientName}`,
      keywords: "invoice premasse zimbabwe",
    },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // ── Header ──────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          { style: styles.logoBlock },
          React.createElement(Text, { style: styles.logoText }, "Premasse"),
          React.createElement(Text, { style: styles.logoSub }, "Business Services"),
          React.createElement(Text, { style: { fontSize: 9, color: SLATE, marginTop: 6 } }, "Harare, Zimbabwe"),
          React.createElement(Text, { style: { fontSize: 9, color: SLATE } }, "info@premasse.co.zw"),
        ),
        React.createElement(
          View,
          { style: styles.invoiceTitle },
          React.createElement(Text, { style: styles.invoiceTitleText }, "INVOICE"),
          React.createElement(Text, { style: styles.invoiceNumber }, data.invoiceNumber),
          React.createElement(
            View,
            { style: [styles.statusBadge, { backgroundColor: statusStyle.bg }] },
            React.createElement(
              Text,
              { style: [styles.statusText, { color: statusStyle.text }] },
              data.status
            )
          ),
        )
      ),

      // ── Meta (dates) ─────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.metaRow },
        React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Issue date"),
          React.createElement(Text, { style: styles.metaValue }, data.issueDate),
        ),
        data.dueDate ? React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Due date"),
          React.createElement(Text, { style: styles.metaValue }, data.dueDate),
        ) : null,
        data.paidAt ? React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Date paid"),
          React.createElement(Text, { style: styles.metaValue }, data.paidAt),
        ) : null,
        React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Reference"),
          React.createElement(Text, { style: styles.metaValue }, data.requestId.slice(-8).toUpperCase()),
        ),
      ),

      // ── Billed from / to ─────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.partiesRow },
        React.createElement(
          View,
          { style: styles.partyBlock },
          React.createElement(Text, { style: styles.partySectionLabel }, "From"),
          React.createElement(Text, { style: styles.partyName }, "Premasse Business Services"),
          React.createElement(Text, { style: styles.partyDetail }, "Registered Tax Practitioners"),
          React.createElement(Text, { style: styles.partyDetail }, "PAAB Registered · Zimbabwe"),
          React.createElement(Text, { style: styles.partyDetail }, "info@premasse.co.zw"),
          React.createElement(Text, { style: styles.partyDetail }, "Harare, Zimbabwe"),
        ),
        React.createElement(
          View,
          { style: styles.partyBlock },
          React.createElement(Text, { style: styles.partySectionLabel }, "Billed to"),
          React.createElement(Text, { style: styles.partyName }, data.clientName),
          React.createElement(Text, { style: styles.partyDetail }, data.clientEmail),
          data.clientPhone ? React.createElement(Text, { style: styles.partyDetail }, data.clientPhone) : null,
        ),
      ),

      // ── Line items table ──────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.table },
        // Header
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableHeaderText, styles.colDescription] }, "Description"),
          React.createElement(Text, { style: [styles.tableHeaderText, styles.colQty] }, "Qty"),
          React.createElement(Text, { style: [styles.tableHeaderText, styles.colPrice] }, "Unit price"),
          React.createElement(Text, { style: [styles.tableHeaderText, styles.colTotal] }, "Total"),
        ),
        // Rows
        ...data.items.map((item, i) =>
          React.createElement(
            View,
            { key: i, style: [styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}] },
            React.createElement(Text, { style: [styles.cellText, styles.colDescription] }, item.description),
            React.createElement(Text, { style: [styles.cellTextMuted, styles.colQty] }, String(item.quantity)),
            React.createElement(Text, { style: [styles.cellTextMuted, styles.colPrice] }, `${data.currency} ${item.unitPrice.toFixed(2)}`),
            React.createElement(Text, { style: [styles.cellText, styles.colTotal] }, `${data.currency} ${(item.quantity * item.unitPrice).toFixed(2)}`),
          )
        ),
      ),

      // ── Totals ────────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.totalsBlock },
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(Text, { style: styles.totalLabel }, "Subtotal"),
          React.createElement(Text, { style: styles.totalValue }, `${data.currency} ${data.subtotal.toFixed(2)}`),
        ),
        ...(data.taxAmount && data.taxRate ? [
          React.createElement(
            View,
            { style: styles.totalRow, key: "tax" },
            React.createElement(Text, { style: styles.totalLabel }, `VAT (${data.taxRate}%)`),
            React.createElement(Text, { style: styles.totalValue }, `${data.currency} ${data.taxAmount.toFixed(2)}`),
          )
        ] : []),
        React.createElement(
          View,
          { style: styles.grandTotalRow },
          React.createElement(Text, { style: styles.grandTotalLabel }, "Total due"),
          React.createElement(Text, { style: styles.grandTotalValue }, `${data.currency} ${data.total.toFixed(2)}`),
        ),
      ),

      // ── Payment info ──────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.paymentBox },
        React.createElement(Text, { style: styles.paymentLabel }, "Payment information"),
        React.createElement(
          Text,
          { style: styles.paymentText },
          data.status === "PAID"
            ? `Payment received${data.paidAt ? ` on ${data.paidAt}` : ""} via ${data.paymentMethod ?? "Paynow"}.`
            : `Payment accepted via EcoCash, OneMoney, or Paynow. Contact info@premasse.co.zw for bank transfer details.`
        ),
      ),

      // ── Notes ─────────────────────────────────────────────────────────────
      data.notes ? React.createElement(
        View,
        { style: styles.notesBlock },
        React.createElement(Text, { style: styles.notesLabel }, "Notes"),
        React.createElement(Text, { style: styles.notesText }, data.notes),
      ) : null,

      // ── Footer ────────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, "Premasse Business Services · Harare, Zimbabwe · info@premasse.co.zw"),
        React.createElement(
          Text,
          { style: styles.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` },
          ""
        ),
      ),
    )
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const doc    = React.createElement(InvoiceDocument, { data });
  const buffer = await renderToBuffer(doc as any);
  return buffer;
}

// ── Invoice number generator ──────────────────────────────────────────────────
// Format: PRE-YYYY-NNN (e.g. PRE-2025-042)

export async function getNextInvoiceNumber(
  prisma: any
): Promise<string> {
  const year = new Date().getFullYear();

  // Count payments this year to get sequence number
  const count = await prisma.payment.count({
    where: {
      status:    "PAID",
      createdAt: { gte: new Date(`${year}-01-01`) },
    },
  });

  const seq = String(count + 1).padStart(3, "0");
  return `PRE-${year}-${seq}`;
}

// ── Build invoice data from DB ────────────────────────────────────────────────

export async function buildInvoiceData(
  requestId: string,
  paymentId:  string,
  prisma:     any
): Promise<InvoiceData | null> {
  const payment = await prisma.payment.findUnique({
    where:   { id: paymentId },
    include: {
      request: {
        include: { service: true },
      },
    },
  });

  if (!payment || payment.request.id !== requestId) return null;

  const invoiceNumber = await getNextInvoiceNumber(prisma);
  const issueDate     = new Date().toLocaleDateString("en-ZW", {
    day: "numeric", month: "long", year: "numeric",
  });
  const paidAt = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-ZW", {
        day: "numeric", month: "long", year: "numeric",
      })
    : undefined;

  return {
    invoiceNumber,
    issueDate,
    paidAt,
    status:   payment.status === "PAID" ? "PAID" : "PENDING",
    currency: payment.currency ?? "USD",

    clientName:  payment.request.clientName,
    clientEmail: payment.request.clientEmail,
    clientPhone: payment.request.clientPhone ?? undefined,

    items: [
      {
        description: payment.request.service.name,
        quantity:    1,
        unitPrice:   payment.amount,
      },
    ],

    subtotal:      payment.amount,
    total:         payment.amount,
    paymentMethod: payment.method ? `${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)} via Paynow` : "Paynow",

    notes:     "Thank you for choosing Premasse Business Services. All work is carried out by PAAB-registered practitioners.",
    requestId: payment.requestId,
  };
}