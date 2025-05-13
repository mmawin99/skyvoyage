"use client"
import {
  BadgeDollarSign,
  Building2,
  CalendarClock,
  ChevronsLeftRightEllipsis,
  ChevronsUpDown,
  ClipboardListIcon,
  HelpCircleIcon,
  LayoutGrid,
  LogOutIcon,
  LucideIcon,
  PlaneIcon,
  SettingsIcon,
  TicketsPlane,
  Users,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { NextRouter, useRouter } from "next/router"
import * as React from "react"
import { BreadcrumbGenerator } from "./admin/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Separator } from "./ui/separator"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "./ui/sidebar"
const data = {
  user: {
    name: "SkyVoyage Admin",
    email: "admin@skyvoyage.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutGrid,
    },
    {
      title: "Airlines",
      url: "/admin/airlines",
      icon: PlaneIcon,
    },
    {
      title: "Airports",
      url: "/admin/airports",
      icon: Building2,
    },
    {
      title: "Admin account",
      url: "/admin/users-admin",
      icon: Users,
    },
    {
      title: "User Account",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "User Booking",
      url: "/admin/user-booking",
      icon: TicketsPlane,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/admin/help",
      icon: HelpCircleIcon,
    },
  ],
  airlineLevel: [
    {
      title: "Aircraft",
      url: "/admin/aircrafts",
      icon: PlaneIcon,
    },
    {
      title: "Aircraft Cost",
      url: "/admin/cost",
      icon: BadgeDollarSign,
    },
    {
      title: "Flights",
      url: "/admin/flights",
      icon: ClipboardListIcon,
    },
    {
      title: "Schedules",
      url: "/admin/schedules",
      icon: CalendarClock,
    },
    {
      title: "Transit",
      url: "/admin/transit",
      icon: ChevronsLeftRightEllipsis,
    },
    {
      title: "Seat Map",
      url: "/admin/seat-map",
      icon: LayoutGrid,
    }
  ],
}

const SidebarItemAdminSidebar = ({
  item,
}: {
  item: {
    title: string
    url: string
    icon?: LucideIcon
  }
})=>{
  const router:NextRouter = useRouter()
  return (
    <SidebarMenuItem className={`cursor-pointer`} key={item.title}>
        <SidebarMenuButton className={`cursor-pointer ${router.asPath == item.url && "bg-gray-100"} hover:bg-gray-200`} tooltip={item.title} onClick={() => { router.push(item.url) }}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
  )
}

function NavMain({
    items,
  }: {
    items: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Global Management</SidebarGroupLabel>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            {items.map((item) => <SidebarItemAdminSidebar item={item} key={item.title} />)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  function NavSecondary({
    items,
    ...props
  }: {
    items: {
      title: string
      url: string
      icon: LucideIcon
    }[]
  } & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => <SidebarItemAdminSidebar item={item} key={item.title} />)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }
  function NavairlineLevel({
    items,
  }: {
    items: {
      title: string
      url: string
      icon: LucideIcon
    }[]
  }) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Airline Level</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => <SidebarItemAdminSidebar item={item} key={item.title} />)}
          {/* <SidebarItemAdminSidebar item={{ title: "More", url: "#", icon: MoreHorizontalIcon }} /> */}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  function NavUser() {
    const { isMobile } = useSidebar()
    const {data:sessionData} = useSession()
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={"/admin-user-icon.png"} alt={sessionData?.user.username} />
                  <AvatarFallback className="rounded-lg">SV</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium first-letter:uppercase">{sessionData?.user.username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                  Permission: {sessionData?.user.permission}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={"/admin-user-icon.png"} alt={sessionData?.user.username} />
                    <AvatarFallback className="rounded-lg">SA</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium first-letter:uppercase">{sessionData?.user.username}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Permission: {sessionData?.user.permission}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={()=>{
                signOut({ callbackUrl: "/admin/signin" })
              }} className="cursor-pointer">
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

export function AdminSideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" variant='inset' {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <Link href="/admin" className="flex flex-row gap-2">
                                <PlaneIcon className="h-8 w-8" />
                                <span className="text-base font-semibold">SkyVoyage</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavairlineLevel items={data.airlineLevel} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}

export const AdminHeader = ({title, link}:{title:string, link:string})=>{
    return (
        <header className="z-50 sticky top-0 bg-white rounded-t-xl group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 sticky bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
            />
                <BreadcrumbGenerator items={[{
                    "name": "SkyVoyage Admin",
                    "link": "/admin"
                },{
                    "name": title,
                    "link": link
                }]} />
        </div>
        </header>
    )
}