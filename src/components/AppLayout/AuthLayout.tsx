import { Outlet } from 'react-router-dom';
import NavbarAuth from '../AppHeader';
import Appsidebar from '../ui/Appsidebar';
import { SidebarProvider } from "../ui/sidebar";

const AuthLayout = () => {
  return (
    <div className='flex'>
      <SidebarProvider>
        <Appsidebar />
        <main className='w-full h-full'>
          <NavbarAuth />
          <div className='px-8 py-8'>
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default AuthLayout;