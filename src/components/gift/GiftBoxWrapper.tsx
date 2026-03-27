'use client'

import { useState, useEffect } from 'react'
import GiftBoxIcon from './GiftBoxIcon'
import GiftBoxModal from './GiftBoxModal'
import { createClient } from '@/lib/supabase/client'

export default function GiftBoxWrapper() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<{ profile_image_url: string; name: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('owner_profiles')
      .select('name, profile_image_url')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data)
      })
  }, [])

  return (
    <>
      <GiftBoxIcon onClick={() => setOpen(true)} />
      <GiftBoxModal
        open={open}
        onClose={() => setOpen(false)}
        profileImageUrl={profile?.profile_image_url || ''}
        ownerName={profile?.name || ''}
      />
    </>
  )
}
