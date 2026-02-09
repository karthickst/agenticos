'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { domainsApi } from '@/lib/api/domains'
import { DomainWithAttributes, DATA_TYPES } from '@/lib/types/domain'

export default function DomainsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [domains, setDomains] = useState<DomainWithAttributes[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDomain, setShowCreateDomain] = useState(false)
  const [showCreateAttribute, setShowCreateAttribute] = useState<string | null>(null)
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)
  const [newDomain, setNewDomain] = useState({ name: '', description: '' })
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    dataType: 'string',
    isRequired: false,
  })

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

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await domainsApi.create(projectId, newDomain)
      setShowCreateDomain(false)
      setNewDomain({ name: '', description: '' })
      loadDomains()
    } catch (error) {
      console.error('Failed to create domain:', error)
    }
  }

  const handleCreateAttribute = async (e: React.FormEvent, domainId: string) => {
    e.preventDefault()
    try {
      await domainsApi.createAttribute(domainId, newAttribute)
      setShowCreateAttribute(null)
      setNewAttribute({ name: '', dataType: 'string', isRequired: false })
      loadDomains()
    } catch (error) {
      console.error('Failed to create attribute:', error)
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return
    try {
      await domainsApi.delete(domainId)
      loadDomains()
    } catch (error) {
      console.error('Failed to delete domain:', error)
    }
  }

  const handleDeleteAttribute = async (attributeId: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return
    try {
      await domainsApi.deleteAttribute(attributeId)
      loadDomains()
    } catch (error) {
      console.error('Failed to delete attribute:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-gray-600 mt-1">Define business domain models with attributes</p>
        </div>
        <Button onClick={() => setShowCreateDomain(true)}>Create Domain</Button>
      </div>

      {showCreateDomain && (
        <Card>
          <form onSubmit={handleCreateDomain}>
            <CardHeader>
              <CardTitle>Create New Domain</CardTitle>
              <CardDescription>Define a business domain entity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Domain Name</Label>
                <Input
                  id="name"
                  placeholder="User, Order, Product..."
                  value={newDomain.name}
                  onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="What does this domain represent?"
                  value={newDomain.description}
                  onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                />
              </div>
            </CardContent>
            <div className="flex gap-2 px-6 pb-6">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateDomain(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {domains.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Domains Yet</CardTitle>
              <CardDescription>Get started by creating your first domain</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Domains represent business entities like User, Order, Product, etc.
              </p>
            </CardContent>
          </Card>
        ) : (
          domains.map((item) => (
            <Card key={item.domain.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{item.domain.name}</CardTitle>
                    <CardDescription>{item.domain.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedDomain(expandedDomain === item.domain.id ? null : item.domain.id)}
                    >
                      {expandedDomain === item.domain.id ? 'Hide' : 'Show'} Attributes
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDomain(item.domain.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedDomain === item.domain.id && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Attributes ({item.attributes.length})</h3>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateAttribute(item.domain.id)}
                    >
                      Add Attribute
                    </Button>
                  </div>

                  {showCreateAttribute === item.domain.id && (
                    <form onSubmit={(e) => handleCreateAttribute(e, item.domain.id)} className="border rounded p-4 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="attr-name">Attribute Name</Label>
                        <Input
                          id="attr-name"
                          placeholder="email, firstName, age..."
                          value={newAttribute.name}
                          onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="attr-type">Data Type</Label>
                        <Select
                          id="attr-type"
                          value={newAttribute.dataType}
                          onChange={(e) => setNewAttribute({ ...newAttribute, dataType: e.target.value })}
                        >
                          {DATA_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="attr-required"
                          checked={newAttribute.isRequired}
                          onChange={(e) => setNewAttribute({ ...newAttribute, isRequired: e.target.checked })}
                        />
                        <Label htmlFor="attr-required">Required</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Add</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateAttribute(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  {item.attributes.length === 0 ? (
                    <p className="text-sm text-gray-500">No attributes defined yet</p>
                  ) : (
                    <div className="space-y-2">
                      {item.attributes.map((attr) => (
                        <div key={attr.id} className="flex items-center justify-between border rounded px-4 py-2">
                          <div className="flex-1">
                            <span className="font-medium">{attr.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({attr.dataType})</span>
                            {attr.isRequired && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2">
                                Required
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttribute(attr.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
