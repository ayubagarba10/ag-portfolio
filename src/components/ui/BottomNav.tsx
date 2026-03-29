'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, Star, User, BookOpen, Link as LinkIcon } from 'lucide-react'

const navItems = [
  { href: '/',           label: 'Home',       Icon: Home      },
  { href: '/projects',   label: 'Projects',   Icon: Briefcase },
  { href: '/experience', label: 'Experience', Icon: Star      },
  { href: '/about',      label: 'About',      Icon: User      },
  { href: '/stories',    label: 'Stories',    Icon: BookOpen  },
  { href: '/connect',    label: 'Connect',    Icon: LinkIcon  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 h-14 flex md:hidden bg-slate-950/90 backdrop-blur-md border-t border-white/[0.08] pb-safe">
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
          >
            <Icon
              className={`w-5 h-5 ${active ? 'text-white' : 'text-white/35'}`}
              strokeWidth={active ? 2.2 : 1.6}
            />
            <span className={`text-[10px] tracking-wide ${active ? 'text-white' : 'text-white/30'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
