import { AdminHeader, AdminSideBar } from '@/components/admin-side-bar'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminWrapper } from '@/components/adminWrapper'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import React from 'react'
import { Metadata } from 'next'
export const metadata: Metadata = {
    title: "Admin",
    description: "Admin dashboard",
}
const AdminHome = () => {

    return (
        <AdminWrapper>
             <SidebarProvider>
                <AdminSideBar />
                <SidebarInset>
                    {/* <SiteHeader /> */}
                    <AdminHeader title="Dashboard" />
                    {/* <SiteHeader /> */}
                    <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* <SectionCards /> */}
                        <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                <CardDescription>Total Revenue</CardDescription>
                                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                    $1,250.00
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <TrendingUpIcon className="size-3" />
                                    +12.5%
                                    </Badge>
                                </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Trending up this month <TrendingUpIcon className="size-4" />
                                </div>
                                <div className="text-muted-foreground">
                                    Visitors for the last 6 months
                                </div>
                                </CardFooter>
                            </Card>
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                <CardDescription>New Customers</CardDescription>
                                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                    1,234
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <TrendingDownIcon className="size-3" />
                                    -20%
                                    </Badge>
                                </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Down 20% this period <TrendingDownIcon className="size-4" />
                                </div>
                                <div className="text-muted-foreground">
                                    Acquisition needs attention
                                </div>
                                </CardFooter>
                            </Card>
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                <CardDescription>Active Accounts</CardDescription>
                                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                    45,678
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <TrendingUpIcon className="size-3" />
                                    +12.5%
                                    </Badge>
                                </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Strong user retention <TrendingUpIcon className="size-4" />
                                </div>
                                <div className="text-muted-foreground">Engagement exceed targets</div>
                                </CardFooter>
                            </Card>
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                <CardDescription>Growth Rate</CardDescription>
                                <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                    4.5%
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <TrendingUpIcon className="size-3" />
                                    +4.5%
                                    </Badge>
                                </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Steady performance <TrendingUpIcon className="size-4" />
                                </div>
                                <div className="text-muted-foreground">Meets growth projections</div>
                                </CardFooter>
                            </Card>
                            </div>
                        {/* <SectionCards /> */}
                        {/* <div className="px-4 lg:px-6">
                            <ChartAreaInteractive />
                        </div>
                        <DataTable data={data} /> */}
                        </div>
                    </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminWrapper>
    )
}

export default AdminHome