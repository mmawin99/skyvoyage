import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { Loader2, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import React from "react"

interface AdminWrapperProps {
    children: React.ReactNode
}

export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === "loading") {
        return (
            <div className='h-svh'>
                <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-4'>
                    <Loader2 className='h-16 w-16 animate-spin text-blue-500' />
                    <span className='text-xl font-medium'>Validating Your access</span>
                    <p className='text-center text-muted-foreground'>
                        Please wait while we validate your access. <br /> This may take a few seconds.
                    </p>
                </div>
            </div>
        )
    }

    if (!session || session.user.role !== "admin") {
        return (
            <div className='h-svh'>
                <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                    <LockKeyhole className='h-24 w-24 text-destructive' />
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

    return <>{children}</>
}