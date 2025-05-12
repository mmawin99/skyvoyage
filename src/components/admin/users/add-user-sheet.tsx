import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { adminPermission, Country, SubmitAdmin, SubmitEditAdminProps, SubmitEditUserProps, SubmitUser } from '@/types/type'
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js'
import { Check, ChevronsUpDown, Loader2, TriangleAlert } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { CountryList } from "@/lib/country"
import { cn } from '@/lib/utils'
const typedCountries = CountryList;

const AddUserSheet = ({
    open,
    userKind,
    onOpenChange,
    onAddUser,
    onEditUser,
    isLoading,
    defaultValue
}:{
    open:boolean,
    onOpenChange:React.Dispatch<React.SetStateAction<boolean>>,
    userKind: "admin" | "user",
    onAddUser: (user: SubmitAdmin | SubmitUser) => void,
    onEditUser?: (user: SubmitAdmin | SubmitUser) => void,
    isLoading:boolean,
    defaultValue: SubmitEditUserProps | SubmitEditAdminProps | null
}) => { 
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    const [mode, setMode] = useState<"add" | "edit">("add")

    const [id, setId] = useState<string>("")

    const [submitAdminUsername, setSubmitAdminUsername] = useState<string>("")
    const [submitAdminPassword, setSubmitAdminPassword] = useState<string>("")
    const [submitAdminPermission, setSubmitAdminPermission] = useState<adminPermission>("SUPER")

    const [SubmitUserFirstName, setSubmitUserFirstName] = useState<string>("")
    const [SubmitUserLastName, setSubmitUserLastName] = useState<string>("")
    const [SubmitUserEmail, setSubmitUserEmail] = useState<string>("")
    const [SubmitUserPassword, setSubmitUserPassword] = useState<string>("")
    //Only for user, visible on edit mode
    const [SubmitUserRegisterDate, setSubmitUserRegisterDate] = useState<string>("")

    const [SubmitUserPhone, setSubmitUserPhone] = useState<string>("")
    const [phoneError, setPhoneError] = useState<string>("")
    const [countryOpen, setCountryOpen] = useState<boolean>(false)
    const [phoneCountryCode, setPhoneCountryCode] = useState<Country>({
        iso2: "TH",
        name: "Thailand",
        dialCode: "+66",
    })
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSubmitUserPhone(value)
        const phoneNumber = parsePhoneNumberFromString(value, phoneCountryCode.iso2 as CountryCode); // 'TH', 'US', etc.
        if (!phoneNumber || !phoneNumber.isValid()) {
            setIsError(true)
            setErrorSubmit(`phone_invalid`);
            console.log("Invalid phone number for country:", phoneCountryCode.name);
            setPhoneError("Invalid phone number")
        }else{
            setIsError(false)
            setErrorSubmit("")
            console.log("Valid phone number for country:", phoneCountryCode.name, phoneNumber.formatInternational());
            setPhoneError("")
        }
    }
  
    const handleCountryChange = (country:Country) => {
        setPhoneCountryCode(country)
    }

    useEffect(() => {
        if (defaultValue != null) {
            console.log("Mode is edit");
            // console.log("defaultValue", defaultValue)
            if (userKind === "admin") {
                setSubmitAdminUsername((defaultValue as SubmitEditAdminProps).username)
                setSubmitAdminPassword((defaultValue as SubmitEditAdminProps).password)
                setSubmitAdminPermission((defaultValue as SubmitEditAdminProps).permission)
                setId((defaultValue as SubmitEditAdminProps).id)
            } else {
                setSubmitUserFirstName((defaultValue as SubmitEditUserProps).firstname)
                setSubmitUserLastName((defaultValue as SubmitEditUserProps).lastname)
                setSubmitUserEmail((defaultValue as SubmitEditUserProps).email)
                setSubmitUserPassword((defaultValue as SubmitEditUserProps).password)
                setSubmitUserPhone((defaultValue as SubmitEditUserProps).phone)
                setId((defaultValue as SubmitEditUserProps).uuid)

            }
            setMode("edit")
        }else{
            setSubmitAdminUsername("")
            setSubmitAdminPassword("")
            setSubmitAdminPermission("SUPER")
            setSubmitUserFirstName("")
            setSubmitUserLastName("")
            setSubmitUserEmail("")
            setSubmitUserPassword("")
            setSubmitUserPhone("")
            setId("")
            setSubmitUserRegisterDate("")
            setPhoneCountryCode({
                iso2: "TH",
                name: "Thailand",
                dialCode: "+66",
            })
            console.log("Mode is add");
            setMode("add")
        }
    }, [defaultValue, userKind])

    useEffect(() => {
        if (needSubmit && mode === "add") {
            if (userKind === "admin") {
                const adminUser: SubmitAdmin = {
                    username: submitAdminUsername,
                    password: submitAdminPassword,
                    permission: submitAdminPermission
                }
                onAddUser(adminUser)
            } else {
                const user: SubmitUser = {
                    firstname: SubmitUserFirstName,
                    lastname: SubmitUserLastName,
                    email: SubmitUserEmail,
                    password: SubmitUserPassword,
                    phone: SubmitUserPhone
                }
                onAddUser(user)
            }
            setNeedSubmit(false)
        }else if (needSubmit && mode === "edit") {
            if (userKind === "admin") {
                const adminUser: SubmitEditAdminProps = {
                    id: id,
                    username: submitAdminUsername,
                    password: submitAdminPassword,
                    permission: submitAdminPermission
                }
                onEditUser?.(adminUser)
            } else {
                const user: SubmitEditUserProps = {
                    uuid: id,
                    firstname: SubmitUserFirstName,
                    lastname: SubmitUserLastName,
                    email: SubmitUserEmail,
                    password: SubmitUserPassword,
                    phone: SubmitUserPhone,
                    registerDate: SubmitUserRegisterDate
                }
                onEditUser?.(user)
            }
            setNeedSubmit(false)
        }
    }, [needSubmit, SubmitUserEmail, SubmitUserFirstName, SubmitUserLastName, SubmitUserPassword, SubmitUserPhone, onAddUser, submitAdminPassword, submitAdminPermission, submitAdminUsername, userKind, mode, id, onEditUser, SubmitUserRegisterDate])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg px-4">
                <SheetHeader className="mt-7">
                    <SheetTitle>{mode == "edit" ? "Edit " : "Add new"} {userKind == "admin" ? "admin user" : "user"}</SheetTitle>
                    <SheetDescription>Fill in the details below.</SheetDescription>
                </SheetHeader>
                {isError ? (
                <Alert variant="destructive" className="mb-4">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorSubmit}</AlertDescription>
                </Alert>
                ): null}
                <Separator className="" />
                <div className="space-y-4">
                    {
                        userKind === "admin" ? (
                            <>
                                <div className='space-y-2'>
                                    <Label>Admin Username</Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter admin username"
                                        value={submitAdminUsername}
                                        onChange={(e) => setSubmitAdminUsername(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Admin Password</Label>
                                    {
                                        mode === "edit" && (
                                            <span className='text-destructive text-sm'>* Leave it encoded string, if you don&rsquo;t want to change.</span>
                                        )
                                    }
                                    <Input 
                                        type="text"
                                        placeholder="Enter admin password"
                                        value={submitAdminPassword}
                                        onChange={(e) => setSubmitAdminPassword(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Admin Permission</Label>
                                    <Select value={submitAdminPermission} onValueChange={(e) => setSubmitAdminPermission(e as adminPermission)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select permission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SUPER">Super Admin</SelectItem>
                                            <SelectItem value="DATA_ENTRY">Data Admin</SelectItem>
                                            <SelectItem value="USER">User Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : 
                        (
                            <>
                                <div className='space-y-2'>
                                    <Label>Email</Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter user email"
                                        value={SubmitUserEmail}
                                        onChange={(e) => setSubmitUserEmail(e.target.value)}
                                    />
                                </div>
                                {/* password */}

                                <div className='space-y-2'>
                                    <Label>Password</Label>
                                    {
                                        mode === "edit" && (
                                            <span className='text-destructive text-sm'>* Leave it encoded string, if you don&rsquo;t want to change.</span>
                                        )
                                    }
                                    <Input 
                                        type="text"
                                        placeholder="Enter user password"
                                        value={SubmitUserPassword}
                                        onChange={(e) => setSubmitUserPassword(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>First Name</Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter user first name"
                                        value={SubmitUserFirstName}
                                        onChange={(e) => setSubmitUserFirstName(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Last Name</Label>
                                    <Input 
                                        type="text"
                                        placeholder="Enter user last name"
                                        value={SubmitUserLastName}
                                        onChange={(e) => setSubmitUserLastName(e.target.value)}
                                    />
                                </div>
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
                                        value={SubmitUserPhone}
                                        autoComplete="new-password"
                                        onChange={handlePhoneChange}
                                        className={cn("flex-1 rounded-l-none", phoneError ? "border-red-500" : "")}
                                        />
                                    </div>
                                    {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                                </div>
                                {
                                    mode === "edit" && (
                                        <div className='space-y-2'>
                                            <Label>Register Date</Label>
                                            <Input 
                                                type="datetime-local"
                                                placeholder="Enter user register date"
                                                value={SubmitUserRegisterDate}
                                                onChange={(e) => setSubmitUserRegisterDate(e.target.value)}
                                            />
                                        </div>
                                    )
                                }
                            </>
                        )
                    }
                    <div className="flex justify-end gap-2">
                        <Button variant="outline"
                            className="cursor-pointer"
                            disabled={
                                isLoading
                            }
                            onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={() => setNeedSubmit(true)}
                            disabled={
                                isLoading ||
                                (userKind === "admin" && (
                                    submitAdminUsername === "" ||
                                    submitAdminPassword === ""
                                )) ||
                                (userKind === "user" && (
                                    SubmitUserFirstName === "" ||
                                    SubmitUserLastName === "" ||
                                    SubmitUserEmail === "" ||
                                    SubmitUserPassword === "" ||
                                    SubmitUserPhone === ""
                                ))
                            }>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === "edit" ? "Edit" : "Add"}ing...
                            </>
                            ) : (
                            `${mode === "edit" ? "Edit" : "Add"}${userKind === "admin" ? " Admin user" : " User"}`
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default AddUserSheet