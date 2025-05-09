// import { FareType } from "@/types/type";
type FareType = "SUPER_SAVER" | "SAVER" | "STANDARD" | "FLEXI" | "FULL_FLEX"
export const cabinClassPrice = (price:number, cabinClass: "Y" | "F" | "C" | "W" , FarePackage: FareType)=>{
    price = customRoundPricing(price)
    if(cabinClass === "Y"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return price
            case "SAVER":
                return price + 50
            case "STANDARD":
                return price + 100
            case "FLEXI":
                return price + 150
            case "FULL_FLEX":
                return price + 200
            default:
                return price
        }
    }else if(cabinClass === "W"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return -1
            case "SAVER":
                return price
            case "STANDARD":
                return price + 50
            case "FLEXI":
                return price + 100
            case "FULL_FLEX":
                return price + 150
            default:
                return price
        }
    }else if(cabinClass === "C"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return -1
            case "SAVER":
                return -1
            case "STANDARD":
                return -1
            case "FLEXI":
                return price
            case "FULL_FLEX":
                return price + 125
            default:
                return price
        }
    }else if(cabinClass === "F"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return -1
            case "SAVER":
                return -1
            case "STANDARD":
                return -1
            case "FLEXI":
                return price + 100
            case "FULL_FLEX":
                return price + 200
            default:
                return price
        }
    }
    return -1
}

export const flightPriceCalculator = (totalPrice: number, type: "Adult" | "Children" | "Infant", passengerCount:number = 1 ):number=>{
    if (type === "Adult") {
      return totalPrice * passengerCount
    } else if (type === "Children") {
      return Math.floor(totalPrice * 0.78553) * passengerCount
    } else if (type === "Infant") {
      return Math.floor(totalPrice * 0.22053) * passengerCount
    }
    return 0
  }

export function customRoundPricing(num:number):number {
    // Check if the number is negative, return 0 if it is
    if(num < 0) return 0;
    // Extract the ones digit and tens digit
    const onesDigit = num % 10;
    const tensDigit = Math.floor((num % 100) / 10);
    
    if (onesDigit === 0 && (tensDigit === 0 || tensDigit % 10 === 0)) {
        // Already at a desired value (like 130, 200, etc.)
        return num;
    } else if (onesDigit >= 0) {
        // Round up to the nearest 10
        return Math.ceil(num / 10) * 10;
    }
    // Default return to handle all cases
    return num;
}

export function extractVAT(totalFare:number, vatRate = 0.07) {
    const vat = (totalFare * vatRate) / (1 + vatRate);
    const base = totalFare - vat;
    return { basePrice: base, vatAmount: vat };
}

export function shortenNumber(num:number):string {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + " B";
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + " M";
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + " K";
    }
    return num.toString();
}