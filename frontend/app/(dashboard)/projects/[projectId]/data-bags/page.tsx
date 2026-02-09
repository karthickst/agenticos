'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataBagImporter } from '@/components/data-bags/DataBagImporter'
import { dataBagsApi } from '@/lib/api/data-bags'
import { DataBagWithItems } from '@/lib/types/data-bag'

export default function DataBagsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [dataBags, setDataBags] = useState<DataBagWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImporter, setShowImporter] = useState<string | null>(null)
  const [expandedBag, setExpandedBag] = useState<string | null>(null)
  const [newBagName, setNewBagName] = useState('')
  const [newBagDescription, setNewBagDescription] = useState('')

  useEffect(() => {
    loadDataBags()
  }, [projectId])

  const loadDataBags = async () => {
    try {
      const response = await dataBagsApi.list(projectId)
      setDataBags(response.data)
    } catch (error) {
      console.error('Failed to load data bags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDataBag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dataBagsApi.create(projectId, {
        name: newBagName,
        description: newBagDescription || undefined,
      })
      setShowCreateModal(false)
      setNewBagName('')
      setNewBagDescription('')
      loadDataBags()
    } catch (error) {
      console.error('Failed to create data bag:', error)
    }
  }

  const handleImportData = async (
    dataBagId: string,
    data: Record<string, any>[],
    schema: Record<string, string>
  ) => {
    try {
      await dataBagsApi.importData(dataBagId, { items: data })
      setShowImporter(null)
      loadDataBags()
    } catch (error) {
      console.error('Failed to import data:', error)
    }
  }

  const handleDeleteDataBag = async (dataBagId: string) => {
    if (!confirm('Are you sure you want to delete this data bag?')) return

    try {
      await dataBagsApi.delete(dataBagId)
      loadDataBags()
    } catch (error) {
      console.error('Failed to delete data bag:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await dataBagsApi.deleteItem(itemId)
      loadDataBags()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (showImporter) {
    return (
      <div className="flex items-center justify-center p-8">
        <DataBagImporter
          onImport={(data, schema) => handleImportData(showImporter, data, schema)}
          onCancel={() => setShowImporter(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Bags</h1>
          <p className="text-gray-600 mt-1">Import and manage test data for requirements</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create Data Bag</Button>
      </div>

      {showCreateModal && (
        <Card>
          <form onSubmit={handleCreateDataBag}>
            <CardHeader>
              <CardTitle>Create New Data Bag</CardTitle>
              <CardDescription>Create a container for your test data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Data Bag Name</Label>
                <Input
                  id="name"
                  placeholder="User Test Data"
                  value={newBagName}
                  onChange={(e) => setNewBagName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Test users for login scenarios"
                  value={newBagDescription}
                  onChange={(e) => setNewBagDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <div className="flex gap-2 px-6 pb-6">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {dataBags.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Data Bags Yet</CardTitle>
              <CardDescription>Get started by creating your first data bag</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Data bags store test data that can be linked to requirements.
              </p>
            </CardContent>
          </Card>
        ) : (
          dataBags.map((bagWithItems) => (
            <Card key={bagWithItems.dataBag.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{bagWithItems.dataBag.name}</CardTitle>
                    <CardDescription>
                      {bagWithItems.dataBag.description || 'No description'} • {bagWithItems.items.length} items
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImporter(bagWithItems.dataBag.id)}
                    >
                      Import Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedBag(
                          expandedBag === bagWithItems.dataBag.id ? null : bagWithItems.dataBag.id
                        )
                      }
                    >
                      {expandedBag === bagWithItems.dataBag.id ? 'Hide' : 'Show'} Items
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDataBag(bagWithItems.dataBag.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedBag === bagWithItems.dataBag.id && (
                <CardContent>
                  {bagWithItems.items.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No items yet. Click "Import Data" to add CSV or JSON data.
                    </p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium">ID</th>
                              {Object.keys(bagWithItems.items[0]?.data || {}).map((key) => (
                                <th key={key} className="px-4 py-2 text-left font-medium">
                                  {key}
                                </th>
                              ))}
                              <th className="px-4 py-2 text-left font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bagWithItems.items.map((item, idx) => (
                              <tr key={item.id} className="border-t">
                                <td className="px-4 py-2 text-gray-500">#{idx + 1}</td>
                                {Object.values(item.data).map((value: any, cellIdx) => (
                                  <td key={cellIdx} className="px-4 py-2">
                                    {String(value)}
                                  </td>
                                ))}
                                <td className="px-4 py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
