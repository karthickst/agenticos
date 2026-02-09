'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CLAUDE_MODELS } from '@/lib/types/specification'

interface ModelSelectorProps {
  onGenerate: (model: string) => void
  isGenerating?: boolean
}

export function ModelSelector({ onGenerate, isGenerating }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<string>(CLAUDE_MODELS[0].value)

  const handleGenerate = () => {
    onGenerate(selectedModel)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generate Software Specification</CardTitle>
        <CardDescription>
          Select a Claude model to generate a comprehensive software specification based on
          your requirements, domains, and test cases.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Claude Model</Label>
          <div className="space-y-3">
            {CLAUDE_MODELS.map((model) => (
              <label
                key={model.value}
                className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedModel === model.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={model.value}
                  checked={selectedModel === model.value}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">{model.label}</div>
                  <div className="text-sm text-gray-600">{model.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Specification'}
        </Button>
      </CardContent>
    </Card>
  )
}
