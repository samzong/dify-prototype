import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import { FieldControl, FieldLabel, FieldRoot } from '@langgenius/dify-ui/field'
import { Form } from '@langgenius/dify-ui/form'
import { Input } from '@langgenius/dify-ui/input'
import { ToastHost, toast } from '@langgenius/dify-ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@langgenius/dify-ui/tooltip'
import {
  RiArrowDownSLine,
  RiBuilding4Line,
  RiCloseCircleFill,
  RiDoorLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiGithubFill,
  RiGlobalLine,
  RiRobot2Fill,
  RiRobot2Line,
  RiSearchLine,
  RiSettings3Line,
  RiTShirt2Line,
} from '@remixicon/react'
import { useEffect, useMemo, useState } from 'react'
import { Knowledge2Section, KnowledgeTopNav } from './Knowledge2Workbench'
import { knowledge2Items, type Knowledge2Item } from './knowledge-2-data'
import { prototypeApps, type AppMode, type PrototypeApp } from './prototype-data'
import { WorkflowOrchestrate } from './WorkflowOrchestrate'

type MainSection = 'studio' | 'knowledge' | 'workflow'

const appTypeLabels: Record<AppMode, string> = {
  workflow: 'Workflow',
  'advanced-chat': 'Chatflow',
  chat: 'Chatbot',
  'agent-chat': 'Agent',
  completion: 'Text Generator',
}

const appTypeIconClassNames: Record<AppMode, string> = {
  workflow: 'i-ri-exchange-2-fill bg-components-icon-bg-indigo-solid',
  'advanced-chat': 'i-ri-message-3-fill bg-components-icon-bg-blue-light-solid',
  chat: 'i-ri-message-3-fill bg-components-icon-bg-blue-solid',
  'agent-chat': 'i-ri-robot-3-fill bg-components-icon-bg-violet-solid',
  completion: 'i-ri-file-text-fill bg-components-icon-bg-teal-solid',
}

const prototypeRepositoryUrl = 'https://github.com/samzong/dify-prototype'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <TooltipProvider delay={300} closeDelay={200}>
      <ToastHost timeout={3000} limit={3} />
      <div className="isolate h-full">
        {authenticated
          ? <AppsDefaultPage theme={theme} onThemeChange={setTheme} onSignOut={() => setAuthenticated(false)} />
          : <SignInPage theme={theme} onThemeChange={setTheme} onSignedIn={() => setAuthenticated(true)} />}
      </div>
    </TooltipProvider>
  )
}

function SignInPage({
  theme,
  onThemeChange,
  onSignedIn,
}: {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  onSignedIn: () => void
}) {
  const [email, setEmail] = useState('admin@dify.ai')
  const [password, setPassword] = useState('dify-prototype')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    if (!password.trim()) {
      toast.error('Password is required')
      return
    }

    setIsLoading(true)
    window.setTimeout(() => {
      setIsLoading(false)
      toast.success('Signed in')
      onSignedIn()
    }, 350)
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-background-default-burn p-6">
      <div className="flex w-full shrink-0 flex-col items-center rounded-2xl border border-effects-highlight bg-background-default-subtle">
        <SignInHeader theme={theme} onThemeChange={onThemeChange} />
        <div className="flex w-full grow flex-col items-center justify-center px-6 md:px-[108px]">
          <div className="flex flex-col md:w-[400px]">
            <div className="mx-auto mt-8 w-full">
              <div className="mx-auto w-full">
                <h2 className="title-4xl-semi-bold text-text-primary">Log in to Dify</h2>
                <p className="mt-2 body-md-regular text-text-tertiary">Welcome back. Please log in to your account.</p>
              </div>
              <div className="relative">
                <Form onFormSubmit={handleSubmit}>
                  <FieldRoot name="email" className="mt-6 mb-3">
                    <FieldLabel className="my-2 py-0 system-md-semibold text-text-secondary">
                      Email
                    </FieldLabel>
                    <FieldControl
                      value={email}
                      onValueChange={setEmail}
                      type="email"
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="Enter your email"
                    />
                  </FieldRoot>
                  <FieldRoot name="password" className="mb-3">
                    <div className="my-2 flex items-center justify-between">
                      <FieldLabel className="py-0 system-md-semibold text-text-secondary">Password</FieldLabel>
                      <a href="#" className="system-xs-regular text-components-button-secondary-accent-text">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative mt-1">
                      <FieldControl
                        value={password}
                        onValueChange={setPassword}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        spellCheck={false}
                        placeholder="Enter your password"
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          className="mr-1 size-8 p-0 text-text-tertiary hover:text-text-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword
                            ? <RiEyeOffLine className="size-4" aria-hidden="true" />
                            : <RiEyeLine className="size-4" aria-hidden="true" />}
                        </Button>
                      </div>
                    </div>
                  </FieldRoot>
                  <div className="mb-2">
                    <Button
                      type="submit"
                      loading={isLoading}
                      variant="primary"
                      disabled={isLoading || !email || !password}
                      className="w-full"
                    >
                      Sign in
                    </Button>
                  </div>
                </Form>
                <Split className="mt-4 mb-5" />
                <div className="mb-3 text-[13px] leading-4 font-medium text-text-secondary">
                  <span>Don&apos;t have an account? </span>
                  <a className="text-text-accent" href="#">
                    Sign up
                  </a>
                </div>
                <div className="mt-2 block w-full system-xs-regular text-text-tertiary">
                  By signing in, you agree to Dify&apos;s
                  {' '}
                  <a className="system-xs-medium text-text-secondary hover:underline" href="https://dify.ai/terms" target="_blank" rel="noreferrer">Terms</a>
                  {' '}
                  &
                  {' '}
                  <a className="system-xs-medium text-text-secondary hover:underline" href="https://dify.ai/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 system-xs-regular text-text-tertiary">
          © 2026 LangGenius, Inc. All rights reserved.
        </div>
      </div>
    </div>
  )
}

function SignInHeader({
  theme,
  onThemeChange,
}: {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}) {
  return (
    <div className="flex w-full items-center justify-between p-6">
      <img src={theme === 'dark' ? '/logo/logo-monochrome-white.svg' : '/logo/logo.svg'} className="block h-7 w-16 object-contain" alt="Dify" />
      <div className="flex items-center gap-1">
        <button type="button" className="flex h-8 items-center gap-1 rounded-lg px-2 system-xs-medium text-text-tertiary hover:bg-state-base-hover">
          English
          <RiArrowDownSLine className="size-4" />
        </button>
        <div className="mx-0 ml-2 h-4 w-px shrink-0 bg-divider-regular" />
        <PrototypeRepoLink />
        <button
          type="button"
          aria-label="Toggle theme"
          className="flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover"
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
        >
          <RiTShirt2Line className="size-4" />
        </button>
      </div>
    </div>
  )
}

function Split({ className }: { className?: string }) {
  return (
    <div className={cn('h-px w-[400px] max-w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.01)_0%,rgba(16,24,40,0.08)_50.5%,rgba(255,255,255,0.01)_100%)]', className)} />
  )
}

function PrototypeRepoLink({ className }: { className?: string }) {
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

function AppsDefaultPage({
  theme,
  onThemeChange,
  onSignOut,
}: {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  onSignOut: () => void
}) {
  const [activeSection, setActiveSection] = useState<MainSection>('studio')
  const [knowledgeScreen, setKnowledgeScreen] = useState<'list' | string>('list')
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge2Item[]>(() => knowledge2Items)
  const [keywords, setKeywords] = useState('')
  const filteredApps = useMemo(() => {
    const query = keywords.trim().toLowerCase()
    if (!query)
      return prototypeApps

    return prototypeApps.filter(app => `${app.name} ${app.description} ${app.tags.join(' ')}`.toLowerCase().includes(query))
  }, [keywords])

  if (activeSection === 'workflow')
    return <WorkflowOrchestrate onBack={() => setActiveSection('studio')} />

  return (
    <div className="flex h-full flex-col bg-background-body text-text-primary">
      <Header
        theme={theme}
        activeSection={activeSection}
        knowledgeScreen={knowledgeScreen}
        onSectionChange={(section) => {
          setActiveSection(section)
          if (section === 'knowledge')
            setKnowledgeScreen('list')
        }}
        knowledgeItems={knowledgeItems}
        onGoToKnowledgeList={() => setKnowledgeScreen('list')}
        onSelectKnowledge={setKnowledgeScreen}
        onOpenKnowledgeCreate={mode => setKnowledgeScreen(`create:${mode}`)}
        onThemeChange={onThemeChange}
        onSignOut={onSignOut}
      />
      {activeSection === 'studio'
        ? (
            <main className="relative flex h-0 shrink-0 grow flex-col overflow-y-auto bg-background-body">
              <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-background-body px-12 pt-7 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <FilterChip iconClassName="i-ri-apps-2-line" label="Types" />
                  <FilterChip iconClassName="i-ri-user-3-line" label="Created by anyone" />
                  <FilterChip iconClassName="i-ri-price-tag-3-line" label="Tags" />
                  <SearchInput value={keywords} onChange={setKeywords} />
                </div>
                <a href="#" className="flex h-8 items-center rounded-lg px-3 text-sm font-semibold text-text-secondary hover:bg-state-base-hover hover:text-text-primary">
                  View Snippets
                </a>
              </div>
              <div className="relative grid grow grid-cols-1 content-start gap-4 px-12 pt-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                <NewAppCard onOpenWorkflow={() => setActiveSection('workflow')} />
                {filteredApps.map(app => <AppCard key={app.id} app={app} onOpenWorkflow={() => setActiveSection('workflow')} />)}
              </div>
              <div className="flex items-center justify-center gap-2 py-4 text-text-quaternary" role="region" aria-label="Drop DSL file here to create app">
                <span className="i-ri-drag-drop-line size-4" />
                <span className="system-xs-regular">Drop DSL file here to create app</span>
              </div>
            </main>
          )
        : (
            <Knowledge2Section
              screen={knowledgeScreen}
              items={knowledgeItems}
              onOpenDetail={setKnowledgeScreen}
              onOpenCreate={mode => setKnowledgeScreen(`create:${mode}`)}
              onUpdateKnowledge={(id, updater) => {
                setKnowledgeItems(current => current.map(item => item.id === id ? updater(item) : item))
              }}
              onCreateKnowledge={(item) => {
                setKnowledgeItems(current => [item, ...current])
                setKnowledgeScreen(item.id)
              }}
            />
          )}
    </div>
  )
}

function Header({
  theme,
  activeSection,
  knowledgeScreen,
  knowledgeItems,
  onSectionChange,
  onGoToKnowledgeList,
  onSelectKnowledge,
  onOpenKnowledgeCreate,
  onThemeChange,
  onSignOut,
}: {
  theme: 'light' | 'dark'
  activeSection: MainSection
  knowledgeScreen: 'list' | string
  knowledgeItems: Knowledge2Item[]
  onSectionChange: (section: MainSection) => void
  onGoToKnowledgeList: () => void
  onSelectKnowledge: (id: string) => void
  onOpenKnowledgeCreate: (mode: 'standard' | 'pipeline' | 'external') => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onSignOut: () => void
}) {
  return (
    <header className="sticky top-0 right-0 left-0 z-30 flex min-h-[56px] shrink-0 grow-0 basis-auto flex-col border-b border-divider-regular bg-background-body">
      <div className="flex h-[56px] items-center">
        <div className="flex min-w-0 flex-1 items-center pr-2 pl-3 min-[1280px]:pr-3">
          <a href="#" className="flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-sm px-0.5 hover:opacity-80 focus-visible:ring-1 focus-visible:ring-components-input-border-active focus-visible:outline-hidden">
            <img src={theme === 'dark' ? '/logo/logo-monochrome-white.svg' : '/logo/logo.svg'} className="block h-[22px] w-12 object-contain" alt="Dify" />
          </a>
          <div className="mx-1.5 shrink-0 font-light text-divider-deep">/</div>
          <button type="button" className="flex h-8 max-w-[220px] items-center rounded-[10px] px-2 text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover">
            <span className="truncate system-sm-medium">Samzong Workspace</span>
            <RiArrowDownSLine className="ml-1 size-4 shrink-0 text-text-tertiary" />
          </button>
          <div className="ml-2 rounded-md border border-components-button-secondary-border px-1.5 system-2xs-medium-uppercase text-text-tertiary">Sandbox</div>
        </div>
        <div className="flex items-center space-x-2">
          <TopNav icon={<span className="i-ri-compass-3-line size-4" />} text="Explore" />
          <TopNav
            icon={<RiRobot2Line className="size-4" />}
            activeIcon={<RiRobot2Fill className="size-4" />}
            text="Studio"
            active={activeSection === 'studio'}
            onClick={() => onSectionChange('studio')}
          />
          <KnowledgeTopNav
            active={activeSection === 'knowledge'}
            screen={knowledgeScreen}
            items={knowledgeItems}
            onActivate={() => onSectionChange('knowledge')}
            onGoToList={onGoToKnowledgeList}
            onSelectKnowledge={onSelectKnowledge}
            onOpenCreate={onOpenKnowledgeCreate}
          />
          <TopNav icon={<span className="i-ri-hammer-line size-4" />} text="Tools" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end pr-3 pl-2 min-[1280px]:pl-3">
          <PrototypeRepoLink className="mr-2" />
          <button type="button" className="mr-2 flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
            <RiTShirt2Line className="size-4" />
          </button>
          <button type="button" className="mr-2 flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover">
            <RiSettings3Line className="size-4" />
          </button>
          <button type="button" className="inline-flex items-center rounded-[20px] p-0.5 hover:bg-background-default-dodge" onClick={onSignOut}>
            <span className="flex size-8 items-center justify-center rounded-full bg-components-avatar-default-avatar-bg system-sm-semibold text-text-primary-on-surface">A</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function TopNav({
  icon,
  activeIcon,
  text,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  text: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div className={cn(
      'flex h-8 max-w-167.5 shrink-0 items-center rounded-xl px-0.5 text-sm font-medium max-[1024px]:max-w-100',
      active && 'bg-components-main-nav-nav-button-bg-active font-semibold shadow-md',
      !active && 'hover:bg-components-main-nav-nav-button-bg-hover',
    )}
    >
      <button type="button" aria-current={active ? 'page' : undefined} onClick={onClick} className={cn('flex h-7 cursor-pointer items-center rounded-[10px] px-2.5', active ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text')}>
        <span>{active ? activeIcon ?? icon : icon}</span>
        <span className="ml-2 max-[1024px]:hidden">{text}</span>
      </button>
    </div>
  )
}

function SearchInput({ value, onChange, className = 'w-52' }: { value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className="relative">
      <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-components-input-text-placeholder" />
      <Input
        size="medium"
        className={cn('pr-7 pl-7', className)}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Search"
      />
      {!!value && (
        <button
          type="button"
          aria-label="Clear"
          className="absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center text-components-input-text-placeholder hover:text-components-input-text-filled"
          onClick={() => onChange('')}
        >
          <RiCloseCircleFill className="size-4" />
        </button>
      )}
    </div>
  )
}

function FilterChip({ iconClassName, label }: { iconClassName: string; label: string }) {
  return (
    <button type="button" className="flex h-8 items-center rounded-lg border-[0.5px] border-transparent bg-components-input-bg-normal px-2 text-[13px] leading-4 text-text-tertiary transition-colors hover:bg-components-input-bg-hover">
      <span aria-hidden className={cn('h-4 w-4 shrink-0 text-text-tertiary', iconClassName)} />
      <span className="px-1 text-text-tertiary">{label}</span>
      <span aria-hidden className="i-ri-arrow-down-s-line h-4 w-4 shrink-0 text-text-tertiary" />
    </button>
  )
}

function NewAppCard({ onOpenWorkflow }: { onOpenWorkflow: () => void }) {
  return (
    <div className="relative col-span-1 inline-flex h-[160px] flex-col justify-between rounded-xl border-[0.5px] border-components-card-border bg-components-card-bg transition-opacity">
      <div className="grow rounded-t-xl p-2">
        <div className="px-6 pt-2 pb-1 text-xs leading-[18px] font-medium text-text-tertiary">Create App</div>
        <button type="button" className="mb-1 flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] leading-[18px] font-medium text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary" onClick={onOpenWorkflow}>
          <span className="mr-2 i-ri-file-add-line size-4 shrink-0" />
          Start from blank
        </button>
        <button type="button" className="flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] leading-[18px] font-medium text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary">
          <span className="mr-2 i-ri-file-copy-2-line size-4 shrink-0" />
          Start from template
        </button>
        <button type="button" className="flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] leading-[18px] font-medium text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary">
          <span className="mr-2 i-ri-file-upload-line size-4 shrink-0" />
          Import DSL
        </button>
      </div>
    </div>
  )
}

function AppCard({ app, onOpenWorkflow }: { app: PrototypeApp; onOpenWorkflow: () => void }) {
  return (
    <div className="group relative col-span-1 inline-flex h-[160px] cursor-pointer flex-col rounded-xl border border-solid border-components-card-border bg-components-card-bg shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-lg" onClick={app.mode === 'workflow' ? onOpenWorkflow : undefined}>
      <div className="flex h-[66px] shrink-0 grow-0 items-center gap-3 px-[14px] pt-[14px] pb-3">
        <div className="relative shrink-0">
          <span className="relative flex h-10 w-10 shrink-0 grow-0 items-center justify-center overflow-hidden rounded-[10px] border-[0.5px] border-divider-regular text-[24px] leading-none" style={{ background: app.iconBackground }}>
            {app.icon}
          </span>
          <AppTypeIcon type={app.mode} wrapperClassName="absolute -right-0.5 -bottom-0.5 size-4 shadow-sm" className="size-3" />
        </div>
        <div className="w-0 grow py-px">
          <div className="flex items-center text-sm/5 font-semibold text-text-secondary">
            <div className="truncate" title={app.name}>{app.name}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] leading-[18px] font-medium text-text-tertiary">
            <div className="truncate" title={app.authorName}>{app.authorName}</div>
            <div>·</div>
            <div className="truncate" title={app.editedAt}>{app.editedAt}</div>
          </div>
        </div>
        <div className="flex h-full shrink-0 flex-col items-end justify-between py-px">
          <div className="flex size-5 items-center justify-center">
            {app.access === 'public' && <RiGlobalLine className="size-4 text-text-quaternary" />}
            {app.access === 'organization' && <RiBuilding4Line className="size-4 text-text-quaternary" />}
            {app.access === 'private' && <RiDoorLockLine className="size-4 text-text-quaternary" />}
          </div>
        </div>
      </div>
      <div className="h-[90px] px-[14px] text-xs leading-normal text-text-tertiary">
        <div className="line-clamp-2" title={app.description}>{app.description}</div>
      </div>
      <div className="absolute right-0 bottom-1 left-0 flex h-[42px] shrink-0 items-center pt-1 pr-[6px] pb-[6px] pl-[14px]">
        <div className="flex w-0 grow items-center gap-1 overflow-hidden">
          {app.tags.map(tag => (
            <span key={tag} className="inline-flex h-5 max-w-[92px] shrink-0 items-center rounded-md border border-divider-subtle bg-components-badge-bg-gray-soft px-1.5 system-2xs-medium-uppercase text-text-tertiary">
              {tag}
            </span>
          ))}
        </div>
        <button type="button" aria-label="More" className="flex size-8 items-center justify-center rounded-lg text-text-tertiary opacity-0 hover:bg-state-base-hover group-hover:opacity-100">
          <span className="i-ri-more-fill size-4" />
        </button>
      </div>
    </div>
  )
}

function AppTypeIcon({ type, className, wrapperClassName }: { type: AppMode; className?: string; wrapperClassName?: string }) {
  const [iconClassName, backgroundClassName] = appTypeIconClassNames[type].split(' ')

  return (
    <div className={cn('inline-flex size-5 items-center justify-center rounded-md border border-divider-regular', backgroundClassName, wrapperClassName)} title={appTypeLabels[type]}>
      <span className={cn(iconClassName, 'text-components-avatar-shape-fill-stop-100', className ?? 'size-3.5')} />
    </div>
  )
}

export default App
