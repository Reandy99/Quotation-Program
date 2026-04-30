"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Building2, Phone, Mail, Globe, Plus, X, AlertCircle } from "lucide-react"

interface SearchResult {
  id: string
  name: string
  category: string
  location: string
  phone?: string
  email?: string
  website?: string
  source: string
  matchScore: number
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", name: "Grand Ballroom Hotel Mulia", category: "Hotel & Venue", location: "Jakarta Selatan", phone: "+62 21 574 7777", website: "www.hotelmulia.com", source: "Google Maps", matchScore: 95 },
  { id: "2", name: "Bali Wedding Organizer", category: "Wedding Organizer", location: "Bali", phone: "+62 361 123 456", email: "info@baliwedding.id", website: "www.baliwedding.id", source: "Google Maps", matchScore: 92 },
  { id: "3", name: "PT Maju Teknologi Indonesia", category: "Technology Company", location: "Jakarta Pusat", phone: "+62 21 555 8888", email: "contact@majutek.co.id", source: "LinkedIn", matchScore: 88 },
  { id: "4", name: "Bella Bridal Studio", category: "Bridal Studio", location: "Surabaya", phone: "+62 31 567 1234", website: "www.bellabridal.id", source: "Instagram", matchScore: 85 },
  { id: "5", name: "Kopi Kenangan HQ", category: "F&B Brand", location: "Jakarta Selatan", email: "marketing@kopikenangan.com", website: "www.kopikenangan.com", source: "Google Maps", matchScore: 82 },
]

export default function LeadDiscoveryPage() {
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [searchParams, setSearchParams] = useState({
    serviceType: "Wedding Photography",
    location: "Jakarta",
    clientType: "B2B",
    industry: "Wedding Organizer",
    keywords: "",
  })

  function handleSearch() {
    setSearching(true)
    // Simulate API call
    setTimeout(() => {
      setResults(MOCK_RESULTS)
      setSearching(false)
    }, 1500)
  }

  function handleAddLead(result: SearchResult) {
    alert(`Demo: Would create lead for "${result.name}"`)
    setResults(prev => prev.filter(r => r.id !== result.id))
  }

  return (
    <div>
      <PageHeader
        title="Lead Discovery"
        description="Find potential clients using public business data"
      />

      {showDisclaimer && (
        <Card className="mb-6 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-1">
                Demo Mode — Mock Data Only
              </p>
              <p className="text-xs text-orange-800 dark:text-orange-300 mb-2">
                This feature displays simulated results for demonstration purposes. In production, this would integrate with Google Places API, LinkedIn, and other public data sources. Always comply with applicable privacy laws (UU PDP Indonesia) when reaching out to potential clients.
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                ⚠️ All data sourced from publicly available, non-authenticated sources. No scraping of authenticated content or ToS violations.
              </p>
            </div>
            <button onClick={() => setShowDisclaimer(false)} className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
              <X className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Form */}
        <Card className="lg:col-span-1 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-gray-100">Target Market Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Service Type</Label>
              <select
                value={searchParams.serviceType}
                onChange={e => setSearchParams(p => ({ ...p, serviceType: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                <option>Wedding Photography</option>
                <option>Corporate Event</option>
                <option>Product Photography</option>
                <option>Fashion Shoot</option>
                <option>Videography</option>
              </select>
            </div>

            <div>
              <Label className="dark:text-gray-300">Target Location</Label>
              <Input
                value={searchParams.location}
                onChange={e => setSearchParams(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Jakarta Selatan, Bali"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <Label className="dark:text-gray-300">Client Type</Label>
              <select
                value={searchParams.clientType}
                onChange={e => setSearchParams(p => ({ ...p, clientType: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                <option value="B2C">Individual (B2C)</option>
                <option value="B2B">Business/Brand (B2B)</option>
              </select>
            </div>

            <div>
              <Label className="dark:text-gray-300">Industry (for B2B)</Label>
              <select
                value={searchParams.industry}
                onChange={e => setSearchParams(p => ({ ...p, industry: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                <option>Wedding Organizer</option>
                <option>Event Organizer</option>
                <option>Hotel</option>
                <option>F&B</option>
                <option>Fashion</option>
                <option>Real Estate</option>
                <option>Technology</option>
                <option>Beauty</option>
              </select>
            </div>

            <div>
              <Label className="dark:text-gray-300">Keywords (optional)</Label>
              <Input
                value={searchParams.keywords}
                onChange={e => setSearchParams(p => ({ ...p, keywords: e.target.value }))}
                placeholder="e.g. bridal studio, boutique"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <Button onClick={handleSearch} disabled={searching} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              {searching ? "Searching..." : "Find Leads"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {results.length === 0 && !searching && (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure your target market and click "Find Leads" to discover potential clients
                </p>
              </CardContent>
            </Card>
          )}

          {searching && (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Searching public databases...</p>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {results.length} potential leads
                </p>
              </div>

              {results.map(result => (
                <Card key={result.id} className="dark:bg-gray-900 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {result.name}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                            {result.matchScore}% match
                          </span>
                        </div>

                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Building2 className="w-3.5 h-3.5" />
                            {result.category}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {result.location}
                          </div>
                          {result.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-3.5 h-3.5" />
                              {result.phone}
                            </div>
                          )}
                          {result.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="w-3.5 h-3.5" />
                              {result.email}
                            </div>
                          )}
                          {result.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Globe className="w-3.5 h-3.5" />
                              {result.website}
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Source: {result.source}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleAddLead(result)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Leads
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setResults(prev => prev.filter(r => r.id !== result.id))} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                          Skip
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
