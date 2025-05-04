/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff, Phone, TriangleAlert, CircleAlert, ChevronsUpDown, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useBackendURL } from "@/components/backend-url-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NextRouter, useRouter } from "next/router"
import { useSearchParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { CountryList } from "@/lib/country"
import { Country } from "@/types/type"
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { signIn, signOut } from "next-auth/react"
const typedCountries = CountryList;

export default function AuthPage() {
    const [showPassword, setShowPassword] = useState(false)
    const {backend:backendURL} = useBackendURL();
    const router: NextRouter = useRouter()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [countryOpen, setCountryOpen] = useState(false)
    // const router:NextRouter = useRouter()
    const [phoneError, setPhoneError] = useState<string>("")
    const [phoneCountryCode, setPhoneCountryCode] = useState<Country>({
        iso2: "TH",
        name: "Thailand",
        dialCode: "+66",
    })
    const searchParams = useSearchParams()
    // console.log(allCountries)
    const [activeTab, setActiveTab] = useState<string>("signin")
    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }
    useEffect(() => {
      if (searchParams.has("signup")) {
        setActiveTab("signup")
      }
      if(searchParams.has("signout")) {
        setActiveTab("signout")
      }
    }
    , [searchParams])

   
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setPhone(value)
      const phoneNumber = parsePhoneNumberFromString(value, phoneCountryCode.iso2 as CountryCode); // 'TH', 'US', etc.
      if (!phoneNumber || !phoneNumber.isValid()) {
        setIsError(true)
        setError(`phone_invalid`);
        console.log("Invalid phone number for country:", phoneCountryCode.name);
        setPhoneError("Invalid phone number")
      }else{
        setIsError(false)
        console.log("Valid phone number for country:", phoneCountryCode.name, phoneNumber.formatInternational());
        setPhoneError("")
      }
    }
  
    const handleCountryChange = (country:Country) => {
      setPhoneCountryCode(country)
    }

    const handleSignUp = async () => {
        setIsLoading(true)
        if(isError) setIsError(false)



        if(!isTermsAccepted) {
            setIsError(true)
            setError("term_not_accepted")
            setIsLoading(false)
            return
        }
        if(email === "" || password === "" || firstName === "" || lastName === "" || phone === "" || confirmPassword === "") {
            setIsError(true)
            setError("no_input")
            setIsLoading(false)
            return
        }
        if(password !== confirmPassword) {
            setIsError(true)
            setError("password_mismatch")
            setIsLoading(false)
            return
        }

        try{
            const phoneNumber = parsePhoneNumberFromString(phone, phoneCountryCode.iso2 as CountryCode);
            if(phoneNumber && phoneNumber.isValid()) {
              // console.log('This will be sent to the backend, All data is valid.')
              // setIsLoading(false)
              const response = await fetch(`${backendURL}/user/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    firstname: firstName,
                    lastname: lastName,
                    phone: phoneNumber.formatInternational()
                  })
                })
                if (response.ok) {
                  const data = await response.json()
                  console.log(data)
                  setIsLoading(false)
                  //clear all fields
                  setEmail("")
                  setPassword("")
                  setConfirmPassword("")
                  setFirstName("")
                  setLastName("")
                  setPhone("")
                  setIsError(false)
                  setError("")
                  setActiveTab("signup_success")
                  setPhoneCountryCode({
                    iso2: "TH",
                    name: "Thailand",
                    dialCode: "+66",
                  })
                  setIsTermsAccepted(false)
                  router.push("/account/auth?signin")
                }else{
                  setIsLoading(false)
                  const data = await response.json()
                  console.log(data)
                  setIsError(true)
                  setError("signup_failed")
                }
            }else{
              setIsError(true)
              setError("phone_invalid")
              return;
            }
        }catch (error) {
            console.error("Error during signup:", error)
            setIsError(true)
            setError("signup_failed")
            setIsLoading(false)
            return
        }
    }
    const signmeout = async () => {
      setIsLoading(true)
      const signout = await signOut({
        redirect: false,
        callbackUrl: "/account/auth?signin"
      });
      setIsLoading(false);
      if (!signout?.url) {
        setIsError(true)
        setError("signout_failed")
        return
      } else {
        setIsError(false)
        setError("")
        setActiveTab("signin")
      }
    }



    const handleSignIn = async ()=>{
      setIsLoading(true)
      if(email === "" || password === "") {
        setIsLoading(false)
        setIsError(true)
        setError("no_input")
        return
      }
      console.log("Signin with email: ", email, " and password: ", password)
      const signinData = await signIn("userSignin", {
        redirect: false,
        email: email,
        password: password,
        callbackUrl: "/",
      });
      setIsLoading(false)

      if(signinData?.error) {
        setIsError(true)
        setError('signin_failed')
        setEmail("")
        setPassword("")
      }else{
        setIsError(false)
        setError("")
        setActiveTab("signin_success")
      }
    }
  return (
    <div className={`min-h-screen flex items-center justify-center bg-[url("/userLoginSplash.jpg")] bg-cover bg-center p-4`}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className={`${activeTab == "signup_success" || activeTab == "signin_success" || activeTab == "signout" ? "hidden" : "mb-6 text-center"}`}>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to SkyVoyage</h1>
          <p className="text-slate-500 mt-1">Sign in or create your account</p>
        </div>

        <Tabs defaultValue="signin" className="w-full" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className={`${activeTab == "signup_success" || activeTab == "signin_success" || activeTab == "signout" ? "hidden" : `grid grid-cols-2 mb-6 w-full`}`}>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signout">
            <div className="flex flex-col items-center justify-center h-full">
              <TriangleAlert className="h-16 w-16 text-red-500" />
              <h2 className="text-lg font-bold text-slate-900">Are you sure?</h2>
              <p className="text-slate-500 mt-1">You can sign in back anytime you want.</p>
              <Button variant="destructive" onClick={() => {
                signmeout();
              }} className="mt-4">
                Sign me out
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="signup_success">
            <div className="flex flex-col items-center justify-center h-full">
              <Check className="h-16 w-16 text-green-500" />
              <h2 className="text-lg font-bold text-slate-900">Sign up successful!</h2>
              <p className="text-slate-500 mt-1">You can now sign in to your account.</p>
              <Button variant="default" onClick={() => setActiveTab("signin")} className="mt-4">
                Go to Sign In
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="signin_success">
            <div className="flex flex-col items-center justify-center h-full">
              <Check className="h-16 w-16 text-green-500" />
              <h2 className="text-lg font-bold text-slate-900">Sign in successful!</h2>
              <p className="text-slate-500 mt-1">You can now start your journey.</p>
              <Button variant="default" onClick={() => { router.push("/"); }} className="mt-4">
                Go to Home page
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="signin">
            {
                isError && error !== "" &&
                <Alert variant="destructive" className={`transition-all duration-300 mb-3`}>
                    <TriangleAlert className='h-4 w-4' />
                    <AlertTitle>Error !</AlertTitle>
                    <AlertDescription>
                        {error == "no_input" ? "Please enter your email and password" : 
                        error == "signin_failed" ? "Signin failed. Please try again later." : 
                        ""
                        }
                    </AlertDescription>
                </Alert>
            }
            <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                handleSignIn()
              }}>
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="new-password"
                    type="email" placeholder="Email" className="pl-10" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end"> 
                <Link href="/account/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant={'default'} className="w-full"
              disabled={isLoading}>
                {isLoading ? <Loader2 className='animate-spin' /> : "Sign in"}
              </Button>
            </form>

          </TabsContent>

          <TabsContent value="signup">
            {
                isError && error !== "" &&
                <Alert variant="destructive" className={`transition-all duration-300 mb-3`}>
                    <TriangleAlert className='h-4 w-4' />
                    <AlertTitle>Error !</AlertTitle>
                    <AlertDescription>
                        {error == "no_input" ? "Please enter all required fields" : 
                        error == "term_not_accepted" ? "Please accept the terms and conditions" :
                        error == "signup_failed" ? "Signup failed. Please try again later." : 
                        error == "password_mismatch" ? "Confirm password not match" :
                        error == "phone_invalid" ? "Invalid phone number" :
                        ""
                        }
                    </AlertDescription>
                </Alert>
            }
            <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                handleSignUp()
              }}>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="relative w-full">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="new-password" type="text" placeholder="First Name" className="pl-10" required />
                    </div>
                    <div className="relative w-full">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          autoComplete="new-password" type="text" placeholder="Last Name" className="pl-10" required />
                    </div>
                </div>
                {/* <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="new-password" type="text" placeholder="Phone number" className="pl-10" required />
                </div> */}

                <div className="relative">
                  <div className="flex">
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="rounded-r-none border-r-0 pr-1 focus:ring-0"
                          type="button"
                        >
                          {phoneCountryCode.dialCode} ({phoneCountryCode.iso2})
                          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {typedCountries.map((country) => (
                                <CommandItem className=""
                                  key={country.iso2}
                                  value={`${country.iso2} ${country.name} ${country.dialCode}`}
                                  onSelect={() => {
                                    handleCountryChange({
                                      iso2: country.iso2,
                                      name: country.name,
                                      dialCode: country.dialCode,
                                    })
                                    setCountryOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      phoneCountryCode.iso2 === country.iso2 ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {country.name} ({country.dialCode})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="phone-number"
                      placeholder={`Enter phone number`}
                      value={phone}
                      autoComplete="new-password"
                      onChange={handlePhoneChange}
                      className={cn("flex-1 rounded-l-none", phoneError ? "border-red-500" : "")}
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                </div>


                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="new-password" type="email" placeholder="Email" className="pl-10" required />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if(e.target.value !== password) {
                        setIsError(true)
                        setError("password_mismatch")
                      }else{
                        setIsError(false)
                      }
                    }}
                    autoComplete="new-password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="pl-10 pr-10"
                    required
                  />
                  <CircleAlert className={`${password == confirmPassword ? "hidden" : "absolute"} right-10 top-2.5 h-5 w-5 text-red-400`} />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                checked={isTermsAccepted}
                onCheckedChange={(checked) => {
                  setIsTermsAccepted(checked === true)
                }}
                id="terms"
                required />
                <label htmlFor="terms" className="text-sm text-slate-500">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
              disabled={isLoading}
              className="w-full">
                {isLoading ? <Loader2 className='animate-spin' /> : "Sign in"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
