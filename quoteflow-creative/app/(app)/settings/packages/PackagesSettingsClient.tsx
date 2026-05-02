"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"

interface PackageItem {
  id: string
  name: string
  description: string
  price: number
}

interface ServicePackage {
  id: string
  name: string
  description: string
  items: PackageItem[]
}

const LS_KEY = "quoteflow_packages"

export default function PackagesSettingsClient() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", items: [] as PackageItem[] })
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0 })

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) {
      try {
        setPackages(JSON.parse(stored))
      } catch {}
    }
  }, [])

  function savePackages(updated: ServicePackage[]) {
    setPackages(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  function handleAddPackage() {
    if (!formData.name.trim()) return
    const newPkg: ServicePackage = {
      id: `pkg-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      items: formData.items,
    }
    savePackages([...packages, newPkg])
    setFormData({ name: "", description: "", items: [] })
    setShowNewForm(false)
  }

  function handleUpdatePackage() {
    if (!editingId || !formData.name.trim()) return
    savePackages(packages.map(p => p.id === editingId ? { ...p, ...formData } : p))
    setEditingId(null)
    setFormData({ name: "", description: "", items: [] })
  }

  function handleDeletePackage(id: string) {
    if (!confirm("Delete this package?")) return
    savePackages(packages.filter(p => p.id !== id))
  }

  function startEdit(pkg: ServicePackage) {
    setEditingId(pkg.id)
    setFormData({ name: pkg.name, description: pkg.description, items: pkg.items })
    setShowNewForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setShowNewForm(false)
    setFormData({ name: "", description: "", items: [] })
  }

  function addItemToForm() {
    if (!newItem.name.trim() || newItem.price <= 0) return
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: `item-${Date.now()}`, ...newItem }],
    }))
    setNewItem({ name: "", description: "", price: 0 })
  }

  function removeItemFromForm(itemId: string) {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }))
  }

  const isEditing = editingId !== null || showNewForm

  return (
    <div>
      <PageHeader
        title="Packages & Pricing"
        description="Manage your service packages and standard pricing"
        action={
          !isEditing && (
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Package
            </Button>
          )
        }
      />

      {/* New/Edit Form */}
      {isEditing && (
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">
              {editingId ? "Edit Package" : "New Package"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Package Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Wedding Photography Standard"
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Full day coverage with album"
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Package Items</h4>
              
              {/* Add Item Form */}
              <div className="grid grid-cols-[2fr_3fr_1fr_auto] gap-2 mb-3">
                <Input
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                />
                <Input
                  placeholder="Description"
                  value={newItem.description}
                  onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newItem.price || ""}
                  onChange={e => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                />
                <Button size="sm" onClick={addItemToForm} variant="outline" className="dark:border-slate-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {formData.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded border border-gray-200 dark:border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItemFromForm(item.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
                    No items added yet
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button variant="outline" onClick={cancelEdit} className="dark:border-slate-700 dark:text-slate-300">
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button onClick={editingId ? handleUpdatePackage : handleAddPackage}>
                <Check className="w-4 h-4 mr-1.5" />
                {editingId ? "Update" : "Create"} Package
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      <div className="grid gap-4">
        {packages.length === 0 && !isEditing && (
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">
                No packages created yet. Create your first service package to use as shortcuts when building quotations.
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Package
              </Button>
            </CardContent>
          </Card>
        )}

        {packages.map(pkg => (
          <Card key={pkg.id} className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base dark:text-slate-100">{pkg.name}</CardTitle>
                  {pkg.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{pkg.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(pkg)} className="dark:border-slate-700">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="text-red-600 dark:text-red-400 dark:border-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pkg.items.map(item => (
                  <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 ml-4 whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
                {pkg.items.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-slate-500 py-2">No items in this package</p>
                )}
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Total Package Value</span>
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(pkg.items.reduce((sum, item) => sum + item.price, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
