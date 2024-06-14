const Home = () => {
    return (
        <section>
            <AccordionDemo />
        </section>
    )
}

export default Home

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function AccordionDemo() {
    return (
        <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='item-1'>
                <AccordionTrigger className='px-3'>Is it accessible?</AccordionTrigger>
                <AccordionContent className='px-3'>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
                <AccordionTrigger className='px-3'>Is it styled?</AccordionTrigger>
                <AccordionContent className='px-3'>
                    Yes. It comes with default styles that matches the other components&apos; aesthetic.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
                <AccordionTrigger className='px-3'>Is it animated?</AccordionTrigger>
                <AccordionContent className='px-3'>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
