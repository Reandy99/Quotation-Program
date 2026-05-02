import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { Quotation, CompanySettings, Lead } from "@/types"
import { formatCurrency } from "@/lib/utils/format"

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#1a1a2e", padding: 40, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  logo: { width: 60, height: 60, objectFit: "contain" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  companyInfo: { fontSize: 8, color: "#6b7280", marginTop: 2, lineHeight: 1.5 },
  headerRight: { textAlign: "right" },
  divider: { borderBottom: "1.5px solid #4f46e5", marginBottom: 20 },
  thinDivider: { borderBottom: "0.5px solid #e5e7eb", marginVertical: 10 },
  quoteTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#4f46e5", marginBottom: 4 },
  quoteNumber: { fontSize: 10, color: "#6b7280" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 100, color: "#6b7280", fontSize: 8 },
  value: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 4, marginBottom: 2 },
  tableHeaderText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottom: "0.5px solid #f3f4f6" },
  tableCell: { fontSize: 8 },
  totalsSection: { marginTop: 12, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3, width: 200 },
  totalsLabel: { width: 100, fontSize: 8, color: "#6b7280", textAlign: "right", paddingRight: 12 },
  totalsValue: { width: 100, fontSize: 8, textAlign: "right" },
  grandTotalRow: { flexDirection: "row", justifyContent: "flex-end", width: 200, borderTop: "1px solid #4f46e5", paddingTop: 6, marginTop: 4 },
  grandTotalLabel: { width: 100, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#4f46e5", textAlign: "right", paddingRight: 12 },
  grandTotalValue: { width: 100, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#4f46e5", textAlign: "right" },
  signatureBlock: { marginTop: 32, alignItems: "flex-end" },
  signatureLine: { borderBottom: "1px solid #9ca3af", width: 160, marginBottom: 4 },
  signerName: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a1a2e", textAlign: "right" },
  signerTitle: { fontSize: 8, color: "#6b7280", textAlign: "right" },
  footer: { marginTop: 32, padding: "16 20", backgroundColor: "#f8f7ff", borderRadius: 8, borderLeft: "3px solid #4f46e5" },
  footerTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#4f46e5", marginBottom: 4 },
  footerText: { fontSize: 8, color: "#6b7280", lineHeight: 1.6 },
  ctaText: { fontSize: 8, color: "#4f46e5", fontFamily: "Helvetica-Bold", marginTop: 6 },
})

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

interface Props {
  quotation: Quotation & { items: any[] }
  company: CompanySettings | null
}

export function QuotationPDF({ quotation, company }: Props) {
  const lead = quotation.lead as Lead | undefined

  const subtotal = quotation.subtotal
  const discountAmount = quotation.discount_type === "percent"
    ? subtotal * (quotation.discount_value / 100)
    : quotation.discount_value
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (quotation.tax_percent / 100)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {company?.logo_url && <Image src={company.logo_url} style={styles.logo} />}
            <Text style={styles.companyName}>{company?.business_name || "Your Business"}</Text>
            <Text style={styles.companyInfo}>
              {[company?.email, company?.phone, company?.website].filter(Boolean).join("  ·  ")}
            </Text>
            {company?.address && <Text style={styles.companyInfo}>{company.address}</Text>}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteTitle}>QUOTATION</Text>
            <Text style={styles.quoteNumber}>{quotation.quote_number}</Text>
            <Text style={{ ...styles.companyInfo, marginTop: 6 }}>Date: {formatDate(quotation.created_at)}</Text>
            {quotation.valid_until && (
              <Text style={styles.companyInfo}>Valid until: {formatDate(quotation.valid_until)}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To + Project */}
        <View style={{ flexDirection: "row", gap: 24, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>{lead?.client_name || "—"}</Text>
            {lead?.company_name && <Text style={styles.companyInfo}>{lead.company_name}</Text>}
            {lead?.email && <Text style={styles.companyInfo}>{lead.email}</Text>}
            {lead?.phone && <Text style={styles.companyInfo}>{lead.phone}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Project</Text>
              <Text style={styles.value}>{quotation.project_title}</Text>
            </View>
            {quotation.project_type && (
              <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{quotation.project_type}</Text>
              </View>
            )}
            {quotation.event_date && (
              <View style={styles.row}>
                <Text style={styles.label}>Event Date</Text>
                <Text style={styles.value}>{formatDate(quotation.event_date)}</Text>
              </View>
            )}
            {quotation.location && (
              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{quotation.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderText, flex: 3 }}>Item</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 4 }}>Description</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 1, textAlign: "right" }}>Qty</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 2, textAlign: "right" }}>Unit Price</Text>
            <Text style={{ ...styles.tableHeaderText, flex: 2, textAlign: "right" }}>Total</Text>
          </View>
          {quotation.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, flex: 3, fontFamily: "Helvetica-Bold" }}>{item.item_name}</Text>
              <Text style={{ ...styles.tableCell, flex: 4, color: "#6b7280" }}>{item.description || ""}</Text>
              <Text style={{ ...styles.tableCell, flex: 1, textAlign: "right" }}>{item.quantity}</Text>
              <Text style={{ ...styles.tableCell, flex: 2, textAlign: "right" }}>{formatCurrency(item.unit_price)}</Text>
              <Text style={{ ...styles.tableCell, flex: 2, textAlign: "right", fontFamily: "Helvetica-Bold" }}>{formatCurrency(item.total_price)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Discount{quotation.discount_type === "percent" ? ` (${quotation.discount_value}%)` : ""}
              </Text>
              <Text style={styles.totalsValue}>- {formatCurrency(discountAmount)}</Text>
            </View>
          )}
          {taxAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax ({quotation.tax_percent}%)</Text>
              <Text style={styles.totalsValue}>+ {formatCurrency(taxAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quotation.grand_total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quotation.notes && (
          <View style={{ ...styles.section, marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 8, color: "#374151", lineHeight: 1.6 }}>{quotation.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {quotation.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={{ fontSize: 8, color: "#374151", lineHeight: 1.6 }}>{quotation.terms}</Text>
          </View>
        )}

        {/* Signature */}
        {(company?.signer_name || company?.signer_title || company?.signature_url) && (
          <View style={styles.signatureBlock}>
            {company?.signature_url ? (
              <Image src={company.signature_url} style={{ width: 160, height: 64, objectFit: "contain" }} />
            ) : (
              <View style={styles.signatureLine} />
            )}
            {company?.signer_name && <Text style={styles.signerName}>{company.signer_name}</Text>}
            {company?.signer_title && <Text style={styles.signerTitle}>{company.signer_title}</Text>}
          </View>
        )}

        {/* Footer CTA */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Thank you for your interest!</Text>
          <Text style={styles.footerText}>
            We look forward to working with you and delivering professional documentation for your event.
            Please review this quotation and feel free to reach out with any questions.
          </Text>
          {company?.phone && (
            <Text style={styles.ctaText}>📱 WhatsApp us: {company.phone}</Text>
          )}
          {company?.website && (
            <Text style={{ ...styles.ctaText, marginTop: 2 }}>🌐 {company.website}</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
