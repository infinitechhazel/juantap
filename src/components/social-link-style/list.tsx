import React from "react"
import { Facebook, Github, Globe, Instagram, Linkedin, Twitter, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialLink {
  id: string | number
  platform: string
  url: string
  username?: string
  isVisible?: boolean
}

interface ListSocialLinksProps {
  user: {
    profile?: {
      socialLinks?: SocialLink[]
    }
  }
  template: {
    fonts: { heading?: string; body?: string }
    colors: { text: string; secondary: string; accent: string }
  }
}

export const ListSocialLinks: React.FC<ListSocialLinksProps> = ({ user, template }) => {
  const links = user?.profile?.socialLinks?.filter((link) => link.isVisible)
  const socialIconMap: Record<string, React.ReactNode> = {
    facebook: <Facebook size={16} />,
    instagram: <Instagram size={16} />,
    twitter: <Twitter size={16} />,
    linkedin: <Linkedin size={16} />,
    github: <Github size={16} />,
    youtube: <Youtube size={16} />,
    tiktok: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  }
  if (!links || links.length === 0) return null

  return (
    <div className="px-6 pb-6">
      <h2
        className="text-sm font-semibold uppercase mb-3 tracking-wide text-foreground"
        style={{
          color: template?.colors?.text,
          fontFamily: template?.fonts?.heading,
        }}
      >
        Connect with me
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {links.map((link) => {
          const platformKey = link.platform?.toLowerCase()
          const icon = socialIconMap[platformKey] || <Globe size={14} />

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={cn("flex items-center gap-2 rounded-lg p-2 py-3 text-sm hover:opacity-80 transition")}
              style={{
                backgroundColor: `${template?.colors?.accent}15`,
                color: template?.colors?.text,
                fontFamily: template?.fonts?.body,
              }}
            >
              <span style={{ color: template?.colors?.secondary }}>{icon}</span>
              <span>{link.username}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
