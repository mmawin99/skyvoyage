/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { AircraftModel, SubmitAircraftCost } from "@/types/type"
import { Check, Loader2, Plane, TriangleAlert } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import modelAircraft from "../../../../data/model_name.json"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { ScrollableSelectPopover } from "../../reusable/scrollableSelectPopover"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"

const aircraftModel = (airline:string):AircraftModel[]=>{
    return Object.keys(modelAircraft).map((key) => {
        return {
            model: key,
            model_name: modelAircraft[key as keyof typeof modelAircraft],
            airlineCode: airline
        }
    }).sort((a, b) => a.model.localeCompare(b.model))
}

interface EditAircraftCostSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddAircraftCost: (costData: SubmitAircraftCost, onSuccess: () => void, onError: () => void) => void
    onEditAircraftCost: (costData: SubmitAircraftCost, onSuccess: () => void, onError: () => void) => void
    isLoading: boolean
    carrier: {name:string, code:string}
    defaultValue: SubmitAircraftCost | null
}

export default function EditAircraftCostSheet({ 
    open, 
    onOpenChange, 
    onAddAircraftCost, 
    onEditAircraftCost, 
    isLoading, 
    carrier, 
    defaultValue 
}: EditAircraftCostSheetProps) {
    const [mode, setMode] = useState<"add" | "edit">("add")
    const { backend: backendURL }: BackendURLType = useBackendURL();
    
    const [modelOpen, setModelOpen] = useState<boolean>(false)
    const [selectedModel, setSelectedModel] = useState<AircraftModel | null>(null)
    const [costPerMile, setCostPerMile] = useState<string>("0")
    
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    // Reset form when closed
    useEffect(() => {
        if (!open) {
            setSelectedModel(null)
            setCostPerMile("0")
            setErrorSubmit("")
            setIsError(false)
        }
    }, [open])

    // Set form values when editing existing cost
    useEffect(() => {
        if (defaultValue) {
            setMode("edit")
            // Find the model in aircraftModel array
            const model = aircraftModel(carrier.code).find(m => m.model === defaultValue.model) || null
            setSelectedModel(model)
            setCostPerMile(defaultValue.costPerMile.toString())
        } else {
            setMode("add")
            setSelectedModel(null)
            setCostPerMile("0")
        }
    }, [defaultValue, carrier.code])

    const handleSubmit = useCallback(async () => {
        if (!selectedModel?.model) {
            toast.error("Please select an aircraft model")
            return
        }
        
        const parsedCost = parseFloat(costPerMile)
        if (isNaN(parsedCost) || parsedCost < 0) {
            toast.error("Please enter a valid cost per mile")
            return
        }

        setLoadingSubmit(true)
        
        const costData: SubmitAircraftCost = {
            model: selectedModel.model,
            ownerAirlineCode: carrier.code,
            costPerMile: parsedCost
        }

        if (mode === "add") {
            onAddAircraftCost(costData, handleSuccess, handleError)
        } else {
            onEditAircraftCost(costData, handleSuccess, handleError)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carrier.code, costPerMile, mode, onAddAircraftCost, onEditAircraftCost, selectedModel])

    const handleSuccess = () => {
        setLoadingSubmit(false)
        setErrorSubmit("")
        setIsError(false)
        onOpenChange(false)
        // Reset form
        setSelectedModel(null)
        setCostPerMile("0")
    }

    const handleError = () => {
        setLoadingSubmit(false)
        setErrorSubmit(`Failed to ${mode === "add" ? "add" : "update"} aircraft cost`)
        setIsError(true)
    }

    useEffect(() => {
        if (needSubmit) {
            handleSubmit()
            setNeedSubmit(false)
        }
        return () => setNeedSubmit(false)
    }, [needSubmit, handleSubmit])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg px-4">
                <SheetHeader className="mt-7">
                    <SheetTitle>{mode === "edit" ? "Edit" : "Add"} Aircraft Cost</SheetTitle>
                    <SheetDescription>
                        {mode === "edit" ? "Update" : "Add new"} operating cost for {carrier.name} ({carrier.code})&rsquo;s aircraft model.
                        <br /> Fill in the details below.
                    </SheetDescription>
                </SheetHeader>
                {isError || !carrier.name || !carrier.code ? (
                    <Alert variant="destructive" className="mb-4">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {!carrier.name || !carrier.code ? "Airline carrier isn't selected" : errorSubmit}
                        </AlertDescription>
                    </Alert>
                ) : null}
                <Separator className="my-4" />
                <div className="space-y-4">
                    {/* Model List */}
                    <div className="space-y-2">
                        <Label>Aircraft Model</Label>
                        {carrier.code ? (
                            <ScrollableSelectPopover<AircraftModel>
                                data={aircraftModel(carrier.code)}
                                value={selectedModel}
                                title="Select Aircraft Model"
                                placeholder="Select Aircraft Model"
                                pageSize={15}
                                disabled={mode === "edit"}
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
                                renderSelectedItem={(item) => (
                                    <div className="flex items-center gap-2">
                                        <Plane className="h-4 w-4" />
                                        ({item.model}) {item.model_name}
                                    </div>
                                )}
                                getKey={(item) => item.model}
                                getSearchValue={(item) => `${item.model_name} ${item.model}`}
                                onSelect={(item) => {
                                    setSelectedModel(item)
                                    setModelOpen(false)
                                }}
                            />
                        ) : (
                            <Button variant="outline" className="w-full cursor-not-allowed" disabled>
                                <Plane className="h-4 w-4 mr-2" />
                                Select Aircraft Model
                            </Button>
                        )}
                    </div>

                    {/* Cost Per Mile */}
                    <div className="space-y-2">
                        <Label htmlFor="costPerMile">Cost Per Mile (USD)</Label>
                        <Input
                            id="costPerMile"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter cost per mile"
                            value={costPerMile}
                            onChange={(e) => setCostPerMile(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            disabled={isLoading}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={() => setNeedSubmit(true)}
                            disabled={
                                isLoading ||
                                !carrier.name ||
                                !carrier.code ||
                                !selectedModel?.model ||
                                parseFloat(costPerMile) < 0 ||
                                isNaN(parseFloat(costPerMile))
                            }
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === "edit" ? "Updating" : "Adding"}...
                                </>
                            ) : (
                                `${mode === "edit" ? "Update" : "Add"} Cost`
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}