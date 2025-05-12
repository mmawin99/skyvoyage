/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Save, Trash2, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { AircraftVisualizer } from "./aircraft-visualizer"
import { toast } from "sonner"
import { SeatClass, seatFeatures, SeatMap } from "@/types/seatmap"
import { SeatmapAPIAdmin } from "@/types/type"
import { cn } from "@/lib/utils"

// Function to generate a unique ID
const generateUniqueId = () => {
  return `seat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Function to generate a new seat
const generateNewSeat = (row: number, column: string, classCode: string): SeatmapAPIAdmin => {
  return {
    seatId: generateUniqueId(),
    seatNum: `${row}${column}`,
    row,
    column,
    class: classCode,
    price: 0,
    features: {
      s: {
        p: "0 in",
        w: "0 in",
        r: "0°",
      },
      f: [],
    },
    floor: 1,
  }
}

interface SeatMapEditorProps {
  seatMapId?: string
  isNewSeatMap?: boolean
}

export function SeatMapEditor({ seatMapId, isNewSeatMap = false }: SeatMapEditorProps) {
  // State for the seat map data
  const [seatMap, setSeatMap] = React.useState<SeatMap | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedClass, setSelectedClass] = React.useState<string>("")
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [showLabels, setShowLabels] = React.useState(true)
  const [selectedSeat, setSelectedSeat] = React.useState<SeatmapAPIAdmin | null>(null)
  const [availableFeatures, setAvailableFeatures] = React.useState<number[]>([])
  const [tabPage, setTabPage] = React.useState("visual")
  const [saving, setSaving] = React.useState(false)

  // Fetch seat map data when the component mounts or seatMapId changes
  React.useEffect(() => {
    const fetchSeatMap = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (seatMapId) {
          // Fetch existing seat map
          const response = await fetch(`/api/seatmap/seatmap-data/${seatMapId}`)
          const result = await response.json()
          
          if (result.status) {
            setSeatMap(result.data)
            setSelectedClass(result.data.classes[0]?.id || "")
          } else {
            throw new Error(result.msg || "Failed to fetch seat map data")
          }
        } else {
          // Create a new empty seat map
          setSeatMap({
            id: "",
            airlineCode: "",
            airlineName: "",
            aircraftModel: "",
            version: "V1",
            classes: [
              {
                id: "economy",
                name: "Economy",
                code: "Y",
                color: "#f97316",
              },
            ],
            seats: [],
          })
          setSelectedClass("economy")
        }
      } catch (err) {
        console.error("Error fetching seat map:", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching the seat map")
      } finally {
        setLoading(false)
      }
    }

    fetchSeatMap()
  }, [seatMapId])

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading seat map data...</p>
        </div>
      </div>
    )
  }

  // If there was an error, show an error message
  if (error || !seatMap) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-red-500">Error: {error || "Failed to load seat map"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Calculate total rows and columns from seats
  const totalRows = seatMap.seats.length > 0 ? Math.max(...seatMap.seats.map((seat) => seat.row)) : 0
  const columnSet = new Set(seatMap.seats.map((seat) => seat.column))
  const columns = Array.from(columnSet).sort()

  // Function to add a new class
  const addClass = () => {
    const newClass: SeatClass = {
      id: `class-${Date.now()}`,
      name: "New Class",
      code: "N",
      color: "#64748b",
    }
    setSeatMap({
      ...seatMap,
      classes: [...seatMap.classes, newClass],
    })
    setSelectedClass(newClass.id)
  }

  // Function to remove a class
  const removeClass = (id: string) => {
    setSeatMap({
      ...seatMap,
      classes: seatMap.classes.filter((c) => c.id !== id),
    })
    if (selectedClass === id) {
      setSelectedClass(seatMap.classes[0]?.id || "")
    }
  }

  // Function to update a class
  const updateClass = (id: string, updates: Partial<SeatClass>) => {
    setSeatMap({
      ...seatMap,
      classes: seatMap.classes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }

  // Function to handle seat click
  const handleSeatClick = (seat: SeatmapAPIAdmin) => {
    setSelectedSeat(seat)
    setAvailableFeatures(seat.features.f)
  }

  // Function to check if a seat ID already exists
  const isSeatIdTaken = (id: string) => {
    return seatMap.seats.some((seat) => seat.seatId === id && (!selectedSeat || seat.seatId !== selectedSeat.seatId))
  }

  // Function to update a seat
  const updateSeat = (updates: Partial<SeatmapAPIAdmin>) => {
    if (!selectedSeat) return

    // If seatNum is being updated, also update row and column to match
    if (updates.seatNum) {
      // Parse the new seat number to extract row and column
      const match = updates.seatNum.match(/^(\d+)([A-Z])$/)
      if (match) {
        const [, rowStr, column] = match
        const row = Number.parseInt(rowStr, 10)

        // Update the row and column properties
        updates.row = row
        updates.column = column
      }
    }

    setSeatMap({
      ...seatMap,
      seats: seatMap.seats.map((s) => (s.seatId === selectedSeat.seatId ? { ...s, ...updates } : s)),
    })

    // Update the selected seat as well
    setSelectedSeat({ ...selectedSeat, ...updates })
  }

  // Function to toggle a feature for the selected seat
  const toggleFeature = (featureId: number) => {
    if (!selectedSeat) return

    const newFeatures = availableFeatures.includes(featureId)
      ? availableFeatures.filter((id) => id !== featureId)
      : [...availableFeatures, featureId]

    setAvailableFeatures(newFeatures)

    updateSeat({
      features: {
        ...selectedSeat.features,
        f: newFeatures,
      },
    })
  }

  // Function to add a new seat
  const addSeat = () => {
    // Find the selected class
    const selectedClassObj = seatMap.classes.find((c) => c.id === selectedClass)
    if (!selectedClassObj) return

    // Create a new row and column that doesn't exist yet
    let newRow = 1
    let newColumn = "A"

    // Find an available seat position
    let seatExists = true
    while (seatExists) {
      seatExists = seatMap.seats.some((s) => s.row === newRow && s.column === newColumn)
      if (seatExists) {
        // Move to next column
        const columnIndex = "ABCDEFGHJKL".indexOf(newColumn)
        if (columnIndex < "ABCDEFGHJKL".length - 1) {
          newColumn = "ABCDEFGHJKL"[columnIndex + 1]
        } else {
          // Move to next row
          newRow++
          newColumn = "A"
        }
      }
    }

    // Create the new seat
    const newSeat = generateNewSeat(newRow, newColumn, selectedClassObj.code)

    // Add the seat to the seat map
    setSeatMap({
      ...seatMap,
      seats: [...seatMap.seats, newSeat],
    })

    // Select the new seat
    setSelectedSeat(newSeat)
    setAvailableFeatures([])
  }

  // Function to save the seat map
  const saveSeatMap = async () => {
    setSaving(true)
    try {
      // Determine if this is a new seat map or an update
      const url = seatMap.id ? `/api/seatmap/update-seatmap/${seatMap.id}` : "/api/seatmap/create-seatmap"
      const method = seatMap.id ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(seatMap),
      })
      
      const result = await response.json()
      
      if (result.status) {
        toast.success(`Seat map saved`, {
          description: `Seat map ${seatMap.id || "new"} has been saved successfully.`
        })
        
        // If this was a new seat map, update the state with the returned ID
        if (!seatMap.id && result.data?.id) {
          setSeatMap({
            ...seatMap,
            id: result.data.id
          })
        }
      } else {
        throw new Error(result.msg || "Failed to save seat map")
      }
    } catch (err) {
      console.error("Error saving seat map:", err)
      toast.error("Failed to save seat map", {
        description: err instanceof Error ? err.message : "An error occurred while saving"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <Tabs defaultValue="visual" className="w-full" value={tabPage} onValueChange={setTabPage}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          {/* <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="class_seat">Class Details</TabsTrigger>
          <TabsTrigger value="seat">Seat Details</TabsTrigger> */}
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Aircraft Layout</CardTitle>
              <CardDescription>
                Visualize and edit the seat map for {seatMap.airlineName || "Unnamed Airline"} {seatMap.aircraftModel || "Unspecified Aircraft"} {seatMap.version}
              </CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="zoom">Zoom</Label>
                  <Slider
                    id="zoom"
                    min={50}
                    max={150}
                    step={10}
                    value={[zoomLevel]}
                    onValueChange={(value) => setZoomLevel(value[0])}
                    className="w-[120px]"
                  />
                  <span className="text-sm text-muted-foreground">{zoomLevel}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="labels">Show Labels</Label>
                  <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto border rounded-md p-4" style={{ maxHeight: "60vh" }}>
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "top left",
                    transition: "transform 0.2s",
                  }}
                >
                  <AircraftVisualizer
                    classes={seatMap.classes}
                    seats={seatMap.seats}
                    showLabels={showLabels}
                    onSeatClick={handleSeatClick}
                    selectedClass={selectedClass}
                    horizontalLayout={true}
                    selectedSeatId={selectedSeat?.seatId}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aircraft Configuration</CardTitle>
              <CardDescription>Configure the basic parameters of the aircraft</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="airlineCode">Airline Code</Label>
                  <Input
                    id="airlineCode"
                    value={seatMap.airlineCode}
                    onChange={(e) => setSeatMap({ ...seatMap, airlineCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airlineName">Airline Name</Label>
                  <Input
                    id="airlineName"
                    value={seatMap.airlineName}
                    onChange={(e) => setSeatMap({ ...seatMap, airlineName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aircraftModel">Aircraft Model</Label>
                  <Input
                    id="aircraftModel"
                    value={seatMap.aircraftModel}
                    onChange={(e) => setSeatMap({ ...seatMap, aircraftModel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={seatMap.version}
                    onChange={(e) => setSeatMap({ ...seatMap, version: e.target.value })}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <Button onClick={saveSeatMap} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class_seat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seat Classes</CardTitle>
              <CardDescription>Select a class to edit or assign seats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {seatMap.classes.map((seatClass) => (
                  <Badge
                    key={seatClass.id}
                    variant={selectedClass === seatClass.id ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{ backgroundColor: selectedClass === seatClass.id ? seatClass.color : undefined }}
                    onClick={() => setSelectedClass(seatClass.id)}
                  >
                    {seatClass.name} ({seatClass.code})
                  </Badge>
                ))}
                <Button variant="outline" size="sm" onClick={addClass}>
                  <Plus className="h-4 w-4 mr-1" /> Add Class
                </Button>
              </div>

              {selectedClass && (
                <div className="space-y-4 border rounded-md p-4">
                  {seatMap.classes.find((c) => c.id === selectedClass) && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="className">Class Name</Label>
                          <Input
                            id="className"
                            value={seatMap.classes.find((c) => c.id === selectedClass)?.name}
                            onChange={(e) => updateClass(selectedClass, { name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="classCode">Class Code</Label>
                          <Input
                            id="classCode"
                            value={seatMap.classes.find((c) => c.id === selectedClass)?.code}
                            onChange={(e) => updateClass(selectedClass, { code: e.target.value })}
                            maxLength={1}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="classColor">Class Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="classColor"
                            type="color"
                            value={seatMap.classes.find((c) => c.id === selectedClass)?.color}
                            onChange={(e) => updateClass(selectedClass, { color: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={seatMap.classes.find((c) => c.id === selectedClass)?.color}
                            onChange={(e) => updateClass(selectedClass, { color: e.target.value })}
                            className="font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeClass(selectedClass)}
                          disabled={seatMap.classes.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete Class
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seat Details</CardTitle>
              <CardDescription>
                {selectedSeat
                  ? `Edit details for seat ${selectedSeat.seatNum}`
                  : "Select a seat from the visual editor or add a new seat"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSeat ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seatId">Seat ID</Label>
                      <Input
                        id="seatId"
                        value={selectedSeat.seatId}
                        onChange={(e) => {
                          const newId = e.target.value
                          if (!isSeatIdTaken(newId)) {
                            updateSeat({ seatId: newId })
                          } else {
                            toast.error("Duplicate Seat ID", {
                                description: "This Seat ID is already in use. Please choose a different one.",
                            })
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Unique identifier for this seat. Must be unique across all seats.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatNum">Seat Number</Label>
                      <Input
                        id="seatNum"
                        value={selectedSeat.seatNum}
                        onChange={(e) => updateSeat({ seatNum: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Display number for this seat (e.g., 10D). Format: [row number][column letter]
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatClass">Seat Class</Label>
                      <Select value={selectedSeat.class} onValueChange={(value) => updateSeat({ class: value })}>
                        <SelectTrigger id="seatClass">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {seatMap.classes.map((c) => (
                            <SelectItem key={c.id} value={c.code}>
                              {c.name} ({c.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatPrice">Price</Label>
                      <Input
                        id="seatPrice"
                        type="number"
                        value={selectedSeat.price}
                        onChange={(e) => updateSeat({ price: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatRow">Row</Label>
                      <Input
                        id="seatRow"
                        type="number"
                        value={selectedSeat.row}
                        onChange={(e) => {
                          const row = Number.parseInt(e.target.value)
                          updateSeat({
                            row,
                            seatNum: `${row}${selectedSeat.column}`,
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatColumn">Column</Label>
                      <Input
                        id="seatColumn"
                        value={selectedSeat.column}
                        maxLength={1}
                        onChange={(e) => {
                          const column = e.target.value.toUpperCase()
                          updateSeat({
                            column,
                            seatNum: `${selectedSeat.row}${column}`,
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatFloor">Floor</Label>
                      <Input
                        id="seatFloor"
                        type="number"
                        value={selectedSeat.floor}
                        onChange={(e) => updateSeat({ floor: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Seat Dimensions</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seatPitch">Pitch</Label>
                        <Input
                          id="seatPitch"
                          value={selectedSeat.features.s.p}
                          onChange={(e) =>
                            updateSeat({
                              features: {
                                ...selectedSeat.features,
                                s: { ...selectedSeat.features.s, p: e.target.value },
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seatWidth">Width</Label>
                        <Input
                          id="seatWidth"
                          value={selectedSeat.features.s.w}
                          onChange={(e) =>
                            updateSeat({
                              features: {
                                ...selectedSeat.features,
                                s: { ...selectedSeat.features.s, w: e.target.value },
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seatRecline">Recline</Label>
                        <Input
                          id="seatRecline"
                          value={selectedSeat.features.s.r}
                          onChange={(e) =>
                            updateSeat({
                              features: {
                                ...selectedSeat.features,
                                s: { ...selectedSeat.features.s, r: e.target.value },
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Seat Features</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(seatFeatures).map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`feature-${feature.id}`}
                            checked={availableFeatures.includes(feature.id)}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                          <Label
                            htmlFor={`feature-${feature.id}`}
                            className={cn(
                              feature.type === "positive" && "text-green-600",
                              feature.type === "negative" && "text-red-600",
                              feature.type === "blocked" && "text-yellow-600"
                            )}
                          >
                            {feature.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-4 border border-dashed border-muted-foreground/50 rounded-md p-6">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">No seat is currently selected</p>
                    <p className="font-medium">
                      Please go to the <span className="text-primary">Visual Editor</span> tab and click on a seat to
                      edit its details
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTabPage("visual")
                      }}
                    >
                      Go to Visual Editor
                    </Button>
                    <Button onClick={addSeat}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Seat
                    </Button>
                  </div>
                </div>
              )}

              {selectedSeat && (
                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" onClick={() => setSelectedSeat(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveSeatMap} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Seat
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}