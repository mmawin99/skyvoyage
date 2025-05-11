import { AdminHeader, AdminSideBar } from '@/components/admin-side-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminWrapper } from '@/components/adminWrapper'
import React from 'react'
import { Metadata } from 'next'
import AdminDashboard from '@/components/admin/dashboard/dashboard'
export const metadata: Metadata = {
    title: "Admin",
    description: "Admin dashboard",
}
const AdminHome = () => {

    return (
        <AdminWrapper adminPermission={["SUPER",'DATA_ENTRY','USER']}>
             <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    {/* <SiteHeader /> */}
                    <AdminHeader title="Dashboard" link="/admin" />
                    {/* <SiteHeader /> */}
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                                <AdminDashboard />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default AdminHome