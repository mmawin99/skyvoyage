import React from 'react'
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MetricsCard = ({
    title,
    desc,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    icon,
    value,
    loading
}:{
    title: string,
    desc: string,
    icon?: LucideIcon,
    value: string | number,
    loading: boolean
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    </div>
                ) : (
                    <>
                    <div className="text-3xl font-bold">
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