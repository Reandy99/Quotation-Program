"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companySchema, type CompanyFormData } from "@/lib/validations/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { Upload, Check } from "lucide-react"
import Image from "next/image"
import type { CompanySettings } from "@/types"

const LS_KEY = "quoteflow_company_settings"

function loadFromStorage(company: CompanySettings | null): CompanyFormData & { logo_url?: string } {
  if (typeof window === "undefined") return {} as CompanyFormData
  try {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {
    business_name: company?.business_name ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    website: company?.website ?? "",
    address: company?.address ?? "",
    default_terms: company?.default_terms ?? "",
    default_payment_terms: company?.default_payment_terms ?? "",
    logo_url: company?.logo_url ?? "",
  }
}

interface Props {
  company: CompanySettings | null
  userId: string
}

export default function CompanySettingsClient({ company, userId: _userId }: Props) {
  const initial = loadFromStorage(company)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>(initial.logo_url ?? company?.logo_url ?? "")
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      business_name: initial.business_name ?? company?.business_name ?? "",
      email: initial.email ?? company?.email ?? "",
      phone: initial.phone ?? company?.phone ?? "",
      website: initial.website ?? company?.website ?? "",
      address: initial.address ?? company?.address ?? "",
      default_terms: initial.default_terms ?? company?.default_terms ?? "",
      default_payment_terms: initial.default_payment_terms ?? company?.default_payment_terms ?? "",
    },
  })

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function onSubmit(data: CompanyFormData) {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...data, logo_url: logoPreview }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <PageHeader title="Company Settings" description="Your business profile used in quotations" />

      {saved && (
        <div className="mb-4 max-w-2xl flex items-center gap-2 px-4 py-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Business Logo</h3>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="w-20 h-20 rounded-lg border dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700">
                  <Image src={logoPreview} alt="Logo" width={80} height={80} className="object-contain w-full h-full" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                  <Upload className="w-6 h-6 text-gray-300 dark:text-gray-500" />
                </div>
              )}
              <div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-3 py-2 text-sm border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label className="dark:text-gray-300">Business Name</Label>
                <Input {...register("business_name")} placeholder="Whitepaper Production" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
                {errors.business_name && <p className="text-xs text-red-500">{errors.business_name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Email</Label>
                <Input {...register("email")} type="email" placeholder="hello@yourbusiness.com" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Phone / WhatsApp</Label>
                <Input {...register("phone")} placeholder="+62 812 3456 7890" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Website</Label>
                <Input {...register("website")} placeholder="https://yourbusiness.com" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Address</Label>
                <Input {...register("address")} placeholder="Jakarta Selatan, Indonesia" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Default Quotation Content</h3>
            <div className="space-y-1">
              <Label className="dark:text-gray-300">Default Terms & Conditions</Label>
              <Textarea {...register("default_terms")} rows={4} placeholder="e.g. 50% down payment required to confirm booking..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
            </div>
            <div className="space-y-1">
              <Label className="dark:text-gray-300">Default Payment Terms</Label>
              <Textarea {...register("default_payment_terms")} rows={2} placeholder="e.g. Payment via bank transfer within 3 days..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            {saved ? <><Check className="w-4 h-4 mr-1" />Saved!</> : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}
