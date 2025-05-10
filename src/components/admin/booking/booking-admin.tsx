"use client"


import React, { useState } from 'react'

export default function BookingAdmin() {
    // const { backend:backendURL }: BackendURLType    = useBackendURL();
    // const [selectedCarrier, setSelectedCarrier]     = useState<Airline>()
    // const [carriers, setCarriers]                   = useState<Airline[]>([])

    // const [loadingBooking, setLoadingBooking]       = useState<boolean>(false)
    // const [page, setPage]                           = useState<number>(1)
    // const [size, setSize]                           = useState<number>(10)
    
    // const [pageSize, setPageSize]                   = useState<number>(20)
    // const [totalCount, setTotalCount]               = useState<number>(0)
    // const [isLoadingAircraft, setIsLoadingAircraft] = useState<boolean>(false)
    // const [aircraft, setAircraft]                   = useState<AircraftRegistration[]>([])

    // const [isAddAircraftOpen, setIsAddAircraftOpen] = useState(false)
    // const [isLoading, setIsLoading] = useState(false)
    // const [newAircraftAdded, setNewAircraftAdded] = useState<boolean>(false)

    // useEffect(() => {
    //     const fetchAircraft = async () => {
    //         setIsLoadingAircraft(true)
    //         if(!backendURL || backendURL == "") return
    //         if(!selectedCarrier) return
    //         if(selectedCarrier?.code == "") return
    //         try {
    //             const response = await fetch(`${backendURL}/autocomplete/aircraft/${selectedCarrier?.code}/${pageSize}/${page}`, {
    //                 method: "GET",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 }
    //             })
    //             if (response.ok) {
    //                 const data:{data:AircraftRegistration[], status:boolean, totalCount:number,
    //                             page:number,pageSize:number} = await response.json()
    //                 setAircraft(data?.data)
    //                 setTotalCount(data?.totalCount)
    //                 // setPage(data?.page)
    //             } else {
    //                 console.error("Error fetching flights:", await response.json())
    //             }
    //         } catch (error) {
    //             console.error("Error fetching flights:", error)
    //         } finally {
    //             setIsLoadingAircraft(false)
    //         }
    //     }
    //     fetchAircraft()
    // }, [page, pageSize, selectedCarrier, backendURL, newAircraftAdded]);


    return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                </div>
            </div>
    )
}
