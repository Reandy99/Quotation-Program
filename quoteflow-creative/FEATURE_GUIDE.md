# QuoteFlow Creative - Feature Reference

## Dark Mode

### How to Toggle
- **Desktop:** Click the moon/sun icon in the top-right header (next to notifications)
- **Mobile:** Click the moon/sun icon in the top-right of the mobile header

### Persistence
- Theme choice is saved to localStorage
- Automatically restored on next visit
- Respects system preference on first load

## Functional Buttons by Page

### Dashboard
- Click any recent lead/quotation to view details
- "View all" links navigate to full lists

### Leads
**List:**
- Search bar filters by client name, company, or project type
- Status pills filter the list
- Checkboxes select leads for bulk actions
- "Update Status" dropdown changes status for selected leads

**Detail:**
- Status flow buttons: New → Contacted → Quoted → Follow Up → Won/Lost
- "Add Note" prompts for text and adds to activity
- "Schedule Follow-up" prompts for date
- "New Quote" creates quotation for this lead
- "Edit" opens form to modify lead
- "Delete" removes lead (with confirmation)

### Quotations
**List:**
- Search filters by project title, quote number, or client
- Status pills filter by Draft/Sent/Accepted/Rejected
- Checkboxes select quotations
- "Duplicate" creates copies of selected quotations
- "Change Status" dropdown updates selected quotations

**Detail:**
- "Duplicate" creates a copy
- "Convert to Invoice" navigates to invoices (when Accepted)
- "Print" opens print dialog
- "Share WhatsApp" opens WhatsApp with full quote details
- Status buttons update quotation status
- "Download PDF" generates PDF (already functional)

### Follow-ups
- WhatsApp icon opens WhatsApp with follow-up message
- Calendar icon reschedules follow-up date
- Checkmark icon marks follow-up complete
- Template "Send via WA" buttons open WhatsApp with template

### Clients
**List:**
- Search filters by name, company, email, or phone
- "New Client" opens modal to add client
- Pencil icon edits client
- Archive icon removes client

**Detail:**
- "Edit" opens modal to modify client
- "Archive" removes client

### Invoices
**List:**
- Search filters by invoice number, client, or project
- Status tabs filter by Paid/Partial/Overdue/Sent/Draft

**Detail:**
- "Print" opens print dialog
- "Send" marks invoice as sent (with confirmation)
- "Record Payment" opens modal to add payment
  - Enter amount, method, date, and notes
  - Updates invoice status automatically

### Calendar
- Click left/right arrows to navigate months
- Click any date to see events in sidebar
- Click X to close sidebar
- Event chips show leads (indigo) and quotations (emerald)

### Reports
- Select "From" and "To" months to filter data
- "Export CSV" downloads quotations data

### Settings
- Fill in company details
- Click "Choose File" to upload logo (preview shows immediately)
- "Save Changes" saves to localStorage (success banner appears)

### Notifications
- Click bell icon to open dropdown
- "Mark all read" clears all unread notifications
- Click individual notification to mark as read

## Demo Mode Notes

All changes are local and not persisted to a backend:
- Lead/quotation/client changes update local state only
- Settings save to localStorage
- Bulk actions show confirmation dialogs
- WhatsApp links open in new tab
- CSV exports download to your device
- Print opens browser print dialog

## Keyboard Shortcuts

- **Tab** - Navigate between form fields
- **Enter** - Submit forms
- **Escape** - Close modals (where implemented)

## Mobile Experience

- Hamburger menu opens sidebar
- Theme toggle in mobile header
- All features work on mobile
- Touch-friendly button sizes
- Responsive tables and cards

## Color Scheme

### Light Mode
- Background: Gray-50
- Cards: White
- Text: Gray-900
- Accent: Indigo-600

### Dark Mode
- Background: Slate-950
- Cards: Slate-900
- Text: Slate-100
- Accent: Indigo-400
- Borders: Slate-800

## Tips

1. **Search is instant** - No need to press Enter
2. **Bulk actions** - Select multiple items for faster updates
3. **WhatsApp integration** - Messages are pre-filled in Indonesian
4. **Status flow** - Follow the natural progression for leads
5. **Calendar events** - Click dates to see all events that day
6. **Payment tracking** - Record partial payments, status updates automatically
7. **CSV export** - Use date filters before exporting for specific periods
8. **Logo preview** - See your logo immediately after selecting file

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Fast page loads (static generation where possible)
- Instant theme switching
- Smooth animations and transitions
- Optimized for demo mode (no API calls)
