import { AdminHeader, AdminSideBar } from '@/components/admin-side-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminWrapper } from '@/components/adminWrapper'
import React from 'react'
import AircraftAdmin from '@/components/admin/aircraft/aircraft-admin'

const AircraftManagement = () => {

    return (
        <AdminWrapper>
             <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    <AdminHeader title="Aircraft Management" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
                                <AircraftAdmin /> 
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default AircraftManagement