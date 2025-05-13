import { FarePackage, FareType, UniversalFlightSchedule } from "@/types/type";

export const FarePackageList = (flight:UniversalFlightSchedule, cabinclass:"Y"|"C"|"W"|"F",filter:FareType | null = null):FarePackage[]=>{
  const farePackage:FarePackage[] = [
    {
      type: "SUPER_SAVER",
      price: flight.price.SUPER_SAVER,
      available: cabinclass === "Y",
      baggage: "1 x 23kg",
      carryOn: "1 x 7kg",
      mileage: "Not eligible",
      seatSelection: true,
      changes: "Fee applies",
      cancellation: "Fee applies",
      priorityBoarding: false,
      label: "Economy",
      refundable: true,
      loungeAccess: false,
      mealSelection: false
    },
    {
      type: "SAVER",
      price: flight.price.SAVER,
      available: cabinclass === "Y" || cabinclass === "W",
      baggage: "1 x 23kg",
      carryOn: "1 x 7kg",
      mileage: "0 - 25%",
      seatSelection: true,
      changes: "Fee applies",
      cancellation: "Fee applies",
      priorityBoarding: false,
      label: "Value",
      refundable: true,
      loungeAccess: false,
      mealSelection: false
    },
    {
      type: "STANDARD",
      price: flight.price.STANDARD,
      available: cabinclass === "Y" || cabinclass === "W",
      baggage: "1 x 25kg",
      carryOn: "1 x 7kg",
      mileage: "25 - 75%",
      seatSelection: true,
      changes: "Fee applies",
      cancellation: "Fee applies",
      priorityBoarding: false,
      recommended: true,
      label: "Popular",
      refundable: true,
      loungeAccess: false,
      mealSelection: cabinclass == "W" ? true : false
    },
    {
      type: "FLEXI",
      price: flight.price.FLEXI,
      available: cabinclass === "Y" || cabinclass === "W" || cabinclass === "C" || cabinclass === "F",
      baggage: "1 x 30kg",
      carryOn: "1 x 7kg",
      mileage: "75 - 100%",
      seatSelection: true,
      changes: "Free",
      cancellation: "Fee applies",
      priorityBoarding: true,
      label: "Business",
      refundable: true,
      loungeAccess: true,
      mealSelection: true
    },
    {
      type: "FULL_FLEX",
      price: flight.price.FULL_FLEX,
      available: cabinclass === "Y" || cabinclass === "W" || cabinclass === "C" || cabinclass === "F",
      baggage: "2 x 32kg",
      carryOn: "1 x 7kg",
      mileage: "100 - 125%",
      seatSelection: true,
      changes: "Free",
      cancellation: "Free",
      priorityBoarding: true,
      label: "Premium",
      refundable: true,
      loungeAccess: true,
      mealSelection: true
    }
  ]
  
  if(filter) return farePackage.filter((item) => item.type === filter)
  return farePackage.filter((item) => item.available)
}

export const formatFareType = (type: FareType) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
}