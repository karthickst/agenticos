'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DomainAttributePicker } from './DomainAttributePicker'

interface GherkinEditorProps {
  projectId: string
  initialTitle?: string
  initialDescription?: string
  initialGherkin?: string
  onSave: (title: string, description: string, gherkin: string) => void
  onCancel: () => void
}

export function GherkinEditor({
  projectId,
  initialTitle = '',
  initialDescription = '',
  initialGherkin = '',
  onSave,
  onCancel,
}: GherkinEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [gherkin, setGherkin] = useState(initialGherkin)
  const [showDomainPicker, setShowDomainPicker] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)

  const handleSave = () => {
    if (!title.trim() || !gherkin.trim()) {
      alert('Please provide both a title and Gherkin scenario')
      return
    }

    // Check if gherkin contains at least one valid keyword
    const hasValidKeyword = /^\s*(Given|When|Then|And|But)\s+/im.test(gherkin)
    if (!hasValidKeyword) {
      alert('Gherkin scenario must contain at least one step starting with: Given, When, Then, And, or But')
      return
    }

    onSave(title, description, gherkin)
  }

  const handleInsertDomainReference = (reference: string) => {
    const beforeCursor = gherkin.substring(0, cursorPosition)
    const afterCursor = gherkin.substring(cursorPosition)
    const newGherkin = beforeCursor + reference + afterCursor
    setGherkin(newGherkin)
    setShowDomainPicker(false)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGherkin(e.target.value)
    setCursorPosition(e.target.selectionStart)
  }

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart)
  }

  const insertTemplate = (template: string) => {
    if (gherkin) {
      setGherkin(gherkin + '\n' + template)
    } else {
      setGherkin(template)
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Gherkin Scenario Editor</CardTitle>
        <CardDescription>
          Define your requirement using Given-When-Then syntax
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Requirement Title</Label>
          <Input
            id="title"
            placeholder="User Login"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Brief description of the requirement"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gherkin">Gherkin Scenario</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => insertTemplate('Given ')}
              >
                + Given
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => insertTemplate('When ')}
              >
                + When
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => insertTemplate('Then ')}
              >
                + Then
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowDomainPicker(true)}
              >
                + Domain Attr
              </Button>
            </div>
          </div>
          <textarea
            id="gherkin"
            className="w-full h-64 p-3 border rounded-md font-mono text-sm"
            placeholder="Given a user exists&#10;When they log in with email ${User.email}&#10;Then they see the dashboard"
            value={gherkin}
            onChange={handleTextareaChange}
            onClick={handleTextareaClick}
          />
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              <strong>Tip:</strong> Start each line with Given, When, Then, And, or But
            </p>
            <p className="text-xs text-gray-500">
              Use ${'{'}Domain.attribute{'}'} to reference domain attributes
            </p>
          </div>
        </div>

        {showDomainPicker && (
          <div className="absolute z-50 mt-2">
            <DomainAttributePicker
              projectId={projectId}
              onSelect={handleInsertDomainReference}
              onClose={() => setShowDomainPicker(false)}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Requirement</Button>
        </div>
      </CardContent>
    </Card>
  )
}
