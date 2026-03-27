'use client'

import { motion } from 'framer-motion'

interface Experience {
  id: string
  role: string
  company: string
  description?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
}

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

      <div className="space-y-8 pl-12">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.id}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Dot */}
            <div className="absolute -left-[2.55rem] top-1.5 w-3 h-3 rounded-full bg-violet-500 ring-4 ring-slate-950" />

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 hover:border-white/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                <div>
                  <h3 className="font-semibold text-white text-base">{exp.role}</h3>
                  <p className="text-violet-400 text-sm">{exp.company}</p>
                </div>
                <span className="text-xs text-white/30 whitespace-nowrap mt-1 sm:mt-0">
                  {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                </span>
              </div>
              {exp.description && (
                <p className="text-white/50 text-sm leading-relaxed">{exp.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
