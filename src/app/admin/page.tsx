"use client"
import { StatsCards } from "@/components/admin/stats-cards"
import { ChartsSection } from "@/components/admin/charts-section"
import { TopTemplates } from "@/components/admin/top-templates"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Monitor your platform&apos;s performance and user engagement</p>
          </div>
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <ChartsSection />
            <TopTemplates />
          </div>
        </div>
      </main>
    </div>
  )
}
