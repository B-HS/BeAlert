import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ReactNode } from 'react'
import LocationSelector from './location-selector'
const SettingSheet = ({ vapidKey, children }: { children: ReactNode; vapidKey: string }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className='flex flex-col flex-start w-full sm:max-w-full'>
                <SheetHeader>
                    <SheetTitle className='text-start'>설정</SheetTitle>
                </SheetHeader>
                <section className='flex flex-col gap-2 w-full h-full'>
                    <LocationSelector vapidKey={vapidKey} />
                </section>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant={'secondary'} type='submit' className='w-full'>
                            닫기
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
export default SettingSheet
