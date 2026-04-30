# QuoteFlow Creative - Quick Start Guide

## 🚀 Getting Started

### Run the Application
```bash
cd /root/.openclaw/workspace/quoteflow-creative
npm run dev
```

Visit: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 📱 New Features Overview

### 1. **Enhanced Lead Management**
- **Path**: `/leads`
- **Features**: 
  - Search by client name, company, or project type
  - Filter by status (New, Contacted, Quoted, Follow Up, Won, Lost)
  - Click any lead to see full details
- **Lead Detail** (`/leads/[id]`):
  - Update status with one click
  - Add notes and activity log
  - Quick actions: Create Quote, Add Note, Schedule Follow-up
  - View all related quotations

### 2. **Professional Quotations**
- **Path**: `/quotations`
- **Features**:
  - Search and filter by status
  - Click to view full quotation
- **Quotation Detail** (`/quotations/[id]`):
  - Print-ready professional layout
  - Print button (uses browser print)
  - WhatsApp share button (opens WhatsApp with pre-filled message)
  - Duplicate quotation
  - Change status (Draft → Sent → Accepted/Rejected)

### 3. **Client Database**
- **Path**: `/clients`
- **Features**:
  - Card-based client directory
  - Shows total projects and revenue per client
  - Click to view full client profile
- **Client Detail** (`/clients/[id]`):
  - Complete contact information
  - Project and revenue summary

### 4. **Invoice Management**
- **Path**: `/invoices`
- **Features**:
  - List all invoices with status
  - Status: Draft, Sent, Partial, Paid, Overdue
  - Shows paid amount vs total
- **Invoice Detail** (`/invoices/[id]`):
  - Professional invoice layout
  - Payment history
  - Outstanding balance
  - Print functionality

### 5. **Calendar View**
- **Path**: `/calendar`
- **Features**:
  - See all upcoming events from leads
  - Sorted by date
  - Quick agenda sidebar
  - Click to view lead details

### 6. **Reports & Analytics**
- **Path**: `/reports`
- **Features**:
  - Total Revenue, Total Quoted, Win Rate, Won Deals
  - Revenue breakdown by project type
  - Top clients ranking
  - Visual summary cards

### 7. **Notifications**
- **Location**: Top right header (desktop only)
- **Features**:
  - Bell icon with unread count badge
  - Dropdown with notifications
  - Mark all as read
  - Demo notifications included

### 8. **Settings**
- **Path**: `/settings` or `/settings/company`
- **Features**:
  - Company profile management
  - Logo upload
  - Default terms and payment settings

## 🎨 UI Features

### Search & Filter
- **Leads page**: Search bar + status filter buttons
- **Quotations page**: Search bar + status filter buttons
- Real-time filtering as you type

### Status Badges
- **Green**: Won, Accepted, Paid
- **Yellow**: Follow Up, Partial
- **Blue**: New, Quoted, Sent
- **Red**: Lost, Rejected, Overdue
- **Gray**: Draft

### Mobile Responsive
- All pages work on mobile
- Hamburger menu on mobile
- Responsive tables and cards
- Touch-friendly buttons

## 📊 Demo Data

The app includes realistic Indonesian demo data:

### Sample Leads
- Budi Santoso - Wedding Photography (New)
- Sari Dewi - Corporate Event (Quoted)
- Andi Wijaya - Product Photography (Won)
- Rina Kusuma - Prewedding (Follow Up)
- Maya Putri - Fashion Shoot (Contacted)

### Sample Quotations
- QF-2026-001: Wedding (Sent, Rp 14,410,000)
- QF-2026-002: Corporate Event (Accepted, Rp 9,499,500)
- QF-2026-003: Product Shoot (Draft, Rp 3,200,000)

### Sample Invoices
- INV-2026-001: Paid (Rp 9,490,950)
- INV-2026-002: Partial (Rp 1,600,000 paid of Rp 3,200,000)
- INV-2026-003: Overdue (Rp 0 paid of Rp 8,880,000)

## 🔧 Technical Notes

### Demo Mode
- All "Save" actions show alerts (no actual database)
- Data resets on page refresh
- Perfect for demonstrations

### WhatsApp Integration
- Uses `wa.me` URL scheme
- Pre-fills message with quotation details
- Opens in new tab/window

### Print Functionality
- Quotations and invoices are print-optimized
- Uses `@media print` CSS
- Hides navigation and action buttons when printing

### Currency & Dates
- All amounts in Indonesian Rupiah (Rp)
- Dates formatted as "DD Mmm YYYY"
- Indonesian locale throughout

## 🎯 Navigation

### Main Menu (Sidebar)
1. **Dashboard** - Overview and stats
2. **Leads** - Manage potential clients
3. **Quotations** - Create and send quotes
4. **Follow-ups** - Track scheduled follow-ups
5. **Clients** - Client database (NEW)
6. **Invoices** - Invoice management (NEW)
7. **Calendar** - Event schedule (NEW)
8. **Reports** - Analytics (NEW)
9. **Settings** - Company settings

### Quick Actions
- Most pages have a "+ New" button in the header
- Lead detail has quick action buttons
- Quotation detail has Print, WhatsApp, Duplicate buttons

## 💡 Tips

1. **Search is instant** - No need to press Enter
2. **Click anywhere on a row** - Opens detail page
3. **Status filters** - Click "All" to reset
4. **Print quotations** - Use browser's print dialog (Ctrl+P)
5. **Mobile menu** - Tap hamburger icon (☰) on mobile

## 🐛 Known Limitations (Demo Mode)

- No actual data persistence
- No email sending
- No file uploads (except in Settings)
- No user authentication (bypassed for demo)
- No backend API calls

## 📝 Next Steps (If Connecting to Real Backend)

1. Replace mock data imports with API calls
2. Implement actual form submissions
3. Add loading states
4. Add error handling
5. Connect to Supabase or your backend
6. Enable authentication

---

**Everything is working and ready to demo!** 🎉

Run `npm run dev` and explore all the new features.
