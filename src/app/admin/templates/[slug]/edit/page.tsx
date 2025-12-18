"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MinimalClean } from "@/components/template-previews/minimal-clean-template"
import { toast } from "sonner"
import { TemplateData } from "@/types/template"
import { adminTemplatePlaceholder } from "@/lib/user-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PreviewRenderer from "@/components/templates/PreviewRenderer"

type TemplatePayload = Omit<TemplateData, "features" | "colors" | "fonts" | "tags"> & {
  features: string
  colors: string
  fonts: string
  tags: string
}

export default function EditTemplatePage() {
  const { slug } = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch template data
  useEffect(() => {
    if (!slug) return

    const fetchTemplate = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/templates/${slug}`)

        // Ensure colors/fonts objects exist
        const data = res.data as TemplateData
        setTemplate({
          ...data,
          id: data.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          preview_url: data.preview_url,
          thumbnail_url: data.thumbnail_url,
          is_premium: data.is_premium,
          created_at: data.created_at,
          updated_at: data.updated_at,
          category: data.category,
          price: data.price,
          original_price: data.original_price,
          discount: data.discount,
          features: data.features,
          colors: data.colors,
          fonts: data.fonts,
          layout: data.layout,
          tags: data.tags,
          is_popular: data.is_popular,
          is_new: data.is_new,
          downloads: data.downloads,
          connectStyle: data.connectStyle,
          socialStyle: data.socialStyle,
        })
      } catch (err) {
        console.error("Failed to fetch template:", err)
        toast.error("Failed to load template.")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [slug])

  const saveTemplate = async () => {
    if (!template) return
    setSaving(true)

    try {
      const payload = {
        ...template,
        features: JSON.stringify(template.features),
        colors: JSON.stringify(template.colors),
        fonts: JSON.stringify(template.fonts),
        tags: JSON.stringify(template.tags),
        is_hidden: template.is_hidden ? 1 : 0,
        is_premium: template.is_premium ? 1 : 0,
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/templates/${template.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      toast.success("Template updated successfully!")
      router.push("/admin/templates")
    } catch (err: any) {
      console.error("Failed to update template:", err.response?.data || err)
      toast.error("Error saving template.")
    } finally {
      setSaving(false)
    }
  }

  const updateTemplate = <K extends keyof TemplateData>(field: K, value: TemplateData[K]) => {
    setTemplate((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        [field]: value,
        updated_at: new Date().toISOString(),
      }
    })
  }

  if (loading) return <p>Loading template...</p>
  if (!template) return <p>Template not found</p>

  // Update color helper
  const updateColor = (key: string, value: string) => {
    setTemplate({
      ...template,
      colors: {
        ...template.colors,
        [key]: value,
      },
    })
  }

  const updateFonts = (fontKey: keyof TemplateData["fonts"], value: string) => {
    setTemplate((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        fonts: {
          ...prev.fonts,
          [fontKey]: value,
        },
        updated_at: new Date().toISOString(),
      }
    })
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <Link href="/admin/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
        <p className="text-gray-600 mt-2">Edit and customize a business card template</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Slug</Label>
                <Input value={template.slug} disabled className="bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={template.description} onChange={(e) => setTemplate({ ...template, description: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Design Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Design Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={template.category}
                    onValueChange={(value) => {
                      updateTemplate("category", value)
                      updateTemplate("is_premium", value === "premium")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={template.layout} onValueChange={(value) => updateTemplate("layout", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="connectStyle">Connect Section Style</Label>
                  <Select value={template.connectStyle} onValueChange={(value) => updateTemplate("connectStyle", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["primary", "secondary", "accent", "background", "text"].map((key) => (
                <div key={key}>
                  <Label className="capitalize">{key}</Label>
                  <Input
                    type="color"
                    value={template.colors?.[key as keyof typeof template.colors] || (key === "background" ? "#ffffff" : "#000000")}
                    onChange={(e) => updateColor(key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fonts */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <Select value={template.fonts.heading} onValueChange={(value) => updateFonts("heading", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      <SelectItem value="Merriweather">Merriweather</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <Select value={template.fonts.body} onValueChange={(value) => updateFonts("body", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Premium Toggle */}
              <div className="md:col-span-2">
                <Label>Premium?</Label>
                <select
                  className="border rounded p-2 w-full"
                  value={template.is_premium ? "1" : "0"}
                  onChange={(e) => setTemplate({ ...template, is_premium: e.target.value === "1" })}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              {/* Show pricing fields ONLY if Premium */}
              {template.is_premium && (
                <>
                  <div>
                    <Label>Price (auto-calculated)</Label>
                    <Input
                      type="text"
                      value={
                        template.price
                          ? `₱${Number(template.price).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : ""
                      }
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label>Original Price</Label>
                    <Input
                      type="text"
                      value={
                        template.original_price
                          ? Number(template.original_price).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[₱,]/g, "") // remove commas and peso sign
                        const original = Number(rawValue) || 0
                        const discount = Number(template.discount) || 0
                        const calculated = original - (original * discount) / 100

                        setTemplate({
                          ...template,
                          original_price: original,
                          price: calculated,
                        })
                      }}
                    />
                  </div>

                  <div>
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      value={template.discount || ""}
                      onChange={(e) => {
                        const discount = Number(e.target.value) || 0
                        const original = Number(template.original_price) || 0
                        const calculated = original - (original * discount) / 100

                        setTemplate({
                          ...template,
                          discount,
                          price: calculated,
                        })
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Visibility / Hide Template */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Hide this template?</Label>
                <select
                  className="border rounded p-2 w-full"
                  value={template.is_hidden ? "1" : "0"}
                  onChange={(e) => setTemplate({ ...template, is_hidden: e.target.value === "1" })}
                >
                  <option value="0">No (Visible)</option>
                  <option value="1">Yes (Hidden)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={saveTemplate} disabled={saving} className="mt-6">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        {/* Live Preview */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewRenderer template={template} user={adminTemplatePlaceholder} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
