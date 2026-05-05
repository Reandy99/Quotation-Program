"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { Check } from "lucide-react"
import { GENERAL_KEY, dispatchSettingsUpdated } from "@/lib/settings/storage"
import { toast } from "@/hooks/use-toast"
import { updateGeneralSettings } from "../actions"
import type { GeneralSettings } from "@/types"

const generalSettingsSchema = z.object({
  workspace_name: z.string().min(1, "Workspace name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  date_format: z.string().min(1, "Date format is required"),
  currency_label: z.string().min(1, "Currency label is required"),
  default_view: z.string().min(1, "Default view is required"),
  email_notifications: z.boolean(),
  browser_notifications: z.boolean(),
})

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>

const defaultSettings: GeneralSettingsFormData = {
  workspace_name: "QuoteFlow Creative",
  timezone: "Asia/Jakarta",
  language: "en",
  date_format: "DD/MM/YYYY",
  currency_label: "Indonesian Rupiah (IDR)",
  default_view: "/dashboard",
  email_notifications: true,
  browser_notifications: false,
}

interface Props {
  initialSettings: GeneralSettings
}

export default function GeneralSettingsClient({ initialSettings }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: initialSettings,
  })

  useEffect(() => {
    reset(initialSettings)
    if (typeof window !== "undefined") {
      localStorage.setItem(GENERAL_KEY, JSON.stringify(initialSettings))
      dispatchSettingsUpdated()
    }
  }, [initialSettings, reset])

  async function onSubmit(data: GeneralSettingsFormData) {
    const result = await updateGeneralSettings(data)

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: result.error,
      })
      return
    }

    localStorage.setItem(GENERAL_KEY, JSON.stringify(data))
    dispatchSettingsUpdated()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    toast({
      variant: "success",
      title: "Settings saved",
      description: "General settings updated successfully.",
    })
  }

  return (
    <div>
      <PageHeader title="General Settings" description="Configure workspace preferences and defaults" />

      {saved && (
        <div className="mb-4 max-w-2xl flex items-center gap-2 px-4 py-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-sm">
          <Check className="w-4 h-4" />
          Settings saved successfully
        </div>
      )}

      <Card className="max-w-2xl dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="workspace_name">Workspace Name</Label>
              <Input
                id="workspace_name"
                {...register("workspace_name")}
                className="dark:bg-slate-900 dark:border-slate-700"
              />
              {errors.workspace_name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.workspace_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                {...register("timezone")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (MYT)</option>
                <option value="UTC">UTC</option>
              </select>
              {errors.timezone && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.timezone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="language">Language / Locale</Label>
              <select
                id="language"
                {...register("language")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              >
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
              {errors.language && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.language.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date_format">Date Format</Label>
              <select
                id="date_format"
                {...register("date_format")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
              {errors.date_format && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.date_format.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currency_label">Currency Display</Label>
              <Input
                id="currency_label"
                {...register("currency_label")}
                className="dark:bg-slate-900 dark:border-slate-700"
                placeholder="Indonesian Rupiah (IDR)"
              />
              {errors.currency_label && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.currency_label.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Display label only. Actual currency formatting remains IDR.
              </p>
            </div>

            <div>
              <Label htmlFor="default_view">Default View on Login</Label>
              <select
                id="default_view"
                {...register("default_view")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              >
                <option value="/dashboard">Dashboard</option>
                <option value="/leads">Leads</option>
                <option value="/quotations">Quotations</option>
                <option value="/follow-ups">Follow-ups</option>
                <option value="/calendar">Calendar</option>
              </select>
              {errors.default_view && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.default_view.message}</p>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t dark:border-slate-700">
              <h4 className="font-medium text-gray-900 dark:text-slate-100">Notifications</h4>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="email_notifications"
                  {...register("email_notifications")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-700 rounded"
                />
                <Label htmlFor="email_notifications" className="font-normal cursor-pointer">
                  Email notifications for new leads and follow-ups
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="browser_notifications"
                  {...register("browser_notifications")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-700 rounded"
                />
                <Label htmlFor="browser_notifications" className="font-normal cursor-pointer">
                  Browser push notifications
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
