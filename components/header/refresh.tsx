'use client'
import { Slot } from '@radix-ui/react-slot'
import { ReactNode } from 'react'

const Refresh = ({ children }: { children: ReactNode }) => {
    return (
        <section onClick={() => window.location.reload()} className='flex items-center cursor-pointer size-3.5'>
            <Slot>{children}</Slot>
        </section>
    )
}

export default Refresh
