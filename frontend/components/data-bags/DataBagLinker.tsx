'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { dataBagsApi } from '@/lib/api/data-bags'
import { DataBagWithItems, RequirementDataBagLink } from '@/lib/types/data-bag'

interface DataBagLinkerProps {
  projectId: string
  requirementId: string
  onClose: () => void
  onLinked: () => void
}

export function DataBagLinker({
  projectId,
  requirementId,
  onClose,
  onLinked,
}: DataBagLinkerProps) {
  const [dataBags, setDataBags] = useState<DataBagWithItems[]>([])
  const [selectedBagId, setSelectedBagId] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [existingLinks, setExistingLinks] = useState<RequirementDataBagLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDataBags()
    loadExistingLinks()
  }, [projectId, requirementId])

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

  const loadExistingLinks = async () => {
    try {
      const response = await dataBagsApi.listRequirementLinks(requirementId)
      setExistingLinks(response.data)
    } catch (error) {
      console.error('Failed to load links:', error)
    }
  }

  const handleLinkDataBag = async () => {
    if (!selectedBagId) {
      alert('Please select a data bag')
      return
    }

    try {
      await dataBagsApi.linkToRequirement(requirementId, {
        dataBagId: selectedBagId,
        dataBagItemId: selectedItemId || undefined,
      })
      setSelectedBagId('')
      setSelectedItemId('')
      loadExistingLinks()
      onLinked()
    } catch (error: any) {
      alert(`Failed to link data bag: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleUnlink = async (linkId: string) => {
    try {
      await dataBagsApi.deleteLink(linkId)
      loadExistingLinks()
      onLinked()
    } catch (error) {
      console.error('Failed to unlink:', error)
    }
  }

  const selectedBag = dataBags.find((bag) => bag.dataBag.id === selectedBagId)

  if (loading) {
    return (
      <Card className="w-96">
        <CardContent className="p-6">
          <p>Loading data bags...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Link Test Data</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingLinks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Linked Data Bags:</h3>
            <div className="space-y-2">
              {existingLinks.map((link) => {
                const bag = dataBags.find((b) => b.dataBag.id === link.dataBagId)
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between border rounded px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{bag?.dataBag.name || 'Unknown'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlink(link.id)}
                    >
                      Unlink
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold">Add New Link:</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Data Bag</label>
            <Select
              value={selectedBagId}
              onChange={(e) => {
                setSelectedBagId(e.target.value)
                setSelectedItemId('')
              }}
            >
              <option value="">-- Select Data Bag --</option>
              {dataBags.map((bag) => (
                <option key={bag.dataBag.id} value={bag.dataBag.id}>
                  {bag.dataBag.name} ({bag.items.length} items)
                </option>
              ))}
            </Select>
          </div>

          {selectedBag && selectedBag.items.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Specific Item (Optional)
              </label>
              <Select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                <option value="">-- Use All Items --</option>
                {selectedBag.items.map((item, idx) => {
                  const preview = Object.entries(item.data)
                    .slice(0, 2)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')
                  return (
                    <option key={item.id} value={item.id}>
                      Item #{idx + 1} ({preview}...)
                    </option>
                  )
                })}
              </Select>
            </div>
          )}

          <Button
            onClick={handleLinkDataBag}
            disabled={!selectedBagId}
            className="w-full"
          >
            Link Data Bag
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
