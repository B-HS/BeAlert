'use client'
import { AlertApi } from '@/lib/alert-api'
import { Fragment, useEffect, useState } from 'react'
import ListAccordian from './list-accordian'
import { Button } from '../ui/button'

const LoadListMore = () => {
    const [list, setList] = useState<DisasterMessage[]>([])
    const [isNext, setIsNext] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState<number>(0)

    const alertApi = new AlertApi()
    const loadList = async () => {
        const response = await alertApi.requestNotificationList(currentPage + 1)
        setList((prev) => [...prev, ...response.messageList])
        setIsNext(response.isNext)
        setCurrentPage(response.currentPage)
    }

    useEffect(() => {
        list?.length > 0 && window.scrollTo(0, document.body.scrollHeight)
    }, [list])

    return (
        <section className='flex flex-col justify-center items-center w-full'>
            <ListAccordian list={list} />
            {isNext && (
                <Button className='mt-7 mb-12' onClick={loadList} variant={'default'}>
                    더보기
                </Button>
            )}
        </section>
    )
}
export default LoadListMore
