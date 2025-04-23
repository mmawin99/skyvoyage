import { Loader2 } from 'lucide-react'
import React from 'react'

const LoadingApp = () => {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-4'>
        <Loader2 className='h-16 w-16 animate-spin text-blue-500' />
        <span className='text-xl font-medium'>Loading...</span>
        <p className='text-center text-muted-foreground'>
          Please wait while we load the data. <br /> This may take a few seconds.
        </p>
      </div>
    </div>
  )
}

export default LoadingApp