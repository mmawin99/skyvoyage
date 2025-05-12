import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SubmitAirport } from '@/types/type'
import { Loader2, TriangleAlert } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const AddAirportSheet = ({
    open,
    onOpenChange,
    onAddAirport,
    onEditAirport,
    isLoading,
    defaultValue
}:{
    open:boolean,
    onOpenChange:React.Dispatch<React.SetStateAction<boolean>>,
    onAddAirport: (user: SubmitAirport,onSuccess: ()=> void, onError: ()=> void) => void,
    onEditAirport?: (user: SubmitAirport,onSuccess: ()=> void, onError: ()=> void) => void,
    isLoading:boolean,
    defaultValue: SubmitAirport | null
}) => {
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    const [mode, setMode] = useState<"add" | "edit">("add")

    const [airportCode, setAirportCode] = useState<string>("")
    const [airportName, setAirportName] = useState<string>("")
    const [airportCity, setAirportCity] = useState<string>("")
    const [airportCountry, setAirportCountry] = useState<string>("")
    const [latitude, setLatitude] = useState<number>(0)
    const [longitude, setLongitude] = useState<number>(0)
    const [altitude, setAltitude] = useState<number>(0)
    const [timezone, setTimezone] = useState<string>("")
    function isValidTimeZone(tz:string) {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
        } catch (ex) {
            console.error('Invalid timezone:', tz, ex);
            return false;
        }
    }
    useEffect(()=>{
        if(defaultValue){
            setMode("edit")
            setAirportCode(defaultValue.airportCode)
            setAirportName(defaultValue.name)
            setAirportCity(defaultValue.city)
            setAirportCountry(defaultValue.country)
            setLatitude(defaultValue.latitude)
            setLongitude(defaultValue.longitude)
            setAltitude(defaultValue.altitude)
            setTimezone(defaultValue.timezone)
        }else{
            setMode("add")
            setAirportCode("")
            setAirportName("")
            setAirportCity("")
            setAirportCountry("")
            setTimezone("")
            setLatitude(0)
            setLongitude(0)
            setAltitude(0)
        }
    }, [defaultValue])
    useEffect(()=>{
        if(needSubmit){
            setIsError(false)
            setErrorSubmit("")
            if(isValidTimeZone(timezone) === false){
                setIsError(true)
                setErrorSubmit("Invalid timezone")
                setNeedSubmit(false)
                return
            }
            setNeedSubmit(false)
            if(mode === "add"){
                if(airportCode.length === 0 || airportName.length === 0){
                    setIsError(true)
                    setErrorSubmit("Please fill all the fields")
                    return
                }
                console.log("Adding airport")
                onAddAirport({
                    airportCode,
                    name: airportName,
                    city: airportCity,
                    country: airportCountry,
                    latitude,
                    longitude,
                    altitude,
                    timezone
                }, ()=>{
                    onOpenChange(false)
                    setAirportCode("")
                    setAirportName("")
                    setAirportCity("")
                    setAirportCountry("")
                    setTimezone("")
                    setLatitude(0)
                    setLongitude(0)
                    setAltitude(0)
                }, ()=>{
                    setIsError(true)
                    setErrorSubmit("Something went wrong")
                })
            }else{
                if(airportCode.length === 0 || airportName.length === 0){
                    setIsError(true)
                    setErrorSubmit("Please fill all the fields")
                    return
                }
                console.log("Edit Airport")
                onEditAirport?.({
                    airportCode,
                    name: airportName,
                    city: airportCity,
                    country: airportCountry,
                    latitude,
                    longitude,
                    altitude,
                    timezone
                }, ()=>{
                    onOpenChange(false)
                    setAirportCode("")
                    setAirportName("")
                }, ()=>{
                    setIsError(true)
                    setErrorSubmit("Something went wrong")
                })
            }
        }
    }, [airportCity, airportCode, airportCountry, airportName, altitude, latitude, longitude, mode, needSubmit, onAddAirport, onEditAirport, onOpenChange, timezone])
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg px-4">
                <SheetHeader className="mt-7">
                    <SheetTitle>{mode == "edit" ? "Edit " : "Add new"} Airport</SheetTitle>
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
                    <div className='space-y-2'>
                        <Label>Airport Code</Label>
                        <Input
                            type="text"
                            value={airportCode}
                            disabled={mode === "edit"}
                            onChange={(e) => setAirportCode(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport code"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Airport Name</Label>
                        <Input
                            type="text"
                            value={airportName}
                            onChange={(e) => setAirportName(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport name"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Airport City</Label>
                        <Input
                            type="text"
                            value={airportCity}
                            onChange={(e) => setAirportCity(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport city"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Airport Country</Label>
                        <Input
                            type="text"
                            value={airportCountry}
                            onChange={(e) => setAirportCountry(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport country"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Latitude</Label>
                        <Input
                            type="number"
                            value={latitude}
                            onChange={(e) => setLatitude(Number(e.target.value))}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport latitude"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Longitude</Label>
                        <Input
                            type="number"
                            value={longitude}
                            onChange={(e) => setLongitude(Number(e.target.value))}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport longitude"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Altitude</Label>
                        <Input
                            type="number"
                            value={altitude}
                            onChange={(e) => setAltitude(Number(e.target.value))}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport altitude"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Timezone</Label>
                        <Input
                            type="text"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airport timezone"
                        />
                    </div>
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
                                airportCode.length === 0 ||
                                airportName.length === 0 ||
                                airportCity.length === 0 ||
                                airportCountry.length === 0 ||
                                latitude === 0 ||
                                longitude === 0 ||
                                altitude === 0
                            }>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === "edit" ? "Edit" : "Add"}ing...
                            </>
                            ) : (
                            `${mode === "edit" ? "Edit" : "Add"} Airport`
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default AddAirportSheet