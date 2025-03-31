import { alertMessages } from '@src/db/schema'
import { PropsWithChildren } from 'hono/jsx'
import { Badge } from './badge'
import { getLocationList } from '@src/utils'

type AlertMessage = typeof alertMessages.$inferSelect

type AccordionProps = {
    data?: AlertMessage[]
}

const LocationBadges = ({ rcptnRgnNm }: { rcptnRgnNm: string }) => {
    return (
        <div class='flex gap-1'>
            {getLocationList(rcptnRgnNm || '').map((location, idx) => (
                <Badge text={location} key={location + idx} />
            ))}
        </div>
    )
}

const AccordionItem = ({ message }: { message: AlertMessage }) => {
    const locations = getLocationList(message.rcptnRgnNm || '')

    return (
        <section class='accordion-item border-b last:border-0 border-border'>
            <button
                class='accordion-trigger flex justify-between w-full font-medium text-left p-3 text-sm transition-all'
                aria-expanded='false'
                aria-controls={message.sn.toString()}>
                <section class='flex flex-col w-full gap-2'>
                    <div class='flex gap-2 items-center'>
                        {message.rcptnRgnNm && (
                            <Badge text={`${locations[0]} ${locations.length > 1 ? '외 ' + (locations.length - 1) + '지역' : ''}`} />
                        )}
                        <span class='text-xs font-semibold'>{message.crtDt}</span>
                    </div>

                    <span class='line-clamp-1'>
                        {`[${message.emrgStepNm}][${message.dstSeNm}] `}
                        {message.msgCn}
                    </span>
                </section>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    class='accordion-chevron h-4 w-4 shrink-0 transition-transform duration-200'>
                    <path d='m6 9 6 6 6-6'></path>
                </svg>
            </button>
            <section id={message.sn.toString()} class='accordion-content overflow-hidden max-h-0 transition-all duration-300 ease-in-out' hidden>
                <div class='p-3 flex flex-col gap-2 bg-secondary/10'>
                    <LocationBadges rcptnRgnNm={message.rcptnRgnNm || ''} />
                    <p>{message.msgCn}</p>
                </div>
            </section>
        </section>
    )
}

export const Accordion = ({ data }: PropsWithChildren<AccordionProps>) => {
    return (
        <div class='accordion-container border-b border-border'>
            {data?.map((message) => (
                <AccordionItem key={message.sn} message={message} />
            ))}
        </div>
    )
}
