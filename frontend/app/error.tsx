'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-lg font-medium text-gray-900">오류가 발생했습니다</h1>
          <p className="mt-2 text-sm text-gray-600">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs text-gray-700">
              <pre className="whitespace-pre-wrap">{error.message}</pre>
              {error.digest && (
                <p className="mt-2 text-gray-500">Error ID: {error.digest}</p>
              )}
            </div>
          )}
          
          <button
            onClick={reset}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}