import React, { useEffect, useRef, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { ChevronDown, Loader2, LucideIcon, MapPin, X } from "lucide-react"

interface DebouncedSearchProps<T> {
  title: string
  placeholder?: string
  selected: T | null
  Icon?: LucideIcon | null
  onSelect: (item: T) => void
  results: T[]
  dependent?: unknown // Accept any type for dependent prop
  requestMethod: "POST" | "GET"
  setResults: (items: T[]) => void
  loading: boolean
  enableSearch?: boolean
  setLoading: (loading: boolean) => void
  fetchUrl: (query: string) => string
  renderItem: (item: T) => React.ReactNode
  renderSelectedItem: (item: T) => React.ReactNode
  loadBefore?: boolean // ✅ new prop
}

export function DebouncedSearch<T>({
  title,
  placeholder = "Type to search...",
  selected,
  onSelect,
  Icon,
  results,
  requestMethod,
  dependent,
  setResults,
  enableSearch = true,
  loading,
  setLoading,
  fetchUrl,
  renderItem,
  renderSelectedItem,
  loadBefore = false, // ✅ default false
}: DebouncedSearchProps<T>) {
  const [searchText, setSearchText] = useState("")
  const [open, setOpen] = useState(false)

  const abortController = useRef<AbortController | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const search = async (query: string) => {
    if(loadBefore && !dependent) return // Don't search if loadBefore is true and dependent is not provided
    if (query.length < 2 && !loadBefore) return

    if (abortController.current) abortController.current.abort()
    abortController.current = new AbortController()
    const signal = abortController.current.signal

    setLoading(true)

    try {
      const res = await fetch(fetchUrl(query), { method: requestMethod, signal })
      const data = await res.json()
      if (!signal.aborted) {
        setResults(data)
        setLoading(false)
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error("Search error:", err)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const debouncedSearch = (query: string) => {
    setSearchText(query)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      search(query)
    }, 300)
  }

  useEffect(() => {
    if (loadBefore) {
      search("") // Fetch with empty query or a default one if needed
    }

    return () => {
      if (abortController.current) abortController.current.abort()
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBefore, loadBefore ? dependent ?? loadBefore : loadBefore])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" onClick={() => setOpen(true)}>
          <div className="flex items-center">
            
              
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {!Icon && <MapPin className="mr-2 h-4 w-4" />}
            
            {selected ? (
              renderSelectedItem(selected)
            ) : (
              <span className="text-muted-foreground">{title}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="md:min-w-[450px]" shouldFilter={false}>
          <div className="flex items-center border-b px-3 w-full">
            {!loadBefore || (loadBefore && enableSearch) ? <CommandInput
              placeholder={placeholder}
              value={searchText}
              onValueChange={debouncedSearch}
              className="md:min-w-[370px]"
            /> : null}
            {
              (loadBefore && !enableSearch) ? (
                <div className="flex flex-row items-center gap-2 py-1.5 text-sm text-muted-foreground">
                  <span className="pl-4">Select value below</span>
                </div>
              ) : null
            }
            {searchText && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSearchText("")
                  setResults([])
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
            {!loading && (searchText.length >= 2 || loadBefore) && results.length === 0 && (
              <CommandEmpty>No results found</CommandEmpty>
            )}
            {!loading && (searchText.length > 1 || loadBefore) && results.length > 0 && (
              <CommandGroup>
                {results.map((item, i) => (
                  <CommandItem key={i} onSelect={() => {
                    onSelect(item)
                    setOpen(false)
                  }}>
                    {renderItem(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!loading && searchText.length < 2 && !loadBefore && (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                Type at least 2 characters to search
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}