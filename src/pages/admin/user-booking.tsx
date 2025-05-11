import { AdminHeader, AdminSideBar } from '@/components/admin-side-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminWrapper } from '@/components/adminWrapper'
import React from 'react'
import BookingAdmin from '@/components/admin/booking/booking-admin'
import { Metadata } from 'next'
export const metadata: Metadata = {
    title: "User Booking",
    description: "Manage User Booking with ease",
}
const AircraftManagement = () => {

    return (
        <AdminWrapper adminPermission={["SUPER",'DATA_ENTRY','USER']}>
            <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    <AdminHeader title="Booking Management" link="/admin/user-booking" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                                <BookingAdmin /> 
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default AircraftManagement