import type { Metadata } from "next"
import FlightScheduleAdmin from "@/components/schedule/flight-schedule-admin"
import { AdminWrapper } from "@/components/adminWrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader, AdminSideBar } from "@/components/admin-side-bar"

export const metadata: Metadata = {
    title: "Flight Schedule",
    description: "Manage flight schedules with ease",
}

export default function Page() {
    return (
        <AdminWrapper>
            <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    <AdminHeader title="Flight Schedule management" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <FlightScheduleAdmin />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    // <div className="flex min-h-screen w-full flex-col">
    //   <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
    //     <FlightScheduleAdmin />
    //   </main>
    // </div>
    )
}