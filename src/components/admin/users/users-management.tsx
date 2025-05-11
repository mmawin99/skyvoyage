 
import { CustomPagination } from '@/components/custom-pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminDetailAPIType, UserDetailAPIType } from '@/types/type'
import { PlusCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import UserTableAdmin from './users-table'

const UserManagementComponent = ({
    kind
}:{
    kind: "user" | "admin"
}) => {
    const [page, setPage] = useState<number>(1)
    const [size, setSize] = useState<number>(10)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [userList, setUserList] = useState<UserDetailAPIType[] | AdminDetailAPIType[]>([])
    const [isFetch, setIsFetch] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/query/admin/userList/${kind}/${size}/${page}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (!response.ok) {
                    // throw new Error('Network response was not ok')
                    toast.error("Failed to fetch data")
                }
                const data = await response.json()
                console.log(data)
                setUserList(data.data)
                setTotalCount(data.pagination.total)
                setIsLoading(false)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        if(!isFetch) {
            setIsFetch(true)
            fetchData()
        }
    }, [isFetch, page, size, kind])
    const SelectSizeInput = ()=>{
        return (
            <Select value={String(size)} onValueChange={(value) => {
                setIsFetch(false)
                setSize(parseInt(value))
                setPage(1)
            }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                </SelectContent>
            </Select>
        )
    }
    return (
      <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <Button onClick={() => { 
                
                }} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                    Add{kind == 'admin' ? " Admin " : " "}User
                </Button>
            </div>
                
            <Card>
                <CardHeader>
                    <CardTitle>
                    {kind == 'admin' ? "Admin " : ""}User
                    </CardTitle>
                    <CardDescription>
                    {kind == 'admin' ? "Admin " : ""}User Management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row justify-between mb-4">
                        <CustomPagination className="w-full flex flex-row justify-start" 
                            currentPage={parseInt(String(page))} 
                            totalCount={totalCount} 
                            pageSize={size} 
                            onPageChange={setPage}
                            siblingCount={1}
                        />
                        <SelectSizeInput />
                    </div>
                    {
                        kind == 'admin' ?
                             <UserTableAdmin 
                                columns={['username', 'fullname', 'permission']} 
                                data={userList as AdminDetailAPIType[]}
                                userType="admin"
                                loading={isLoading}
                            /> :
                            <UserTableAdmin 
                                columns={['firstname', 'lastname', 'email', 'phone', 'registerDate']} 
                                data={userList as UserDetailAPIType[]}
                                userType="user"
                                loading={isLoading}
                            />
                    }
                    <div className="flex flex-row justify-between mt-4">
                    <CustomPagination className="w-full flex flex-row justify-start" 
                        currentPage={parseInt(String(page))} 
                        totalCount={totalCount} 
                        pageSize={size} 
                        onPageChange={setPage}
                        siblingCount={1}
                    />
                    <SelectSizeInput />
                    </div>
                </CardContent>
            </Card>

            {/* <AddFlightSheet
                open={isAddFlightOpen}
                onOpenChange={setIsAddFlightOpen}
                onAddFlight={handleAddFlight}
                isLoading={isLoading}
                carrier={{
                name: selectedCarrier?.name ?? "",
                code: selectedCarrier?.code ?? "",
                }}
            /> */}
        </div>
    )
}

export default UserManagementComponent