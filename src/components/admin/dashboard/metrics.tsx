import React from 'react'
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const MetricsCard = ({
    title,
    desc,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    icon,
    isError,
    color,
    value,
    loading
}:{
    title: string,
    desc: string,
    color: "revenue" | "booking" |  "active_flight" |  "seat_util" | string,
    icon?: LucideIcon,
    value: string | number,
    loading: boolean,
    isError: boolean
}) => {
    if (isError) {
        return (
            <Card className="bg-red-100">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-2'>
                    <div className="text-5xl font-bold text-red-600">Error</div>
                    <p className="text-xs text-muted-foreground">Failed to load data</p>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base lg:text-xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ) : (
                    <>
                    <div className={
                        cn(
                            "text-4xl lg:text-5xl font-bold",
                            color == "revenue" && "text-blue-600",
                            color == "booking" && "text-green-600",
                            color == "active_flight" && "text-amber-600",
                            color == "seat_util" && "text-rose-600"
                        )
                    }>
                        {value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {desc}
                    </p>
                    </>
                )}
            </CardContent>
          </Card>
    )
}

export default MetricsCard