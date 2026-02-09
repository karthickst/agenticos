'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { X, Keyboard } from 'lucide-react'
import { formatShortcut, KeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut'

interface ShortcutItem {
  shortcut: KeyboardShortcut
  description: string
  category: string
}

const shortcuts: ShortcutItem[] = [
  {
    shortcut: { key: 'n', ctrlKey: true, metaKey: true },
    description: 'Create new requirement',
    category: 'Requirements',
  },
  {
    shortcut: { key: 'g', ctrlKey: true, metaKey: true },
    description: 'Generate specification',
    category: 'Specifications',
  },
  {
    shortcut: { key: 's', ctrlKey: true, metaKey: true },
    description: 'Save current form',
    category: 'General',
  },
  {
    shortcut: { key: 'Escape' },
    description: 'Close dialog/cancel',
    category: 'General',
  },
  {
    shortcut: { key: '?', shiftKey: true },
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
]

interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  if (!isOpen) return null

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription>
                Speed up your workflow with these keyboard shortcuts
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="font-semibold text-sm text-gray-700 mb-3">{category}</h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter((s) => s.category === category)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm text-gray-700">{item.description}</span>
                        <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                          {formatShortcut(item.shortcut)}
                        </kbd>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function useShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }
}
