import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { Input } from '@langgenius/dify-ui/input'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { useEffect, useState } from 'react'
import type { GoldenQuestion } from '../../api-types'
import type { GoldenQuestionDraft } from './useQualityController'

const emptyDraft = (): GoldenQuestionDraft => ({
  question: '',
  tags: '',
  annotation: '',
  expectedEvidenceIds: '',
})

export function GoldenQuestionDialog({
  open,
  editing,
  onOpenChange,
  onSave,
}: {
  open: boolean
  editing: GoldenQuestion | null
  onOpenChange: (open: boolean) => void
  onSave: (draft: GoldenQuestionDraft, editing: GoldenQuestion | null) => Promise<void>
}) {
  const [draft, setDraft] = useState(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open)
      return

    if (editing) {
      setDraft({
        question: editing.question,
        tags: (editing.tags ?? []).join(', '),
        annotation: typeof editing.metadata?.annotation === 'string' ? editing.metadata.annotation : '',
        expectedEvidenceIds: (editing.expectedEvidenceIds ?? []).join(', '),
      })
    }
    else {
      setDraft(emptyDraft())
    }
    setError(null)
  }, [open, editing])

  const handleSave = async () => {
    if (!draft.question.trim()) {
      setError('Question is required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(draft, editing)
      onOpenChange(false)
    }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save golden question')
    }
    finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[640px] max-w-[calc(100vw-2rem)]">
        <DialogCloseButton />
        <DialogTitle className="system-md-semibold text-text-secondary">
          {editing ? 'Edit golden question' : 'Create golden question'}
        </DialogTitle>
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 system-xs-medium text-text-tertiary">Question</div>
            <Textarea
              value={draft.question}
              onValueChange={value => setDraft(current => ({ ...current, question: value }))}
              className="min-h-20"
              aria-label="Golden question"
            />
          </div>
          <div>
            <div className="mb-1 system-xs-medium text-text-tertiary">Tags</div>
            <Input
              value={draft.tags}
              onChange={event => setDraft(current => ({ ...current, tags: event.target.value }))}
              placeholder="billing, sso"
            />
          </div>
          <div>
            <div className="mb-1 system-xs-medium text-text-tertiary">Expected evidence IDs</div>
            <Input
              value={draft.expectedEvidenceIds}
              onChange={event => setDraft(current => ({ ...current, expectedEvidenceIds: event.target.value }))}
              placeholder="Comma-separated evidence IDs"
            />
          </div>
          <div>
            <div className="mb-1 system-xs-medium text-text-tertiary">Annotation</div>
            <Textarea
              value={draft.annotation}
              onValueChange={value => setDraft(current => ({ ...current, annotation: value }))}
              className="min-h-16"
              placeholder="Reviewer notes for expected answer quality"
              aria-label="Annotation"
            />
          </div>
          {error && <p className="system-xs-regular text-util-colors-red-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="small" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="primary" size="small" loading={saving} onClick={() => void handleSave()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
