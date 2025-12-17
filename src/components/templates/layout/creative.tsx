"use client"

import React, { useState, useEffect } from "react"
import {
  Mail,
  MapPin,
  Globe,
  Copy,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Music,
  QrCode,
  Share2,
  Download,
  Phone,
  User as UserIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import { fontClassMap } from "@/const/fontMap"
import { toast } from "sonner"
import { User } from "@/types/template"
import { GridSocialLinks } from "@/components/social-link-style/grid"
import { ListSocialLinks } from "@/components/social-link-style/list"
interface SocialLink {
  id: string
  platform: string
  username: string
  url: string
  isVisible?: boolean | number
}

interface CreativeLayoutProps {
  template: any
  user?: User | null
  slug?: string
}

export const CreativeLayout: React.FC<CreativeLayoutProps> = ({ template, user, slug }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const profileUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${user?.username || ""}`

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
      alert("Sharing is not supported on this browser.")
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    } else if (Array.isArray(user?.social_links)) {
      socials = user.social_links
    }

    const socialFields = socials.map((s: any) => `X-SOCIALPROFILE;TYPE=${(s.platform || "social").toLowerCase()}:${s.url}`).join("\n")

    const vcardData = `
BEGIN:VCARD
VERSION:3.0
FN:${user.display_name || user.name || user.username || ""}
TEL;TYPE=CELL:${user?.profile?.phone || ""}
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

  return (
    <div className="flex justify-center px-4 py-6 sm:px-6" style={{ backgroundColor: "transparent" }}>
      <div
        className="w-full max-w-lg shadow-lg rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: template?.colors?.background,
          fontFamily: template?.fonts?.body,
        }}
      >
        {/* Banner */}
        <div
          className="w-full h-40"
          style={{
            background: `linear-gradient(135deg, ${template?.colors?.accent}, ${template?.colors?.primary})`,
          }}
        />

        {/* Avatar & Bio */}
        <div className="relative flex flex-col items-center mt-6 px-6">
          <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white/20 -mt-25">
            {user?.avatar_url && !avatarError ? (
              <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-white/20">
                <UserIcon size={64} className="text-gray-400" />
              </div>
            )}
          </div>
          <h1
            className="mt-4 text-xl font-bold"
            style={{
              fontFamily: template?.fonts?.heading,
              color: template?.colors?.text,
            }}
          >
            {user?.display_name || user?.name || user?.username}
          </h1>

          {user?.profile?.bio && (
            <p
              className="text-sm text-center mt-1"
              style={{
                color: template?.colors?.secondary,
                fontFamily: template?.fonts?.body,
              }}
            >
              {user?.profile.bio}
            </p>
          )}
        </div>

        {/* Contact */}
        {(user?.email || user?.profile?.phone || user?.profile?.website || user?.profile?.location) && (
          <div className="p-6 space-y-4">
            <h2
              className="text-sm font-semibold uppercase"
              style={{
                color: template?.colors?.text,
                fontFamily: template?.fonts?.heading,
              }}
            >
              Contact
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {/* Email */}
              {user.email && (
                <div
                  className="flex justify-between items-center rounded-lg p-3 text-sm md:text-base"
                  style={{
                    backgroundColor: `${template?.colors?.primary}10`,
                    fontFamily: template?.fonts?.body,
                    color: template?.colors?.text,
                  }}
                >
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-center gap-2 flex-1 hover:opacity-80 truncate"
                    style={{ color: template?.colors?.text }}
                  >
                    <Mail size={16} style={{ color: template?.colors?.secondary }} />
                    <span className="truncate">{user.email}</span>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigator.clipboard.writeText(user.email!)
                    }}
                    className="hover:opacity-70 ml-2"
                    style={{ color: template?.colors?.secondary }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}

              {/* Phone */}
              {user?.profile?.phone && (
                <div
                  className="flex justify-between items-center rounded-lg p-3 text-sm md:text-base"
                  style={{
                    backgroundColor: `${template?.colors?.primary}10`,
                    fontFamily: template?.fonts?.body,
                    color: template?.colors?.text,
                  }}
                >
                  <a
                    href={`tel:${user.profile.phone}`}
                    className="flex items-center gap-2 flex-1 hover:opacity-80 truncate"
                    style={{ color: template?.colors?.text }}
                  >
                    <Phone size={16} style={{ color: template?.colors?.secondary }} />
                    <span className="truncate">{user.profile.phone}</span>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigator.clipboard.writeText(user?.profile?.phone!)
                    }}
                    className="hover:opacity-70 ml-2"
                    style={{ color: template?.colors?.secondary }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}

              {/* Website */}
              {user?.profile?.website && (
                <div
                  className="flex justify-between items-center rounded-lg p-3 text-sm md:text-base"
                  style={{
                    backgroundColor: `${template?.colors?.primary}10`,
                    fontFamily: template?.fonts?.body,
                    color: template?.colors?.text,
                  }}
                >
                  <a
                    href={user.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 flex-1 hover:opacity-80 truncate"
                    style={{ color: template?.colors?.text }}
                  >
                    <Globe size={16} style={{ color: template?.colors?.secondary }} />
                    <span className="truncate">{user.profile.website}</span>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigator.clipboard.writeText(user?.profile?.website!)
                    }}
                    className="hover:opacity-70 ml-2"
                    style={{ color: template?.colors?.secondary }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}

              {/* Location */}
              {user?.profile?.location && (
                <div
                  className="flex justify-between items-center rounded-lg p-3 text-sm md:text-base"
                  style={{
                    backgroundColor: `${template?.colors?.primary}10`,
                    fontFamily: template?.fonts?.body,
                    color: template?.colors?.text,
                  }}
                >
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.profile.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 flex-1 hover:opacity-80 truncate"
                    style={{ color: template?.colors?.text }}
                  >
                    <MapPin size={16} style={{ color: template?.colors?.secondary }} className="flex-shrink-0 self-start mt-0.5" />

                    <span className="truncate">{user.profile.location}</span>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigator.clipboard.writeText(user?.profile?.location!)
                    }}
                    className="hover:opacity-70 ml-2"
                    style={{ color: template?.colors?.secondary }}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Links */}
        {template.connectStyle === "grid" && <GridSocialLinks user={user} template={template} />}
        {template.connectStyle === "list" && <ListSocialLinks user={user} template={template} />}

        {/* Bottom Actions */}
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

      {/* QR Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code for {user?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="w-full flex justify-center">
              <QRCodeSVG value={profileUrl} size={200} className="w-full max-w-[220px] h-auto" />
            </div>
            <div className="w-full p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
              <p className="text-gray-600 mb-2">Profile URL:</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <code className="text-gray-800 truncate flex-1">{profileUrl}</code>
                <Button variant="ghost" size="sm" onClick={copyUrl} className="self-end sm:self-auto">
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setIsQRModalOpen(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
