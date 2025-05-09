/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CalendarIcon, Check, ChevronsUpDown, Loader2, MapIcon, Plane, Terminal, TriangleAlert } from "lucide-react"
import { AircraftModel, AircraftRegistration, Airline, Airport, Flight, SeatMapVersionType, SubmitAircraft, SubmitFlight } from "@/types/type"
import { DebouncedSearch } from "../../reusable/search"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ScrollableSelectPopover } from "@/components/reusable/scrollableSelectPopover"
import modelAircraft from "../../../../data/model_name.json"

const aircraftModel = (airline:string):AircraftModel[]=>{
    return Object.keys(modelAircraft).map((key) => {
        return {
            model: key,
            model_name: modelAircraft[key as keyof typeof modelAircraft],
            airlineCode: airline
        }
    }).sort((a, b) => a.model.localeCompare(b.model))
}

interface AddAircraftSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddAircraft: (flight: SubmitAircraft, onSuccess: () => void, onError: () => void) => void
    isLoading: boolean
    carrier: {name:string, code:string}
}

export default function AddAircraftSheet({ open, onOpenChange, onAddAircraft, isLoading, carrier }: AddAircraftSheetProps) {
    const [scheduleType, setScheduleType] = useState("single")
    
    const { backend: backendURL }: BackendURLType = useBackendURL();

    const [registration, setRegistration] = useState<string>("")
    
    const [modelOpen, setModelOpen] = useState<boolean>(false)
    const [selectedModel, setSelectedModel] = useState<AircraftModel | null>(null)

    const [seatmapId, setSeatmapId] = useState<SeatMapVersionType | null>(null)
    const [seatmapResults, setSeatmapResults] = useState<SeatMapVersionType[]>([])
    const [loadingSeatmap, setLoadingSeatmap] = useState<boolean>(false)
    // For recurring schedules
  
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    const handleSubmit = useCallback(async ()=>{
        if(!registration || !selectedModel?.model || !seatmapId) {
            toast.error("Please fill in all the fields")
            return
        }
        onAddAircraft({
            aircraftId: registration,
            model: selectedModel?.model,
            seatMapId: seatmapId?.id,
            ownerAirlineCode: carrier.code
        },  () => {
            setLoadingSubmit(false)
            setErrorSubmit("")
            setIsError(false)
            onOpenChange(false)
            setSelectedModel(null)
            setSeatmapId(null)
            setRegistration("")
        }, () => {
            setLoadingSubmit(false)
            setErrorSubmit("Failed to add flight")
            setIsError(true)
        })
    }, [carrier.code, onAddAircraft, onOpenChange, registration, seatmapId, selectedModel?.model])
    
    useEffect(() => {
        if(needSubmit){
            handleSubmit()
            setNeedSubmit(false)
        }
        return () => setNeedSubmit(false)

    }, [needSubmit, handleSubmit])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg px-4">
            <SheetHeader className="mt-7">
                <SheetTitle>Add New Aircraft</SheetTitle>
                <SheetDescription>Add a new Aircraft for {carrier.name} ({carrier.code})&rsquo;s fleets. <br /> Fill in the details below.</SheetDescription>
            </SheetHeader>
                {isError || !carrier.name || !carrier.code ? (
                <Alert variant="destructive" className="mb-4">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{!carrier.name || !carrier.code ? "Airline carrier isn't selected" : errorSubmit}</AlertDescription>
                </Alert>
                ): null}
                <Separator className="" />
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="registration">Registration</Label>
                        <Input id="registration" type="text" placeholder="Enter Aircraft Registration" value={registration} onChange={(e) => setRegistration(e.target.value)} />
                    </div>

                    {/* Model List */}
                    <Label>Aircraft Model</Label>
                    {!(!carrier.code && !carrier.code) ?
                        <ScrollableSelectPopover<AircraftModel>
                            data={aircraftModel(carrier.code)}
                            value={selectedModel}
                            title="Select Aircraft Model"
                            placeholder="Select Aircraft Model"
                            pageSize={15}
                            renderItem={(item, selected) => (
                                    <div className="flex flex-row gap-2">
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            selected ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                        ({item.model}) {item.model_name}
                                    </div>
                            )}
                            renderSelectedItem ={(item) => (
                                <div className="flex items-center gap-2">
                                    <Plane className="h-4 w-4" />
                                    ({item.model}) {item.model_name}
                                </div>
                            )}
                            getKey ={(item) => item.model}
                            getSearchValue={(item) => `${item.model_name} ${item.model}`}
                            onSelect={(item) => {
                                setSelectedModel(item)
                                setModelOpen(false)
                            }}
                        /> :
                        <Button variant="outline" className="w-full cursor-not-allowed" disabled>
                            <Plane className="h-4 w-4 mr-2" />
                            Select Aircraft Model
                        </Button>
                    }
                    {/* seatmap */}

                    {
                        selectedModel &&
                        <DebouncedSearch<SeatMapVersionType>
                            title="Aircraft Seatmap"
                            Icon={MapIcon}
                            selected={seatmapId}
                            onSelect={setSeatmapId}
                            requestMethod="GET"
                            results={seatmapResults}
                            setResults={setSeatmapResults}
                            loading={loadingSeatmap}
                            setLoading={setLoadingSeatmap}
                            loadBefore={true}
                            enableSearch={false}
                            dependent={selectedModel}
                            fetchUrl={(q) => `${backendURL}/autocomplete/seatmap/${carrier.code}/${selectedModel?.model}`}
                            renderItem={(seatmap) => (
                                <div className="flex flex-row gap-2">
                                    <span>{selectedModel?.model_name}</span> 
                                    <span>Version: {seatmap.version}</span>
                                </div>
                            )}
                            renderSelectedItem={(seatmap) => (
                                <div className="flex flex-row gap-2">
                                    <span>{selectedModel?.model_name}</span> 
                                    <span>Version: {seatmap.version}</span>
                                </div>
                            )}
                        /> 
                        }
                        <div className="flex justify-end gap-2">
                            <Button variant="outline"
                                className="cursor-pointer"
                                disabled={
                                    isLoading ||
                                    !carrier.name ||
                                    !carrier.code ||
                                    !registration ||
                                    !selectedModel?.model ||
                                    !seatmapId
                                }
                                onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="cursor-pointer"
                                onClick={() => setNeedSubmit(true)}
                                disabled={
                                    isLoading ||
                                    !carrier.name ||
                                    !carrier.code ||
                                    !registration ||
                                    !selectedModel?.model ||
                                    !seatmapId
                                }>
                                {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                                ) : (
                                "Add Aircraft"
                                )}
                            </Button>
                        </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
