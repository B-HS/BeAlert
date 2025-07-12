import { DisasterSmsResponse } from '../types'

const Pagination = ({ rtnResult, searchParams }: { rtnResult: DisasterSmsResponse['rtnResult']; searchParams: Record<string, string> }) => {
    const totalRecordCount = rtnResult.totCnt
    const pageSize = rtnResult.pageSize
    const currentPageNo = parseInt(searchParams.pageIndex || '1', 10)
    const totalPageCount = Math.ceil(totalRecordCount / pageSize)

    if (totalPageCount <= 1) {
        return null
    }

    const buildQueryString = (pageIndex: number) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set('pageIndex', pageIndex.toString())
        return `/?${newParams.toString()}`
    }

    const pageGroupSize = 5
    const currentPageGroup = Math.floor((currentPageNo - 1) / pageGroupSize)
    const startPage = currentPageGroup * pageGroupSize + 1
    const endPage = Math.min(totalPageCount, startPage + pageGroupSize - 1)

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    const prevGroupPage = startPage - pageGroupSize
    const nextGroupPage = startPage + pageGroupSize

    return (
        <div class='pagination'>
            <div class='pagination-container'>
                {startPage > 1 && (
                    <a className='pagination-item' href={buildQueryString(prevGroupPage)}>
                        이전
                    </a>
                )}
                {pageNumbers.map((page) => (
                    <a className='pagination-item' href={buildQueryString(page)} class={page === currentPageNo ? 'active' : ''}>
                        {page}
                    </a>
                ))}
                {endPage < totalPageCount && (
                    <a className='pagination-item' href={buildQueryString(nextGroupPage)}>
                        다음
                    </a>
                )}
            </div>
        </div>
    )
}

export const Home = ({ data, searchParams }: { data: DisasterSmsResponse | null; searchParams: Record<string, string> }) => {
    const disasterSmsList = data?.disasterSmsList || []
    const rtnResult = data?.rtnResult

    return (
        <main className='container'>
            <section className='disaster-list'>
                {disasterSmsList && disasterSmsList.length > 0 ? (
                    disasterSmsList.map((sms) => (
                        <details key={sms.MD101_SN} className='disaster-item'>
                            <summary className='disaster-summary'>
                                <section className='summary-header'>
                                    <div className='summary-header-left'>
                                        <span className='summary-badge'>{sms.CREAT_DT || '-'}</span>
                                        <span className='summary-badge'>{sms.DSSTR_SE_NM || '-'}</span>
                                    </div>
                                    <div className='summary-badge area-badge'>
                                        {sms.RCV_AREA_NM ? sms.RCV_AREA_NM.split(' ,')[0] : '-'}
                                        {sms.RCV_AREA_NM && sms.RCV_AREA_NM.split(' ,').length > 1 && (
                                            <span className='area-count'> 외 {sms.RCV_AREA_NM.split(' ,').length - 1}곳</span>
                                        )}
                                    </div>
                                </section>
                                <p className='summary-message'>{sms.MSG_CN}</p>
                            </summary>
                            <div className='details-content'>
                                <div className='detail-item'>
                                    <span className='detail-label'>발송지역</span>
                                    <div className='detail-value'>
                                        {sms.RCV_AREA_NM ? (
                                            sms.RCV_AREA_NM.split(' ,').map((area, index) => (
                                                <div key={index} className='area-item'>
                                                    {area}
                                                </div>
                                            ))
                                        ) : (
                                            <span className='no-data'>-</span>
                                        )}
                                    </div>
                                </div>
                                <div className='detail-item'>
                                    <span className='detail-label'>메시지 내용</span>
                                    <div className='detail-value'>
                                        {sms.MSG_CN ? <span className='message-content'>{sms.MSG_CN}</span> : <span className='no-data'>-</span>}
                                    </div>
                                </div>
                            </div>
                        </details>
                    ))
                ) : (
                    <div className='empty-state'>
                        <div className='empty-message'>메시지가 존재하지 않습니다.</div>
                    </div>
                )}
            </section>

            {rtnResult && <Pagination rtnResult={rtnResult} searchParams={searchParams} />}
        </main>
    )
}
