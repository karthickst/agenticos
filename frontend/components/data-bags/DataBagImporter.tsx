'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DataBagImporterProps {
  onImport: (data: Record<string, any>[], schema: Record<string, string>) => void
  onCancel: () => void
}

export function DataBagImporter({ onImport, onCancel }: DataBagImporterProps) {
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([])
  const [schema, setSchema] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState<string>('')

  const detectType = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'string'
    if (!isNaN(Number(value))) return 'number'
    if (value === 'true' || value === 'false') return 'boolean'
    if (!isNaN(Date.parse(value))) return 'date'
    return 'string'
  }

  const detectSchema = (data: Record<string, any>[]): Record<string, string> => {
    if (data.length === 0) return {}

    const firstRow = data[0]
    const detectedSchema: Record<string, string> = {}

    Object.keys(firstRow).forEach((key) => {
      detectedSchema[key] = detectType(firstRow[key])
    })

    return detectedSchema
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, any>[]
          setPreviewData(data)
          setSchema(detectSchema(data))
        },
        error: (error) => {
          alert(`Error parsing CSV: ${error.message}`)
        },
      })
    } else if (fileExtension === 'json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string)
          const data = Array.isArray(jsonData) ? jsonData : [jsonData]
          setPreviewData(data)
          setSchema(detectSchema(data))
        } catch (error) {
          alert('Error parsing JSON file')
        }
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a CSV or JSON file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    multiple: false,
  })

  const handleImport = () => {
    if (previewData.length === 0) {
      alert('No data to import')
      return
    }
    onImport(previewData, schema)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>Upload CSV or JSON file to import test data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewData.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <p>Drag and drop a CSV or JSON file, or click to browse</p>
                )}
              </div>
              <p className="text-xs text-gray-500">CSV or JSON files only</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{fileName}</h3>
                <p className="text-sm text-gray-500">{previewData.length} rows detected</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewData([])
                  setSchema({})
                  setFileName('')
                }}
              >
                Clear
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2 text-sm">Detected Schema:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(schema).map(([field, type]) => (
                  <div key={field} className="flex justify-between">
                    <span className="font-medium">{field}:</span>
                    <span className="text-gray-600">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 10 && (
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
                  Showing 10 of {previewData.length} rows
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {previewData.length > 0 && (
            <Button onClick={handleImport}>
              Import {previewData.length} Rows
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
