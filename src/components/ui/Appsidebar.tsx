import { ChevronDown, ChevronUp, ClipboardList, Home, User2, Settings, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from './sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface SidebarItems {
  title: string
  icon: React.ReactNode
  path?: string
  roles?: string[]
  items?: SidebarItems[]
}

const Appsidebar = () => {
  const navigate = useNavigate()
  const companyName = import.meta.env.VITE_APPLICATION_NAME || 'TSMS'
  const [openConfiguration, setOpenConfiguration] = useState(true)
  
  const Items: SidebarItems[] = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      path: "/dashboard",
    },
    {
      title: "Configuration",
      icon: <Settings className="h-4 w-4" />,
      items: [
        {
          title: "Data Source",
          icon: <ClipboardList className="h-4 w-4" />,
          path: "/datasource",
        },
        {
          title: "Data Source Transform",
          icon: <ClipboardList className="h-4 w-4" />,
          path: "/datasource-transform",
        },
        {
          title: "CV DataBase",
          icon: <ClipboardList className="h-4 w-4" />,
          path: "/cv-database",
        },
        {
          title: "JD DataBase",
          icon: <ClipboardList className="h-4 w-4" />,
          path: "/jd-database",
        },
      ]
    },
    {
      title: "Hiring Process Dashboard",
      icon: <ClipboardList className="h-4 w-4" />,
      path: "/hiring-process-dashboard",
    },
    {
      title: "Clients",
      icon: <Users className="h-4 w-4" />,
      path: "/clients",
    },
    {
      title: "Master Organization Pipeline",
      icon: <Users className="h-4 w-4" />,
      path: "/master-organization-pipeline",
    },
    {
      title: "Master Feature",
      icon: <Users className="h-4 w-4" />,
      path: "/master-feature",
    },

    // {
    //   title: "Team Management",
    //   icon: <UserCheck className="h-4 w-4" />,
    //   path: "/team-management",
    // },
   
  ]

  return (
    <Sidebar collapsible='icon' side='left' variant="sidebar" className='min-w-[65px]'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='min-w-full'>
              <Link to="/" className="flex items-left w-full text-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {companyName.charAt(0)}
                  </span>
                </div>
                <span className="font-semibold text-foreground truncate">
                  {companyName}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className='m-0' />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {Items.map((item: SidebarItems) => (
                item.items ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => setOpenConfiguration(!openConfiguration)}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronDown className={`ml-auto transition-transform ${openConfiguration ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                    {openConfiguration && (
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isTruncated = subItem.title.length > 20;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              {isTruncated ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <SidebarMenuSubButton asChild isActive={subItem.path === window.location.pathname}>
                                        <Link to={subItem.path || '#'}>
                                          <span className="truncate">{subItem.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <p>{subItem.title}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <SidebarMenuSubButton asChild isActive={subItem.path === window.location.pathname}>
                                  <Link to={subItem.path || '#'}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              )}
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.path === window.location.pathname}>
                      <Link to={item.path || '#'} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.title === "Personal Time Study" &&
                      <SidebarMenuBadge>45</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="border border-custom-border rounded-md">
                <SidebarMenuButton className='h-15'>
                  <User2 className='h-8 w-8 text-custom-color' />
                  <div className='text-sm flex flex-col'>
                    <p>Naresh</p>
                    <p className='italic'>Super Admin</p>
                  </div>
                  <ChevronUp className='ml-auto' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={5} align='end'>
                <DropdownMenuItem>My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/signin')}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default Appsidebar
