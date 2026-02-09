'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { projectsApi } from '@/lib/api/projects'
import { Project } from '@/lib/types/project'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const response = await projectsApi.get(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600 mt-1">{project.description || 'No description'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/projects/${projectId}/requirements`)}
        >
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>Visual Gherkin requirements editor</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Build requirements using Gherkin syntax and visual flows
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/projects/${projectId}/domains`)}
        >
          <CardHeader>
            <CardTitle>Domains</CardTitle>
            <CardDescription>Define business domain models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Create domains and attributes for your application
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/projects/${projectId}/data-bags`)}
        >
          <CardHeader>
            <CardTitle>Data Bags</CardTitle>
            <CardDescription>Import and manage test data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Upload CSV/JSON data for testing requirements
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/projects/${projectId}/test-cases`)}
        >
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>Define test scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Create test cases linked to requirements
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/projects/${projectId}/specifications`)}
        >
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>Claude-generated specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Generate software specs with Claude AI
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
