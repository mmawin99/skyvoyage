/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { searchSelectedRoutes } from '@/types/type'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { CheckCircleIcon, EqualApproximately, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'sonner'

export const CheckoutForm = ({ selectedRoute, totalFare, thbFare, onComplete }: {
  selectedRoute: searchSelectedRoutes
  onComplete: () => void
  totalFare: number
  thbFare: number
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const { data: sessionData } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false)
  const [isBookingCreated, setIsBookingCreated] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required"
      })

      if (result.error) {
        console.log(result);
        toast.error("Payment Failed: " + result.error.message)
        setLoading(false)
        return
      }else{
        console.log(result);
      }

      if (result.paymentIntent.status === "succeeded") {
        setIsPaymentSuccess(true)
        try{
          const createBooking = await fetch("/api/booking/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              selectedRoute,
              userid: sessionData?.user.uuid,
              paymentReference: result.paymentIntent.id,
              paymentDate: new Date().toISOString(),
              paymentMethod: result.paymentIntent.payment_method,
              totalFare: thbFare
            })
          })
          const bookingData = await createBooking.json()
          console.log("Booking Data: ", bookingData)
          if(bookingData.status) {
            setIsBookingCreated(true)
            toast.success("Payment Successful: Booking confirmed!");
            onComplete()
          }else{
            toast.error("Booking creation failed: " + bookingData?.error)
          }
          // router.push("/confirmed")
        }catch(error) {
          console.error("Error creating booking:", error)
          toast.error("Booking creation failed: " + (error as Error).message)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message)
    }
    setLoading(false)
  }
  if(isBookingCreated) {
    return (
      <Card>
        <CardHeader className="text-lg font-semibold mb-4">Booking Confirmation</CardHeader>
        <CardContent className='flex flex-col items-center '>
          <CheckCircleIcon className="h-16 w-16 text-primary mb-4" />
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h2 className="text-lg font-semibold mb-4">Booking Confirmed!</h2>
            <p className="text-gray-500">Your journey has begin right now, Thank for choosing us.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  if(isPaymentSuccess) {
    // return card that show booking being created, please wait...
    return (
      <Card>
        {/* <CardHeader className="text-lg font-semibold mb-4">Booking Confirmation</CardHeader> */}
        <CardContent className='flex flex-col items-center '>
          <Loader2 className="animate-spin h-16 w-16 text-primary mb-4" />
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h2 className="text-lg font-semibold mb-4">Booking is being created...</h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <PaymentElement />
      </div>
      <Button type="submit" className="w-full cursor-pointer" disabled={!stripe || loading}>
        {loading ? "Processing..." : 
        <div className="flex flex-row items-center gap-2">
            Pay now for $ {totalFare} <EqualApproximately className='h-4 w-4' /> ({thbFare} THB)
        </div>}
      </Button>
    </form>
  )
}
