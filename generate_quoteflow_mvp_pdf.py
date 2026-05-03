#!/usr/bin/env python3
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def create_pdf():
    pdf_path = "/root/.openclaw/workspace/quoteflow-mvp-flow.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, topMargin=1.5*cm, bottomMargin=1.5*cm)
    story = []
    styles = getSampleStyleSheet()
    
    # Dark theme colors
    bg_dark = colors.HexColor('#1a1a1a')
    text_light = colors.HexColor('#e0e0e0')
    accent = colors.HexColor('#3b82f6')
    
    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=28, textColor=accent, alignment=TA_CENTER, spaceAfter=30)
    h1_style = ParagraphStyle('CustomH1', parent=styles['Heading1'], fontSize=18, textColor=accent, spaceAfter=12)
    h2_style = ParagraphStyle('CustomH2', parent=styles['Heading2'], fontSize=14, textColor=text_light, spaceAfter=10)
    body_style = ParagraphStyle('CustomBody', parent=styles['BodyText'], fontSize=10, textColor=text_light, spaceAfter=8)
    
    # Page 1: Title
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("QuoteFlow Creative", title_style))
    story.append(Paragraph("MVP Product Flow", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=16, textColor=text_light, alignment=TA_CENTER)))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("SaaS Platform for Creative Professionals", ParagraphStyle('Desc', parent=styles['Normal'], fontSize=12, textColor=text_light, alignment=TA_CENTER, fontName='Helvetica-Oblique')))
    story.append(PageBreak())
    
    # Page 2: Overview & User Flow
    story.append(Paragraph("Overview", h1_style))
    story.append(Paragraph("QuoteFlow Creative adalah SaaS platform untuk fotografer dan videografer dalam mengelola leads, quotations, invoices, dan follow-ups secara profesional.", body_style))
    story.append(Spacer(1, 0.5*cm))
    
    story.append(Paragraph("User Flow", h1_style))
    flow_data = [
        ['Sign Up', '→', 'Free Trial (14 days)', '→', 'Dashboard'],
        ['Create Lead', '→', 'Convert to Quote', '→', 'Send Invoice'],
        ['Follow-up', '→', 'Close Deal', '→', 'Analytics']
    ]
    flow_table = Table(flow_data, colWidths=[3.5*cm, 0.8*cm, 3.5*cm, 0.8*cm, 3.5*cm])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#2a2a2a')),
        ('TEXTCOLOR', (0, 0), (-1, -1), text_light),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#404040')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor('#2a2a2a'), colors.HexColor('#252525')]),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 0.8*cm))
    
    # Features
    story.append(Paragraph("Core Features", h1_style))
    
    features = [
        ("Landing Page", "Hero section, 6 feature highlights, CTA, footer"),
        ("Auth", "Login/Signup via Supabase Auth"),
        ("Dashboard", "Pipeline stats, won deals, conversion rate, today's agenda, funnel view, recent activity"),
        ("Leads", "List view, Kanban board, status tracking, event scheduling"),
        ("Quotations", "PDF generation, line items, discounts, tax calculation, templates"),
        ("Invoices", "Payment tracking, overdue management, status updates"),
        ("Follow-ups", "WhatsApp templates, scheduling, reminder system"),
        ("Calendar", "Event & schedule view, integrated with leads"),
        ("Settings", "General, Company Profile, Packages, Billing"),
        ("Pricing", "Free Trial (14 days), Studio Rp99k/mo, Pro Rp199k/mo"),
        ("Admin", "Subscription management, user overview"),
    ]
    
    for title, desc in features:
        story.append(Paragraph(f"<b>{title}</b>: {desc}", body_style))
    
    story.append(PageBreak())
    
    # Page 3: Tech Stack & Architecture
    story.append(Paragraph("Tech Stack", h1_style))
    
    tech_data = [
        ['Frontend', 'Next.js 14 (App Router), React Server Components'],
        ['Backend', 'Supabase (PostgreSQL + Auth + Storage)'],
        ['UI', 'Tailwind CSS, shadcn/ui, Lucide icons'],
        ['Deployment', 'Netlify (SSR + Edge Functions)'],
        ['Language', 'TypeScript'],
    ]
    tech_table = Table(tech_data, colWidths=[4*cm, 12*cm])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#2a2a2a')),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#1f1f1f')),
        ('TEXTCOLOR', (0, 0), (-1, -1), text_light),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#404040')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 0.8*cm))
    
    story.append(Paragraph("Database Schema (Supabase)", h1_style))
    schema_items = [
        "profiles: user data, company info, subscription tier",
        "leads: client leads, status, event details, source",
        "quotations: quote details, line items, pricing, PDF URL",
        "invoices: payment tracking, due dates, status",
        "follow_ups: scheduled reminders, WhatsApp templates",
        "packages: service packages, pricing templates",
        "settings: user preferences, company profile",
    ]
    for item in schema_items:
        story.append(Paragraph(f"• {item}", body_style))
    
    story.append(Spacer(1, 0.8*cm))
    
    story.append(Paragraph("Billing & Payment", h1_style))
    story.append(Paragraph("MVP: Manual billing management with gateway fields ready for Xendit/Midtrans integration.", body_style))
    story.append(Paragraph("• Free Trial: 14 days, full feature access", body_style))
    story.append(Paragraph("• Studio Plan: Rp99,000/month (basic features)", body_style))
    story.append(Paragraph("• Pro Plan: Rp199,000/month (advanced features + priority support)", body_style))
    
    story.append(PageBreak())
    
    # Page 4: MVP Scope & Next Steps
    story.append(Paragraph("MVP Scope", h1_style))
    
    mvp_in = [
        "✓ Full authentication flow (Supabase Auth)",
        "✓ Lead management (list, kanban, status tracking)",
        "✓ Quotation generation (PDF export, templates)",
        "✓ Invoice tracking (payment status, overdue alerts)",
        "✓ Follow-up system (WhatsApp templates, scheduling)",
        "✓ Dashboard analytics (pipeline, conversion, activity)",
        "✓ Calendar view (events, schedules)",
        "✓ Settings (company profile, packages, billing)",
        "✓ Pricing page (trial + 2 paid tiers)",
        "✓ Admin panel (subscription management)",
        "✓ Responsive design (mobile-first)",
    ]
    
    story.append(Paragraph("Included in MVP:", h2_style))
    for item in mvp_in:
        story.append(Paragraph(item, body_style))
    
    story.append(Spacer(1, 0.5*cm))
    
    mvp_out = [
        "⊗ Automated payment gateway (manual for MVP)",
        "⊗ Email marketing automation",
        "⊗ Advanced analytics & reporting",
        "⊗ Multi-user team collaboration",
        "⊗ API integrations (CRM, accounting)",
    ]
    
    story.append(Paragraph("Post-MVP (Phase 2):", h2_style))
    for item in mvp_out:
        story.append(Paragraph(item, body_style))
    
    story.append(Spacer(1, 0.8*cm))
    
    story.append(Paragraph("Deployment Status", h1_style))
    story.append(Paragraph("• Environment: Production-ready on Netlify", body_style))
    story.append(Paragraph("• Database: Supabase PostgreSQL (hosted)", body_style))
    story.append(Paragraph("• Auth: Supabase Auth (email/password)", body_style))
    story.append(Paragraph("• Storage: Supabase Storage (PDF, images)", body_style))
    story.append(Paragraph("• Domain: Ready for custom domain setup", body_style))
    
    story.append(Spacer(1, 0.8*cm))
    
    story.append(Paragraph("Next Steps", h1_style))
    next_steps = [
        "1. User testing & feedback collection",
        "2. Payment gateway integration (Xendit/Midtrans)",
        "3. Email notification system",
        "4. Performance optimization & caching",
        "5. SEO & marketing site setup",
        "6. Customer onboarding flow",
    ]
    for step in next_steps:
        story.append(Paragraph(step, body_style))
    
    # Build PDF
    doc.build(story)
    print(f"✓ PDF generated: {pdf_path}")

if __name__ == "__main__":
    create_pdf()
