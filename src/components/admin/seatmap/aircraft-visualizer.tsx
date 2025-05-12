/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { type SeatClass, seatFeatures } from "@/types/seatmap"
import type { SeatmapAPIAdmin } from "@/types/type"
import { TooltipArrow } from "@radix-ui/react-tooltip"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AircraftVisualizerProps {
  classes: SeatClass[]
  seats: SeatmapAPIAdmin[]
  showLabels: boolean
  selectedClass: string
  onSeatClick: (seat: SeatmapAPIAdmin) => void
  onRowClick?: (row: number) => void
  horizontalLayout?: boolean
  selectedSeatId?: string
}

export function AircraftVisualizer({
  classes,
  seats,
  showLabels,
  selectedClass,
  onSeatClick,
  onRowClick,
  horizontalLayout = true,
  selectedSeatId,
}: AircraftVisualizerProps) {
  // Group seats by floor
  const floorMap = seats.reduce<Record<number, SeatmapAPIAdmin[]>>((acc, seat) => {
    const floor = seat.floor || 1 // Default to floor 1 if not specified
    if (!acc[floor]) {
      acc[floor] = []
    }
    acc[floor].push(seat)
    return acc
  }, {})

  // Get all available floors
  const floors = Object.keys(floorMap).map(Number).sort()

  // Set default active floor to the first one
  const [activeFloor, setActiveFloor] = useState(floors[0] || 1)

  // Function to get class color
  const getClassColor = (classCode: string) => {
    const seatClass = classes.find((c) => c.code === classCode)
    return seatClass?.color || "#64748b"
  }

  // Function to render a single floor
  const renderFloor = (floorNumber: number) => {
    const floorSeats = floorMap[floorNumber] || []

    // Calculate total rows and columns for this floor
    const totalRows = floorSeats.length > 0 ? Math.max(...floorSeats.map((seat) => seat.row)) : 0

    // Get all unique columns and determine the full column range
    const columnSet = new Set(floorSeats.map((seat) => seat.column))
    const existingColumns = Array.from(columnSet)

    // Find the first and last column to determine the range
    const firstCol = existingColumns.length > 0 ? existingColumns.sort()[0].charCodeAt(0) : 65 // 'A'
    const lastCol = existingColumns.length > 0 ? existingColumns.sort().pop()!.charCodeAt(0) : 75 // 'K'

    // Create the full sequence of columns including missing ones
    const columns = Array.from({ length: lastCol - firstCol + 1 }, (_, i) => String.fromCharCode(firstCol + i))

    // Get all unique rows and sort them numerically
    const rowSet = new Set(floorSeats.map((seat) => seat.row))
    const rows = Array.from(rowSet).sort((a, b) => a - b)

    // Function to get a seat by row and column
    const getSeat = (row: number, col: string): SeatmapAPIAdmin | undefined => {
      return floorSeats.find((seat) => seat.row === row && seat.column === col)
    }

    // Function to render a single seat
    const renderSeat = (row: number, col: string) => {
      const seat = getSeat(row, col)
      const seatId = seat ? seat.seatId : `${row}${col}`

      // If no seat data exists for this position
      if (!seat) {
        return <div key={seatId} className="w-10 h-10"></div>
      }

      const classColor = getClassColor(seat.class)
      const isSelected = selectedSeatId === seat.seatId

      // Get feature names for tooltip
      const featureNames = seat.features.f.map((id) => seatFeatures[id]?.name || "").filter(Boolean)

      return (
        <TooltipProvider key={seatId}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-all",
                  "text-white border hover:brightness-110",
                  isSelected
                    ? "border-2 border-primary shadow-md ring-2 ring-primary ring-opacity-50"
                    : "border-gray-300",
                )}
                style={{
                  backgroundColor: classColor,
                }}
                onClick={() => onSeatClick(seat)}
              >
                {showLabels && <span className="text-xs font-medium">{seat.seatNum}</span>}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black border-[1px] border-gray-300 rounded-lg p-2 shadow-lg max-w-[350px]">
              <div className="space-y-2">
                <div className="font-medium text-lg">
                  {seat.seatNum} - {seat.class}
                  {isSelected && <span className="ml-2 text-primary">(Selected)</span>}
                </div>
                <Separator className="my-2" />
                <div className="text-sm">Price: ${seat.price.toFixed(2)}</div>
                <div className="text-xs">
                  Pitch: {seat.features.s.p} | Width: {seat.features.s.w} | Recline: {seat.features.s.r}
                </div>
                {featureNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {featureNames.map((name, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500">Floor: {seat.floor || 1}</div>
              </div>
              <TooltipArrow className="fill-white text-white bg-white z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <div className="flex">
        {/* Aircraft front (top) */}
        <div className="w-16 flex flex-col justify-center items-center mr-4">
          <div className="h-16 w-full bg-gray-200 rounded-t-full mb-4 flex items-center justify-center">
            <div className="text-gray-500 font-medium">Front</div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="text-gray-500 font-medium transform -rotate-90">Aircraft</div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Row numbers at the top */}
            {showLabels && (
              <div className="flex mb-2">
                <div className="w-10"></div> {/* Empty space for column labels */}
                {rows.map((row) => (
                  <div
                    key={row}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center font-medium text-sm mx-1 rounded cursor-pointer",
                      "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {row}
                  </div>
                ))}
              </div>
            )}

            {/* Columns with seats */}
            <div className="space-y-1">
              {/* Render columns in reverse order (F, E, D, C, B, A) */}
              {columns
                .slice()
                .reverse()
                .map((col) => (
                  <div key={col} className="flex items-center">
                    {/* Column label */}
                    {showLabels && (
                      <div className="w-10 h-10 flex items-center justify-center text-sm font-medium">{col}</div>
                    )}

                    {/* Seats in this column */}
                    <div className="flex">
                      {rows.map((row) => (
                        <div key={`${row}${col}`} className="mx-1">
                          {renderSeat(row, col)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If there's only one floor, render it directly
  if (floors.length <= 1) {
    return renderFloor(floors[0] || 1)
  }

  // Otherwise, render tabs for multiple floors
  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeFloor.toString()} onValueChange={(value) => setActiveFloor(Number(value))}>
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium mr-4">Select Floor:</h3>
          <TabsList>
            {floors.map((floor) => (
              <TabsTrigger key={floor} value={floor.toString()}>
                Floor {floor}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {floors.map((floor) => (
          <TabsContent key={floor} value={floor.toString()}>
            {renderFloor(floor)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
