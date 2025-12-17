"use client"
import React, { useState } from "react"
import {
  Mail,
  Globe,
  Copy,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  QrCode,
  Share2,
  Download,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import type { User, TemplateData } from "@/types/template"
import { toast } from "sonner"
import QRCode from "qrcode"
import { cn } from "@/lib/utils"
import { fontClassMap } from "@/const/fontMap"
import { GridSocialLinks } from "@/components/social-link-style/grid"
import { ListSocialLinks } from "@/components/social-link-style/list"

interface ProfessionalLayoutProps {
  template: TemplateData
  user?: User | null
  slug?: string
}

export const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({ template, user, slug }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/${user?.username || slug}` : ""

  const downloadQR = async () => {
    const dataUrl = await QRCode.toDataURL(profileUrl, { width: 300 })
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${user?.username || "profile"}-qr.png`
    link.click()
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied!")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: template?.name ?? "My Profile",
          text: template?.description ?? "",
          url: profileUrl,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      copyUrl()
      toast.success("Link copied to clipboard!")
    }
  }

  const handleSaveContact = () => {
    if (!user) return

    let socials: any[] = []

    if (Array.isArray(user?.social_links)) {
      socials = user.social_links
    } else if (typeof user?.social_links === "string") {
      try {
        socials = JSON.parse(user.social_links)
      } catch (err) {
        socials = []
      }
    } else if (Array.isArray(user?.profile?.socialLinks)) {
      socials = user.profile.socialLinks
    }

    const socialFields = socials.map((s: any) => `X-SOCIALPROFILE;TYPE=${(s.platform || "social").toLowerCase()}:${s.url}`).join("\n")

    const vcardData = `
BEGIN:VCARD
VERSION:3.0
FN:${user.display_name || user.name || user.username || ""}
TEL;TYPE=CELL:${user.profile?.phone || ""}
EMAIL;TYPE=INTERNET:${user.email || ""}
URL:${user.profile?.website || ""}
ADR;TYPE=HOME:;;${user.profile?.location || ""};;;
NOTE:${user.profile?.bio || ""}
${socialFields}
END:VCARD
    `.trim()

    const blob = new Blob([vcardData], { type: "text/vcard" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${user.display_name || user.username || "contact"}.vcf`
    link.click()
    URL.revokeObjectURL(link.href)

    toast.success("Contact saved!")
  }

  const avatarUrl = user?.avatar_url || null
  return (
    <div className="flex justify-center px-4 py-6 sm:px-6">
      <div
        key={`${template.fonts.heading}-${template.fonts.body}`}
        className="w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden flex flex-col mx-auto animate-in fade-in duration-500"
        style={{
          fontFamily: template?.fonts?.body,
          background: template.colors.background,
        }}
      >
        <div className="relative flex flex-col items-center pt-8 px-4 sm:px-6">
          <div className="w-48 h-64 sm:w-56 sm:h-72 rounded-3xl overflow-hidden bg-muted shadow-xl mb-6">
            {user?.avatar_url && !avatarError ? (
              <img src={avatarUrl || ""} alt="User avatar" className="w-full h-full object-cover object-center" onError={() => setAvatarError(true)} />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-muted">
                <UserIcon size={80} className="text-muted-foreground" />
              </div>
            )}
          </div>

          <div
            className="w-full px-6 py-3"
            style={{
              fontFamily: template?.fonts?.heading,
              background: template.colors.primary,
            }}
          >
            <h1
              className={cn(fontClassMap[template.fonts.heading], "text-lg sm:text-xl font-bold text-center uppercase tracking-wide")}
              style={{
                color: template.colors.accent,
              }}
            >
              {user?.display_name || user?.name || user?.username || "Anonymous"}
            </h1>
          </div>

          {user?.profile?.bio && (
            <p
              className={cn(fontClassMap[template.fonts.body], "text-sm text-center mt-4 px-2 leading-relaxed")}
              style={{
                color: template.colors.text,
              }}
            >
              {user.profile.bio}
            </p>
          )}
        </div>

        <div className="p-6 space-y-2">
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3 text-foreground"
            style={{
              fontFamily: template?.fonts?.heading,
              color: template.colors.text,
            }}
          >
            Contact
          </h2>

          {user?.email && (
            <div
              className={cn(
                fontClassMap[template.fonts.body],
                "flex items-center gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-muted border border-border",
              )}
            >
              <Mail
                size={16}
                className="text-muted-foreground flex-shrink-0"
                style={{
                  color: template.colors.secondary,
                }}
              />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {user.email.split(",").map((email, index) => {
                  const trimmed = email.trim()
                  return (
                    <div key={index} className="flex justify-between items-center gap-2">
                      <a
                        href={`mailto:${trimmed}`}
                        className={cn(fontClassMap[template.fonts.body], "truncate hover:opacity-70 transition-opacity")}
                        style={{
                          color: template.colors.text,
                        }}
                      >
                        {trimmed}
                      </a>
                      <button
                        className="hover:opacity-70 p-1 flex-shrink-0 transition-opacity text-muted-foreground"
                        onClick={() => handleCopy(trimmed)}
                      >
                        <Copy
                          size={16}
                          style={{
                            color: template.colors.secondary,
                          }}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {user?.profile?.phone && (
            <div
              className={cn(
                fontClassMap[template.fonts.body],
                "flex items-center gap-2 rounded-lg p-3 text-sm transition-colors hover:bg-muted border border-border",
              )}
              style={{
                fontFamily: template?.fonts?.body,
              }}
            >
              <Phone
                size={16}
                className="flex-shrink-0 text-muted-foreground"
                style={{
                  color: template.colors.secondary,
                }}
              />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {user.profile.phone.split(",").map((phone, index) => {
                  const trimmedPhone = phone.trim()
                  return (
                    <div key={index} className={cn(fontClassMap[template.fonts.body], "flex justify-between items-center gap-2 text-foreground")}>
                      <a
                        href={`tel:${trimmedPhone}`}
                        className="hover:opacity-70 truncate transition-opacity"
                        style={{
                          fontFamily: template?.fonts?.body,
                          color: template.colors.text,
                        }}
                      >
                        {trimmedPhone}
                      </a>
                      <button
                        className="hover:opacity-70 p-1 flex-shrink-0 transition-opacity text-muted-foreground"
                        onClick={() => handleCopy(trimmedPhone)}
                      >
                        <Copy
                          size={16}
                          style={{
                            color: template.colors.secondary,
                          }}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {user?.profile?.website && (
            <div
              className="flex items-center gap-2 rounded-lg p-3 text-sm transition-colors hover:bg-muted border border-border"
              style={{
                fontFamily: template?.fonts?.body,
              }}
            >
              <Globe
                size={16}
                className="flex-shrink-0 text-muted-foreground"
                style={{
                  color: template.colors.secondary,
                }}
              />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {user.profile.website.split(",").map((site, index) => {
                  const trimmedSite = site.trim()
                  return (
                    <div key={index} className="flex justify-between items-center gap-2 text-foreground">
                      <a
                        href={trimmedSite.startsWith("http") ? trimmedSite : `https://${trimmedSite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(fontClassMap[template.fonts.body], "hover:opacity-70 truncate transition-opacity")}
                        style={{
                          fontFamily: template?.fonts?.body,
                          color: template.colors.text,
                        }}
                      >
                        {trimmedSite.replace(/^https?:\/\//, "")}
                      </a>
                      <button
                        className="hover:opacity-70 p-1 flex-shrink-0 transition-opacity text-muted-foreground"
                        onClick={() => handleCopy(trimmedSite)}
                      >
                        <Copy
                          size={16}
                          style={{
                            color: template.colors.secondary,
                          }}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {user?.profile?.location && (
            <div
              className="flex justify-between items-center rounded-lg p-3 text-sm transition-colors hover:bg-muted border border-border"
              style={{
                fontFamily: template?.fonts?.body,
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 text-foreground">
                <MapPin
                  size={16}
                  className="flex-shrink-0 text-muted-foreground"
                  style={{
                    color: template.colors.secondary,
                  }}
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.profile.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(fontClassMap[template.fonts.body], "truncate hover:opacity-70 transition-opacity")}
                  style={{
                    fontFamily: template?.fonts?.body,
                    color: template.colors.text,
                  }}
                >
                  {user.profile.location}
                </a>
              </div>
              <button
                className="hover:opacity-70 p-1 ml-2 flex-shrink-0 transition-opacity text-muted-foreground"
                onClick={() => handleCopy(user?.profile?.location || "")}
              >
                <Copy
                  size={16}
                  style={{
                    color: template.colors.secondary,
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Social Links */}
        {template.connectStyle === "grid" && <GridSocialLinks user={user} template={template} />}
        {template.connectStyle === "list" && <ListSocialLinks user={user} template={template} />}

        <div
          className={cn(fontClassMap[template.fonts.body], "flex justify-around border-t border-border p-4 bg-card")}
          style={{
            background: template.colors.background,
          }}
        >
          <button onClick={() => setIsQRModalOpen(true)} className="flex flex-col items-center text-sm hover:scale-110 transition-transform">
            <QrCode
              className="w-5 h-5 mb-1"
              style={{
                color: template.colors.secondary,
              }}
            />
            <span
              className={cn(fontClassMap[template.fonts.body], "whitespace-nowrap")}
              style={{
                color: template.colors.text,
              }}
            >
              QR Code
            </span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center text-sm hover:scale-110 transition-transform">
            <Share2
              className="w-5 h-5 mb-1"
              style={{
                color: template.colors.secondary,
              }}
            />
            <span
              className={cn(fontClassMap[template.fonts.body], "whitespace-nowrap")}
              style={{
                color: template.colors.text,
              }}
            >
              Share
            </span>
          </button>
          <button onClick={handleSaveContact} className="flex flex-col items-center text-sm hover:scale-110 transition-transform">
            <Download
              className="w-5 h-5 mb-1"
              style={{
                color: template.colors.secondary,
              }}
            />
            <span
              className={cn(fontClassMap[template.fonts.body], "whitespace-nowrap")}
              style={{
                color: template.colors.text,
              }}
            >
              Save
            </span>
          </button>
        </div>
      </div>

      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="w-[95%] max-w-[350px] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">QR Code for {user?.name || "Anonymous"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-2">
            <div className="w-full flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG id="qr-code-svg" value={profileUrl} size={180} className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]" />
            </div>
            <div className="w-full p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Profile URL:</p>
              <div className="flex items-center justify-between gap-2 w-full">
                <code className="text-[10px] sm:text-xs text-foreground truncate flex-1 min-w-0 break-all">{profileUrl}</code>
                <Button variant="ghost" size="sm" className="flex-shrink-0 text-[10px] sm:text-xs px-2 py-1" onClick={copyUrl}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={downloadQR} className="flex-1 text-xs sm:text-sm py-2">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Download
              </Button>
              <Button onClick={() => setIsQRModalOpen(false)} className="flex-1 text-xs sm:text-sm py-2">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
