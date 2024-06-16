type DisasterMessage = {
    create_date: string
    location_id: string
    location_name: string
    md101_sn: string
    msg: string
    send_platform: string
}

type ResponseDisasterMessage = {
    totalPages: number
    totalElements: number
    currentPage: number
    isNext: boolean
    isPrev: boolean
    elementsPerPage: number
    messageList: DisasterMessage[]
}
