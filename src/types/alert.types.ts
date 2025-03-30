export type AlertData = {
    header: {
        resultMsg: string
        resultCode: string
        errorMsg: null
    }
    numOfRows: number
    pageNo: number
    totalCount: number
    body: {
        MSG_CN: string
        RCPTN_RGN_NM: string
        CRT_DT: string
        REG_YMD: string
        EMRG_STEP_NM: string
        SN: number
        DST_SE_NM: string
        MDFCN_YMD: string
    }[]
}