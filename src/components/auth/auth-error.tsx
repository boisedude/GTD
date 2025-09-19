'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface AuthErrorProps {
  error: string
  onRetry?: () => void
  showRetry?: boolean
}

export function AuthError({ error, onRetry, showRetry = true }: AuthErrorProps) {
  const getErrorMessage = (error: string) => {
    // Common Supabase auth error messages
    const errorMappings: Record<string, string> = {
      'Invalid login credentials': 'The verification code is incorrect or has expired. Please try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'Too many requests': 'Too many attempts. Please wait a few minutes before trying again.',
      'Token has expired or is invalid': 'The verification code has expired. Please request a new one.',
      'User not found': 'No account found with this email address.',
      'Invalid email': 'Please enter a valid email address.',
      'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another.',
    }

    return errorMappings[error] || error || 'An unexpected error occurred. Please try again.'
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{getErrorMessage(error)}</p>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Loading state component for auth flows
export function AuthLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}