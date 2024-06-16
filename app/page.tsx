import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { AlertApi } from '@/lib/alert-api'
import dayjs from 'dayjs'

const Home = async () => {
    const alertApi = new AlertApi()
    const response = await alertApi.requestNotificationList()
    const list = response && response.messageList

    return (
        <section>
            <Accordion type='single' collapsible>
                {list.map((item) => {
                    return (
                        <AccordionItem key={item.md101_sn} value={item.md101_sn}>
                            <AccordionTrigger className='px-3'>
                                <section className='flex flex-col items-start gap-2'>
                                    <section className='flex items-center gap-2'>
                                        <Badge className='px-1 text-nowrap text-xs'>{item.location_name.split(',')[0]}</Badge>
                                        <section className='text-nowrap text-xs'>{dayjs(item.create_date).format('YY/MM/DD - hh:mm:ss')}</section>
                                    </section>
                                    <section className='line-clamp-1 text-start'>{item.msg}</section>
                                </section>
                            </AccordionTrigger>
                            <AccordionContent className='px-3'>{item.msg}</AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </section>
    )
}

export default Home
