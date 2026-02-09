'use client'

import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="flex">
      <Sidebar projectId={projectId} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
