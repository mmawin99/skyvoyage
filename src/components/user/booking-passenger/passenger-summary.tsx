import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { countryCodeToName } from '@/lib/country'
import { searchSelectedRoutes } from '@/types/type'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'

const PassengerSummary = ({
    selectedRoute,
    onPrevious,
    onEdit,
    onComplete
}:{
    selectedRoute: searchSelectedRoutes
    onPrevious: () => void
    onComplete: () => void
    onEdit: (index:number)=>void
}) => {
    return (
        <>
            <Card >
                <CardHeader className='flex flex-row items-center justify-start gap-2'>
                    <Button variant={"default"} size={"sm"} onClick={onPrevious}>
                        <ArrowLeft className='h-4 w-4' /> Back
                    </Button>
                    <CardTitle className='text-lg font-semibold'>Passenger Summary</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-4'>
                    <div className='grid grid-cols-3 col-span-2 mb-3 border-b-[1px] border-b-slate-600 pb-2'>
                    {
                        selectedRoute.queryString.passengersStr.split(",").map((passenger, index) => (  
                            <div key={index} className='flex flex-row gap-2 text-sm place-self-center'>
                                <span className='text-base font-normal'>{passenger}</span>
                                <span className='font-semibold tracking-tighter text-base'>{["Adult","Children","Infant"][index]}</span>
                            </div>
                        ))
                    }
                    </div>
                    {
                        selectedRoute.passenger?.map((passenger, index) => {
                            return (
                                <Card key={`passenger-summarize-${index}`} className='col-span-2 md:col-span-1'>
                                    <CardContent className='flex flex-col gap-2'>
                                        <Collapsible>
                                            <CollapsibleTrigger className='group flex flex-row gap-2 justify-start items-center'>
                                                <Avatar className='w-10 h-10 md:w-12 md:h-12'>
                                                    <AvatarFallback className="bg-slate-500 text-white">
                                                        {passenger.firstName.charAt(0).toUpperCase()}{passenger.lastName.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className='text-lg font-semibold tracking-tighter'>{passenger.label}</span>
                                                <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180 transition-transform text-muted-foreground" />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className='mt-2 ml-4 border-l-2 border-l-slate-300 pl-4'>
                                                <div className='flex flex-col'>
                                                    <div className='flex flex-row gap-2'>
                                                        <span className='font-semibold tracking-tighter'>Full name:</span>
                                                        <span>{passenger.titleName} {passenger.firstName} {passenger.lastName}</span>
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <span className='font-semibold tracking-tighter'>Date of Birth:</span>
                                                        <span>{new Date(passenger.dateOfBirth).toDateString()}</span>
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <span className='font-semibold tracking-tighter'>Nationality:</span>
                                                        <span>{countryCodeToName[passenger.nationality as keyof typeof countryCodeToName]}</span>
                                                    </div>
                                                    <Separator className='my-2' />
                                                    <div className='flex flex-row gap-2'>
                                                        <span className='font-semibold tracking-tighter'>Passport Number:</span>
                                                        <span>{passenger.passportNum}</span>
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <span className='font-semibold tracking-tighter'>Expire Date:</span>
                                                        <span>{new Date(passenger.passportExpiry).toDateString()}</span>
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <span className='font-semibold tracking-tighter'>Issuing Country:</span>
                                                        <span>{countryCodeToName[passenger.passportCountry as keyof typeof countryCodeToName]}</span>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                        <Button variant={"outline"} className='w-full mt-4' onClick={() => {
                                            console.log("Edit passenger", passenger, index)
                                            onEdit(index)
                                        }}>Edit</Button>
                                    </CardContent>
                                </Card>    
                            )
                        })
                    }
                </CardContent>
            </Card>
            <Button variant={"default"} className="w-full mt-4 cursor-pointer" onClick={onComplete}>
                <div className="flex items-center gap-2">   
                    <span>Customize your journey</span>
                    <ArrowRight className="h-4 w-4" />
                </div>
            </Button>
        </>    
    )
}

export default PassengerSummary