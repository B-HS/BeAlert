'use client'

import { Locations } from '@/lib/locations'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import useFCM from '@/lib/notification'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'

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
    const [onHold, setOnHold] = useState<boolean>(false)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const searchLocations = useCallback((orgValue: string) => {
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
    }, [])

    const debouncedSearch = useCallback(
        (value: string) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            setOnHold(true)
            debounceTimeoutRef.current = setTimeout(() => {
                searchLocations(value)
                setOnHold(false)
            }, 1000)
        },
        [searchLocations],
    )

    const loadSubscribedLocations = useCallback(async () => {
        const locInfo = await requestLocationListByToken()
        setSubscribed((Array.isArray(locInfo) && locInfo?.map((loc) => loc.location)) || [])
    }, [requestLocationListByToken])

    const manageSubscribe = useCallback(
        async (location_id: number) => {
            if (subscribed.includes(String(location_id))) {
                await requestUnsubscribeLocation(String(location_id))
            } else {
                await requestSubscribeLocation(String(location_id))
            }
            loadSubscribedLocations()
        },
        [subscribed, requestSubscribeLocation, requestUnsubscribeLocation, loadSubscribedLocations],
    )

    useEffect(() => {
        debouncedSearch(value)
    }, [value, debouncedSearch])

    useEffect(() => {
        loadSubscribedLocations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const SearchedLocationsList = memo(
        ({ locations, subscribed, manageSubscribe }: { locations: Location[]; subscribed: string[]; manageSubscribe: (id: number) => void }) => (
            <ScrollArea className='p-3 border rounded h-96'>
                <section className='flex flex-wrap gap-2'>
                    {!onHold && locations.length === 0 && <span>검색 결과가 없습니다.</span>}
                    {!onHold &&
                        locations.length > 0 &&
                        locations.map((location) => {
                            const isSubscribed = subscribed.includes(String(location.location_id))
                            return (
                                !isSubscribed && (
                                    <Button
                                        onClick={() => manageSubscribe(location.location_id)}
                                        className='w-fit'
                                        variant={isSubscribed ? 'default' : 'outline'}
                                        key={location.location_id}
                                    >
                                        {`${location.province} ${location.city} ${location.town}`}
                                    </Button>
                                )
                            )
                        })}

                    {onHold && <span> 검색 중</span>}
                </section>
            </ScrollArea>
        ),
    )

    const SubscribedLocationsList = memo(
        ({ locations, subscribed, manageSubscribe }: { locations: Location[]; subscribed: string[]; manageSubscribe: (id: number) => void }) => (
            <ScrollArea className='p-3 border rounded h-52'>
                <section className='flex flex-wrap gap-2'>
                    {locations.map(
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
        ),
    )

    SearchedLocationsList.displayName = 'SearchedLocationsList'
    SubscribedLocationsList.displayName = 'SubscribedLocationsList'

    return (
        <ScrollArea className='h-full'>
            <section className='flex flex-col flex-1 gap-5 mb-12 p-5'>
                <Separator />
                <span className='font-semibold text-md'>검색</span>
                <Input className='focus-visible:ring-0' placeholder='지역명을 입력하세요' value={value} onChange={(e) => setValue(e.target.value)} autoFocus={false}/>
                <Separator />
                <span className='font-semibold text-md'>지역 목록</span>
                <SearchedLocationsList locations={searchedLocations} subscribed={subscribed} manageSubscribe={manageSubscribe} />
                <Separator />
                <span className='font-semibold text-md'>현재 구독한 지역</span>
                <SubscribedLocationsList locations={Locations} subscribed={subscribed} manageSubscribe={manageSubscribe} />
            </section>
        </ScrollArea>
    )
}

export default LocationSelector
