import { ToastHost } from '@langgenius/dify-ui/toast'
import { TooltipProvider } from '@langgenius/dify-ui/tooltip'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={300} closeDelay={200}>
      <ToastHost timeout={3000} limit={3} />
      <div className="isolate h-full">
        {children}
      </div>
    </TooltipProvider>
  )
}
