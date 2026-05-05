import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { CompanySettings, Invoice, QuotationItem } from "@/types"
import { formatCurrency } from "@/lib/utils/format"

const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#111827", paddingTop: 40, paddingBottom: 40, paddingLeft: 44, paddingRight: 44, backgroundColor: "#ffffff" },
  // Header: company kiri, doc title kanan
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  headerLeft: { flex: 1, paddingRight: 16 },
  coLogo: { width: 68, height: 68, objectFit: "contain", marginBottom: 8 },
  coName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2 },
  coLine: { fontSize: 7.5, color: "#6b7280", marginBottom: 1 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 8 },
  metaRow: { marginBottom: 5, alignItems: "flex-end" },
  metaLabel: { fontSize: 6.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
  metaValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#111827" },
  // Divider
  divider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 18 },
  // Info
  infoRow: { flexDirection: "row", marginBottom: 18 },
  infoBlock: { flex: 1, paddingRight: 12 },
  infoBlockRight: { flex: 1, paddingLeft: 12, alignItems: "flex-end" },
  infoLabel: { fontSize: 6.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  infoName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2 },
  infoText: { fontSize: 8, color: "#6b7280", marginBottom: 1 },
  // Table
  tableHead: { flexDirection: "row", backgroundColor: "#111827", paddingTop: 6, paddingBottom: 6, paddingLeft: 8, paddingRight: 8 },
  tableRow: { flexDirection: "row", paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, borderBottom: "0.5px solid #f3f4f6" },
  tableRowAlt: { flexDirection: "row", paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, borderBottom: "0.5px solid #f3f4f6", backgroundColor: "#f9fafb" },
  thText: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase" },
  tdText: { fontSize: 8, color: "#374151" },
  tdBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#111827" },
  // Bottom
  bottomSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  notesBlock: { flex: 1, paddingRight: 20 },
  totalsBlock: { width: 190 },
  blockLabel: { fontSize: 6.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  blockText: { fontSize: 8, color: "#6b7280", lineHeight: 1.5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: "0.5px solid #f3f4f6" },
  totalLabel: { fontSize: 8, color: "#6b7280" },
  totalValue: { fontSize: 8, color: "#374151" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#111827", paddingTop: 6, paddingBottom: 6, paddingLeft: 8, paddingRight: 8, marginTop: 3 },
  grandLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  grandValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  paidRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: "0.5px solid #f3f4f6" },
  outstandingRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fef2f2", paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, marginTop: 2 },
  outstandingRowPaid: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f0fdf4", paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, marginTop: 2 },
  outstandingLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#991b1b" },
  outstandingLabelPaid: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#166534" },
  outstandingValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#991b1b" },
  outstandingValuePaid: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#166534" },
  // Footer — signature only
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24, paddingTop: 14, borderTop: "1px solid #e5e7eb" },
  // Signature
  sigWrap: { width: 180, alignItems: "center" },
  sigLabel: { fontSize: 7.5, color: "#9ca3af", marginBottom: 16, textAlign: "center", width: "100%" },
  sigImageWrap: { width: "100%", alignItems: "center" },
  sigLine: { height: 1, backgroundColor: "#d1d5db", marginBottom: 4 },
  sigName: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "center", width: "100%" },
  sigTitle: { fontSize: 7.5, color: "#6b7280", marginTop: 1, textAlign: "center", width: "100%" },
})

function fmtDate(date: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

type InvoicePdfData = Invoice & {
  items?: QuotationItem[]
  quotation?: {
    event_date?: string | null
    location?: string | null
    project_type?: string | null
    terms?: string | null
    lead?: {
      company_name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
}

interface Props {
  invoice: InvoicePdfData
  company: CompanySettings
}

export function InvoicePDF({ invoice, company }: Props) {
  const lead = invoice.quotation?.lead
  const terms = invoice.quotation?.terms || company.default_payment_terms || company.default_terms
  const outstanding = Math.max(0, invoice.grand_total - invoice.paid_amount)
  const hasSignature = !!(company.signer_name || company.signer_title || company.signature_url)

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Header: company kiri, doc title kanan ── */}
        <View style={S.header}>
          <View style={S.headerLeft}>
            {company.logo_url ? (
              <Image src={company.logo_url} style={S.coLogo} />
            ) : null}
            {company.business_name ? <Text style={S.coName}>{company.business_name}</Text> : null}
            {company.address ? <Text style={S.coLine}>{company.address}</Text> : null}
            {company.phone ? <Text style={S.coLine}>{company.phone}</Text> : null}
            {company.email ? <Text style={S.coLine}>{company.email}</Text> : null}
            {company.website ? <Text style={S.coLine}>{company.website}</Text> : null}
          </View>
          <View style={S.headerRight}>
            <Text style={S.docTitle}>Invoice</Text>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Nomor</Text>
              <Text style={S.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Tanggal Terbit</Text>
              <Text style={S.metaValue}>{fmtDate(invoice.issue_date)}</Text>
            </View>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Jatuh Tempo</Text>
              <Text style={S.metaValue}>{fmtDate(invoice.due_date)}</Text>
            </View>
          </View>
        </View>

        <View style={S.divider} />

        {/* ── Kepada + Detail Proyek ── */}
        <View style={S.infoRow}>
          <View style={S.infoBlock}>
            <Text style={S.infoLabel}>Kepada</Text>
            <Text style={S.infoName}>{invoice.client_name}</Text>
            {lead?.company_name ? <Text style={S.infoText}>{lead.company_name}</Text> : null}
            {lead?.email ? <Text style={S.infoText}>{lead.email}</Text> : null}
            {lead?.phone ? <Text style={S.infoText}>{lead.phone}</Text> : null}
          </View>
          <View style={S.infoBlockRight}>
            <Text style={{ ...S.infoLabel, textAlign: "right" }}>Detail Proyek</Text>
            <Text style={{ ...S.infoName, textAlign: "right" }}>{invoice.project_title}</Text>
            {invoice.quotation?.project_type ? <Text style={{ ...S.infoText, textAlign: "right" }}>{invoice.quotation.project_type}</Text> : null}
            {invoice.quotation?.event_date ? <Text style={{ ...S.infoText, textAlign: "right" }}>Tanggal: {fmtDate(invoice.quotation.event_date)}</Text> : null}
            {invoice.quotation?.location ? <Text style={{ ...S.infoText, textAlign: "right" }}>Lokasi: {invoice.quotation.location}</Text> : null}
          </View>
        </View>

        {/* ── Table ── */}
        {!!invoice.items?.length && (
          <View>
            <View style={S.tableHead}>
              <View style={{ flex: 3 }}><Text style={S.thText}>Item</Text></View>
              <View style={{ flex: 4 }}><Text style={S.thText}>Deskripsi</Text></View>
              <View style={{ width: 30 }}><Text style={{ ...S.thText, textAlign: "right" }}>Qty</Text></View>
              <View style={{ width: 80 }}><Text style={{ ...S.thText, textAlign: "right" }}>Harga Satuan</Text></View>
              <View style={{ width: 80 }}><Text style={{ ...S.thText, textAlign: "right" }}>Total</Text></View>
            </View>
            {invoice.items.map((item, i) => (
              <View key={item.id || i} style={i % 2 === 1 ? S.tableRowAlt : S.tableRow}>
                <View style={{ flex: 3 }}><Text style={S.tdBold}>{item.item_name}</Text></View>
                <View style={{ flex: 4 }}><Text style={S.tdText}>{item.description || ""}</Text></View>
                <View style={{ width: 30 }}><Text style={{ ...S.tdText, textAlign: "right" }}>{item.quantity}</Text></View>
                <View style={{ width: 80 }}><Text style={{ ...S.tdText, textAlign: "right" }}>{formatCurrency(item.unit_price)}</Text></View>
                <View style={{ width: 80 }}><Text style={{ ...S.tdBold, textAlign: "right" }}>{formatCurrency(item.total_price)}</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* ── Catatan + Totals ── */}
        <View style={S.bottomSection}>
          <View style={S.notesBlock}>
            {invoice.notes ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={S.blockLabel}>Catatan</Text>
                <Text style={S.blockText}>{invoice.notes}</Text>
              </View>
            ) : null}
            {terms ? (
              <View>
                <Text style={S.blockLabel}>Syarat Pembayaran</Text>
                <Text style={S.blockText}>{terms}</Text>
              </View>
            ) : null}
          </View>

          <View style={S.totalsBlock}>
            <View style={S.totalRow}>
              <Text style={S.totalLabel}>Subtotal</Text>
              <Text style={S.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {invoice.discount > 0 ? (
              <View style={S.totalRow}>
                <Text style={S.totalLabel}>Diskon</Text>
                <Text style={S.totalValue}>- {formatCurrency(invoice.discount)}</Text>
              </View>
            ) : null}
            {invoice.tax > 0 ? (
              <View style={S.totalRow}>
                <Text style={S.totalLabel}>Pajak</Text>
                <Text style={S.totalValue}>+ {formatCurrency(invoice.tax)}</Text>
              </View>
            ) : null}
            <View style={S.grandRow}>
              <Text style={S.grandLabel}>Total</Text>
              <Text style={S.grandValue}>{formatCurrency(invoice.grand_total)}</Text>
            </View>
            {invoice.paid_amount > 0 ? (
              <View style={S.paidRow}>
                <Text style={S.totalLabel}>Terbayar</Text>
                <Text style={S.totalValue}>- {formatCurrency(invoice.paid_amount)}</Text>
              </View>
            ) : null}
            <View style={outstanding <= 0 ? S.outstandingRowPaid : S.outstandingRow}>
              <Text style={outstanding <= 0 ? S.outstandingLabelPaid : S.outstandingLabel}>
                {outstanding <= 0 ? "LUNAS" : "Sisa Tagihan"}
              </Text>
              <Text style={outstanding <= 0 ? S.outstandingValuePaid : S.outstandingValue}>
                {outstanding <= 0 ? "✓" : formatCurrency(outstanding)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Footer: Signature ── */}
        {hasSignature ? (
          <View style={S.footer}>
            <View style={S.sigWrap}>
              <Text style={S.sigLabel}>Hormat Kami,</Text>
              <View style={S.sigImageWrap}>
                {company.signature_url ? (
                  <Image src={company.signature_url} style={{ width: 88, height: 42, objectFit: "contain", marginBottom: 4 }} />
                ) : (
                  <View style={{ height: 36 }} />
                )}
              </View>
              <View style={S.sigLine} />
              {company.signer_name ? <Text style={S.sigName}>{company.signer_name}</Text> : null}
              {company.signer_title ? <Text style={S.sigTitle}>{company.signer_title}</Text> : null}
            </View>
          </View>
        ) : null}

      </Page>
    </Document>
  )
}
