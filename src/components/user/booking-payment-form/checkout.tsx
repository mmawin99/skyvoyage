import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { searchSelectedRoutes } from '@/types/type'
import { EqualApproximately } from 'lucide-react'

export const CheckoutForm = ({ selectedRoute, totalFare, thbFare }: {
  selectedRoute: searchSelectedRoutes
  totalFare: number
  thbFare: number
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const { data: sessionData } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
        toast.error("Payment Failed: " + result.error.message)
        setLoading(false)
        return
      }

      if (result.paymentIntent.status === "succeeded") {
        await fetch("/api/payment/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedRoute,
            userid: sessionData?.user.uuid,
            paymentReference: result.paymentIntent.id,
            paymentDate: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            paymentMethod: result.paymentIntent.payment_method
          })
        })

        toast.success("Payment Successful: Booking confirmed!")
        router.push("/booking-confirmation")
      }
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <PaymentElement />
      </div>
      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading ? "Processing..." : 
        <div className="flex flex-row items-center gap-2">
            Pay now for $ {totalFare} <EqualApproximately className='h-4 w-4' /> ({thbFare} THB)
        </div>}
      </Button>
    </form>
  )
}
