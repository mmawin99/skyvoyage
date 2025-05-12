import { AdminHeader, AdminSideBar } from '@/components/admin-side-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminWrapper } from '@/components/adminWrapper'
import React from 'react'
import {SeatmapAdmin} from '@/components/admin/seatmap/seatmap-admin'

const AdminUserManagement = () => {

    return (
        <AdminWrapper adminPermission={["SUPER","DATA_ENTRY"]}>
            <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    <AdminHeader title="Seatmap management" link="/admin/seat-map" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                                <SeatmapAdmin />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default AdminUserManagement