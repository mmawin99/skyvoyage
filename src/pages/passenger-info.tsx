import { AppFooter } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const PassengerInfo = () => {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">
                  Fill in Passenger Information
                </h1>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-7/20 md:sticky md:top-20 self-start h-fit">
                        <Card className="max-h-screen overflow-auto">
                            <CardHeader className="text-lg font-semibold">
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </div>

            <AppFooter />
        </main>
    )
}

export default PassengerInfo