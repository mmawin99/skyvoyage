import React, { useEffect, useRef, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { ChevronDown, Loader2, MapPin, X } from "lucide-react"

interface DebouncedSearchProps<T> {
  title: string
  placeholder?: string
  selected: T | null
  onSelect: (item: T) => void
  results: T[]
  setResults: (items: T[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  fetchUrl: (query: string) => string // function that returns full URL for fetching
  renderItem: (item: T) => React.ReactNode
  renderSelectedItem: (item: T) => React.ReactNode
}

export function DebouncedSearch<T>({
  title,
  placeholder = "Type to search...",
  selected,
  onSelect,
  results,
  setResults,
  loading,
  setLoading,
  fetchUrl,
  renderItem,
  renderSelectedItem,
}: DebouncedSearchProps<T>) {
  const [searchText, setSearchText] = useState("")
  const [open, setOpen] = useState(false)

  const abortController = useRef<AbortController | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const search = async (query: string) => {
    if (query.length < 2) return

    if (abortController.current) abortController.current.abort()
    abortController.current = new AbortController()
    const signal = abortController.current.signal

    setLoading(true)

    try {
      const res = await fetch(fetchUrl(query), { method: "POST", signal })
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
    return () => {
      if (abortController.current) abortController.current.abort()
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" onClick={() => setOpen(true)}>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
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
            <CommandInput
              placeholder={placeholder}
              value={searchText}
              onValueChange={debouncedSearch}
              className="md:min-w-[370px]"
            />
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
            {!loading && searchText.length >= 2 && results.length === 0 && (
              <CommandEmpty>No results found</CommandEmpty>
            )}
            {!loading && searchText.length > 1 && results.length > 0 && (
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
            {!loading && searchText.length < 2 && (
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