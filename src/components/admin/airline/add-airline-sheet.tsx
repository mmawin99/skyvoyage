import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SubmitAirline } from '@/types/type'
import { Loader2, TriangleAlert } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const AddAirlineSheet = ({
    open,
    onOpenChange,
    onAddAirline,
    onEditAirline,
    isLoading,
    defaultValue
}:{
    open:boolean,
    onOpenChange:React.Dispatch<React.SetStateAction<boolean>>,
    onAddAirline: (user: SubmitAirline,onSuccess: ()=> void, onError: ()=> void) => void,
    onEditAirline?: (user: SubmitAirline,onSuccess: ()=> void, onError: ()=> void) => void,
    isLoading:boolean,
    defaultValue: SubmitAirline | null
}) => {
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    const [mode, setMode] = useState<"add" | "edit">("add")

    const [airlineCode, setAirlineCode] = useState<string>("")
    const [airlineName, setAirlineName] = useState<string>("")

    useEffect(()=>{
        if(defaultValue){
            setMode("edit")
            setAirlineCode(defaultValue.airlineCode)
            setAirlineName(defaultValue.airlineName)
        }else{
            setMode("add")
            setAirlineCode("")
            setAirlineName("")
        }
    }, [defaultValue])
    useEffect(()=>{
        if(needSubmit){
            setNeedSubmit(false)
            if(mode === "add"){
                if(airlineCode.length === 0 || airlineName.length === 0){
                    setIsError(true)
                    setErrorSubmit("Please fill all the fields")
                    return
                }
                onAddAirline({
                    airlineCode,
                    airlineName
                }, ()=>{
                    onOpenChange(false)
                    setAirlineCode("")
                    setAirlineName("")
                }, ()=>{
                    setIsError(true)
                    setErrorSubmit("Something went wrong")
                })
            }else{
                if(airlineCode.length === 0 || airlineName.length === 0){
                    setIsError(true)
                    setErrorSubmit("Please fill all the fields")
                    return
                }
                onEditAirline?.({
                    airlineCode,
                    airlineName
                }, ()=>{
                    onOpenChange(false)
                    setAirlineCode("")
                    setAirlineName("")
                }, ()=>{
                    setIsError(true)
                    setErrorSubmit("Something went wrong")
                })
            }
        }
    }, [airlineCode, airlineName, mode, needSubmit, onAddAirline, onEditAirline, onOpenChange])
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg px-4">
                <SheetHeader className="mt-7">
                    <SheetTitle>{mode == "edit" ? "Edit " : "Add new"} Airline</SheetTitle>
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
                        <Label>Airline Code</Label>
                        <input
                            type="text"
                            value={airlineCode}
                            disabled={mode === "edit"}
                            onChange={(e) => setAirlineCode(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airline code"
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label>Airline Name</Label>
                        <input
                            type="text"
                            value={airlineName}
                            onChange={(e) => setAirlineName(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="Enter airline name"
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
                                airlineCode.length === 0 ||
                                airlineName.length === 0
                            }>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === "edit" ? "Edit" : "Add"}ing...
                            </>
                            ) : (
                            `${mode === "edit" ? "Edit" : "Add"} Airline`
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default AddAirlineSheet