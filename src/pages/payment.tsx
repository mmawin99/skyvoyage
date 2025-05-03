/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import * as React from "react"
import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import { ArrowLeft, CheckCircleIcon, Loader2 } from "lucide-react"
import { useSessionStorage } from "@uidotdev/usehooks"
import { CabinClassType, searchSelectedRoutes, UniversalFlightSchedule } from "@/types/type"
import { Navbar } from "@/components/navbar"
import BookingSummary from "@/components/user/booking/booking-summary"
import { AppFooter } from "@/components/footer"
import { useSession } from "next-auth/react"
import { CheckoutForm } from "@/components/user/booking-payment-form/checkout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const BookingPayment = () => {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [selectedRoute, setSelectedRoute] = useSessionStorage<searchSelectedRoutes>("selectedRoute", {
    departRoute: [],
    selectedDepartRoute: {
      selectedFare: "SUPER_SAVER",
      flightId: "",
      flight: {} as UniversalFlightSchedule,
      price: 0
    },
    returnRoute: [],
    selectedReturnRoute: undefined,
    queryString: {
      origin: "",
      destination: "",
      departDateStr: "",
      returnDateStr: "",
      passengersStr: "",
      cabinClass: "Y" as CabinClassType,
      tripType: ""
    },
    totalFare: 0,
    passenger: []
  })
  const totalAdditionalFare =
    selectedRoute.passenger?.reduce(
      (acc, p) =>
        acc +
        p.ticket.reduce((ticketAcc, t) => ticketAcc + t.mealPrice + t.seatPrice + t.baggageAllowancePrice, 0),
      0
    ) ?? 0

  const totalFare = Number(((totalAdditionalFare + selectedRoute.totalFare) * 1.07).toFixed(2))
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  useEffect(() => {
    // Convert USD to THB
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json")
        const data = await res.json()
        const rate = data?.usd?.thb
        if (rate) {
          const thbAmount = totalFare * rate
          setConvertedAmount(thbAmount) // in satang
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate", err)
      }
    }

    fetchExchangeRate()
  }, [totalFare])

  useEffect(() => {
    const fetchClientSecret = async () => {
      const seats =
        selectedRoute.passenger?.flatMap(p =>
          p.ticket.map(t => ({
            seat_id: t.seatId!,
            flight_id: t.fid,
            price: t.seatPrice
          }))
        ) ?? []

      const res = await fetch("/api/booking/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seats,
          userId: sessionData?.user.uuid,
          amount: convertedAmount !== null ? Math.round(convertedAmount * 100) : 0
        })
      })

      const data = await res.json()
      if (data.success) setClientSecret(data.clientSecret)
    }

    if (sessionData?.user.uuid) 
        if (convertedAmount)
            fetchClientSecret()
  }, [sessionData?.user.uuid, totalFare, convertedAmount])
  const onBookingComplete = () => {
    setIsBookingComplete(true)
    setSelectedRoute({
      departRoute: [],
      selectedDepartRoute: {
        selectedFare: "SUPER_SAVER",
        flightId: "",
        flight: {} as UniversalFlightSchedule,
        price: 0
      },
      returnRoute: [],
      selectedReturnRoute: undefined,
      queryString: {
        origin: "",
        destination: "",
        departDateStr: "",
        returnDateStr: "",
        passengersStr: "",
        cabinClass: "Y" as CabinClassType,
        tripType: ""
      },
      totalFare: 0,
      passenger: []
    })
  }
  if(isBookingComplete){
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Booking Confirmed!
          </h1>
          <div className="flex flex-col lg:flex-row gap-6">
          <Card className="w-full">
            <CardHeader className="text-2xl font-semibold mb-4 text-center">Booking Confirmation</CardHeader>
            <CardContent className='flex flex-col items-center '>
              <CheckCircleIcon className="h-32 w-32 text-primary" />
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <h2 className="text-xl font-semibold mb-4">Booking Confirmed!</h2>
                <p className="text-gray-500">Your journey has begin right now, Thank for choosing us.</p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
        <AppFooter />
      </main>
    )
  }
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Button onClick={() => router.push("/booking-confirmation")} variant="default" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          Checkout
        </h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/5">
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                onComplete={onBookingComplete}
                selectedRoute={selectedRoute} totalFare={totalFare} thbFare={convertedAmount ? Number(convertedAmount.toFixed(2)) : 0} />
              </Elements>
            ): (
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                    </CardContent>
                </Card>
            )}
          </div>
          <div className="w-full lg:w-2/5">
            <BookingSummary
              flightOpen={false}
              percentageComplete={100}
              selectedRoute={selectedRoute}
              additionalFare={totalAdditionalFare}
              onClickNext={() => {}}
              customButton={false}
              customText="Checkout now"
              isEnableButton={true}
            />
          </div>
        </div>
      </div>
      <AppFooter />
    </main>
  )
}

export default BookingPayment