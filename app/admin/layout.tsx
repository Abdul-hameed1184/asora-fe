import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import React from 'react'
import { Sidebar } from './components/Sidebar'
// import Sidebar from '../(dashboard)/Sidebar'
// import { Separator } from "@/components/ui/separator"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <>
                <div className="flex h-screen bg-background">
                    <Sidebar />
                    <main className="flex-1 overflow-auto bg-background">{children}</main>
                </div>
            </>
        </div>
    )
}

export default Layout