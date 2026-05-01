"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companySchema, type CompanyFormData } from "@/lib/validations/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateCompanySettings } from "../actions"
import { dispatchSettingsUpdated } from "@/lib/settings/storage"
import type { CompanySettings } from "@/types"

interface Props {
  company: CompanySettings | null
}

export default function CompanySettingsClient({ company }: Props) {
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      business_name: company?.business_name ?? "",
      email: company?.email ?? "",
      phone: company?.phone ?? "",
      website: company?.website ?? "",
      address: company?.address ?? "",
      default_terms: company?.default_terms ?? "",
      default_payment_terms: company?.default_payment_terms ?? "",
    },
  })

  function onSubmit(data: CompanyFormData) {
    startTransition(async () => {
      try {
        await updateCompanySettings(data)
        
        // Also update localStorage for live updates
        if (typeof window !== "undefined") {
          localStorage.setItem("quoteflow_company_settings", JSON.stringify(data))
          dispatchSettingsUpdated()
        }
        
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        toast({
          variant: "success",
          title: "Settings saved",
          description: "Company settings updated successfully.",
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to save",
          description: error.message,
        })
      }
    })
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
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label className="dark:text-gray-300">Business Name</Label>
                <Input {...register("business_name")} placeholder="Whitepaper Production" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
                {errors.business_name && <p className="text-xs text-red-500">{errors.business_name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Email</Label>
                <Input {...register("email")} type="email" placeholder="hello@yourbusiness.com" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Phone / WhatsApp</Label>
                <Input {...register("phone")} placeholder="+62 812 3456 7890" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Website</Label>
                <Input {...register("website")} placeholder="https://yourbusiness.com" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Address</Label>
                <Input {...register("address")} placeholder="Jakarta Selatan, Indonesia" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Default Quotation Content</h3>
            <div className="space-y-1">
              <Label className="dark:text-gray-300">Default Terms & Conditions</Label>
              <Textarea {...register("default_terms")} rows={4} placeholder="e.g. 50% down payment required to confirm booking..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
            </div>
            <div className="space-y-1">
              <Label className="dark:text-gray-300">Default Payment Terms</Label>
              <Textarea {...register("default_payment_terms")} rows={2} placeholder="e.g. Payment via bank transfer within 3 days..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  )
}
