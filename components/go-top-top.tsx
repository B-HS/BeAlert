'use client'

import { cx } from 'class-variance-authority'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { AnimatePresence, motion } from 'framer-motion'
const GoToTop = () => {
    const [isTop, setIsTop] = useState(true)

    useEffect(() => {
        window.onscroll = () => setIsTop(window.scrollY === 0)
        return () => {
            window.onscroll = null
        }
    })

    return (
        <AnimatePresence>
            {!isTop && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
                    <Button
                        variant={'secondary'}
                        size={'icon'}
                        className={cx('fixed bottom-3 right-10 text-foreground/50 hover:text-foreground/100 transition-all z-50', 'size-12')}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <ArrowUp />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default GoToTop
