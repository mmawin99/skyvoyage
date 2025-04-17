"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Schedule } from "@/types/type"

interface AddScheduleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddFlight: (flight: Schedule) => void
  isLoading: boolean
}

export default function AddScheduleSheet({ open, onOpenChange, onAddFlight, isLoading }: AddScheduleSheetProps) {
  const [scheduleType, setScheduleType] = useState("single")
  const [selectedCarrier, setSelectedCarrier] = useState("")
  const [selectedFlight, setSelectedFlight] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedRegistration, setSelectedRegistration] = useState("")
  const [openCarrierCommand, setOpenCarrierCommand] = useState(false)
  const [openFlightCommand, setOpenFlightCommand] = useState(false)
  const [openModelCommand, setOpenModelCommand] = useState(false)
  const [openRegistrationCommand, setOpenRegistrationCommand] = useState(false)

  const [flightData, setFlightData] = useState({
    flightNum: "",
    carrier: "",
    iata_from: "",
    iata_to: "",
    utc_dep_time: new Date().toISOString(),
    utc_arr_time: addDays(new Date(), 1).toISOString(),
    aircraft_model: "",
    aircraft_registration: "",
  })

  const [depDate, setDepDate] = useState<Date | undefined>(new Date())
  const [arrDate, setArrDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [depTime, setDepTime] = useState("12:00")
  const [arrTime, setArrTime] = useState("14:00")

  // For recurring schedules
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 30))
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([])

  // Reset form when opening the sheet
  useEffect(() => {
    if (open) {
      setSelectedCarrier("")
      setSelectedFlight("")
      setSelectedModel("")
      setSelectedRegistration("")
      setFlightData({
        flightNum: "",
        carrier: "",
        iata_from: "",
        iata_to: "",
        utc_dep_time: new Date().toISOString(),
        utc_arr_time: addDays(new Date(), 1).toISOString(),
        aircraft_model: "",
        aircraft_registration: "",
      })
      setDepDate(new Date())
      setArrDate(addDays(new Date(), 1))
      setDepTime("12:00")
      setArrTime("14:00")
      setStartDate(new Date())
      setEndDate(addDays(new Date(), 30))
      setDaysOfWeek([])
    }
  }, [open])

  // Update flight data when carrier is selected
  useEffect(() => {
    if (selectedCarrier) {
      setFlightData((prev) => ({
        ...prev,
        carrier: selectedCarrier,
        flightNum: "",
        iata_from: "",
        iata_to: "",
      }))
      setSelectedFlight("")
      setSelectedModel("")
      setSelectedRegistration("")
    }
  }, [selectedCarrier])

  // Update flight data when flight is selected
  useEffect(() => {
    if (selectedCarrier && selectedFlight) {
      const flight = carrierFlights[selectedCarrier].find((f) => f.flightNum === selectedFlight)
      if (flight) {
        setDepTime(flight.depTime)
        setArrTime(flight.arrTime)
        setFlightData((prev) => ({
          ...prev,
          flightNum: selectedCarrier + selectedFlight,
          iata_from: flight.from,
          iata_to: flight.to,
        }))
      }
    }
  }, [selectedFlight, selectedCarrier])

  // Update aircraft model when selected
  useEffect(() => {
    if (selectedModel) {
      const model = aircraftModels.find((m) => m.id === selectedModel)
      if (model) {
        setFlightData((prev) => ({
          ...prev,
          aircraft_model: model.name,
        }))
      }
      setSelectedRegistration("")
    }
  }, [selectedModel])

  // Update aircraft registration when selected
  useEffect(() => {
    if (selectedRegistration) {
      const registration = aircraftRegistrations.find((r) => r.id === selectedRegistration)
      if (registration) {
        setFlightData((prev) => ({
          ...prev,
          aircraft_registration: registration.registration,
        }))
      }
    }
  }, [selectedRegistration])

  const handleSubmit = () => {
    // Combine date and time for departure and arrival
    const depDateTime = new Date(depDate!)
    const arrDateTime = new Date(arrDate!)

    const [depHours, depMinutes] = depTime.split(":").map(Number)
    const [arrHours, arrMinutes] = arrTime.split(":").map(Number)

    depDateTime.setHours(depHours, depMinutes)
    arrDateTime.setHours(arrHours, arrMinutes)

    // For single flights, if it's an overnight flight and the user hasn't already
    // set the arrival date to the next day, adjust it automatically
    if (
      scheduleType === "single" &&
      isOvernightFlight(depTime, arrTime) &&
      depDate &&
      arrDate &&
      depDate.getTime() === arrDate.getTime()
    ) {
      const nextDay = new Date(arrDateTime)
      nextDay.setDate(nextDay.getDate() + 1)
      arrDateTime.setTime(nextDay.getTime())
    }

    const newFlight: Flight = {
      ...flightData,
      id: Math.random().toString(36).substring(2, 9),
      utc_dep_time: depDateTime.toISOString(),
      utc_arr_time: arrDateTime.toISOString(),
    }

    onAddFlight(newFlight)

    // Close sheet after submission
    if (!isLoading) {
      onOpenChange(false)
    }
  }

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

  // Get available models for selected carrier
  const availableModels = selectedCarrier ? aircraftModels.filter((model) => model.carrier === selectedCarrier) : []

  // Get available registrations for selected model and carrier
  const availableRegistrations =
    selectedModel && selectedCarrier
      ? aircraftRegistrations.filter((reg) => reg.model_id === selectedModel && reg.carrier === selectedCarrier)
      : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add Flight Schedule</SheetTitle>
          <SheetDescription>Create a new flight schedule. Fill in the details below.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Tabs value={scheduleType} onValueChange={setScheduleType} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Flight</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Popover open={openCarrierCommand} onOpenChange={setOpenCarrierCommand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCarrierCommand}
                      className="w-full justify-between"
                    >
                      {selectedCarrier
                        ? carriers.find((carrier) => carrier.code === selectedCarrier)?.name
                        : "Select carrier..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search carrier..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No carrier found.</CommandEmpty>
                        <CommandGroup>
                          {carriers.map((carrier) => (
                            <CommandItem
                              key={carrier.code}
                              value={carrier.code}
                              onSelect={(currentValue) => {
                                setSelectedCarrier(currentValue)
                                setOpenCarrierCommand(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCarrier === carrier.code ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {carrier.name} ({carrier.code})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedCarrier && (
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <Popover open={openFlightCommand} onOpenChange={setOpenFlightCommand}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFlightCommand}
                        className="w-full justify-between"
                      >
                        {selectedFlight ? `${selectedCarrier}${selectedFlight}` : "Select flight number..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search flight..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No flight found.</CommandEmpty>
                          <CommandGroup>
                            {carrierFlights[selectedCarrier]?.map((flight) => (
                              <CommandItem
                                key={flight.flightNum}
                                value={flight.flightNum}
                                onSelect={(currentValue) => {
                                  setSelectedFlight(currentValue)
                                  setOpenFlightCommand(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedFlight === flight.flightNum ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {selectedCarrier}
                                {flight.flightNum} ({flight.from} → {flight.to})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                          <Calendar mode="single" selected={depDate} onSelect={setDepDate} initialFocus />
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
                          <Calendar mode="single" selected={arrDate} onSelect={setArrDate} initialFocus />
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
                    <Popover open={openModelCommand} onOpenChange={setOpenModelCommand}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openModelCommand}
                          className="w-full justify-between"
                        >
                          {selectedModel
                            ? aircraftModels.find((model) => model.id === selectedModel)?.name
                            : "Select aircraft model..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search model..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No model found.</CommandEmpty>
                            <CommandGroup>
                              {availableModels.map((model) => (
                                <CommandItem
                                  key={model.id}
                                  value={model.id}
                                  onSelect={(currentValue) => {
                                    setSelectedModel(currentValue)
                                    setOpenModelCommand(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedModel === model.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {model.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedModel && (
                    <div className="space-y-2">
                      <Label>Aircraft Registration</Label>
                      <Popover open={openRegistrationCommand} onOpenChange={setOpenRegistrationCommand}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openRegistrationCommand}
                            className="w-full justify-between"
                          >
                            {selectedRegistration
                              ? aircraftRegistrations.find((reg) => reg.id === selectedRegistration)?.registration
                              : "Select aircraft registration..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search registration..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No registration found.</CommandEmpty>
                              <CommandGroup>
                                {availableRegistrations.map((reg) => (
                                  <CommandItem
                                    key={reg.id}
                                    value={reg.id}
                                    onSelect={(currentValue) => {
                                      setSelectedRegistration(currentValue)
                                      setOpenRegistrationCommand(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedRegistration === reg.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {reg.registration}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Popover open={openCarrierCommand} onOpenChange={setOpenCarrierCommand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCarrierCommand}
                      className="w-full justify-between"
                    >
                      {selectedCarrier
                        ? carriers.find((carrier) => carrier.code === selectedCarrier)?.name
                        : "Select carrier..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search carrier..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No carrier found.</CommandEmpty>
                        <CommandGroup>
                          {carriers.map((carrier) => (
                            <CommandItem
                              key={carrier.code}
                              value={carrier.code}
                              onSelect={(currentValue) => {
                                setSelectedCarrier(currentValue)
                                setOpenCarrierCommand(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCarrier === carrier.code ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {carrier.name} ({carrier.code})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedCarrier && (
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <Popover open={openFlightCommand} onOpenChange={setOpenFlightCommand}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFlightCommand}
                        className="w-full justify-between"
                      >
                        {selectedFlight ? `${selectedCarrier}${selectedFlight}` : "Select flight number..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search flight..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No flight found.</CommandEmpty>
                          <CommandGroup>
                            {carrierFlights[selectedCarrier]?.map((flight) => (
                              <CommandItem
                                key={flight.flightNum}
                                value={flight.flightNum}
                                onSelect={(currentValue) => {
                                  setSelectedFlight(currentValue)
                                  setOpenFlightCommand(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedFlight === flight.flightNum ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {selectedCarrier}
                                {flight.flightNum} ({flight.from} → {flight.to})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
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
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
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
                      <Input id="dep_time" type="time" value={depTime} onChange={(e) => setDepTime(e.target.value)} />
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
                    <Popover open={openModelCommand} onOpenChange={setOpenModelCommand}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openModelCommand}
                          className="w-full justify-between"
                        >
                          {selectedModel
                            ? aircraftModels.find((model) => model.id === selectedModel)?.name
                            : "Select aircraft model..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search model..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No model found.</CommandEmpty>
                            <CommandGroup>
                              {availableModels.map((model) => (
                                <CommandItem
                                  key={model.id}
                                  value={model.id}
                                  onSelect={(currentValue) => {
                                    setSelectedModel(currentValue)
                                    setOpenModelCommand(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedModel === model.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {model.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
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
                  Saving...
                </>
              ) : (
                "Save Schedule"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
