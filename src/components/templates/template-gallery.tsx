"use client"

import React, { useEffect, useState } from "react"
import { TemplateCard } from "@/components/templates/template-card"
import { TemplateFilters } from "@/components/templates/template-filters"
import type { Template } from "@/types/template"
import PreviewRenderer from "./PreviewRenderer"

// ----- Types -----
interface SocialLink {
  id: string
  platform: string
  username: string
  url: string
  isVisible?: boolean
}

interface UserData {
  id: number
  name: string
  firstname?: string
  lastname?: string
  display_name?: string
  username: string
  email: string
  is_admin: boolean
  avatar_url: string
  profile?: {
    bio?: string
    phone?: string
    website?: string
    location?: string
    template_id?: number
    background_type?: string
    background_value?: string
    font_style?: string
    font_size?: string
    button_style?: string
    accent_color?: string
    nfc_redirect_url?: string
    is_published?: boolean
    socialLinks?: SocialLink[]
  }
}

interface TemplateGalleryProps {
  templates: Template[]
}

// ----- API -----
const API_URL = process.env.NEXT_PUBLIC_API_URL as string

// ----- Component -----
export function TemplateGallery({ templates }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<UserData | null>(null)

  // Filter templates
  const freeTemplates = templates.filter((t) => t.category === "free" && t.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const premiumTemplates = templates.filter((t) => t.category === "premium" && t.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`${API_URL}/user-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!res.ok) throw new Error("Failed to fetch user")
        const data = await res.json()

        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
          is_admin: data.is_admin,
          avatar_url: data.avatar_url,

          profile: {
            bio: data.profile?.bio ?? "",
            phone: data.profile?.phone ?? "",
            website: data.profile?.website ?? "",
            location: data.profile?.location ?? "",
            socialLinks: data.profile?.socialLinks ?? [],
          },
        })
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }

    fetchUser()
  }, [])

  return (
    <section className="relative py-12 px-4 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-700 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-pink-600 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-blue-700 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 right-1/3 w-1 h-1 bg-gray-800 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto relative z-10">
        <TemplateFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Free Templates */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold mb-2 leading-tight bg-gradient-to-r from-purple-700 via-purple-700 to-pink-700 bg-clip-text text-transparent drop-shadow-lg animate-puls">
              Free Templates
            </h2>
            <span className="text-sm text-gray-500">{freeTemplates.length} templates</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {freeTemplates.map((template) =>
                <TemplateCard key={template.id} template={template} user={user}/>
             
            )}
          </div>
        </div>

        {/* Premium Templates */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold mb-2 leading-tight bg-gradient-to-r from-purple-700 via-purple-700 to-pink-700 bg-clip-text text-transparent drop-shadow-lg animate-puls">
              Premium Templates
            </h2>
            <span className="text-sm text-gray-500">{premiumTemplates.length} templates</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {premiumTemplates.map((template) =>
              <TemplateCard key={template.id} template={template} user={user}/>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
