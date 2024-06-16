import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ReactNode } from 'react'
const SettingSheet = ({ children }: { children: ReactNode }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>설정</SheetTitle>
                </SheetHeader>
                <div className='gap-4 grid py-4'>
                    <div className='items-center gap-4 grid grid-cols-4'>
                        <Label htmlFor='name' className='text-right'>
                            Name
                        </Label>
                        <Input id='name' value='Pedro Duarte' className='col-span-3' />
                    </div>
                    <div className='items-center gap-4 grid grid-cols-4'>
                        <Label htmlFor='username' className='text-right'>
                            Username
                        </Label>
                        <Input id='username' value='@peduarte' className='col-span-3' />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type='submit'>Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
export default SettingSheet
