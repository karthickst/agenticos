'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/projects" className="font-bold text-xl">
          Agentic OS
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
