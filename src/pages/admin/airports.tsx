import type { Metadata } from "next"
import { AdminWrapper } from "@/components/adminWrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader, AdminSideBar } from "@/components/admin-side-bar"
import AirportAdmin from "@/components/admin/airport/airport-admin"
export const metadata: Metadata = {
    title: "Airport",
    description: "Manage Airport with ease",
}

const AirportManagement = () => {
    return (
        <AdminWrapper adminPermission={["SUPER",'DATA_ENTRY']}>
            <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    <AdminHeader title="Airport management" link="/admin/airports" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                                <AirportAdmin />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default AirportManagement