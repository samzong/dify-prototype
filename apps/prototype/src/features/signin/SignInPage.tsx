import { Button } from '@langgenius/dify-ui/button'
import { FieldControl, FieldLabel, FieldRoot } from '@langgenius/dify-ui/field'
import { Form } from '@langgenius/dify-ui/form'
import { toast } from '@langgenius/dify-ui/toast'
import { RiEyeLine, RiEyeOffLine } from '@remixicon/react'
import { useState } from 'react'
import { SignInHeader } from './components/SignInHeader'
import { Split } from './components/Split'

export function SignInPage({
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
