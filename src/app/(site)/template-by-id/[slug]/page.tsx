"use client"

import React, { useEffect, useState, use } from "react" // use() for unwrapping Promise
import { useRouter } from "next/navigation"
import { TemplatePreviewHeader } from "@/components/templates/template-preview-header"
import { TemplatePreviewContent } from "@/components/templates/template-preview-content"
import { TemplatePreviewSidebar } from "@/components/templates/template-preview-sidebar"
import { Loading } from "@/components/loading"
import { Template, TemplateData } from "@/types/template"
import PreviewRenderer from "@/components/templates/PreviewRenderer"

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



const API_URL = process.env.NEXT_PUBLIC_API_URL as string

const defaultColors = {
  primary: "#1f2937",
  secondary: "#6b7280",
  accent: "#3b82f6",
  background: "#ffffff",
  text: "#111827",
}

const defaultFonts = {
  heading: "Inter",
  body: "Inter",
}

interface Props {
  params: Promise<{ slug: string }> // params is a Promise
}

export default function TemplatePage({ params }: Props) {
  const { slug } = use(params) // unwrap Promise

  const [template, setTemplate] = useState<Template | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const router = useRouter()

  // 🔑 Check authentication
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // 🔄 Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/templates/${slug}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "application/json",
          },
        })

        if (!res.ok) throw new Error("Template not found")
        const data = await res.json()

        setTemplate({
          ...data,
          colors: {
            primary: data.colors?.primary ?? defaultColors.primary,
            secondary: data.colors?.secondary ?? defaultColors.secondary,
            accent: data.colors?.accent ?? defaultColors.accent,
            background: data.colors?.background ?? defaultColors.background,
            text: data.colors?.text ?? defaultColors.text,
          },
          fonts: {
            heading: data.fonts?.heading ?? defaultFonts.heading,
            body: data.fonts?.body ?? defaultFonts.body,
          },
          sections: data.sections ?? [],
        })
      } catch (err) {
        console.error("Error fetching template:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [slug])

  // 🔄 Fetch logged-in user
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

  // 🌀 Show loading state using custom Loading component
  if (isAuthenticated === null || loading) {
    return <Loading />
  }

  if (!template) {
    return <div className="p-6 text-center text-gray-600">Template not found.</div>
  }

  return (
    <>
      <header className="w-full bg-gray-50 px-6 py-4 shadow-sm">
        <TemplatePreviewHeader template={template} />
      </header>

      {/* Background wrapper with gradient + orbs */}
      <div className="min-h-screen relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">

        {/* Animated orbs */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-purple-700 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-pink-600 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 right-10 w-2 h-2 bg-blue-700 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 right-1/3 w-1 h-1 bg-gray-800 rounded-full animate-ping delay-500"></div>
        </div>

        {/* Soft blurred circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6 p-6 relative z-10">
          <main className="flex-1 mx-auto">
            <PreviewRenderer template={template} user={user} slug={slug} />
            <div className="container mx-auto px-4 py-10">
              <TemplatePreviewContent template={template} />
            </div>
          </main>

          <aside className="w-full lg:w-80">
            <TemplatePreviewSidebar template={template} />
          </aside>
        </div>

      </div>
    </>
  )
}
