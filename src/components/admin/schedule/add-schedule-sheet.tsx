/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { CalendarIcon, Loader2, Terminal, TriangleAlert } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { AircraftModel, AircraftRegistration, Airline, Flight, SubmitSchedule } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { DebouncedSearch } from "../../reusable/search"
// import { Card, CardContent, CardHeader } from "../ui/card"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import modelAircraft from "../../../../data/model_name.json"

interface AddScheduleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddFlight: (flight: SubmitSchedule, onSuccess: () => void, onError: () => void) => void
  isLoading: boolean,
  defaultValue?: SubmitSchedule | null
  defaultDepartAirport?: string
  defaultArriveAirport?: string
  handleEditSchedule: (flights: SubmitSchedule)=>void
}

export default function AddScheduleSheet({ open, onOpenChange, onAddFlight, isLoading,defaultValue , handleEditSchedule,
defaultDepartAirport,
defaultArriveAirport

 }: AddScheduleSheetProps) {
  const [scheduleType, setScheduleType] = useState("single")
  const { backend: backendURL }: BackendURLType = useBackendURL();
  
  const [mode, setMode] = useState<"add" | "edit">("add")

  const [selectedCarrier, setSelectedCarrier] = useState<Airline>()
  const [carriers, setCarriers] = useState<Airline[]>([])
  const [loadingCarrier, setLoadingCarrier] = useState<boolean>(false)

  const [selectedFlight, setSelectedFlight] = useState<Flight>()
  const [carrierFlights, setCarrierFlights] = useState<Flight[]>([])
  const [loadingFlight, setLoadingFlight] = useState<boolean>(false)

  const [selectedModel, setSelectedModel] = useState<AircraftModel>()
  const [aircraftModels, setAircraftModels] = useState<AircraftModel[]>([])
  const [loadingModel, setLoadingModel] = useState<boolean>(false)

  const [selectedRegistration, setSelectedRegistration] = useState<AircraftRegistration>()
  const [aircraftRegistrations, setAircraftRegistrations] = useState<AircraftRegistration[]>([])
  const [loadingRegistration, setLoadingRegistration] = useState<boolean>(false)
  
  const [depDate, setDepDate] = useState<Date | undefined>(new Date())
  const [arrDate, setArrDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [depTime, setDepTime] = useState(selectedFlight?.departure_time || "12:00")
  const [arrTime, setArrTime] = useState(selectedFlight?.arrival_time   || "14:00")
  useEffect(()=>{
    if(defaultValue != null){
      setMode("edit")
      console.log("Default value:", defaultValue)
      setScheduleType(defaultValue.type)
      setSelectedCarrier({code: defaultValue.airlineCode, name: defaultValue.airlineCode})
      setSelectedFlight({
        flight_number: defaultValue.flightNum ?? "",
        airlineCode: defaultValue.airlineCode ?? "",
        departure_time: defaultValue.departureDate ? defaultValue.departureDate.split("T")[1].split("00.000Z")[0] : "",
        arrival_time: defaultValue.arrivalDate ? defaultValue.arrivalDate.split("T")[1].split("00.000Z")[0] : "",
        depart_airport: defaultDepartAirport ?? "", // Provide a default or fetch the actual value
        arrive_airport: defaultArriveAirport ?? ""  // Provide a default or fetch the actual value
      })
      setDepDate(new Date(defaultValue.departureDate ?? ""))
      setArrDate(new Date(defaultValue.arrivalDate ?? ""))
      setDepTime(defaultValue.departureDate ? defaultValue.departureDate.split("T")[1].split("00.000Z")[0] : new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }))
      setArrTime(defaultValue.arrivalDate ? defaultValue.arrivalDate.split("T")[1].split("00.000Z")[0] : new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }))
      setSelectedModel({
        model: defaultValue.model,
        model_name: modelAircraft[defaultValue.model as keyof typeof modelAircraft] || "",
        airlineCode: defaultValue.airlineCode
      })
      setSelectedRegistration({
        registration: defaultValue.registration ?? "",
        model: defaultValue.model,
        airlineCode: defaultValue.airlineCode,
        totalFlight: 0 // Provide a default value or fetch the actual value
      })
    }else{
      setMode("add")
      setScheduleType("single")
      setSelectedCarrier(undefined)
      setSelectedFlight(undefined)
      setDepDate(new Date())
      setArrDate(addDays(new Date(), 1))
      setDepTime("12:00")
      setArrTime("14:00")
    }
  }, [defaultValue, defaultDepartAirport, defaultArriveAirport])
  useEffect(() => {
    if (selectedFlight) {
      // setDepDate(new Date(selectedFlight.departure_time))
      // setArrDate(new Date(selectedFlight.arrival_time))
      setDepTime(selectedFlight.departure_time.split(":").slice(0, 2).join(":"))
      setArrTime(selectedFlight.arrival_time.split(":").slice(0, 2).join(":"))
    }
  }
  , [selectedFlight])

  useEffect(() => {
    
    if(isOvernightFlight(depTime, arrTime)) {
      const nextDay = new Date(depDate!)
      nextDay.setDate(nextDay.getDate() + 1)
      setArrDate(nextDay)
    }else{
      setArrDate(depDate)
    }

  }, [depDate, depTime, arrTime])

  // For recurring schedules
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 30))
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([])

  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
  const [errorSubmit, setErrorSubmit] = useState<string>("")
  const [isError, setIsError] = useState<boolean>(false)
  const [needSubmit, setNeedSubmit] = useState<boolean>(false)
  const handleSubmit = useCallback(() => {
    // Combine date and time for departure and arrival
    setLoadingSubmit(true)
    setIsError(false)
    setErrorSubmit("")
    let submission: SubmitSchedule;
    if (scheduleType === "single") {
      if(!depDate || !arrDate) {
        toast.error("Please select departure and arrival date")
        return
      }
      console.log("Single flight schedule")
      // depDate is in user's local timezone, convert to UTC
      // const utcDepDate = new Date(depDate!.toISOString().split("T")[0] + "T" + depTime + "Z") // not in UTC
      const utcDepDate = new Date(depDate!.getTime() - depDate!.getTimezoneOffset() * 60000)
      const utcArrDate = new Date(arrDate!.getTime() - arrDate!.getTimezoneOffset() * 60000)
      // console.log("UTC Departure Date:", utcDepDate.toISOString(), depDate!.toISOString())
      // console.log("UTC Arrival Date:", utcArrDate.toISOString(), arrDate!.toISOString())
      const depDateTime = new Date(utcDepDate.toISOString().split("T")[0] + "T" + depTime + "Z")
      const arrDateTime = new Date(utcArrDate.toISOString().split("T")[0] + "T" + arrTime + "Z")
      console.log("Departure DateTime:", depDateTime.toISOString())
      console.log("Arrival DateTime:", arrDateTime.toDateString())
      console.log("Selected Flight:", selectedFlight?.flight_number)
      console.log("Selected Carrier:", selectedCarrier?.code)
      console.log("Selected Model:", selectedModel?.model)
      console.log("Selected Registration:", selectedRegistration?.registration)

      submission = {
        type: "single",
        flightNum: selectedFlight?.flight_number || "",
        airlineCode: selectedCarrier?.code || "",
        model: selectedModel?.model || "",
        registration: selectedRegistration?.registration || "",
        departureDate: depDateTime.toISOString(),
        arrivalDate: arrDateTime.toISOString(),
      }

    } else {
      if(!startDate || !endDate) {
        toast.error("Please select start and end date")
        return
      }
      // const startDateTime = new Date(startDate!)
      // const endDateTime = new Date(endDate!)

      const startDateTime = new Date(startDate!.getTime() - startDate!.getTimezoneOffset() * 60000)
      const endDateTime = new Date(endDate!.getTime() - endDate!.getTimezoneOffset() * 60000)

      console.log("Start Date:", startDateTime?.toISOString())
      console.log("End Date:", endDateTime?.toISOString())
      console.log("Days of Week:", daysOfWeek.join(", "))
      console.log("Selected Flight:", selectedFlight?.flight_number)
      console.log("Selected Carrier:", selectedCarrier?.code)
      console.log("Selected Model:", selectedModel?.model)

      submission = {
        type: "recurring",
        flightNum: selectedFlight?.flight_number || "",
        airlineCode: selectedCarrier?.code || "",
        model: selectedModel?.model || "",
        daysofweek: daysOfWeek.join(","),
        startDate: startDateTime.toISOString().split("T")[0], // Extract only the date part
        endDate: endDateTime.toISOString().split("T")[0], // Extract only the date part
        depTime: depTime,
        arrTime: arrTime,
      }
    }
    if (submission) {
      console.log("Submission:", submission)
      onAddFlight(submission, () => {
        setLoadingSubmit(false)
        setIsError(false)
        setErrorSubmit("")
        onOpenChange(false)
        // Reset all states
        setSelectedCarrier(undefined)
        setSelectedFlight(undefined)
        setSelectedModel(undefined)
        setSelectedRegistration(undefined)
        setDepDate(new Date())
        setArrDate(addDays(new Date(), 1))
        setDepTime("12:00")
        setArrTime("14:00")
        setStartDate(new Date())
        setEndDate(addDays(new Date(), 30))
        setDaysOfWeek([])
        setCarrierFlights([])
        setAircraftModels([])
        setAircraftRegistrations([])
      }, () => {
        setLoadingSubmit(false)
        setIsError(true)
        setErrorSubmit("Failed to add flight schedule")
      })
    }
  }, [scheduleType, depDate, depTime, arrDate, arrTime, selectedFlight, selectedCarrier, selectedModel, selectedRegistration, startDate, endDate, daysOfWeek, onAddFlight, onOpenChange])
  
  const handleEdit = useCallback(() => {
    console.log("departure date:", depDate)
    console.log("departure time:", depTime)
    console.log("arrival date:", arrDate)
    console.log("arrival time:", arrTime)

    //replace arrival date, time part with time from arrTime
    const depDateTime = new Date(depDate!.toISOString().split("T")[0] + "T" + depTime + ":00Z").toISOString()
    const arrDateTime = new Date(arrDate!.toISOString().split("T")[0] + "T" + arrTime + ":00Z").toISOString()

    handleEditSchedule({
      type: "single",
      flightNum: selectedFlight?.flight_number || "",
      airlineCode: selectedCarrier?.code || "",
      model: selectedModel?.model || "",
      registration: selectedRegistration?.registration || "",
      departureDate: depDateTime || "",
      arrivalDate: arrDateTime || "",
    })
  },[arrDate, arrTime, depDate, depTime, handleEditSchedule, selectedCarrier?.code, selectedFlight?.flight_number, selectedModel?.model, selectedRegistration?.registration])
  
  useEffect(() => {
    if(needSubmit && mode == "add") handleSubmit()
    if(needSubmit && mode == "edit") handleEdit()
    return () => setNeedSubmit(false)

  }, [needSubmit, handleSubmit, handleEdit, mode])
  
  const toggleDayOfWeek = (day: string) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day))
    } else {
      setDaysOfWeek([...daysOfWeek, day])
    }
  }

  const isOvernightFlight = (depTime: string, arrTime: string) => {
    const [depHours, depMinutes] = depTime.split(":").map(Number)
    const [arrHours, arrMinutes] = arrTime.split(":").map(Number)

    const depMinutesTotal = depHours * 60 + depMinutes
    const arrMinutesTotal = arrHours * 60 + arrMinutes

    return arrMinutesTotal < depMinutesTotal
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg px-4">
        <SheetHeader className="mt-7">
          <SheetTitle>{mode === "edit" ? "Edit" : "Add New"} Flight Schedule</SheetTitle>
          <SheetDescription>{mode === "edit" ? "" : "Create new schedule. "}Fill in the details below.</SheetDescription>
        </SheetHeader>
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorSubmit}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <Tabs value={scheduleType} onValueChange={setScheduleType} className="w-full">
            <TabsList className={`
              grid w-full
              ${mode === "edit" ? "grid-cols-1" : "grid-cols-2"}
              `}>
              <TabsTrigger value="single">Single Flight</TabsTrigger>
              {
                mode === "edit" ? null : 
                <TabsTrigger value="recurring">Recurring Schedule</TabsTrigger>
              }
            </TabsList>

            <TabsContent value="single" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Airlines Carrier</Label>
                <span className="text-xs text-muted-foreground">(e.g. CX, SQ, Thai Airways, or operated airport in format ap:&#10100;code&#10101;)</span>
                <DebouncedSearch<Airline>
                  title="Airlines Carrier"
                  disabled={mode === "edit"}
                  selected={selectedCarrier ?? null}
                  onSelect={setSelectedCarrier}
                  results={carriers}
                  requestMethod="GET"
                  setResults={setCarriers}
                  loading={loadingCarrier}
                  setLoading={setLoadingCarrier}
                  fetchUrl={(q) => `${backendURL}/autocomplete/airline/${q}`}
                  renderItem={(airline) => (
                    <div>
                      {airline.name}, ({airline.code})
                    </div>
                  )}
                  renderSelectedItem={(airline) => (
                    <div>
                    {airline.name}, ({airline.code})
                    </div>
                  )}
                />
              </div>

              {selectedCarrier && (
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <DebouncedSearch<Flight>
                    title="Search for flight number (e.g. cnx, 123, or bkk,cnx)"
                    selected={selectedFlight ?? null}
                    disabled={mode === "edit"}
                    onSelect={setSelectedFlight}
                    requestMethod="GET"
                    results={carrierFlights}
                    setResults={setCarrierFlights}
                    loading={loadingFlight}
                    setLoading={setLoadingFlight}
                    fetchUrl={(q) => `${backendURL}/autocomplete/flight/${selectedCarrier?.code}/${q}`}
                    renderItem={(flight) => (
                      <div className="flex flex-col">
                        <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number}</span>
                        <span className="text-xs text-gray-500">{flight.depart_airport} → {flight.arrive_airport}</span>
                        <span className="text-xs text-gray-500">{flight.departure_time} UTC → {flight.arrival_time} UTC</span>
                      </div>
                    )}
                    renderSelectedItem={(flight) => (
                      <div>
                        <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number} ({flight.depart_airport} → {flight.arrive_airport})</span>
                      </div>
                    )}
                  />
                </div>
              )}

              {selectedFlight && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departure Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !depDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {depDate ? format(depDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                          mode="single" 
                          selected={depDate} 
                          disabled={(date) => {
                            const today = new Date();
                            const nextYear = new Date(today);
                            nextYear.setFullYear(today.getFullYear() + 1);
                            return date.getTime() < today.setHours(0, 0, 0, 0) || date.getTime() > nextYear.setHours(0, 0, 0, 0);
                          }}
                          onSelect={(date) => {
                            console.log("Selected date from calendar:", date?.toISOString());
                            setDepDate(date);
                          }} 
                          initialFocus 
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dep_time">Departure Time (UTC)</Label>
                      <Input id="dep_time" type="time" value={depTime} onChange={(e) => setDepTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Arrival Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !arrDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {arrDate ? format(arrDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Alert variant={"destructive"}>
                          <Terminal className="h-4 w-4" />
                          <AlertTitle>Please note!</AlertTitle>
                          <AlertDescription>
                          Single flight is automatically calculate arrival date based on departure date and time.
                          </AlertDescription>
                        </Alert>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="arr_time">Arrival Time (UTC)</Label>
                      <Input id="arr_time" type="time" value={arrTime} onChange={(e) => setArrTime(e.target.value)} />
                    </div>
                  </div>

                  {isOvernightFlight(depTime, arrTime) && (
                    <div className="col-span-2 mt-1">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Overnight Flight (+1 day)
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Aircraft Model</Label>
                    <DebouncedSearch<AircraftModel>
                      title="Aircraft Model"
                      selected={selectedModel ?? null}
                      disabled={mode === "edit"}
                      onSelect={setSelectedModel}
                      dependent={selectedCarrier?.code}
                      loadBefore={true}
                      enableSearch={false}
                      requestMethod="GET"
                      results={aircraftModels}
                      setResults={setAircraftModels}
                      loading={loadingModel}
                      setLoading={setLoadingModel}
                      fetchUrl={(q) => `${backendURL}/autocomplete/model/${selectedCarrier?.code}`}
                      renderItem={(model) => (
                        <div>
                          {model.model_name}, ({model.model})
                        </div>
                      )}
                      renderSelectedItem={(model) => (
                        <div>
                          {model.model_name}, ({model.model})
                        </div>
                      )}
                    />
                  </div>

                  {selectedModel && (
                    <div className="space-y-2">
                      <Label>Aircraft Registration</Label>
                      <DebouncedSearch<AircraftRegistration>
                        title="Aircraft Registration"
                        disabled={mode === "edit"}
                        selected={selectedRegistration ?? null}
                        onSelect={setSelectedRegistration}
                        requestMethod="GET"
                        results={aircraftRegistrations}
                        setResults={setAircraftRegistrations}
                        loading={loadingRegistration}
                        setLoading={setLoadingRegistration}
                        fetchUrl={(q) => `${backendURL}/autocomplete/registration/${selectedCarrier?.code}/${selectedModel?.model}`}
                        renderItem={(registration) => (
                          <div>
                            {registration.registration}, ({registration.model} {registration.airlineCode})
                          </div>
                        )}
                        renderSelectedItem={(registration) => (
                          <div>
                            {registration.registration}, ({registration.model} {registration.airlineCode})
                          </div>
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Airlines Carrier</Label>
                <span className="text-xs text-muted-foreground">(e.g. CX, SQ, Thai Airways, or operated airport in format ap:&#10100;code&#10101;)</span>
                <DebouncedSearch<Airline>
                  title="Airlines Carrier"
                  selected={selectedCarrier ?? null}
                  onSelect={setSelectedCarrier}
                  requestMethod="GET"
                  results={carriers}
                  setResults={setCarriers}
                  loading={loadingCarrier}
                  setLoading={setLoadingCarrier}
                  fetchUrl={(q) => `${backendURL}/autocomplete/airline/${q}`}
                  renderItem={(airline) => (
                    <div>
                      {airline.name}, ({airline.code})
                    </div>
                  )}
                  renderSelectedItem={(airline) => (
                    <div>
                    {airline.name}, ({airline.code})
                    </div>
                  )}
                />
              </div>

              {selectedCarrier && (
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <DebouncedSearch<Flight>
                    title="Search for flight number (e.g. cnx, 123, or bkk,cnx)"
                    selected={selectedFlight ?? null}
                    onSelect={setSelectedFlight}
                    requestMethod="GET"
                    results={carrierFlights}
                    setResults={setCarrierFlights}
                    loading={loadingFlight}
                    setLoading={setLoadingFlight}
                    fetchUrl={(q) => `${backendURL}/autocomplete/flight/${selectedCarrier?.code}/${q}`}
                    renderItem={(flight) => (
                      <div className="flex flex-col">
                        <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number}</span>
                        <span className="text-xs text-gray-500">{flight.depart_airport} → {flight.arrive_airport}</span>
                        <span className="text-xs text-gray-500">{flight.departure_time} UTC → {flight.arrival_time} UTC</span>
                      </div>
                    )}
                    renderSelectedItem={(flight) => (
                      <div>
                        <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number} ({flight.depart_airport} → {flight.arrive_airport})</span>
                      </div>
                    )}
                    />
                </div>
              )}

              {selectedFlight && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} 
                          disabled={(date) => {
                            const today = new Date();
                            const nextYear = new Date(today);
                            nextYear.setFullYear(today.getFullYear() + 1);
                            return date.getTime() < today.setHours(0, 0, 0, 0) || date.getTime() > nextYear.setHours(0, 0, 0, 0);
                          }}
                          onSelect={setStartDate}
                           initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} 
                          // disabled={(date) => startDate ? date.getTime() < new Date(startDate).setHours(0, 0, 0, 0) : date.getTime() < new Date().setHours(0, 0, 0, 0)}
                          disabled={(date) => {
                            const today = new Date();
                            const nextYear = new Date(today);
                            nextYear.setFullYear(today.getFullYear() + 1);
                            return (startDate ? date.getTime() < new Date(startDate).setHours(0, 0, 0, 0) : 
                                               date.getTime() < today.setHours(0, 0, 0, 0)) || date.getTime() > nextYear.setHours(0, 0, 0, 0);
                          }}
                          onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={daysOfWeek.includes(day) ? "default" : "outline"}
                          className="h-9 w-12"
                          onClick={() => toggleDayOfWeek(day)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dep_time">Departure Time (UTC)</Label>
                      <Input id="dep_time" type="time" value={depTime} disabled onChange={(e) => setDepTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="arr_time">Arrival Time (UTC)</Label>
                      <Input id="arr_time" type="time" value={arrTime} disabled onChange={(e) => setArrTime(e.target.value)} />
                    </div>
                  </div>

                  {isOvernightFlight(depTime, arrTime) && (
                    <div className="col-span-2 mt-1">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Overnight Flight (+1 day)
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Aircraft Model</Label>
                    <DebouncedSearch<AircraftModel>
                      title="Aircraft Model"
                      selected={selectedModel ?? null}
                      onSelect={setSelectedModel}
                      requestMethod="GET"
                      dependent={selectedCarrier?.code}
                      loadBefore={true}
                      enableSearch={false}
                      results={aircraftModels}
                      setResults={setAircraftModels}
                      loading={loadingModel}
                      setLoading={setLoadingModel}
                      fetchUrl={(q) => `${backendURL}/autocomplete/model/${selectedCarrier?.code}`}
                      renderItem={(model) => (
                        <div>
                          {model.model_name}, ({model.model})
                        </div>
                      )}
                      renderSelectedItem={(model) => (
                        <div>
                          {model.model_name}, ({model.model})
                        </div>
                      )}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline"
              className="cursor-pointer"
              disabled={
                isLoading // ||
                // !selectedCarrier ||
                // !selectedFlight ||
                // !selectedModel ||
                // (scheduleType === "single" && !selectedRegistration)
              }
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => setNeedSubmit(true)}
              disabled={
                isLoading ||
                !selectedCarrier ||
                !selectedFlight ||
                !selectedModel ||
                (scheduleType === "single" && !selectedRegistration)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "edit" ? "Edit" : "Add"}ing...
                </>
              ) : (
                (mode === "edit" ? "Edit" : "Add") + " Schedule"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
