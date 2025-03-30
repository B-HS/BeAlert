import { LOCATION_LIST } from '@src/constant'
import { FC, useEffect, useState } from 'hono/jsx'
import { Layout } from './components/layout'

declare global {
    interface Window {
        __p256dh__: string
    }
}

const SubscribePanel: FC<{}> = ({}) => {
    const { city, province, town } = LOCATION_LIST
    const renderLocationButtons = (title: string, items: string[]) => {
        return (
            <div className='mb-6'>
                <h2 className='text-xl mb-3'>{title}</h2>
                <div className='flex flex-wrap gap-2' data-type={'locationlist' + title}>
                    {items.map((item) => (
                        <button key={item} className={`px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer`} data-name={item}>
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Layout>
            <div className='max-w-4xl mx-auto p-4'>
                <input id='keyword-input' placeholder='지역 검색' className='w-full px-2 py-1 outline-none border-none' />
                <hr />
                <div className='space-y-6'>
                    {province.length > 0 && renderLocationButtons('Provinces', province)}
                    {city.length > 0 && renderLocationButtons('Cities', city)}
                    {town.length > 0 && renderLocationButtons('Towns', town)}
                </div>
            </div>
            <script type='module' src='/subscribe-panel.js'></script>
        </Layout>
    )
}

export default SubscribePanel
