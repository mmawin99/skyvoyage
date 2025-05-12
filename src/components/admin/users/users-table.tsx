
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDetailAPIType, UserDetailAPIType } from '@/types/type';
import { format } from 'date-fns';
import { Edit, Trash2 } from "lucide-react";

// Create a union type for the table data
type TableDataType = UserDetailAPIType | AdminDetailAPIType;

// Create a type for the columns prop
type ColumnsType<T extends TableDataType> = (keyof T)[];

const UserTableAdmin = <T extends TableDataType>({
  handleDeleteUser,
  handleEditUser,
  columns,
  data,
  userType,
  loading
}: {
  handleDeleteUser: (userId: string) => void;
  handleEditUser: (userIndex: number) => void;
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  userType: 'user' | 'admin';
}) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  // Helper to get the display value of any field
  const getFieldValue = (item: T, column: keyof T) => {
    const value = item[column];
    
    // Format dates if needed
    if (column === 'registerDate') {
      return formatDate(value as string);
    }else if(column === "uuid"){
      return (value as string).slice(0, 10) + "..." + (value as string).slice(-2);
    }
    
    return value as string | null;
  };

  // Helper to get ID field based on user type
  const getItemId = (item: T): string => {
    if (userType === 'user') {
      return (item as UserDetailAPIType).uuid;
    } else {
      return (item as AdminDetailAPIType).id;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        {/* {caption && <TableCaption>{caption}</TableCaption>} */}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column as string}>
                {/* Format column name for display */}
                {(column as string) == "uuid" ? "UUID" : (column as string).replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {loading ? (
                Array.from({ length: 20 }).map((_, index) => (
                <TableRow key={index}>
                    {
                        columns.length > 0 ? (
                            columns.map((column, colIndex) => (
                                <TableCell key={`${index}-${colIndex}-${column as string}`}>
                                    <Skeleton className="h-6 w-30" />
                                </TableCell>
                            ))
                        ) : null
                    }
                    <TableCell>
                        <Skeleton className="h-6 w-32" />
                    </TableCell>
                </TableRow>
              ))
            ) : null}
            {/* Check if data is empty */}
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-6">
                No {userType}s found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={getItemId(item)}>
                {columns.map((column) => (
                  <TableCell key={`${getItemId(item)}-${column as string}`}>
                    {getFieldValue(item, column)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={()=>{
                      handleEditUser(data.indexOf(item));
                    }} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button onClick={()=>{
                      handleDeleteUser(getItemId(item));
                    }} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTableAdmin;