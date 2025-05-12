 
import { CustomPagination } from '@/components/custom-pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminDetailAPIType, SubmitAdmin, SubmitEditAdminProps, SubmitEditUserProps, SubmitUser, UserDetailAPIType } from '@/types/type'
import { PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import UserTableAdmin from './users-table'
import AddUserSheet from './add-user-sheet'

const UserManagementComponent = ({
    kind
}:{
    kind: "user" | "admin"
}) => {
    const [page, setPage] = useState<number>(1)
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [size, setSize] = useState<number>(10)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [userList, setUserList] = useState<UserDetailAPIType[] | AdminDetailAPIType[]>([])
    const [isFetch, setIsFetch] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isAddUserLoading, setIsAddUserLoading] = useState<boolean>(false)
    const [defaultValue, setDefaultValue] = useState<SubmitEditAdminProps | SubmitEditUserProps | null>(null)
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
    // /api/user/delete/${kind}/${userId} kind = user or admin
    // /api/admin/adduser for add admin user (body: SubmitAdmin)
    // /api/user/signup  for add user (body: SubmitUser)
    const promptDeleteUser = (userId: string) => {
        toast.warning("Are you sure you want to delete this" + (kind == "admin" ? " admin" : "") + " user?", {
            action: {
                label: "Yes I'm sure",
                onClick: () => {
                    handleDeleteUser(userId)
                },
            },
            duration: 10000,
        })
    }
    const handleDeleteUser = async (userId: string) => {

        toast.promise(
            async () => {
                const response = await fetch(`/api/user/delete/${kind}/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (!response.ok) {
                    toast.error("Failed to delete user")
                }
                const data = await response.json()
                console.log(data)
                setIsFetch(false)
            },
            {
                loading: 'Deleting' + (kind == "admin" ? " admin" : "") + ' user...',
                success: (kind == "admin" ? "Admin" : "User") + ' deleted successfully',
                error: (err) => `Error: ${err}`,
            }
        )
    }

    const handleAddAdmin = async (user: SubmitAdmin) =>{
        setIsAddUserLoading(true)
        toast.promise(
            async () => {
                const response = await fetch(`/api/admin/adduser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
                if (!response.ok) {
                    toast.error("Failed to add user")
                }
                setIsAddUserLoading(false)
                const data = await response.json()
                console.log(data)
                setIsFetch(false)
                setDefaultValue(null)
                setIsAddUserOpen(false)
            },
            {
                loading: 'Adding Admin user...',
                success: 'Admin added successfully',
                error: (err) => `Error: ${err}`,
            }
        )
    }

    const handleAddUser = async (user: SubmitUser) =>{
        setIsAddUserLoading(true)
        toast.promise(
            async () => {
                const response = await fetch(`/api/user/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
                if (!response.ok) {
                    toast.error("Failed to add user")
                }
                setIsAddUserLoading(false)
                const data = await response.json()
                console.log(data)
                setIsFetch(false)
                setDefaultValue(null)
                setIsAddUserOpen(false)
            },
            {
                loading: 'Adding user...',
                success: 'User added successfully',
                error: (err) => `Error: ${err}`,
            }
        )
    }

    const handleEditUser = async (user: SubmitEditUserProps) =>{
        setIsAddUserLoading(true)
        toast.promise(
            async () => {
                const response = await fetch(`/api/user/edit/${kind}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
                if (!response.ok) {
                    toast.error("Failed to edit user")
                }
                setIsAddUserLoading(false)
                const data = await response.json()
                console.log(data)
                setIsFetch(false)
                setDefaultValue(null)
                setIsAddUserOpen(false)
            },
            {
                loading: 'Editing user...',
                success: 'User edited successfully',
                error: (err) => `Error: ${err}`,
            }
        )
    }

    const handleEditAdmin = async (user: SubmitEditAdminProps) =>{
        setIsAddUserLoading(true)
        toast.promise(
            async () => {
                const response = await fetch(`/api/user/edit/${kind}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
                if (!response.ok) {
                    toast.error("Failed to edit user")
                }
                setIsAddUserLoading(false)
                const data = await response.json()
                console.log(data)
                setIsFetch(false)
                setDefaultValue(null)
                setIsAddUserOpen(false)
            },
            {
                loading: 'Editing admin user...',
                success: 'Admin edited successfully',
                error: (err) => `Error: ${err}`,
            }
        )
    }

    const promptEdit = (index: number) => {
        const user = userList[index]
        setDefaultValue(kind === "admin" 
            ? { ...user } as unknown as SubmitEditAdminProps 
            : { ...user, password: "" } as SubmitEditUserProps)
    }

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
                    setDefaultValue(null)
                    setIsAddUserOpen(true)
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
                                handleDeleteUser={(userid:string)=>{
                                    promptDeleteUser(userid)
                                }}
                                handleEditUser={(index:number)=>{
                                    setIsAddUserOpen(true)
                                    promptEdit(index)
                                }}
                                columns={['id','username', 'fullname', 'permission']} 
                                data={userList as AdminDetailAPIType[]}
                                userType="admin"
                                loading={isLoading}
                            /> :
                            <UserTableAdmin
                                handleDeleteUser={(userid:string)=>{
                                    promptDeleteUser(userid)
                                }}
                                handleEditUser={(index:number)=>{
                                    setIsAddUserOpen(true)
                                    promptEdit(index)
                                }}
                                columns={['uuid','firstname', 'lastname', 'email', 'phone', 'registerDate']} 
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

            <AddUserSheet
                open={isAddUserOpen}
                userKind={kind}
                onOpenChange={(setOpen) => {
                    setIsAddUserOpen(setOpen)
                    setDefaultValue(null)
                }}
                onAddUser={(user) => {
                    if (kind === "admin") {
                        handleAddAdmin(user as SubmitAdmin);
                    } else {
                        handleAddUser(user as SubmitUser);
                    }
                }}
                onEditUser={(user) => {
                    if (kind === "admin") {
                        handleEditAdmin(user as SubmitEditAdminProps);
                    } else {
                        handleEditUser(user as SubmitEditUserProps);
                    }
                }}
                isLoading={isAddUserLoading}
                defaultValue={defaultValue}
            />
        </div>
    )
}

export default UserManagementComponent