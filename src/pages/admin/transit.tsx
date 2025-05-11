import type { Metadata } from "next"
import { AdminWrapper } from "@/components/adminWrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader, AdminSideBar } from "@/components/admin-side-bar"
import TransitAdmin from "@/components/admin/transit/transit-admin"

export const metadata: Metadata = {
    title: "Transit Schedule",
    description: "Manage Transit schedules with ease",
}

const Schedules = () => {
    return (
        <AdminWrapper adminPermission={["SUPER",'DATA_ENTRY']}>
            <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    <AdminHeader title="Transit management" link="/admin/transit" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                                <TransitAdmin />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default Schedules