import React, { useState } from 'react'
import { signIn, useSession } from "next-auth/react"
import { NextRouter, useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Loader2Icon, LockKeyholeOpen, LucidePlane, TriangleAlert } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'


const AdminSignin = () => {
    const { data: session } = useSession()
    const router: NextRouter = useRouter()
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)
    const handleSignin = async () => {
        if(username === "" || password === "") {
            setIsLoading(true)
            setIsError(true)
            setError("no_input")
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        setError("")
        setIsError(false)
        const signinData = await signIn("adminSignin", {
            redirect: false,
            username: username,
            password: password,
            callbackUrl: "/admin",
        })
        setIsLoading(false)
        console.log(signinData)
        if(signinData?.error) {
            setIsError(true)
            setError(signinData.error)
            setUsername("")
            setPassword("")
        }else{

        }
    }

    if (!(!session || session.user.role !== "admin")) {
        return (
            <div className='h-svh'>
                <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                    <h1 className='text-[7rem] font-bold leading-tight'>
                        <LockKeyholeOpen className='h-24 w-24' />
                    </h1>
                    <span className='font-medium text-xl'>Admin access granted</span>
                    <p className='text-center text-muted-foreground'>
                        You can now access the admin dashboard. <br /> Please proceed to the dashboard for further actions.
                    </p>
                    <div className='mt-6 flex gap-4'>
                        <Button className='cursor-pointer' variant='outline' onClick={() => history.go(-1)}>Go Back</Button>
                        <Button className='cursor-pointer' onClick={() => router.push("/admin")}>Go to Dashboard</Button>
                    </div>
                </div>
          </div>
        )
    }

    return (
        <div className='container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
            <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
                <div className='absolute inset-0'>
                    <div className='z-10 absolute inset-0 from-black/60 to-black/60 via-transparent via-50% bg-gradient-to-b' />
                    <div className='absolute inset-0 bg-[url("/adminLoginSplash.jpg")] bg-cover bg-center w-full h-full' />
                </div>
                <div className='relative z-20 flex items-center text-lg font-medium'>
                    <LucidePlane />
                SkyVoyage
                </div>


                <div className='relative z-20 mt-auto'>
                    <blockquote className='space-y-2'>
                        <p className='text-lg'>
                        &ldquo;A CPE241 Database System Term Project 2024/2.&rdquo;
                        </p>
                        <footer className='text-sm'>SkyVoyage Group</footer>
                    </blockquote>
                </div>
            </div>
            <div className='lg:p-8'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
                <div className='flex flex-col space-y-2 text-left'>
                    <h1 className='text-2xl font-semibold tracking-tight'>Admin Login</h1>
                    <div className='bg-gray-500 h-[1px] w-36' />
                    <p className='text-sm text-muted-foreground'>
                    Enter username and password below <br />
                    to access the admin dashboard.
                    </p>
                </div>
                {
                    isError && error !== "" &&
                    <Alert variant='destructive' className={`transition-all duration-300 ${isError ? "opacity-100" : "opacity-0"}`}>
                        <TriangleAlert className='h-4 w-4' />
                        <AlertTitle className='text-sm font-medium'>Error</AlertTitle>
                        <AlertDescription className='text-sm'>{error == "CredentialsSignin" ? "Invalid Username or Password" : 
                        error == "no_input" ? "Please enter your username and password" : ""}</AlertDescription>
                    </Alert>
                }
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" type="text" placeholder="Enter your username"
                            required
                            value={username}
                            autoComplete="new-password"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {/* <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                            Forgot your password?
                            </a> */}
                        </div>
                        <Input id="password" type="password" required
                            placeholder="Enter your password"
                            value={password}
                            autoComplete="new-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={()=>{ handleSignin() }} className="w-full">
                        {isLoading ? <Loader2Icon className='animate-spin' /> : "Sign in"}
                    </Button>
                    {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div> */}
                </div>
                <p className='px-8 text-center text-sm text-muted-foreground'>
                    &copy; {new Date().getFullYear()} SkyVoyage. All rights reserved.
                </p>
                <p className='px-8 text-center text-sm text-muted-foreground'>
                    <Link href="/account/auth?signin" className='text-blue-500 hover:underline'>Go to user sign in</Link>
                </p>
                </div>
            </div>
        </div>
    )
}

export default AdminSignin