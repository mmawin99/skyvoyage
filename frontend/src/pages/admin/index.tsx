import React from 'react'
import { useSession } from "next-auth/react"
import { NextRouter, useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { LockKeyholeIcon } from 'lucide-react'


const AdminHome = () => {
    const { data: session } = useSession()
    const router: NextRouter = useRouter()
    if (!session || session.user.role !== "admin") {
        return (
            <div className='h-svh'>
                <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                    <h1 className='text-[7rem] font-bold leading-tight'>
                        <LockKeyholeIcon className='h-24 w-24' />
                    </h1>
                    <span className='font-medium text-xl'>You need to login to access</span>
                    <p className='text-center text-muted-foreground'>
                        Please log in with the appropriate credentials <br /> to access this
                        resource.
                    </p>
                    <div className='mt-6 flex gap-4'>
                        <Button className='cursor-pointer' variant='outline' onClick={() => history.go(-1)}>Go Back</Button>
                        <Button className='cursor-pointer' onClick={() => router.push("/admin/signin")}>Sign in</Button>
                    </div>
                </div>
          </div>
        )
    }

    return (
        <div>AdminHome</div>
    )
}

export default AdminHome