import { cn } from '@langgenius/dify-ui/cn'

export function Split({ className }: { className?: string }) {
  return (
    <div className={cn('h-px w-[400px] max-w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.01)_0%,rgba(16,24,40,0.08)_50.5%,rgba(255,255,255,0.01)_100%)]', className)} />
  )
}
