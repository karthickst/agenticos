import { useEffect, useState } from 'react'
import { requirementsApi } from '@/lib/api/requirements'
import { domainsApi } from '@/lib/api/domains'
import { testCasesApi } from '@/lib/api/test-cases'
import { specificationsApi } from '@/lib/api/specifications'

interface ProjectChanges {
  hasChanges: boolean
  latestSpecDate: Date | null
  latestChangeDate: Date | null
  changedItems: string[]
}

export function useProjectChanges(projectId: string) {
  const [changes, setChanges] = useState<ProjectChanges>({
    hasChanges: false,
    latestSpecDate: null,
    latestChangeDate: null,
    changedItems: [],
  })
  const [checking, setChecking] = useState(false)

  const checkForChanges = async () => {
    setChecking(true)
    try {
      // Get latest specification
      const specsResponse = await specificationsApi.list(projectId)
      const latestSpec = specsResponse.data[0]

      if (!latestSpec) {
        setChanges({
          hasChanges: false,
          latestSpecDate: null,
          latestChangeDate: null,
          changedItems: [],
        })
        setChecking(false)
        return
      }

      const specDate = new Date(latestSpec.createdAt)
      const changedItems: string[] = []
      let latestChangeDate: Date | undefined = undefined

      const updateLatestChangeDate = (newDate: Date) => {
        if (!latestChangeDate || newDate > latestChangeDate) {
          latestChangeDate = newDate
        }
      }

      // Check requirements
      const reqsResponse = await requirementsApi.list(projectId)
      const requirements = reqsResponse.data
      const latestReqChange = requirements.reduce((latest, req) => {
        const updated = new Date(req.requirement.updatedAt)
        return updated > latest ? updated : latest
      }, new Date(0))

      if (latestReqChange > specDate) {
        changedItems.push('Requirements')
        updateLatestChangeDate(latestReqChange)
      }

      // Check domains
      const domainsResponse = await domainsApi.list(projectId)
      const domains = domainsResponse.data
      const latestDomainChange = domains.reduce((latest, domainWithAttrs) => {
        const updated = new Date(domainWithAttrs.domain.updatedAt)
        return updated > latest ? updated : latest
      }, new Date(0))

      if (latestDomainChange > specDate) {
        changedItems.push('Domains')
        updateLatestChangeDate(latestDomainChange)
      }

      // Check test cases across all requirements
      for (const req of requirements) {
        const testCasesResponse = await testCasesApi.list(req.requirement.id)
        const testCases = testCasesResponse.data
        const latestTestChange = testCases.reduce((latest, test) => {
          const updated = new Date(test.updatedAt)
          return updated > latest ? updated : latest
        }, new Date(0))

        if (latestTestChange > specDate) {
          if (!changedItems.includes('Test Cases')) {
            changedItems.push('Test Cases')
          }
          updateLatestChangeDate(latestTestChange)
        }
      }

      setChanges({
        hasChanges: changedItems.length > 0,
        latestSpecDate: specDate,
        latestChangeDate: latestChangeDate || null,
        changedItems,
      })
    } catch (error) {
      console.error('Failed to check for changes:', error)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      checkForChanges()
    }
  }, [projectId])

  return { changes, checking, recheckChanges: checkForChanges }
}
