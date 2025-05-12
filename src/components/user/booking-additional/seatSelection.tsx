/* eslint-disable @typescript-eslint/no-unused-vars */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PassengerFillOut, PassengerTicket, searchSelectedRoutes, SeatmapAPI, SeatmapFetch } from '@/types/type'
import { ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export const SeatSelectionCard = ({onInteract,isError, setError}:{
    onInteract: ()=> void
    isError: boolean
    setError: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    return (
        <Card className={`p-0 flex-col md:flex-row overflow-hidden gap-0 ${isError ? "border-2 border-red-500 bg-amber-100" : ""}`}>
          <CardImage
                src="./seat.jpg" 
                alt="Pick Your Seat" 
                aspectRatio="wide"
                position="top"
                className="w-full md:hidden h-42"
            />
            <div className="flex flex-col w-full md:w-2/3 py-6">
                <CardHeader>
                    <CardTitle className={`text-lg font-semibold`}>Seat Selection</CardTitle>
                    <CardDescription>Find your perfect spot onboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Select the seat that suits you best &mdash; whether you prefer extra legroom, a window view, or quick access to the aisle. Secure your comfort and enjoy a more personalized flying experience.</p>
                    <p className='font-bold text-sm'>*If seat is not selected, you will be automatically assign to the first seat that is not reserved.</p>
                </CardContent>
                <CardFooter>
                    <Button variant={"default"} onClick={()=>{
                      onInteract();
                      setError(false);
                    }} className="cursor-pointer">Pick Your Seat</Button>
                </CardFooter>
            </div>
            <CardImage
                src="./seat.jpg" 
                alt="Pick Your Seat" 
                aspectRatio="wide"
                position="left"
                className="w-1/3 rounded-l-none hidden md:block"
            />
        </Card>
    )
}

// interface SeatmapSelectorProps {
//     passenger: PassengerFillOut[];
//     seatmap: SeatmapAPI[];
//     ticketIndex: number;
//     tempSelections: Record<number, Record<number, string | null>>;
//     updateTempSelection: (passengerIndex: number, ticketIndex: number, seatId: string | null) => void;
//   }
  
//   const SeatmapSelector: React.FC<SeatmapSelectorProps> = ({
//     passenger,
//     seatmap,
//     ticketIndex,
//     tempSelections,
//     updateTempSelection,
//   }) => {
//     // State to track which passenger is currently selecting seats
//     const [activePassenger, setActivePassenger] = useState<number | null>(null);
  
//     const handleSeatSelect = (
//       seat: SeatmapAPI,
//       passengerIndex: number
//     ) => {
//       if (passengerIndex === null) return;
  
//       // Check if the seat is already selected by this passenger
//       const isAlreadySelected = tempSelections[passengerIndex]?.[ticketIndex] === seat.seatId;
  
//       // If the seat is already selected by this passenger, deselect it
//       if (isAlreadySelected) {
//         updateTempSelection(passengerIndex, ticketIndex, null);
//         return;
//       }
  
//       // Update the temporary selection for this passenger
//       updateTempSelection(passengerIndex, ticketIndex, seat.seatId);
      
//       // If this passenger has an infant, clear the infant's seat
//       passenger
//         .map((p, idx) => ({ ...p, idx }))
//         .filter(
//           (p) =>
//             p.ageRange === "Infant" &&
//             passengerIndex >= 0 &&
//             p.idx === passengerIndex + 1
//         )
//         .forEach((infant) => {
//           updateTempSelection(infant.idx, ticketIndex, null);
//         });
//     };
  
//     // Function to organize seats into rows and columns
//     const organizeSeatGrid = (seatmapData: SeatmapAPI[]) => {
//       // Get all available seats
//       const availableSeats = seatmapData.filter(seat => seat.seatStatus === 'available');
      
//       // Extract unique rows and columns
//       const uniqueRows = [...new Set(availableSeats.map(seat => seat.row))].sort((a, b) => a - b);
//       const uniqueColumns = [...new Set(availableSeats.map(seat => seat.column))].sort();
      
//       // Create the grid structure
//       const grid = uniqueRows.map(row => {
//         return {
//           row,
//           columns: uniqueColumns.map(column => {
//             const seat = availableSeats.find(seat => seat.row === row && seat.column === column);
//             return seat || null;
//           })
//         };
//       });
      
//       return { grid, columns: uniqueColumns };
//     };
  
//     // Function to check if a seat is selected by any passenger in temporary selections
//     const isSeatSelected = (seatId: string) => {
//       for (const [passengerIdx, ticketSelections] of Object.entries(tempSelections)) {
//         if (ticketSelections[ticketIndex] === seatId) {
//           return parseInt(passengerIdx);
//         }
//       }
//       return -1;
//     };
  
//     // Function to get passenger name by index
//     const getPassengerName = (index: number) => {
//       if (index >= 0 && index < passenger.length) {
//         return `${passenger[index].label} (${passenger[index].ageRange})`;
//       }
//       return '';
//     };
//     const getPassengerNameAlias = (index: number) => {
//       if (index >= 0 && index < passenger.length) {
//         return `${passenger[index].firstName[0]}${passenger[index].lastName[0]}`;
//       }
//       return '';
//     };
  
//     const eligiblePassengers = passenger.filter((p, idx) => 
//       (p.ageRange === "Adult" || p.ageRange === "Children")
//     );
  
//     const { grid, columns } = organizeSeatGrid(seatmap);
    
//     // Get current seat assignment (from temp state)
//     const getCurrentSeatNum = (passengerIndex: number) => {
//       const seatId = tempSelections[passengerIndex]?.[ticketIndex];
//       if (!seatId) return "Not Selected";
      
//       const seat = seatmap.find(s => s.seatId === seatId);
//       return seat?.seatNum || "Unknown";
//     };
    
//     // Get seat price
//     const getSeatPrice = (passengerIndex: number) => {
//       const seatId = tempSelections[passengerIndex]?.[ticketIndex];
//       if (!seatId) return null;
      
//       const seat = seatmap.find(s => s.seatId === seatId);
//       return seat?.price || null;
//     };
            
//     return (
//       <div className="space-y-6">
//         <Card className="mb-4">
//           <CardContent className="p-4">
//             {/* Passenger Selection */}
//             <div className="mb-4">
//               <h3 className="text-md font-medium mb-2">Select Passenger</h3>
//               <div className="flex flex-wrap gap-2">
//                 {eligiblePassengers.map((p, idx) => (
//                   <Button
//                     key={p.pid}
//                     variant={activePassenger === idx ? "default" : "outline"}
//                     onClick={() => setActivePassenger(idx)}
//                     className="text-sm"
//                   >
//                     {p.label}
//                     {tempSelections[idx]?.[ticketIndex] ? 
//                       ` (${getCurrentSeatNum(idx)})` : 
//                       ' (No Seat)'}
//                   </Button>
//                 ))}
//               </div>
//             </div>
            
//             {/* Passenger Assignments Overview */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
//               {eligiblePassengers.map((p, pIdx) => {
//                 const seatPrice = getSeatPrice(pIdx);
//                 return (
//                   <div key={p.pid} className="border p-2 rounded bg-gray-50">
//                     <p className="font-medium text-sm">{p.label}</p>
//                     <p className="text-sm">
//                       Seat: {getCurrentSeatNum(pIdx)} 
//                     </p>
//                     {seatPrice !== null && (
//                       <p className="text-sm text-green-600">
//                         Price: ${seatPrice}
//                       </p>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
            
//             {/* Seatmap */}
//             <div className="mt-4">
//               <h3 className="text-md font-medium mb-2">Seat Map</h3>
//               <div className="overflow-x-auto">
//                 <div className="mb-2 flex justify-center">
//                   <div className="grid grid-flow-col gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(40px, 1fr))` }}>
//                     {columns.map(column => (
//                       <div key={column} className="text-center font-medium text-sm">{column}</div>
//                     ))}
//                   </div>
//                 </div>
                
//                 {grid.map(row => (
//                   <div key={row.row} className="flex justify-center mb-2">
//                     <div className="mr-2 flex items-center text-sm font-medium">
//                       {row.row}
//                     </div>
//                     <div className="grid grid-flow-col gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(40px, 1fr))` }}>
//                       {row.columns.map((seat, colIndex) => {
//                         if (!seat) return <div key={`empty-${row.row}-${colIndex}`} className="w-10 h-10"></div>;
                        
//                         const passengerIdx = isSeatSelected(seat.seatId);
//                         const isSelected = passengerIdx !== -1;
//                         const isCurrentPassengerSeat = passengerIdx === activePassenger;
                        
//                         return (
//                           <Button
//                             key={seat.seatId}
//                             variant="outline"
//                             disabled={isSelected && !isCurrentPassengerSeat && activePassenger !== null}
//                             className={cn("w-10 h-10 p-0 flex items-center justify-center", {
//                               "bg-blue-500 text-white": isSelected,
//                               "hover:bg-green-100": !isSelected && activePassenger !== null,
//                               "hover:bg-red-100": isSelected && isCurrentPassengerSeat, // Highlight that clicking will deselect
//                               "cursor-not-allowed opacity-50": isSelected && !isCurrentPassengerSeat && activePassenger !== null
//                             })}
//                             title={isSelected 
//                               ? `Assigned to ${getPassengerName(passengerIdx)} - $${seat.price}` 
//                               : `${seat.class} Class - $${seat.price}`}
//                             onClick={() => {
//                               if (activePassenger !== null) {
//                                 handleSeatSelect(seat, activePassenger);
//                               }
//                             }}
//                           >
//                             {isSelected ? getPassengerNameAlias(passengerIdx) : seat.seatNum}
//                           </Button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               {/* Legend */}
//               <div className="mt-4 flex flex-wrap gap-4">
//                 <div className="flex items-center">
//                   <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
//                   <span className="text-sm">Selected Seat</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-4 h-4 border rounded mr-2"></div>
//                   <span className="text-sm">Available Seat</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-4 h-4 border border-red-500 rounded mr-2"></div>
//                   <span className="text-sm">Click to Deselect</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   };
  
//   export const SeatSelectionForm = ({
//       onClose,
//       selectedRoute,
//       seatmapTemporary,
//       updatePassenger,
//       defaultValue = [],
//       setDefaultValue
//   }:{
//       onClose: ()=> void
//       selectedRoute: searchSelectedRoutes,
//       updatePassenger: (update: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket>}[]) => void
//       defaultValue?: string[]
//       setDefaultValue?: React.Dispatch<React.SetStateAction<string[]>>
//       seatmapTemporary: SeatmapFetch[]
//   }) => {
//       // Initialize temporary state for seat selections
//       const [tempSelections, setTempSelections] = useState<Record<number, Record<number, string | null>>>({});
//       const [activeAccordion, setActiveAccordion] = useState<string | null>("baggage-0");
      
//       // Initialize temp state from current passenger data
//       useEffect(() => {
//           const initialState: Record<number, Record<number, string | null>> = {};
          
//           selectedRoute?.passenger?.forEach((p, pIdx) => {
//               initialState[pIdx] = {};
//               p.ticket.forEach((ticket, tIdx) => {
//                   if (ticket && ticket.seatId) {
//                       initialState[pIdx][tIdx] = ticket.seatId;
//                   }
//               });
//           });
          
//           setTempSelections(initialState);
//       }, [selectedRoute?.passenger]);
      
//       // Function to update temporary selections
//       const updateTempSelection = (passengerIndex: number, ticketIndex: number, seatId: string | null) => {
//           setTempSelections(prev => {
//               const newSelections = {...prev};
//               if (!newSelections[passengerIndex]) {
//                   newSelections[passengerIndex] = {};
//               }
//               newSelections[passengerIndex][ticketIndex] = seatId;
//               return newSelections;
//           });
//       };
      
//       // Function to apply all temporary selections at once
//       const applySelections = () => {
//           const updates: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket> }[] = [];
          
//           // Convert temp selections to update format
//           for (const [passengerIdx, ticketSelections] of Object.entries(tempSelections)) {
//               for (const [ticketIdx, seatId] of Object.entries(ticketSelections)) {
//                   const seat = seatId 
//                       ? seatmapTemporary
//                           .filter(s => s.flightId === allSegments[parseInt(ticketIdx)].flightId)[0]
//                           ?.data.find(s => s.seatId === seatId)
//                       : null;
                  
//                   updates.push({
//                       passengerIndex: parseInt(passengerIdx),
//                       ticketIndex: parseInt(ticketIdx),
//                       fields: { 
//                           seatId,
//                           seatPrice: seat?.price ?? 0
//                       }
//                   });
//               }
//           }
          
//           // Update parent state once with all changes
//           updatePassenger(updates);
          
//           // Update defaultValue if needed
//           if (setDefaultValue) {
//               const seatIds = updates.map(update => update.fields.seatId ?? "");
//               setDefaultValue(seatIds);
//           }
//           onClose();
//       };
      
//       const allSegments = [
//           ...selectedRoute.selectedDepartRoute.flight.segments, 
//           ...(selectedRoute?.selectedReturnRoute?.flight.segments ?? [])
//       ];
      
//       return (
//           <Card>  
//               <CardHeader className='flex flex-row items-center justify-between'>
//                   <div>
//                       <CardTitle className={`text-lg font-semibold`}>Seat Selection</CardTitle>
//                       <CardDescription>Select perfect spot onboard</CardDescription>
//                   </div>
//                   <Button variant={"destructive"} onClick={onClose} className='rounded-lg'>X</Button>
//               </CardHeader>
//               <CardContent>
//                   <Accordion 
//                         type="single" 
//                         collapsible 
//                         className="my-4 w-full">
//                         {allSegments.map((segment, segmentIndex) => (
//                             <AccordionItem 
//                                 key={segmentIndex} 
//                                 value={`baggage-${segmentIndex}`} 
//                                 className="w-full"
//                             >
//                                 <AccordionTrigger className="w-full flex justify-between items-center">
//                                     <div className='flex flex-row items-center'>
//                                         (Flight: {segment.airlineCode} {segment.flightNum.split("-")[0]}) 
//                                         [{segment.departureAirport} <ArrowRight className='h-4 w-4' /> {segment.arrivalAirport}] 
//                                         <Badge variant="outline" className='ml-2'>
//                                         {
//                                             selectedRoute?.passenger?.filter(
//                                                 (p) => p.ticket?.[segmentIndex]?.seatId != null
//                                             ).length ?? 0
//                                         } / {selectedRoute?.passenger?.filter(p=>p.ageRange!="Infant").length} Selected
//                                         </Badge>
//                                   </div>
//                               </AccordionTrigger>
//                               <AccordionContent className="w-full flex flex-col gap-2">
//                                   <SeatmapSelector
//                                       passenger={selectedRoute?.passenger ?? []}
//                                       seatmap={seatmapTemporary.filter((s) => s.flightId === segment.flightId)[0]?.data ?? []}
//                                       ticketIndex={segmentIndex}
//                                       tempSelections={tempSelections}
//                                       updateTempSelection={updateTempSelection}
//                                   />
//                               </AccordionContent>
//                           </AccordionItem>
//                       ))}
//                   </Accordion>
//               </CardContent>
//               <CardFooter className="flex justify-between">
//                   <Button variant="outline" onClick={onClose}>
//                       Cancel
//                   </Button>
//                   <Button onClick={applySelections}>
//                       Complete Seat Selection
//                   </Button>
//               </CardFooter>
//           </Card>
//     );
// }

interface SeatmapSelectorProps {
  passenger: PassengerFillOut[];
  seatmap: SeatmapAPI[];
  ticketIndex: number;
  tempSelections: Record<number, Record<number, string | null>>;
  updateTempSelection: (passengerIndex: number, ticketIndex: number, seatId: string | null) => void;
}

const SeatmapSelector: React.FC<SeatmapSelectorProps> = ({
  passenger,
  seatmap,
  ticketIndex,
  tempSelections,
  updateTempSelection,
}) => {
  // State to track which passenger is currently selecting seats
  const [activePassenger, setActivePassenger] = useState<number | null>(null);

  const handleSeatSelect = (
    seat: SeatmapAPI,
    passengerIndex: number
  ) => {
    if (passengerIndex === null) return;

    // Check if the seat is already selected by this passenger
    const isAlreadySelected = tempSelections[passengerIndex]?.[ticketIndex] === seat.seatId;

    // If the seat is already selected by this passenger, deselect it
    if (isAlreadySelected) {
      updateTempSelection(passengerIndex, ticketIndex, null);
      return;
    }

    // Update the temporary selection for this passenger
    updateTempSelection(passengerIndex, ticketIndex, seat.seatId);
    
    // If this passenger has an infant, clear the infant's seat
    passenger
      .map((p, idx) => ({ ...p, idx }))
      .filter(
        (p) =>
          p.ageRange === "Infant" &&
          passengerIndex >= 0 &&
          p.idx === passengerIndex + 1
      )
      .forEach((infant) => {
        updateTempSelection(infant.idx, ticketIndex, null);
      });
  };

  // Function to organize seats into rows and columns
  const organizeSeatGrid = (seatmapData: SeatmapAPI[]) => {
    // Get all available seats
    const availableSeats = seatmapData.filter(seat => seat.seatStatus === 'available');
    
    // Extract unique rows and columns
    const uniqueRows = [...new Set(availableSeats.map(seat => seat.row))].sort((a, b) => a - b);
    const uniqueColumns = [...new Set(availableSeats.map(seat => seat.column))].sort();
    
    return { rows: uniqueRows, columns: uniqueColumns, availableSeats };
  };

  // Function to check if a seat is selected by any passenger in temporary selections
  const isSeatSelected = (seatId: string) => {
    for (const [passengerIdx, ticketSelections] of Object.entries(tempSelections)) {
      if (ticketSelections[ticketIndex] === seatId) {
        return parseInt(passengerIdx);
      }
    }
    return -1;
  };

  // Function to get passenger name by index
  const getPassengerName = (index: number) => {
    if (index >= 0 && index < passenger.length) {
      return `${passenger[index].label} (${passenger[index].ageRange})`;
    }
    return '';
  };
  
  const getPassengerNameAlias = (index: number) => {
    if (index >= 0 && index < passenger.length) {
      return `${passenger[index].firstName[0]}${passenger[index].lastName[0]}`;
    }
    return '';
  };

  const eligiblePassengers = passenger.filter((p) => 
    (p.ageRange === "Adult" || p.ageRange === "Children")
  );

  const { rows, columns, availableSeats } = organizeSeatGrid(seatmap);
  
  // Get current seat assignment (from temp state)
  const getCurrentSeatNum = (passengerIndex: number) => {
    const seatId = tempSelections[passengerIndex]?.[ticketIndex];
    if (!seatId) return "Not Selected";
    
    const seat = seatmap.find(s => s.seatId === seatId);
    return seat?.seatNum || "Unknown";
  };
  
  // Get seat price
  const getSeatPrice = (passengerIndex: number) => {
    const seatId = tempSelections[passengerIndex]?.[ticketIndex];
    if (!seatId) return null;
    
    const seat = seatmap.find(s => s.seatId === seatId);
    return seat?.price || null;
  };
  
  // Find a seat by row and column
  const getSeatByPosition = (row: number, column: string) => {
    return availableSeats.find(seat => seat.row === row && seat.column === column) || null;
  };
          
  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardContent className="p-4">
          {/* Passenger Selection */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Select Passenger</h3>
            <div className="flex flex-wrap gap-2">
              {eligiblePassengers.map((p, idx) => (
                <Button
                  key={p.pid}
                  variant={activePassenger === idx ? "default" : "outline"}
                  onClick={() => setActivePassenger(idx)}
                  className="text-sm"
                >
                  {p.label}
                  {tempSelections[idx]?.[ticketIndex] ? 
                    ` (${getCurrentSeatNum(idx)})` : 
                    ' (No Seat)'}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Passenger Assignments Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {eligiblePassengers.map((p, pIdx) => {
              const seatPrice = getSeatPrice(pIdx);
              return (
                <div key={p.pid} className="border p-2 rounded bg-gray-50">
                  <p className="font-medium text-sm">{p.label}</p>
                  <p className="text-sm">
                    Seat: {getCurrentSeatNum(pIdx)} 
                  </p>
                  {seatPrice !== null && (
                    <p className="text-sm text-green-600">
                      Price: ${seatPrice}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Seatmap - Horizontal Layout with Front on Left */}
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Seat Map</h3>
            <div className="flex items-center space-x-4">
              {/* Aircraft Front Indicator */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mt-2 mb-8 transform rotate-270">AIRCRAFT</div>
                <div className="text-xs text-gray-600 mt-2 transform rotate-270">FRONT</div>
              </div>
              
              {/* Scrollable Seatmap Area */}
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4">
                  {rows.map((row) => (
                    <div key={row} className="flex-none">
                      <div className="text-center font-medium text-sm mb-2">{row}</div>
                      <div className="flex flex-col space-y-2">
                        {columns.slice().reverse().map((column) => {
                          const seat = getSeatByPosition(row, column);
                          
                          if (!seat) return (
                            <div 
                              key={`empty-${row}-${column}`} 
                              className="w-10 h-10"
                            ></div>
                          );
                          
                          const passengerIdx = isSeatSelected(seat.seatId);
                          const isSelected = passengerIdx !== -1;
                          const isCurrentPassengerSeat = passengerIdx === activePassenger;
                          
                          return (
                            <Button
                              key={seat.seatId}
                              variant="outline"
                              disabled={isSelected && !isCurrentPassengerSeat && activePassenger !== null}
                              className={cn("w-10 h-10 p-0 flex items-center justify-center", {
                                "bg-blue-500 text-white": isSelected,
                                "hover:bg-green-100": !isSelected && activePassenger !== null,
                                "hover:bg-red-100": isSelected && isCurrentPassengerSeat,
                                "cursor-not-allowed opacity-50": isSelected && !isCurrentPassengerSeat && activePassenger !== null
                              })}
                              title={isSelected 
                                ? `Assigned to ${getPassengerName(passengerIdx)} - $${seat.price}` 
                                : `${seat.class} Class - $${seat.price}`}
                              onClick={() => {
                                if (activePassenger !== null) {
                                  handleSeatSelect(seat, activePassenger);
                                }
                              }}
                            >
                              {isSelected ? getPassengerNameAlias(passengerIdx) : seat.column}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm">Selected Seat</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border rounded mr-2"></div>
                <span className="text-sm">Available Seat</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border border-red-500 rounded mr-2"></div>
                <span className="text-sm">Click to Deselect</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SeatSelectionForm = ({
  onClose,
  selectedRoute,
  seatmapTemporary,
  updatePassenger,
  defaultValue = [],
  setDefaultValue
}:{
  onClose: ()=> void
  selectedRoute: searchSelectedRoutes,
  updatePassenger: (update: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket>}[]) => void
  defaultValue?: string[]
  setDefaultValue?: React.Dispatch<React.SetStateAction<string[]>>
  seatmapTemporary: SeatmapFetch[]
}) => {
  // Initialize temporary state for seat selections
  const [tempSelections, setTempSelections] = useState<Record<number, Record<number, string | null>>>({});
  const [activeAccordion, setActiveAccordion] = useState<string | null>("baggage-0");
  
  // Initialize temp state from current passenger data
  useEffect(() => {
    const initialState: Record<number, Record<number, string | null>> = {};
    
    selectedRoute?.passenger?.forEach((p, pIdx) => {
      initialState[pIdx] = {};
      p.ticket.forEach((ticket, tIdx) => {
        if (ticket && ticket.seatId) {
          initialState[pIdx][tIdx] = ticket.seatId;
        }
      });
    });
    
    setTempSelections(initialState);
  }, [selectedRoute?.passenger]);
  
  // Function to update temporary selections
  const updateTempSelection = (passengerIndex: number, ticketIndex: number, seatId: string | null) => {
    setTempSelections(prev => {
      const newSelections = {...prev};
      if (!newSelections[passengerIndex]) {
        newSelections[passengerIndex] = {};
      }
      newSelections[passengerIndex][ticketIndex] = seatId;
      return newSelections;
    });
  };
  
  // Function to apply all temporary selections at once
  const applySelections = () => {
    const updates: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket> }[] = [];
    
    // Convert temp selections to update format
    for (const [passengerIdx, ticketSelections] of Object.entries(tempSelections)) {
      for (const [ticketIdx, seatId] of Object.entries(ticketSelections)) {
        const seat = seatId 
          ? seatmapTemporary
            .filter(s => s.flightId === allSegments[parseInt(ticketIdx)].flightId)[0]
            ?.data.find(s => s.seatId === seatId)
          : null;
        
        updates.push({
          passengerIndex: parseInt(passengerIdx),
          ticketIndex: parseInt(ticketIdx),
          fields: { 
            seatId,
            seatPrice: seat?.price ?? 0
          }
        });
      }
    }
    
    // Update parent state once with all changes
    updatePassenger(updates);
    
    // Update defaultValue if needed
    if (setDefaultValue) {
      const seatIds = updates.map(update => update.fields.seatId ?? "");
      setDefaultValue(seatIds);
    }
    onClose();
  };
  
  const allSegments = [
    ...selectedRoute.selectedDepartRoute.flight.segments, 
    ...(selectedRoute?.selectedReturnRoute?.flight.segments ?? [])
  ];
  
  return (
    <Card>  
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className={`text-lg font-semibold`}>Seat Selection</CardTitle>
          <CardDescription>Select perfect spot onboard</CardDescription>
        </div>
        <Button variant={"destructive"} onClick={onClose} className='rounded-lg'>X</Button>
      </CardHeader>
      <CardContent>
        <Accordion 
          type="single" 
          collapsible 
          className="my-4 w-full">
          {allSegments.map((segment, segmentIndex) => (
            <AccordionItem 
              key={segmentIndex} 
              value={`baggage-${segmentIndex}`} 
              className="w-full"
            >
              <AccordionTrigger className="w-full flex justify-between items-center">
                <div className='flex flex-row items-center'>
                  (Flight: {segment.airlineCode} {segment.flightNum.split("-")[0]}) 
                  [{segment.departureAirport} <ArrowRight className='h-4 w-4' /> {segment.arrivalAirport}] 
                  <Badge variant="outline" className='ml-2'>
                  {
                    selectedRoute?.passenger?.filter(
                      (p) => p.ticket?.[segmentIndex]?.seatId != null
                    ).length ?? 0
                  } / {selectedRoute?.passenger?.filter(p=>p.ageRange!="Infant").length} Selected
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="w-full flex flex-col gap-2">
                <SeatmapSelector
                  passenger={selectedRoute?.passenger ?? []}
                  seatmap={seatmapTemporary.filter((s) => s.flightId === segment.flightId)[0]?.data ?? []}
                  ticketIndex={segmentIndex}
                  tempSelections={tempSelections}
                  updateTempSelection={updateTempSelection}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={applySelections}>
          Complete Seat Selection
        </Button>
      </CardFooter>
    </Card>
  );
};

