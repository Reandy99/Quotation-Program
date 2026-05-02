"use client"

import { useState, useTransition, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companySchema, type CompanyFormData } from "@/lib/validations/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { Check, Upload, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateCompanySettings, uploadLogo, uploadSignature } from "../actions"
import { dispatchSettingsUpdated } from "@/lib/settings/storage"
import type { CompanySettings } from "@/types"

interface Props {
  company: CompanySettings | null
}

export default function CompanySettingsClient({ company }: Props) {
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(company?.signature_url ?? null)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      business_name: company?.business_name ?? "",
      logo_url: company?.logo_url ?? "",
      email: company?.email ?? "",
      phone: company?.phone ?? "",
      website: company?.website ?? "",
      address: company?.address ?? "",
      default_terms: company?.default_terms ?? "",
      default_payment_terms: company?.default_payment_terms ?? "",
      signer_name: company?.signer_name ?? "",
      signer_title: company?.signer_title ?? "",
      signature_url: company?.signature_url ?? "",
      google_review_url: company?.google_review_url ?? "",
    },
  })

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please select an image file.",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Logo must be under 2MB.",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("logo", file)
      const publicUrl = await uploadLogo(formData)

      setValue("logo_url", publicUrl)
      setLogoPreview(publicUrl)

      toast({
        variant: "success",
        title: "Logo uploaded",
        description: "Remember to save settings to apply changes.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  function removeLogo() {
    setValue("logo_url", "")
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please select an image file.",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Signature must be under 2MB.",
      })
      return
    }

    setIsUploadingSignature(true)
    try {
      const formData = new FormData()
      formData.append("signature", file)
      const publicUrl = await uploadSignature(formData)

      setValue("signature_url", publicUrl)
      setSignaturePreview(publicUrl)

      toast({
        variant: "success",
        title: "Signature uploaded",
        description: "Remember to save settings to apply changes.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      })
    } finally {
      setIsUploadingSignature(false)
    }
  }

  function removeSignature() {
    setValue("signature_url", "")
    setSignaturePreview(null)
    if (signatureInputRef.current) signatureInputRef.current.value = ""
  }

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
              <div className="col-span-2 space-y-1">
                <Label className="dark:text-gray-300">Company Logo</Label>
                <div className="flex items-start gap-3">
                  {logoPreview && (
                    <div className="relative w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                      <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={isUploading || isPending}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading || isPending}
                        className="cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Logo"}
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                {errors.logo_url && <p className="text-xs text-red-500">{errors.logo_url.message}</p>}
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
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Invoice Branding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Signer Name</Label>
                <Input {...register("signer_name")} placeholder="John Doe" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
                {errors.signer_name && <p className="text-xs text-red-500">{errors.signer_name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Signer Title / Position</Label>
                <Input {...register("signer_title")} placeholder="Director" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500" disabled={isPending} />
                {errors.signer_title && <p className="text-xs text-red-500">{errors.signer_title.message}</p>}
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="dark:text-gray-300">Signature Image <span className="text-gray-400 font-normal">(optional)</span></Label>
                <div className="flex items-start gap-3">
                  {signaturePreview && (
                    <div className="relative w-32 h-20 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                      <img src={signaturePreview} alt="Signature" className="max-w-full max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={removeSignature}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      disabled={isUploadingSignature || isPending}
                      className="hidden"
                      id="signature-upload"
                    />
                    <label htmlFor="signature-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingSignature || isPending}
                        className="cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        onClick={() => signatureInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploadingSignature ? "Uploading..." : "Upload Signature"}
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                {errors.signature_url && <p className="text-xs text-red-500">{errors.signature_url.message}</p>}
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
