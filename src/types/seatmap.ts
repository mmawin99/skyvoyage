import { SeatmapAPIAdmin } from "./type"

export interface SeatFeature {
  id: number
  name: string
  type: "positive" | "negative" | "neutral" | "blocked"
}
// Sample seat features data
export const seatFeatures: Record<string, SeatFeature> = {
    "1":  {
        "id": 1,
        "name":"Personal TV available in armrest",
        "type": "negative"
    },
    "2":  {
        "id": 2,
        "name":"Narrower seat",
        "type": "negative"
    },
    "3":  {
        "id": 3,
        "name":"Side Armrest on aircraft door",
        "type": "negative"
    },
    "4":  {
        "id": 4,
        "name":"Recline might be limited",
        "type": "negative"
    },
    "5":  {
        "id": 5,
        "name":"Stairs, heavy traffic area",
        "type": "negative"
    },
    "6":  {
        "id": 6,
        "name":"Close to exit, drafts and chilly",
        "type": "negative"
    },
    "7":  {
        "id": 7,
        "name":"Close to galleys",
        "type": "negative"
    },
    "8":  {
        "id": 8,
        "name":"Wing from window view",
        "type": "negative"
    },
    "9":  {
        "id": 9,
        "name":"Limited storage space",
        "type": "negative"
    },
    "10": {
        "id": 10,
        "name":"Tray table in the armrest",
        "type": "negative"
    },
    "11": {
        "id": 11,
        "name":"Pre Reclined Seat",
        "type": "negative"
    },
    "12": {
        "id": 12,
        "name":"Near a noisy location",
        "type": "negative"
    },
    "13": {
        "id": 13,
        "name":"Partial or missing window view",
        "type": "negative"
    },
    "14": {
        "id": 14,
        "name":"Close to Lavatory",
        "type": "negative"
    },
    "15": {
        "id": 15,
        "name":"Extra Storage on side of the seat",
        "type": "negative"
    },
    "16": {
        "id": 16,
        "name":"No Underseat Storage",
        "type": "negative"
    },
    "17": {
        "id": 17,
        "name":"Restricted recline, backaches possible",
        "type": "negative"
    },
    "18": {
        "id": 18,
        "name":"Exit Row",
        "type": "negative"
    },
    "19": {
        "id": 19,
        "name":"Constrained Legroom",
        "type": "negative"
    },
    "20": {
        "id": 20,
        "name":"Close to bassinet seat",
        "type":"neutral"
    },
    "21": {
        "id": 21,
        "name":"Armrest on the window side",
        "type":"neutral"
    },
    "22": {
        "id": 22,
        "name":"Inverted seat, facing the rear",
        "type":"neutral"
    },
    "23": {
        "id": 23,
        "name":"Extra Legroom",
        "type":"positive"
    },
    "24": {
        "id": 24,
        "name":"Audio & Video On Demand (BYOD $)",
        "type":"positive"
    },
    "25": {
        "id": 25,
        "name":"Audio & Video On Demand ($)",
        "type":"positive"
    },
    "26": {
        "id": 26,
        "name":"Audio & Video On Demand (DIRECTV & BYOD)",
        "type":"positive"
    },
    "27": {
        "id": 27,
        "name":"Audio & Video On Demand (Yes)",
        "type":"positive"
    },
    "28": {
        "id": 28,
        "name":"Audio & Video On Demand (BYOD)",
        "type":"positive"
    },
    "29": {
        "id": 29,
        "name":"Audio & Video On Demand (iPad)",
        "type":"positive"
    },
    "30": {
        "id": 30,
        "name":"USB Plug",
        "type":"positive"
    },
    "31": {
        "id": 31,
        "name":"USB & power plug (AC)",
        "type":"positive"
    },
    "32": {
        "id": 32,
        "name":"Power plug (AC)",
        "type":"positive"
    },
    "33": {
        "id": 33,
        "name":"Power plug (AC/USB)",
        "type":"positive"
    },
    "34": {
        "id": 34,
        "name":"Standard Seat",
        "type":"positive"
    },
    "35": {
        "id": 35,
        "name":"WiFi Enabled",
        "type":"positive"
    },
    "36": {
        "id": 36,
        "name":"Storage is in the wall",
        "type":"positive"
    },
    "37": {
        "id": 37,
        "name":"Baby bassinet available",
        "type":"positive"
    },
    "38": {
        "id": 38,
        "name":"Reserved for Cabin Crew",
        "type":"blocked"
    },
    "39": {
        "id": 39,
        "name":"get Bumped",
        "type":"blocked"
    }
}

// Define the seat class type
export interface SeatClass {
  id: string
  name: string
  code: string
  color: string
}

// Define the seat map type
export interface SeatMap {
  id: string
  airlineCode: string
  airlineName: string
  aircraftModel: string
  version: string
  classes: SeatClass[]
  seats: SeatmapAPIAdmin[]
}
