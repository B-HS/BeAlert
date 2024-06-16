import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import dayjs from 'dayjs'
const ListAccordian = ({ list }: { list: DisasterMessage[] }) => {
    return (
        <Accordion type='single' collapsible className='w-full'>
            {list.map((item) => {
                return (
                    <AccordionItem key={item.md101_sn} value={item.md101_sn}>
                        <AccordionTrigger className='px-3'>
                            <section className='flex flex-col items-start gap-2'>
                                <section className='flex items-center gap-2'>
                                    <Badge className='px-1 text-nowrap text-xs'>
                                        {item.location_name.split(',')[0]}
                                        {item.location_name.split(',').length > 1 ? ` 외 ${item.location_name.split(',').length - 1}지역` : ''}
                                    </Badge>
                                    <section className='text-nowrap text-xs'>{dayjs(item.create_date).format('YY/MM/DD - hh:mm:ss')}</section>
                                </section>
                                <section className='line-clamp-1 text-start'>{item.msg.split('vo.la')[0].replaceAll(',', ', ')}</section>
                            </section>
                        </AccordionTrigger>
                        <AccordionContent className='px-3'>
                            <section className='bg-foreground/10 p-3 break-keep size-full'>
                                <section className='flex flex-wrap gap-2 mb-2'>
                                    {item.location_name.split(',').map((location, key) => (
                                        <Badge key={key} className='px-1 text-nowrap text-xs'>
                                            {location}
                                        </Badge>
                                    ))}
                                </section>
                                {item.msg.split('vo.la/')[0].replaceAll(',', ', ')}
                                <br />
                                <sub className='opacity-75'>{`${item.msg.split('vo.la/')[1] ? 'vo.la / ' + item.msg.split('vo.la/')[1] : ''}`}</sub>
                            </section>
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
    )
}

export default ListAccordian
