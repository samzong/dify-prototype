import { useCallback, useEffect, useState } from 'react'
import { MockServiceError } from '../api-types'
import {
  createKnowledgeSpace,
  deleteKnowledgeSpace,
  listKnowledgeSpaces,
} from '../mock-services'
import type { DatasetItem } from '../fixtures/types'
import {
  findFixtureForSpace,
  mergeSpaceWithFixture,
  resolveCatalogItem,
  resolveKnowledgeSpaceId,
} from '../fixtures/knowledge-space-bridge'

export function useKnowledgeSpaceCatalog() {
  const [items, setItems] = useState<DatasetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | undefined>()

  const loadPage = useCallback(async (cursor?: string) => {
    try {
      if (cursor)
        setLoadingMore(true)
      else
        setLoading(true)

      const result = await listKnowledgeSpaces({ cursor, limit: 4 })
      const mapped = result.items.map(space => mergeSpaceWithFixture(space, findFixtureForSpace(space)))

      setItems(current => cursor ? [...current, ...mapped] : mapped)
      setNextCursor(result.nextCursor)
      setError(null)
    }
    catch (cause) {
      setError(cause instanceof MockServiceError ? cause.message : 'Failed to load knowledge spaces')
    }
    finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const refresh = useCallback(() => loadPage(), [loadPage])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  useEffect(() => {
    const handleLocationChange = () => {
      void refresh()
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [refresh])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore)
      return
    await loadPage(nextCursor)
  }, [loadPage, loadingMore, nextCursor])

  const createSpace = useCallback(async (input: {
    name: string
    slug: string
    description?: string
    draft: DatasetItem
  }) => {
    const space = await createKnowledgeSpace({
      name: input.name,
      slug: input.slug,
      description: input.description,
    })
    const item = mergeSpaceWithFixture(space, { ...input.draft, id: space.id })
    setItems(current => [item, ...current.filter(entry => entry.id !== space.id)])
    return item
  }, [])

  const removeSpace = useCallback(async (spaceId: string) => {
    const resolvedId = resolveKnowledgeSpaceId(spaceId)
    await deleteKnowledgeSpace(resolvedId)
    setItems(current => current.filter(item => item.id !== resolvedId))
  }, [])

  const upsertItem = useCallback((item: DatasetItem) => {
    setItems(current => {
      const index = current.findIndex(entry => entry.id === item.id)
      if (index === -1)
        return [item, ...current]
      return current.map(entry => entry.id === item.id ? item : entry)
    })
  }, [])

  const resolveItem = useCallback((routeId: string) => {
    return resolveCatalogItem(routeId, items)
  }, [items])

  return {
    items,
    loading,
    loadingMore,
    error,
    nextCursor,
    refresh,
    loadMore,
    createSpace,
    removeSpace,
    upsertItem,
    resolveItem,
  }
}

export type KnowledgeSpaceCatalog = ReturnType<typeof useKnowledgeSpaceCatalog>
