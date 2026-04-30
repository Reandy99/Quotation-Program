export interface QuotationTemplateItem {
  item_name: string
  description: string | null
  quantity: number
  unit_price: number
}

export interface QuotationTemplate {
  id: string
  name: string
  description: string
  category: string
  package_name: string
  items: QuotationTemplateItem[]
  payment_terms: string
  notes: string
  discount_type: "flat" | "percent"
  discount_value: number
  tax_percent: number
}

export const BUILTIN_TEMPLATES: QuotationTemplate[] = [
  {
    id: "wedding-standard",
    name: "Wedding Photography Standard",
    description: "Complete wedding day coverage with album",
    category: "Wedding",
    package_name: "Wedding Photography Package",
    items: [
      { item_name: "Full Day Coverage", description: "8 hours, 2 photographers", quantity: 1, unit_price: 10000000 },
      { item_name: "Online Gallery", description: "500+ edited photos", quantity: 1, unit_price: 2000000 },
      { item_name: "Premium Photo Album 30x40cm", description: null, quantity: 1, unit_price: 3500000 },
    ],
    payment_terms: "50% DP to confirm booking, remaining balance due 7 days before event date.",
    notes: "Includes pre-event consultation, location scouting for 1 location.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "wedding-premium",
    name: "Wedding Photography Premium",
    description: "Premium wedding documentation with video",
    category: "Wedding",
    package_name: "Premium Wedding Documentation",
    items: [
      { item_name: "Full Day Coverage", description: "10 hours, 3 photographers", quantity: 1, unit_price: 18000000 },
      { item_name: "Cinematic Highlight Video", description: "5-7 minutes", quantity: 1, unit_price: 8000000 },
      { item_name: "Same Day Edit (SDE) Video", description: null, quantity: 1, unit_price: 4000000 },
      { item_name: "Luxury Photo Album 40x50cm", description: "Lay-flat", quantity: 1, unit_price: 6000000 },
      { item_name: "Engagement/Prewedding Session", description: null, quantity: 1, unit_price: 5000000 },
    ],
    payment_terms: "40% DP upon contract signing, 30% one month before event, 30% on event day.",
    notes: "Includes 2 prewedding locations, drone footage (weather permitting), private online gallery for 12 months.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "prewedding",
    name: "Prewedding / Engagement Session",
    description: "Outdoor prewedding photo session",
    category: "Prewedding",
    package_name: "Prewedding Photo Session",
    items: [
      { item_name: "Outdoor Session 4 hours", description: null, quantity: 1, unit_price: 4000000 },
      { item_name: "Edited Photos", description: "50 photos", quantity: 1, unit_price: 2000000 },
      { item_name: "Studio Session add-on", description: "Optional", quantity: 0, unit_price: 1500000 },
      { item_name: "Drone Aerial Shots", description: "Optional", quantity: 0, unit_price: 1000000 },
    ],
    payment_terms: "Full payment before session date.",
    notes: "Location scouting included, hair & makeup not included. Session reschedulable once due to weather.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "corporate-event",
    name: "Corporate Event Photography",
    description: "Professional corporate event documentation",
    category: "Corporate",
    package_name: "Corporate Event Documentation",
    items: [
      { item_name: "Half Day Coverage", description: "4 hours", quantity: 0, unit_price: 3500000 },
      { item_name: "Full Day Coverage", description: "8 hours", quantity: 1, unit_price: 6000000 },
      { item_name: "Edited Deliverables", description: "200 photos", quantity: 1, unit_price: 1500000 },
      { item_name: "Express Delivery add-on", description: "24 hours", quantity: 0, unit_price: 1000000 },
    ],
    payment_terms: "Invoice due within 14 days of event completion. Purchase Order accepted.",
    notes: "Corporate invoice with company letterhead available. NPWP and tax invoice (Faktur Pajak) can be provided upon request.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "product-photography",
    name: "Product Photography",
    description: "Professional product photography for e-commerce",
    category: "Commercial",
    package_name: "Product Photography Package",
    items: [
      { item_name: "Up to 10 hero products", description: null, quantity: 1, unit_price: 3000000 },
      { item_name: "Additional products", description: "Per item", quantity: 0, unit_price: 200000 },
      { item_name: "White background clean shots", description: "Per product", quantity: 10, unit_price: 150000 },
      { item_name: "Lifestyle/contextual shots", description: "Per product", quantity: 5, unit_price: 350000 },
    ],
    payment_terms: "50% DP before shoot date, 50% upon file delivery.",
    notes: "Client must provide products at least 2 days before shoot. Studio props and background available. RAW files not included.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "fashion-editorial",
    name: "Fashion & Editorial Shoot",
    description: "Fashion and editorial photography",
    category: "Fashion",
    package_name: "Fashion Editorial Package",
    items: [
      { item_name: "Half day studio/location", description: "4 hours", quantity: 0, unit_price: 5000000 },
      { item_name: "Full day", description: "8 hours", quantity: 1, unit_price: 9000000 },
      { item_name: "Edited photos", description: "30 selects", quantity: 1, unit_price: 3000000 },
      { item_name: "Additional edits", description: "Per photo", quantity: 0, unit_price: 100000 },
      { item_name: "Second photographer", description: null, quantity: 0, unit_price: 2000000 },
    ],
    payment_terms: "50% DP to book date, balance before shoot.",
    notes: "Mood board required 1 week before shoot. Usage rights for commercial/editorial specified per agreement.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "birthday-social",
    name: "Birthday & Social Event",
    description: "Birthday party and social event coverage",
    category: "Social",
    package_name: "Birthday & Social Event Package",
    items: [
      { item_name: "3 Hour Event Coverage", description: null, quantity: 0, unit_price: 2500000 },
      { item_name: "5 Hour Event Coverage", description: null, quantity: 1, unit_price: 3800000 },
      { item_name: "Edited Photos", description: "150 selects", quantity: 1, unit_price: 1000000 },
      { item_name: "Photo Booth Setup", description: "3 hours, optional", quantity: 0, unit_price: 2000000 },
    ],
    payment_terms: "Full payment or 50% DP, balance on event day.",
    notes: "Delivery of edited photos within 7-14 business days.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "videography-wedding",
    name: "Videography — Wedding Cinematic",
    description: "Cinematic wedding film package",
    category: "Videography",
    package_name: "Cinematic Wedding Film Package",
    items: [
      { item_name: "Full Day Videography Coverage", description: "2 videographers", quantity: 1, unit_price: 12000000 },
      { item_name: "Cinematic Highlight Film", description: "5-8 min", quantity: 1, unit_price: 5000000 },
      { item_name: "Full Ceremony & Reception Edit", description: null, quantity: 1, unit_price: 4000000 },
      { item_name: "Drone Aerial Footage", description: null, quantity: 1, unit_price: 2000000 },
      { item_name: "Same Day Edit (SDE)", description: "3-5 min", quantity: 0, unit_price: 3500000 },
    ],
    payment_terms: "40% DP, 30% one month before, 30% on event day.",
    notes: "Delivered via private YouTube/Google Drive link. Color grading and licensed background music included.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "videography-corporate",
    name: "Videography — Corporate & Commercial",
    description: "Corporate video production",
    category: "Videography",
    package_name: "Corporate Video Production",
    items: [
      { item_name: "Shoot Day", description: "Up to 8 hours, 1 camera", quantity: 1, unit_price: 8000000 },
      { item_name: "Additional Camera Operator", description: null, quantity: 0, unit_price: 3000000 },
      { item_name: "Post-Production & Editing", description: "Per minute of final video", quantity: 3, unit_price: 1500000 },
      { item_name: "Motion Graphics & Titles", description: null, quantity: 1, unit_price: 2000000 },
      { item_name: "Scriptwriting & Storyboard", description: null, quantity: 0, unit_price: 2500000 },
      { item_name: "Voice Over", description: "Male/female", quantity: 0, unit_price: 1000000 },
    ],
    payment_terms: "50% DP upon project kickoff, 50% upon final video approval.",
    notes: "Up to 2 revision rounds included. Additional revisions billed at Rp 500.000/hour. Final file delivered in MP4 1080p and 4K.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
  {
    id: "combo-package",
    name: "Photo + Video Combo Package",
    description: "Complete documentation package",
    category: "Combo",
    package_name: "Complete Documentation Package",
    items: [
      { item_name: "Full Day Photography", description: "8 hours", quantity: 1, unit_price: 8000000 },
      { item_name: "Full Day Videography", description: "8 hours", quantity: 1, unit_price: 10000000 },
      { item_name: "Photo Album 30x40cm", description: null, quantity: 1, unit_price: 3000000 },
      { item_name: "Highlight Video", description: "5-7 min", quantity: 1, unit_price: 4000000 },
      { item_name: "Online Gallery", description: "1 year", quantity: 1, unit_price: 1000000 },
    ],
    payment_terms: "50% DP to secure date, remaining balance 2 weeks before event.",
    notes: "Best value combo for comprehensive event documentation. Drone add-on available at Rp 2.000.000.",
    discount_type: "flat",
    discount_value: 0,
    tax_percent: 11,
  },
]

export function getTemplateById(id: string): QuotationTemplate | undefined {
  return BUILTIN_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByCategory(category: string): QuotationTemplate[] {
  return BUILTIN_TEMPLATES.filter(t => t.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(BUILTIN_TEMPLATES.map(t => t.category)))
}
