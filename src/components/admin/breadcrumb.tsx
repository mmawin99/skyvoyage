import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronRight } from "lucide-react"
import React from "react"

interface BreadcrumbItemProps {
    name: string
    link: string
}

interface BreadcrumbGeneratorProps {
    items: BreadcrumbItemProps[]
    separator?: React.ReactNode
}

export function BreadcrumbGenerator({
    items,
    separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbGeneratorProps) {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLastItem = index === items.length - 1
                    return (
                        <React.Fragment key={index}>
                        <BreadcrumbItem>
                            {isLastItem ? (
                                <BreadcrumbPage>{item.name}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={item.link}>{item.name}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!isLastItem && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}