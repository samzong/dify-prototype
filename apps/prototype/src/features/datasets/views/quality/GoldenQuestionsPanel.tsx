import { Button } from '@langgenius/dify-ui/button'
import { RiAddLine } from '@remixicon/react'
import type { GoldenQuestion } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { EmptyPanel, Panel } from '../../components/panel'

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function expectedEvidenceLabel(question: GoldenQuestion) {
  const count = question.expectedEvidenceIds?.length ?? 0
  if (count === 0)
    return '—'
  if (count === 1)
    return question.expectedEvidenceIds![0]!
  return `${count} linked`
}

function annotationLabel(question: GoldenQuestion) {
  const annotation = question.metadata?.annotation
  if (typeof annotation !== 'string' || !annotation.trim())
    return '—'
  return annotation
}

export function GoldenQuestionsPanel({
  goldenQuestions,
  loading,
  loadingMore,
  error,
  nextCursor,
  onAdd,
  onEdit,
  onDelete,
  onLoadMore,
}: {
  goldenQuestions: GoldenQuestion[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  nextCursor?: string
  onAdd: () => void
  onEdit: (question: GoldenQuestion) => void
  onDelete: (questionId: string) => void
  onLoadMore: () => void
}) {
  return (
    <Panel
      title="Golden questions"
      action={(
        <Button variant="primary" size="small" onClick={onAdd}>
          <RiAddLine className="size-4" />
          Add golden
        </Button>
      )}
    >
      {loading && <EmptyPanel text="Loading golden questions…" />}
      {error && !loading && <EmptyPanel text={error} />}
      {!loading && !error && goldenQuestions.length === 0 && (
        <div className="py-8 text-center">
          <EmptyPanel text="No golden questions yet." />
          <Button variant="secondary" size="small" className="mt-3" onClick={onAdd}>
            <RiAddLine className="size-4" />
            Add golden
          </Button>
        </div>
      )}
      {!loading && !error && goldenQuestions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-components-panel-border bg-components-panel-bg shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-divider-subtle">
                  {['Question', 'Tags', 'Expected evidence', 'Annotation', 'Updated', ''].map(column => (
                    <th
                      key={column || 'actions'}
                      className="px-4 py-3 text-left system-xs-medium-uppercase text-text-tertiary"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {goldenQuestions.map(question => (
                  <tr key={question.id} className="border-b border-divider-subtle last:border-b-0 hover:bg-state-base-hover">
                    <td className="max-w-[320px] px-4 py-3 system-sm-regular text-text-secondary">{question.question}</td>
                    <td className="px-4 py-3">
                      {question.tags?.length
                        ? (
                            <div className="flex flex-wrap gap-1">
                              {question.tags.map(tag => (
                                <StatusBadge key={tag} label={tag} tone="neutral" />
                              ))}
                            </div>
                          )
                        : <span className="system-xs-regular text-text-quaternary">—</span>}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 system-xs-regular text-text-tertiary">
                      {expectedEvidenceLabel(question)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 system-xs-regular text-text-tertiary">
                      {annotationLabel(question)}
                    </td>
                    <td className="px-4 py-3 system-xs-regular text-text-tertiary">{formatUpdatedAt(question.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button variant="ghost" size="small" onClick={() => onEdit(question)}>Edit</Button>
                        <Button variant="ghost" size="small" onClick={() => void onDelete(question.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {nextCursor && !loading && (
        <Button variant="secondary" size="small" loading={loadingMore} onClick={() => void onLoadMore()}>
          Load more
        </Button>
      )}
    </Panel>
  )
}
