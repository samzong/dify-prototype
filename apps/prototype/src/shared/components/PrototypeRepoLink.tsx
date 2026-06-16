import { cn } from '@langgenius/dify-ui/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '@langgenius/dify-ui/tooltip'
import { RiGithubFill } from '@remixicon/react'
import { prototypeRepositoryUrl } from '../constants'

export function PrototypeRepoLink({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={(
          <a
            href={prototypeRepositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub repository"
            className={cn('flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary', className)}
          >
            <RiGithubFill className="size-4" />
          </a>
        )}
      />
      <TooltipContent>GitHub repository</TooltipContent>
    </Tooltip>
  )
}
