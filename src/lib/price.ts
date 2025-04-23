// import { FareType } from "@/types/type";
type FareType = "SUPER_SAVER" | "SAVER" | "STANDARD" | "FLEXI" | "FULL_FLEX"
export const cabinClassPrice = (price:number, cabinClass: "Y" | "F" | "C" | "W" , FarePackage: FareType)=>{
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
