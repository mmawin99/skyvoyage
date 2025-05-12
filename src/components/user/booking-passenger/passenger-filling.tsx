import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { CountryList } from '@/lib/country'
import { cn } from '@/lib/utils'
import { loadExistPassengerType, PassengerFillOut, searchSelectedRoutes } from '@/types/type'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, SearchX, TriangleAlert } from 'lucide-react'
import { NextRouter, useRouter } from 'next/router'
import React, { useState } from 'react'

const calculateAge = (dateOfBirthISO: string): number => {
    
    const birthDate = new Date(dateOfBirthISO);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
const diff2Date = (dateISO1: string, dateISO2: string): number => {
    const date1 = new Date(dateISO1);
    const date2 = new Date(dateISO2);
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
}
const diffDateInFuture = (dateISO: string): number => {
    const date1 = new Date();
    return diff2Date(date1.toISOString(), dateISO)
    // const date1 = new Date();
    // const date2 = new Date(dateISO);
    // return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
}
const PassengerFilling = ({
    selectedRoute,
    currentPassenger,
    setCurrentPassenger,
    updatePassengerFields,
    existPassenger,
    setAllComplete,
    firstPasssenger
}:{
    selectedRoute: searchSelectedRoutes,
    currentPassenger: number,
    setCurrentPassenger: React.Dispatch<React.SetStateAction<number>>,
    updatePassengerFields: (index: number, fields: Record<string, string>) => void
    setAllComplete: React.Dispatch<React.SetStateAction<boolean>>
    firstPasssenger: PassengerFillOut
    existPassenger: loadExistPassengerType[]
}) => {
    const [passportNum, setPassportNum] = useState<string>(firstPasssenger.passportNum)
    const [passportCountry, setpassportCountry] = useState<string>(firstPasssenger.passportCountry)
    const [passportExpiry, setpassportExpiry] = useState<string>(firstPasssenger.passportExpiry)
    const [titleName, setTitleName] = useState<string>(firstPasssenger.titleName)
    const [firstName, setFirstName] = useState<string>(firstPasssenger.firstName)
    const [lastName, setLastName] = useState<string>(firstPasssenger.lastName)
    const [dateOfBirth, setDateOfBirth] = useState<string>(firstPasssenger.dateOfBirth)
    const [nationality, setNationality] = useState<string>(firstPasssenger.nationality)
    const [nationalityOpen, setNationalityOpen] = useState<boolean>(false)
    const [issueCountryOpen, setIssueCountryOpen] = useState<boolean>(false)
    const router:NextRouter = useRouter()
    const [isError, setIsError] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [loadPassengerOpen, setLoadPassengerOpen] = useState<boolean>(false)
    const validate = (action: string) => {
        console.log("validate", action);
        setIsError(false)
        const updatedFields = {
            titleName,
            passportNum,
            passportCountry,
            passportExpiry,
            firstName,
            lastName,
            dateOfBirth,
            nationality,
            status: "FILLED",
        };
        const passengerAge = calculateAge(dateOfBirth)
        const passengerAgeRange = selectedRoute?.passenger?.[currentPassenger]?.ageRange || "Adult"
        //Check if passenger isn't exist in the list of passenger
        if((selectedRoute?.passenger ?? []).filter(i=>i.passportNum == passportNum).length > 0){
            setIsError(true)
            setError("passenger_exist")
            return;
        }
        if(passengerAgeRange == "Adult" && passengerAge < 12){
            setIsError(true)
            setError("adult_age_error")
            return;
        }
        if(passengerAgeRange == "Children" && (passengerAge < 2 || passengerAge > 12)){
            setIsError(true)
            setError("children_age_error")
            return;
        }
        if(passengerAgeRange == "Infant" && (passengerAge < 0 || passengerAge > 2)){
            setIsError(true)
            setError("infant_age_error")
            return;
        }
        // check passport expire with 60 days from selectedRoute?.queryString?.returnDateStr if exist else selectedRoute?.queryString?.departureDateStr
        const selectedDateCheck = selectedRoute?.queryString?.returnDateStr || selectedRoute?.queryString?.departDateStr
        if(selectedDateCheck === undefined){
            setIsError(true)
            setError("query_empty")
            return;
        }
        //regex english, space, number
        const regex = /^[a-zA-Z0-9 ]+$/
        const passportRegex = /^[a-zA-Z0-9]{9}$/
        if(!passportRegex.test(passportNum)){
            setIsError(true)
            setError("regex_passportNum")
            return;
        }
        if(!regex.test(firstName) || firstName.length < 2){
            setIsError(true)
            setError("regex_firstName")
            return;
        }
        if(!regex.test(lastName) || lastName.length < 2){
            setIsError(true)
            setError("regex_lastName")
            return;
        }

        if(diff2Date(selectedDateCheck, passportExpiry) < 60){
            setIsError(true)
            setError("passport_expiry_error_onboard")
            return;
        }
        
        if(diffDateInFuture(passportExpiry) < 60){
            setIsError(true)
            setError("passport_expiry_error")
            return;
        }
        if(passengerAge < 0){
            setIsError(true)
            setError("invalid_dob")
            return;
        }
        if(!(passportCountry === "" ||
            passportExpiry === "" ||
            passportNum === "" ||
            firstName === "" ||
            lastName === "" ||
            dateOfBirth === "" ||
            nationality === "")){
            updatePassengerFields(currentPassenger, updatedFields);
        }else{
            if(action == "next"){
                setIsError(true)
                setError("information_empty")
                return;
            }
        }
    
        if (action === "next") {
            if (currentPassenger === (selectedRoute?.passenger?.length ?? 0) - 1) {
                setAllComplete(true);
                console.log("next passenger details, 1");
            } else {
                console.log("next passenger details, 2");
                const nextPassenger = selectedRoute.passenger?.[currentPassenger + 1];
                setCurrentPassenger((prev) => prev + 1);
                setPassportNum(nextPassenger?.passportNum || "");
                setpassportCountry(nextPassenger?.passportCountry || "");
                setpassportExpiry(nextPassenger?.passportExpiry || "");
                setFirstName(nextPassenger?.firstName || "");
                setLastName(nextPassenger?.lastName || "");
                setDateOfBirth(nextPassenger?.dateOfBirth || "");
                setNationality(nextPassenger?.nationality || "");
            }
        } else if (action === "back") {
            setAllComplete(false)
            if (currentPassenger === 0) {
                console.log("back passenger details, 1");
            } else {
                console.log("back passenger details, 2");
                const previousPassenger = selectedRoute.passenger?.[currentPassenger - 1];
                setCurrentPassenger((prev) => prev - 1);
                setPassportNum(previousPassenger?.passportNum || "");
                setpassportCountry(previousPassenger?.passportCountry || "");
                setpassportExpiry(previousPassenger?.passportExpiry || "");
                setFirstName(previousPassenger?.firstName || "");
                setLastName(previousPassenger?.lastName || "");
                setDateOfBirth(previousPassenger?.dateOfBirth || "");
                setNationality(previousPassenger?.nationality || "");
            }
        }
    };
    if(selectedRoute.passenger === undefined || selectedRoute.passenger.length === 0){   
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <SearchX className="h-16 w-16 mb-4 text-red-600" />
                <span className="text-3xl font-bold mb-4">booking not found</span>
                <p className="text-lg text-gray-600">Find your perfect journey before booking.</p>
                <div className="flex flex-row gap-2">
                    <Button variant={"outline"} onClick={() => router.push("/")}>Go to Home</Button>
                </div>
            </div>
        )
    }
    return (
        <div className='flex flex-col items-end justify-center gap-4'>
            <Card className='w-full'>
                <CardHeader className='flex flex-row justify-between'>
                    <div>
                        <CardTitle className="text-lg font-semibold">{selectedRoute.passenger?.[currentPassenger].label}</CardTitle>
                        <CardDescription>Please fill in passenger details</CardDescription>
                    </div>
                    <div>
                        <Popover open={loadPassengerOpen} onOpenChange={setLoadPassengerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={loadPassengerOpen}>
                                    Load Exist Passenger
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side='bottom' sideOffset={10} className="p-0">
                                <Command>
                                <CommandInput placeholder="Search passenger..." />
                                <CommandList>
                                    <CommandEmpty>No passenger found.</CommandEmpty>
                                    <CommandGroup>
                                        {
                                            existPassenger.filter(i=>{
                                                return i.ageRange == selectedRoute.passenger?.[currentPassenger].ageRange
                                            }).map((passenger) => (
                                                <CommandItem className=""
                                                key={passenger.passportNum}
                                                value={`${passenger.passportNum} ${passenger.firstName} ${passenger.lastName}`}
                                                onSelect={() => {
                                                    setPassportNum(passenger.passportNum)
                                                    setpassportCountry(passenger.passportCountry)
                                                    setpassportExpiry(passenger.passportExpiry)
                                                    setFirstName(passenger.firstName)
                                                    setLastName(passenger.lastName)
                                                    setDateOfBirth(passenger.dateOfBirth)
                                                    setNationality(passenger.nationality)
                                                    setTitleName(passenger.title)
                                                    setLoadPassengerOpen(false)
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    passportNum === passenger.passportNum ? "opacity-100" : "opacity-0",
                                                    )}
                                                />
                                                {passenger.firstName} {passenger.lastName} ({passenger.passportNum})
                                                </CommandItem>
                                            ))
                                        }
                                    </CommandGroup>
                                </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    {
                        isError && <Alert className='mb-4' variant={"destructive"}>
                            <TriangleAlert />
                            <AlertTitle>Error!</AlertTitle>
                            <AlertDescription>
                                {
                                    error && 
                                    error == "regex_passportNum" ? "Passport number must be 9 characters and only contain letters number." :
                                    error == "regex_firstName" ? "First name must be at least 2 characters and only contain letters number and space." :
                                    error == "regex_lastName" ? "Last name must be at least 2 characters and only contain letters number and space." :
                                    error == "passenger_exist" ? "Passenger already exist in the booking. (or maybe you try to use same passport number)" :
                                    error == "query_empty" ? "The system malfunctioned because the session was modified by a user without permission to modify it." :
                                    error == "information_empty" ? "Information can not be empty." :
                                    error == "invalid_dob" ? "Invalid Date of Birth." :
                                    error == "adult_age_error" ? "Adult age must be greater than or equal to 12" :
                                    error == "children_age_error" ? "Children age must be in range 2 to 11" :
                                    error == "infant_age_error" ? "Infant age must be less than 2" :
                                    error == "passport_expiry_error_onboard" ? "Passport that will be expired in 60 days on travelling date can not travel." :
                                    error == "passport_expiry_error" ? "Passport that will be expired in 60 days can not travel." :
                                    ""
                                }
                            </AlertDescription>
                        </Alert>
                    }
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`titlename-${currentPassenger}`}>
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Select value={titleName} onValueChange={setTitleName}>
                                <SelectTrigger className="w-full">{titleName ? titleName: "Choose Your title"}</SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Mr'>Mr</SelectItem>
                                    <SelectItem value='Mrs'>Mrs</SelectItem>
                                    <SelectItem value='Ms'>Ms</SelectItem>
                                    <SelectItem value='Miss'>Miss</SelectItem>
                                    <SelectItem value='Professor'>Professor</SelectItem>
                                    <SelectItem value='Doctor'>Doctor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`firstName-${currentPassenger}`}>
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id={`firstName-${currentPassenger}`}
                                value={firstName || ""}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="As shown on passport"
                            />
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor={`lastName-${currentPassenger}`}>
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id={`lastName-${currentPassenger}`}
                            value={lastName || ""}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="As shown on passport"
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor={`dateOfBirth-${currentPassenger}`}>
                                Date of Birth <span className="text-red-500">*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateOfBirth && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateOfBirth ? format(new Date(dateOfBirth), "PPP") : "Select date"}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                                    defaultMonth={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                                    onSelect={(date) => setDateOfBirth(date?.toISOString() || "")}
                                    disabled={(date) => date > new Date()}
                                    
                                />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`nationality-${currentPassenger}`}>
                                Nationality <span className="text-red-500">*</span>
                            </Label>
                            <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full flex flex-row justify-between"
                                    type="button"
                                    >
                                    {!nationality && "No Nationality Selected"} {nationality && "("+nationality+")"} {nationality && CountryList.filter(i=>i.iso2 == nationality)?.[0]?.name} 
                                    <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                                        {CountryList.map((country) => (
                                            <CommandItem className=""
                                            key={country.iso2}
                                            value={`${country.iso2} ${country.name}`}
                                            onSelect={() => {
                                                setNationality(country.iso2)
                                                setNationalityOpen(false)
                                            }}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                nationality === country.iso2 ? "opacity-100" : "opacity-0",
                                                )}
                                            />
                                            {country.name} ({country.iso2})
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2 my-4">
                        <h3 className="text-lg font-medium">Passport Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`passportNum-${currentPassenger}`}>
                                Passport Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                id={`passportNum-${currentPassenger}`}
                                value={passportNum || ""}
                                onChange={(e) => setPassportNum(e.target.value)}
                                placeholder="9 characters"
                                maxLength={9}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`passportCountry-${currentPassenger}`}>
                                Issuing Country <span className="text-red-500">*</span>
                                </Label>
                                <Popover open={issueCountryOpen} onOpenChange={setIssueCountryOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full flex flex-row justify-between"
                                        type="button"
                                        >
                                        {!passportCountry && "No Country Selected"} {passportCountry && "("+passportCountry+")"} {passportCountry && CountryList.filter(i=>i.iso2 == passportCountry)?.[0]?.name} 
                                        <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                        <CommandInput placeholder="Search country..." />
                                        <CommandList>
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                                            {CountryList.map((country) => (
                                                <CommandItem className=""
                                                key={country.iso2}
                                                value={`${country.iso2} ${country.name}`}
                                                onSelect={() => {
                                                    setpassportCountry(country.iso2)
                                                    setIssueCountryOpen(false)
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    passportCountry === country.iso2 ? "opacity-100" : "opacity-0",
                                                    )}
                                                />
                                                {country.name} ({country.iso2})
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`passportExpiry-${currentPassenger}`}>
                                Expiry Date <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !passportExpiry && "text-muted-foreground",
                                        )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {passportExpiry ? format(new Date(passportExpiry), "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={passportExpiry ? new Date(passportExpiry) : undefined}
                                        defaultMonth={passportExpiry ? new Date(passportExpiry) : new Date()}
                                        onSelect={(date) => setpassportExpiry(date?.toISOString() || "")}
                                        disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className='flex flex-row gap-2'>
                <Button variant="destructive" className={`${currentPassenger === 0 ? "cursor-not-allowed hidden" : "cursor-pointer"}`} onClick={() => validate("back")} disabled={currentPassenger === 0}>            
                    Previous Passenger
                </Button>
                <Button variant="default" className={`${currentPassenger === selectedRoute.passenger.length - 1 ? "cursor-not-allowed hidden" : "cursor-pointer"}`} onClick={() => validate("next")} disabled={currentPassenger === selectedRoute.passenger.length - 1}>    
                    Next Passenger
                </Button>
                <Button variant="default" className={`${!(currentPassenger === selectedRoute.passenger.length - 1) && "hidden"} cursor-pointer`} onClick={() => validate("next")}>    
                    Complete
                </Button>
            </div>
        </div>
    )
}

export default PassengerFilling