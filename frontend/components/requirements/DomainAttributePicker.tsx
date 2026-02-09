'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { domainsApi } from '@/lib/api/domains'
import { DomainWithAttributes } from '@/lib/types/domain'

interface DomainAttributePickerProps {
  projectId: string
  onSelect: (reference: string) => void
  onClose: () => void
}

export function DomainAttributePicker({
  projectId,
  onSelect,
  onClose,
}: DomainAttributePickerProps) {
  const [domains, setDomains] = useState<DomainWithAttributes[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDomains()
  }, [projectId])

  const loadDomains = async () => {
    try {
      const response = await domainsApi.list(projectId)
      setDomains(response.data)
    } catch (error) {
      console.error('Failed to load domains:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDomains = domains.filter(
    (item) =>
      item.domain.name.toLowerCase().includes(search.toLowerCase()) ||
      item.attributes.some((attr) =>
        attr.name.toLowerCase().includes(search.toLowerCase())
      )
  )

  const handleSelectAttribute = (domainName: string, attributeName: string) => {
    const reference = `\${${domainName}.${attributeName}}`
    onSelect(reference)
  }

  if (loading) {
    return (
      <Card className="w-96">
        <CardContent className="p-6">
          <p>Loading domains...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-96 max-h-96 overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Domain Attribute</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardTitle>
        <Input
          placeholder="Search domains and attributes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {filteredDomains.length === 0 ? (
          <p className="text-sm text-gray-500">No domains found</p>
        ) : (
          <div className="space-y-4">
            {filteredDomains.map((item) => (
              <div key={item.domain.id}>
                <h3 className="font-semibold text-sm mb-2">{item.domain.name}</h3>
                {item.attributes.length === 0 ? (
                  <p className="text-xs text-gray-500 ml-4">No attributes</p>
                ) : (
                  <div className="space-y-1 ml-4">
                    {item.attributes.map((attr) => (
                      <button
                        key={attr.id}
                        className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        onClick={() => handleSelectAttribute(item.domain.name, attr.name)}
                      >
                        <span className="font-medium">{attr.name}</span>
                        <span className="text-gray-500 text-xs ml-2">({attr.dataType})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
