"use client"
import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Shuffle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { MinimalClean } from "@/components/template-previews/minimal-clean-template"
import { toast } from "sonner"
import { adminTemplatePlaceholder } from "@/lib/user-data"
import { TemplateData } from "@/types/template"
import { TemplateCard } from "@/components/templates/template-card-2"
import PreviewRenderer from "@/components/templates/PreviewRenderer"

const defaultTemplate: TemplateData = {
  id: "",
  slug: "",
  name: "",
  description: "",
  preview_url: "/placeholder.svg",
  thumbnail_url: "/placeholder.svg",
  is_premium: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: "free", // must be "free" or "premium"
  price: 0,
  original_price: 0,
  discount: 0,
  features: [],
  colors: { primary: "", secondary: "", accent: "", background: "", text: "" },
  fonts: { heading: "Inter", body: "Inter" },
  layout: "professional", // must be one of the allowed values
  tags: [],
  is_popular: false,
  is_new: false,
  downloads: 0,
  connectStyle: "grid",
  socialStyle: "default",
}

type TemplatePayload = Omit<TemplateData, "id" | "features" | "colors" | "fonts" | "tags"> & {
  features: string
  colors: string
  fonts: string
  tags: string
}

export default function AddTemplatePage() {
  const [template, setTemplate] = useState<TemplateData>(defaultTemplate)
  const [newFeature, setNewFeature] = useState("")
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const formatPrice = (value: number | string) => {
    if (!value) return "₱0.00"
    const num = Number(value)
    return "₱" + num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const updateTemplate = <K extends keyof TemplateData>(field: K, value: TemplateData[K]) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date().toISOString(),
    }))
  }

  const updateColors = (colorKey: string, value: string) => {
    setTemplate((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value },
      updated_at: new Date().toISOString(),
    }))
  }

  const updateFonts = (fontKey: string, value: string) => {
    setTemplate((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
      updated_at: new Date().toISOString(),
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setTemplate((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setTemplate((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    updateTemplate("name", name)
    if (!template.id) {
      const slug = generateSlug(name)
      updateTemplate("slug", slug)
      updateTemplate("id", slug)
    }
  }

  const saveTemplate = async () => {
    if (!template.name || !template.description) {
      toast.error("Name and description are required!")
      return
    }

    setSaving(true)

    try {
      const slug = template.slug || generateSlug(template.name)
      const now = new Date().toISOString()

      const payload: TemplatePayload = {
        ...template,
        slug,
        created_at: template.created_at || now,
        updated_at: now,
        features: JSON.stringify(template.features),
        colors: JSON.stringify(template.colors),
        fonts: JSON.stringify(template.fonts),
        tags: JSON.stringify(template.tags),
      }

      console.log("[v2] Sending template data to Laravel backend:", payload)

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/templates/store`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("[v2] Backend response:", response.data)

      setTemplate({
        ...defaultTemplate,
        created_at: now,
        updated_at: now,
      })

      toast.success("Template saved successfully!")
      router.push("/admin/templates")
    } catch (error: any) {
      console.error("[v2] Error saving template:", error.response?.data || error)

      if (error.response?.status === 422) {
        const errors = error.response.data.errors
        if (errors) {
          const messages = Object.values(errors).flat().join("\n")
          toast.error(messages)
        } else {
          toast.error("Validation failed. Please check your inputs.")
        }
      } else {
        toast.error("Failed to save template. Please try again.")
      }
    } finally {
      // ✅ This line ensures the button resets after *any* outcome
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Template</h1>
          <p className="text-gray-600 mt-2">Create and customize a new business card template</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" value={template.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., Minimal Clean" />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (auto-generated)</Label>
                  <Input id="slug" value={template.slug} onChange={(e) => updateTemplate("slug", e.target.value)} placeholder="minimal-clean" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => updateTemplate("description", e.target.value)}
                    placeholder="A clean and simple design perfect for professionals..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4"></div>
                {template.category === "premium" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (auto-calculated)</Label>
                      <Input id="price" value={formatPrice(template.price)} disabled className="bg-gray-100 cursor-not-allowed" />
                    </div>

                    <div>
                      <Label htmlFor="original_price">Original Price</Label>
                      <Input
                        id="original_price"
                        type="text"
                        value={template.original_price ? formatPrice(template.original_price) : ""}
                        onChange={(e) => {
                          const unformatted = e.target.value.replace(/[₱,]/g, "")
                          const original = Number(unformatted) || 0
                          updateTemplate("original_price", original)
                          const calculated = original - (original * (template.discount || 0)) / 100
                          updateTemplate("price", calculated)
                        }}
                        placeholder="₱399.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount %</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={template.discount || ""}
                        onChange={(e) => {
                          const discount = Number(e.target.value) || 0
                          updateTemplate("discount", discount)
                          const calculated = (template.original_price || 0) - ((template.original_price || 0) * discount) / 100
                          updateTemplate("price", calculated)
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Design Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Design Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid lg:grid-cols-3 gap-4">
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
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(["primary", "secondary", "accent", "background", "text"] as (keyof typeof template.colors)[]).map((colorKey) => (
                    <div key={colorKey}>
                      <Label htmlFor={colorKey}>{colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id={colorKey}
                          type="color"
                          value={template.colors[colorKey]}
                          onChange={(e) => updateColors(colorKey, e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input value={template.colors[colorKey]} onChange={(e) => updateColors(colorKey, e.target.value)} placeholder="#000000" />
                        <button
                          type="button"
                          onClick={() => updateColors(colorKey, getRandomColor())}
                        >
                          <Shuffle className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button onClick={addFeature}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(index)}>
                      {feature} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeTag(index)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_popular"
                    checked={template.is_popular}
                    onCheckedChange={(checked: boolean) => updateTemplate("is_popular", checked)}
                  />
                  <Label htmlFor="is_popular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="is_new" checked={template.is_new} onCheckedChange={(checked: boolean) => updateTemplate("is_new", checked)} />
                  <Label htmlFor="is_new">Mark as New</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_premium"
                    checked={template.is_premium}
                    onCheckedChange={(checked: boolean) => {
                      updateTemplate("is_premium", checked)
                      updateTemplate("category", checked ? "premium" : "free")
                    }}
                  />
                  <Label htmlFor="is_premium">Premium Template</Label>
                </div>
              </CardContent>
            </Card>

            <Button onClick={saveTemplate} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <p className="text-sm text-gray-600">Live preview with design customizations</p>
              </CardHeader>
              <CardContent>
                <PreviewRenderer template={template} user={adminTemplatePlaceholder} />

                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Name:</strong> {template.name || "Untitled Template"}
                  </div>
                  <div>
                    <strong>Category:</strong> {template.category}
                  </div>
                  <div>
                    <strong>Layout:</strong> {template.layout}
                  </div>
                  <div>
                    <strong>Connect Style:</strong> {template.connectStyle}
                  </div>
                  <div>
                    <strong>Premium:</strong> {template.is_premium ? "Yes" : "No"}
                  </div>
                  {template.category === "premium" && (
                    <div>
                      <strong>Price:</strong> ₱{template.price}
                    </div>
                  )}
                  <div>
                    <strong>Downloads:</strong> {template.downloads}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
