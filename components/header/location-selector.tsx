'use client'

import { Locations } from '@/lib/locations'
import { useEffect, useState } from 'react'

import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import useFCM from '@/lib/notification'

type Location = {
    location_id: number
    province: string
    city: string
    town: string
}

const LocationSelector = ({ vapidKey }: { vapidKey: string }) => {
    const { requestSubscribeLocation, requestLocationListByToken, requestUnsubscribeLocation } = useFCM(vapidKey)
    const [value, setValue] = useState<string>('')
    const [searchedLocations, setSearchedLocations] = useState<Location[]>([])
    const [subscribed, setSubscribed] = useState<string[]>([])
    const searchLocations = (orgValue: string) => {
        const value = orgValue.trim()
        if (!value) {
            setSearchedLocations([])
            return
        }
        const result = Locations.filter(
            (location) =>
                location.province.toLowerCase().includes(value.toLowerCase()) ||
                location.city.toLowerCase().includes(value.toLowerCase()) ||
                location.town.toLowerCase().includes(value.toLowerCase()),
        )
        setSearchedLocations(result)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadSubscribedLocations = async () => {
        requestLocationListByToken().then((locInfo) => {
            setSubscribed((Array.isArray(locInfo) && locInfo?.map((loc) => loc.location)) || [])
        })
    }

    const manageSubscribe = async (location_id: number) => {
        if (subscribed.includes(String(location_id))) {
            await requestUnsubscribeLocation(String(location_id))
        } else {
            await requestSubscribeLocation(String(location_id))
        }
        loadSubscribedLocations()
    }

    useEffect(() => {
        searchLocations(value)
    }, [value])

    useEffect(() => {
        loadSubscribedLocations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ScrollArea className='h-full'>
            <section className='flex flex-col flex-1 gap-5 mb-12'>
                <Separator />
                <span className='font-semibold text-xl'>검색</span>
                <Input placeholder='지역명을 입력하세요' value={value} onChange={(e) => setValue(e.target.value)} />
                <Separator />
                <span className='font-semibold text-xl'>지역 목록</span>
                <ScrollArea className='p-3 border rounded h-96'>
                    <section className='flex flex-wrap gap-2'>
                        {searchedLocations.length === 0 ? (
                            <span>검색 결과가 없습니다.</span>
                        ) : (
                            searchedLocations.map(
                                (location) =>
                                    !subscribed.includes(String(location.location_id)) && (
                                        <Button
                                            onClick={() => manageSubscribe(location.location_id)}
                                            className='w-fit'
                                            variant={subscribed.includes(String(location.location_id)) ? 'default' : 'outline'}
                                            key={location.location_id}
                                        >{`${location.province} ${location.city} ${location.town}`}</Button>
                                    ),
                            )
                        )}
                    </section>
                </ScrollArea>
                <Separator />
                <span className='font-semibold text-xl'>현재 구독한 지역</span>
                <ScrollArea className='p-3 border rounded h-52'>
                    <section className='flex flex-wrap gap-2'>
                        {Locations.map(
                            (location) =>
                                subscribed.includes(String(location.location_id)) && (
                                    <Button
                                        onClick={() => manageSubscribe(location.location_id)}
                                        className='w-fit'
                                        variant={subscribed.includes(String(location.location_id)) ? 'default' : 'outline'}
                                        key={location.location_id}
                                    >{`${location.province} ${location.city} ${location.town}`}</Button>
                                ),
                        )}
                    </section>
                </ScrollArea>
            </section>
        </ScrollArea>
    )
}

export default LocationSelector
