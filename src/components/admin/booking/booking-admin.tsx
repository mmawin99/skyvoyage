 
"use client"


import { BackendURLType, useBackendURL } from '@/components/backend-url-provider';
import { BookingDetails } from '@/components/booking-list/booking';
import { CustomPagination } from '@/components/custom-pagination';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingStatus, UserDetailType, searchSelectedBookingRoutes } from '@/types/type';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function BookingAdmin() {
    const { backend:backendURL }: BackendURLType        = useBackendURL();
    const [booking, setBooking]                         = useState<searchSelectedBookingRoutes[]>([])
    const [loadingBooking, setLoadingBooking]           = useState<boolean>(false)
    const [page, setPage]                               = useState<number>(1)
    const [size, setSize]                               = useState<number>(10)
    const [totalCount, setTotalCount]                   = useState<number>(0)
    const isFetchRef                                    = useRef<boolean>(false)
    const [currentUserSelector, setCurrentUserSelector] = useState<string | null>(null)
    const [iNeedUpdate, setINeedUpdate]                 = useState<boolean>(false)
    const [userList, setUserList]                       = useState<UserDetailType[]>([])
    const isUserFetchRef                                = useRef<boolean>(false)
   
    //State for modifying booking status
    const [modifyBookingStatus, setModifyBookingStatus] = useState<boolean>(false)
    const [modifyBookingStatusId, setModifyBookingStatusId] = useState<string>("")
    const [modifyBookingStatusType, setModifyBookingStatusType] = useState<BookingStatus | null>(null)
    const [modifyBookingStatusIndex, setModifyBookingStatusIndex] = useState<number>(0)
    const [modifyBookingStatusCancel, setModifyBookingStatusCancel] = useState<boolean>(false)
    
    //State for modifying booking date
    const [modifyBookingDate, setModifyBookingDate] = useState<boolean>(false)
    const [modifyBookingDateCancel, setModifyBookingDateCancel] = useState<boolean>(false)
    const [modifyBookingDateId, setModifyBookingDateId] = useState<string>("")
    const [modifyBookingDateIndex, setModifyBookingDateIndex] = useState<number>(0)
    const [newModifyBookingDate, setNewModifyBookingDate] = useState<string>(new Date().toISOString())

    //State for deleting booking
    const [deleteBooking, setDeleteBooking] = useState<boolean>(false)
    const [deleteBookingId, setDeleteBookingId] = useState<string>("")
    const [deleteBookingIndex, setDeleteBookingIndex] = useState<number>(0)
    const [deleteBookingCancel, setDeleteBookingCancel] = useState<boolean>(false)

    //State for deleting passenger
    // /delete-passenger/:userId/:passportNum/:bookingId
    // /delete-ticket/:userId/:ticketId
    // /delete-payment/:bookingId/:paymentId
    const [deletePassenger, setDeletePassenger] = useState<boolean>(false)
    const [deletePassengerId, setDeletePassengerId] = useState<string>("")
    const [deletePassengerBookingIndex, setDeletePassengerBookingIndex] = useState<number>(0)
    const [deletePassengerCancel, setDeletePassengerCancel] = useState<boolean>(false)
    
    //State for deleting ticket
    const [deleteTicket, setDeleteTicket] = useState<boolean>(false)
    const [deleteTicketId, setDeleteTicketId] = useState<string>("")
    const [deleteTicketBookingIndex, setDeleteTicketBookingIndex] = useState<number>(0)
    const [deleteTicketCancel, setDeleteTicketCancel] = useState<boolean>(false)

    //State for deleting payment
    const [deletePayment, setDeletePayment] = useState<boolean>(false)
    const [deletePaymentId, setDeletePaymentId] = useState<string>("")
     
    const [deletePaymentBookingIndex, setDeletePaymentBookingIndex] = useState<number>(0)
    const [deletePaymentCancel, setDeletePaymentCancel] = useState<boolean>(false)

    useEffect(()=>{
        const fetchPassenger = async () => {
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`${backendURL}/query/admin/bookingUserList`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data:{data: UserDetailType[], status:boolean} = await response.json()
                    setUserList(data?.data)
                } else {
                    console.error("Error fetching flights:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching flights:", error)
            }
        }
        if(!isUserFetchRef.current){
            isUserFetchRef.current = true
            fetchPassenger()
        }
    }, [backendURL])
    useEffect(() => {
        const fetchBooking = async () => {
            setLoadingBooking(true)
            if(!backendURL || backendURL == "") return

            try {
                const response = await fetch(`${backendURL}/query/admin/booking/${size}/${page}?user=${currentUserSelector ?? "all"}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data:{
                        booking:searchSelectedBookingRoutes[],
                        status: boolean,
                        pagination:{
                            page: number
                            size: number
                            total: number
                            totalPages: number
                        }
                    } = await response.json()
                    setBooking(data?.booking)
                    setTotalCount(data?.pagination.total)
                    // setTotalCount(data?.totalCount)
                    // setPage(data?.page)
                } else {
                    console.error("Error fetching flights:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching flights:", error)
            } finally {
                setLoadingBooking(false)
            }
        }
        if(!isFetchRef.current){
            setINeedUpdate(false)
            fetchBooking()
            isFetchRef.current = true
        }
    }, [backendURL, page, size, currentUserSelector, iNeedUpdate]);
    
    const handleStatusChange = async (bookingId: string, status: BookingStatus, index:number) => {
        setModifyBookingStatusCancel(false);
        setModifyBookingStatus(true);
        console.log("handleStatusChange", bookingId, status)
        // Set dialog info first
        setModifyBookingStatusId(bookingId);
        setModifyBookingStatusType(status);
        setModifyBookingStatusIndex(index);

    };
    const confirmChangeBookingStatus = async () => {
        toast.promise(
            async () => {
                let url:string;
                // /api/booking/cancel/:userId/:bookingId
                // /api/booking/refund/:userId/:bookingId
                // /api/booking/restore-status/:userId/:bookingId
                if(modifyBookingStatusType == "CANCELLED"){
                    url = `/api/booking/cancel/${booking[modifyBookingStatusIndex].userId}/${modifyBookingStatusId}`
                }else if(modifyBookingStatusType == "REFUNDED"){
                    url = `/api/booking/refund/${booking[modifyBookingStatusIndex].userId}/${modifyBookingStatusId}`
                }else if(modifyBookingStatusType == "PAID"){
                    url = `/api/booking/restore-status/${booking[modifyBookingStatusIndex].userId}/${modifyBookingStatusId}`
                }else{
                    throw new Error("Invalid booking status")
                }
                const response = await fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    if(data.status == false){
                        throw new Error(data.message)
                    }
                    setModifyBookingStatus(false)
                    setModifyBookingStatusId("")
                    setModifyBookingStatusType(null)
                    setModifyBookingStatusIndex(0)
                    isFetchRef.current = false
                    setINeedUpdate(true)
                } else {
                    const data = await response.json()
                    toast.error(data.message)
                    throw new Error(data.message)
                }
            }, {
                loading: "Changing booking status...",
                success: "Booking status changed successfully",
                error: (err) => {
                    console.error(err)
                    return "Error changing booking status"
                }
            })
    }
    const cancelBookingStatusChange = async () => {
        setModifyBookingStatus(false)
        setModifyBookingStatusId("")
        setModifyBookingStatusType(null)
        setModifyBookingStatusIndex(0)
    }

    const handleBookingDateChange = async (bookingId: string, index:number) => {
        setModifyBookingDateCancel(false);
        setModifyBookingDate(true);
        setModifyBookingDateId(bookingId);
        setModifyBookingDateIndex(index);
        setNewModifyBookingDate(booking[index].bookingDate ? booking[index].bookingDate : new Date().toISOString())
    }
    const confirmChangeBookingDate = async () => {
        toast.promise(
            async () => {
                const response = await fetch(`/api/booking/change-booking-date/${booking[modifyBookingDateIndex].userId}/${modifyBookingDateId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bookingDate: newModifyBookingDate
                    })
                })
                if (response.ok) {
                    const data = await response.json()
                    if(data.status == false){
                        throw new Error(data.message)
                    }
                    setModifyBookingDate(false)
                    setModifyBookingDateId("")
                    setModifyBookingDateIndex(0)
                    isFetchRef.current = false
                    setINeedUpdate(true)
                } else {
                    const data = await response.json()
                    toast.error(data.message)
                    throw new Error(data.message)
                }
            }, {
                loading: "Changing booking date...",
                success: "Booking date changed successfully",
                error: (err) => {
                    console.error(err)
                    return "Error changing booking date"
                }
            })
    }
    const cancelBookingDateChange = async () => {
        setModifyBookingDate(false)
        setModifyBookingDateId("")
        setModifyBookingDateIndex(0)
    }

    const handleDeleteBooking = async (bookingId: string, index:number) => {
        setDeleteBookingCancel(false);
        setDeleteBooking(true);
        setDeleteBookingId(bookingId);
        setDeleteBookingIndex(index);
    }

    const confirmDeleteBooking = async () => {
        toast.promise(
            async () => {
                const response = await fetch(`/api/booking/delete/${booking[deleteBookingIndex].userId}/${deleteBookingId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    if(data.status == false){
                        throw new Error(data.message)
                    }
                    setDeleteBooking(false)
                    setDeleteBookingId("")
                    setDeleteBookingIndex(0)
                    isFetchRef.current = false
                    setINeedUpdate(true)
                } else {
                    const data = await response.json()
                    toast.error(data.message)
                    throw new Error(data.message)
                }
            }, {
                loading: "Deleting booking...",
                success: "Booking deleted successfully",
                error: (err) => {
                    console.error(err)
                    return "Error deleting booking"
                }
            })
    }

    const cancelDeleteBooking = async () => {
        setDeleteBooking(false)
        setDeleteBookingId("")
        setDeleteBookingIndex(0)
    }

    const handleDeletePassenger = async (bookingId: string, passengerId: string, index:number) => {
        setDeletePassengerCancel(false);
        setDeletePassenger(true);
        setDeletePassengerId(passengerId);
        setDeletePassengerBookingIndex(index);
    }
    const cancelDeletePassenger = async () => {
        setDeletePassenger(false)
        setDeletePassengerId("")
        setDeletePassengerBookingIndex(0)
    }
    const confirmDeletePassenger = async () => {
        toast.promise(
            async () => {
                const response = await fetch(`/api/booking/delete-passenger/${booking[deletePassengerBookingIndex].userId}/${deletePassengerId}/${booking[deletePassengerBookingIndex].ticket}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    if(data.status == false){
                        throw new Error(data.message)
                    }
                    setDeletePassenger(false)
                    setDeletePassengerId("")
                    setDeletePassengerBookingIndex(0)
                    isFetchRef.current = false
                    setINeedUpdate(true)
                } else {
                    const data = await response.json()
                    toast.error(data.message)
                    throw new Error(data.message)
                }
            }, {
                loading: "Deleting passenger...",
                success: "Passenger deleted successfully",
                error: (err) => {
                    console.error(err)
                    return "Error deleting passenger"
                }
            })
    }

    const handleDeleteTicket = async (bookingId: string, ticketId: string, index:number) => {
        setDeleteTicketCancel(false);
        setDeleteTicket(true);
        setDeleteTicketId(ticketId);
        setDeleteTicketBookingIndex(index);
    }
    const cancelDeleteTicket = async () => {
        setDeleteTicket(false)
        setDeleteTicketId("")
        setDeleteTicketBookingIndex(0)
    }
    const confirmDeleteTicket = async () => {
        toast.promise(
            async () => {
                const response = await fetch(`/api/booking/delete-ticket/${booking[deleteTicketBookingIndex].userId}/${deleteTicketId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    if(data.status == false){
                        throw new Error(data.message)
                    }
                    setDeleteTicket(false)
                    setDeleteTicketId("")
                    setDeleteTicketBookingIndex(0)
                    isFetchRef.current = false
                    setINeedUpdate(true)
                } else {
                    const data = await response.json()
                    toast.error(data.message)
                    throw new Error(data.message)
                }
            }, {
                loading: "Deleting ticket...",
                success: "Ticket deleted successfully",
                error: (err) => {
                    console.error(err)
                    return "Error deleting ticket"
                }
            })
    }
    
    const handleDeletePayment = async (bookingId: string, paymentId: string, index:number) => {
        setDeletePaymentCancel(false);
        setDeletePayment(true);
        setDeletePaymentId(paymentId);
        setDeletePaymentBookingIndex(index);
    }
    const cancelDeletePayment = async () => {
        setDeletePayment(false)
        setDeletePaymentId("")
        setDeletePaymentBookingIndex(0)
    }
    const confirmDeletePayment = async () => {
        toast.promise(
            async () => {
                const response = await fetch(`/api/booking/delete-payment/${booking[deletePaymentBookingIndex].ticket}/${deletePaymentId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    if(data.status == false){
                        throw new Error(data.message)
                    }
                    setDeletePayment(false)
                    setDeletePaymentId("")
                    setDeletePaymentBookingIndex(0)
                    isFetchRef.current = false
                    setINeedUpdate(true)
                } else {
                    const data = await response.json()
                    toast.error(data.message)
                    throw new Error(data.message)
                }
            }, {
                loading: "Deleting payment...",
                success: "Payment deleted successfully",
                error: (err) => {
                    console.error(err)
                    return "Error deleting payment"
                }
            })
    }

    const SelectSizeInput = ()=>{
        return (
            <Select value={String(size)} onValueChange={(value) => {
                isFetchRef.current = false
                setSize(parseInt(value))
                setPage(1)
            }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                </SelectContent>
            </Select>
        )
    }
    const SelectUserInput = ()=>{
        return (
            <Select value={currentUserSelector || "default"} onValueChange={(value) => {
                isFetchRef.current = false
                if(value == "default") {
                    setCurrentUserSelector(null)
                }else{
                    setCurrentUserSelector(value)
                }
                setPage(1)
            }}>
                <SelectTrigger className="w-[230px]">
                    <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">All Users</SelectItem>
                    {
                        userList?.length == 0 ? null : userList.map((item, index) => (
                            <SelectItem key={index} value={item.uuid}><span className='font-bold'>({item.email})</span>{item.firstname} {item.lastname[0]}</SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>
        )
    }

    return (
            <div className="flex flex-col gap-4">
                <Dialog open={modifyBookingStatus} onOpenChange={()=>{
                    setModifyBookingStatusCancel(true)
                    cancelBookingStatusChange()
                }} modal>
                    <DialogContent forceMount>
                        <DialogHeader className="items-center">
                            <DialogTitle>
                                <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <TriangleAlert className="h-7 w-7 text-primary" />
                                </div>
                                Are you sure to change booking status to <span className='first-letter:uppercase lowercase'>{modifyBookingStatusType}</span>?
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-center">
                                This action will change the booking status of selected booking to <span className='first-letter:uppercase lowercase'>{modifyBookingStatusType}</span>. 
                                <br />
                                This action can be undo by changing the status back.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2 sm:justify-center">
                            <DialogClose asChild>
                                <Button className='cursor-pointer' disabled={modifyBookingStatusCancel} variant="outline"
                                    onClick={()=>{
                                        setModifyBookingStatusCancel(true)
                                        cancelBookingStatusChange()
                                    }}
                                >{
                                    modifyBookingStatusCancel == true ? <Loader2 className="animate-spin h-4 w-4" /> : "Cancel"}</Button>
                            </DialogClose>
                            <Button className='cursor-pointer' disabled={modifyBookingStatusCancel} variant="default" onClick={confirmChangeBookingStatus}>
                                Continue
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={modifyBookingDate} onOpenChange={()=>{
                    setModifyBookingDateCancel(true)
                    cancelBookingDateChange()
                }} modal>
                    <DialogContent forceMount>
                        <DialogHeader className="items-center">
                            <DialogTitle>
                                Changing booking date
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-center">
                                Booking date change to specfic date.
                            </DialogDescription>
                        </DialogHeader>
                        {/* //Display current booking date */}
                        <div className="flex flex-row justify-between gap-2">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-lg font-bold">Current Booking Date</h1>
                                <p className="text-base text-muted-foreground">{format(booking[modifyBookingDateIndex]?.bookingDate ? new Date(booking[modifyBookingDateIndex]?.bookingDate) : new Date(), "MMM dd, yyyy HH:mm")}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-lg font-bold">New Booking Date</h1>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(new Date(newModifyBookingDate), "MMM dd, yyyy HH:mm")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            selected={new Date(newModifyBookingDate)}
                                            onSelect={(date) => {
                                                console.log(date)
                                                const lastPart = (booking[modifyBookingDateIndex]?.bookingDate ?? new Date().toISOString()).split("T")[1]
                                                const firstPart = date?.toISOString().split("T")[0]
                                                setNewModifyBookingDate(firstPart + "T" + lastPart)
                                            }}
                                            mode="single"
                                            defaultMonth={new Date(newModifyBookingDate)}
                                            disabled={(date) => date > (
                                                booking[modifyBookingDateIndex]?.selectedDepartRoute.flight.segments[0].departureTime ?
                                                new Date(booking[modifyBookingDateIndex]?.selectedDepartRoute.flight.segments[0].departureTime)
                                                : new Date()
                                            )}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter className="mt-2 sm:justify-center">
                            <DialogClose asChild>
                                <Button className='cursor-pointer' disabled={modifyBookingDateCancel} variant="outline"
                                    onClick={()=>{
                                        setModifyBookingDateCancel(true)
                                        cancelBookingDateChange()
                                    }}
                                >{
                                    modifyBookingDateCancel == true ? <Loader2 className="animate-spin h-4 w-4" /> : "Cancel"}</Button>
                            </DialogClose>
                            <Button className='cursor-pointer' disabled={modifyBookingDateCancel} variant="default" onClick={confirmChangeBookingDate}>
                                Continue
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={deleteBooking} onOpenChange={()=>{
                    setDeleteBookingCancel(true)
                    cancelDeleteBooking()
                }} modal>
                    <DialogContent forceMount>
                        <DialogHeader className="items-center">
                            <DialogTitle>
                                <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                                    <TriangleAlert className="h-7 w-7 text-destructive" />
                                </div>
                                Are you sure to delete booking?
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-center">
                                This action will delete the booking and all the information related to it.
                                <br />
                                This action cannot be undone.
                                <br />
                                <span className='text-destructive font-bold'>*User won&rsquo;t get any refund.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2 sm:justify-center">
                            <DialogClose asChild>
                                <Button className='cursor-pointer' disabled={deleteBookingCancel} variant="outline"
                                    onClick={()=>{
                                        setDeleteBookingCancel(true)
                                        cancelDeleteBooking()
                                    }}
                                >{
                                    deleteBookingCancel == true ? <Loader2 className="animate-spin h-4 w-4" /> : "Cancel"}</Button>
                            </DialogClose>
                            <Button className='cursor-pointer' disabled={deleteBookingCancel} variant="destructive" onClick={confirmDeleteBooking}>
                                Delete Booking
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={deletePassenger} onOpenChange={()=>{
                    setDeletePassengerCancel(true)
                    cancelDeletePassenger()
                }} modal>
                    <DialogContent forceMount>
                        <DialogHeader className="items-center">
                            <DialogTitle>
                                <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                                    <TriangleAlert className="h-7 w-7 text-destructive" />
                                </div>
                                Are you sure to delete Passenger?
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-center">
                                This action will delete the passenger from the selected booking only.
                                <br />
                                This action cannot be undone. (Cannot be restored or create a new one)
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2 sm:justify-center">
                            <DialogClose asChild>
                                <Button className='cursor-pointer' disabled={deletePassengerCancel} variant="outline"
                                    onClick={()=>{
                                        setDeletePassengerCancel(true)
                                        cancelDeletePassenger()
                                    }}
                                >{
                                    deletePassengerCancel == true ? <Loader2 className="animate-spin h-4 w-4" /> : "Cancel"}</Button>
                            </DialogClose>
                            <Button className='cursor-pointer' disabled={deletePassengerCancel} variant="destructive" onClick={confirmDeletePassenger}>
                                Delete Passenger
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={deleteTicket} onOpenChange={()=>{
                    setDeleteTicketCancel(true)
                    cancelDeleteTicket()
                }} modal>
                    <DialogContent forceMount>
                        <DialogHeader className="items-center">
                            <DialogTitle>
                                <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                                    <TriangleAlert className="h-7 w-7 text-destructive" />
                                </div>
                                Are you sure to delete Ticket?
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-center">
                                This action will delete only selected ticket for selected passenger.
                                <br />
                                This action cannot be undone. (Cannot be restored or create a new one)
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2 sm:justify-center">
                            <DialogClose asChild>
                                <Button className='cursor-pointer' disabled={deleteTicketCancel} variant="outline"
                                    onClick={()=>{
                                        setDeleteTicketCancel(true)
                                        cancelDeleteTicket()
                                    }}
                                >{
                                    deleteTicketCancel == true ? <Loader2 className="animate-spin h-4 w-4" /> : "Cancel"}</Button>
                            </DialogClose>
                            <Button className='cursor-pointer' disabled={deleteTicketCancel} variant="destructive" onClick={confirmDeleteTicket}>
                                Delete Ticket
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={deletePayment} onOpenChange={()=>{
                    setDeletePaymentCancel(true)
                    cancelDeletePayment()
                }} modal>
                    <DialogContent forceMount>
                        <DialogHeader className="items-center">
                            <DialogTitle>
                                <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                                    <TriangleAlert className="h-7 w-7 text-destructive" />
                                </div>
                                Are you sure to delete Payment?
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-center">
                                This action will delete only selected ticket for selected passenger.
                                <br />
                                This action cannot be undone. (Cannot be restored or create a new one)
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2 sm:justify-center">
                            <DialogClose asChild>
                                <Button className='cursor-pointer' disabled={deletePaymentCancel} variant="outline"
                                    onClick={()=>{
                                        setDeletePaymentCancel(true)
                                        cancelDeletePayment()
                                    }}
                                >{
                                    deletePaymentCancel == true ? <Loader2 className="animate-spin h-4 w-4" /> : "Cancel"}</Button>
                            </DialogClose>
                            <Button className='cursor-pointer' disabled={deletePaymentCancel} variant="destructive" onClick={confirmDeletePayment}>
                                Delete Payment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                </div>
                {
                    loadingBooking ? <div className="flex flex-row items-center justify-center gap-2 mb-4 h-60">
                            <Loader2 className="animate-spin h-14 w-14 text-gray-500" />
                            <span className="text-gray-500 text-xl">Loading...</span>
                        </div> :
                    <>
                        <div className="container flex flex-row justify-between mb-4">
                            <CustomPagination className="w-full flex flex-row justify-start" 
                                currentPage={parseInt(String(page))} 
                                totalCount={totalCount} 
                                pageSize={size} 
                                onPageChange={(page)=>{
                                    isFetchRef.current = false
                                    setPage(page)
                                }}
                                siblingCount={1}
                            />
                            <div className='flex flex-row gap-2'>
                                <SelectUserInput />
                                <SelectSizeInput />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {booking?.length == 0 ? null : booking.map((item, bIndex) => (
                                <BookingDetails
                                    onModifyBookingStatus={(bookingId:string, status: BookingStatus) => {
                                        handleStatusChange(bookingId, status, bIndex)
                                    }}
                                    onModifyBookingDate={(bookingId:string) => {
                                        handleBookingDateChange(bookingId, bIndex)
                                    }}
                                    onDeleteBooking={(bookingId:string) => {
                                        handleDeleteBooking(bookingId, bIndex)
                                    }}
                                    onDeletePassenger={(bookingId:string, passengerId: string) => {
                                        handleDeletePassenger(bookingId, passengerId, bIndex)
                                    }}
                                    onDeleteTicket={(bookingId:string, ticketId: string)=>{
                                        handleDeleteTicket(bookingId, ticketId, bIndex)
                                    }}
                                    onDeletePayment={(bookingId:string, paymentId: string)=>{
                                        handleDeletePayment(bookingId, paymentId, bIndex)
                                    }}
                                    key={item.ticket} item={item} isAdmin={true} defaultOpen={bIndex===0} />
                            ))}
                        </div>
                    </>
                }
            </div>
    )
}
