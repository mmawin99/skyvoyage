import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronsUpDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"
// import { cn } from "@/lib/utils"

interface ScrollableSelectPopoverProps<T> {
    data: T[]
    value?: T | null
    title?: string
    placeholder?: string
    pageSize?: number
    renderItem: (item: T, selected: boolean) => React.ReactNode
    renderSelectedItem?: (item: T) => React.ReactNode
    getKey: (item: T) => string
    getSearchValue?: (item: T) => string
    onSelect: (item: T) => void
}

export function ScrollableSelectPopover<T>({
    data,
    value,
    title = "Select Item",
    placeholder = "Search...",
    pageSize = 20,
    renderItem,
    renderSelectedItem,
    getKey,
    getSearchValue = (item: T) => getKey(item), // fallback
    onSelect,
}: ScrollableSelectPopoverProps<T>) {
    const [open, setOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [visibleData, setVisibleData] = useState<T[]>([])
    const scrollRef = useRef<HTMLDivElement | null>(null)

    const filteredData = data.filter((item) =>
        getSearchValue(item).toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(()=>{
        if (open) {
            console.log("Searching for Trigger")
            setSearchTerm("Trigger")
            setPage(1)
            setTimeout(()=>{
                console.log("Resetting Search")
                setSearchTerm("")
                setPage(1)
                scrollRef.current?.scrollTo(0, 0)
            }, 2000);
        }
    }, [open])

    useEffect(() => {
        setVisibleData(filteredData.slice(0, page * pageSize))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm, data])

    useEffect(() => {
        const container = scrollRef.current
        if (!container) return
    
        let isWheelScrolling = false
        let wheelTimeout: ReturnType<typeof setTimeout>
    
        const handleWheel = () => {
            isWheelScrolling = true
            clearTimeout(wheelTimeout)
            wheelTimeout = setTimeout(() => {
                isWheelScrolling = false
            }, 100) // small delay after wheel stops
        }
    
        const handleScroll = () => {
            if (isWheelScrolling) return
    
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
                if (page * pageSize < filteredData.length) setPage((p) => p + 1)
            }
        }
    
        container.addEventListener("wheel", handleWheel)
        container.addEventListener("scroll", handleScroll)
        return () => {
            container.removeEventListener("wheel", handleWheel)
            container.removeEventListener("scroll", handleScroll)
            clearTimeout(wheelTimeout)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, page])
    useEffect(() => {
        if (open) {
            setSearchTerm("")
            setPage(1)
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                type="button"
                >
                {value ? (
                    renderSelectedItem ? (
                        renderSelectedItem(value)
                    ) : (
                        <span className="truncate">selected value cannot show, No render function provided.</span>
                    )
                    ) : (
                    <span className="opacity-50">{title}</span>
                )}
                <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchTerm}
                        onValueChange={(val) => {
                            setSearchTerm(val)
                            setPage(1)
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup ref={scrollRef} className="max-h-[300px] overflow-y-auto">
                        {visibleData.map((item) => {
                            const itemKey = getKey(item)
                            const isSelected = itemKey === value
                            return (
                            <CommandItem
                                key={itemKey}
                                value={getSearchValue(item)}
                                onSelect={() => {
                                onSelect(item)
                                setOpen(false)
                                }}
                            >
                                {renderItem(item, isSelected)}
                            </CommandItem>
                            )
                        })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}