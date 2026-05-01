import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { Building2, Package, Settings as SettingsIcon, Sliders } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your business settings and preferences" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/settings/general">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">General Settings</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Workspace preferences, timezone, language, and notification settings
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/company">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Company Profile</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Business name, contact info, logo, and default quotation terms
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/packages">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Packages & Pricing</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Manage service packages and standard pricing for quick quotations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Advanced Settings</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Tax configuration, numbering format, team members (Coming soon)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
