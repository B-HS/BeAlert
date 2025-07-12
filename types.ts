export type SearchInfo = {
  pageIndex: string;
  pageUnit: string;
  pageSize: string;
  firstIndex: string;
  lastIndex: string;
  recordCountPerPage: string;
  searchBgnDe: string;
  searchEndDe: string;
  searchGb: string;
  searchWrd: string;
  rcv_Area_Id: string;
  dstr_se_Id: string;
  c_ocrc_type: string;
  sbLawArea1: string;
  sbLawArea2: string;
  sbLawArea3: string;
};

export type DisasterSms = {
  DSSTR_SE_NM: string;
  CREAT_DT: string;
  RCV_AREA_NM: string;
  MD101_SN: number;
  DSSTR_SE_ID: string;
  MODF_DT: string;
  RCV_AREA_ID: string;
  UPDUSR_ID: string;
  MSG_SE_CD: string;
  DELETE_AT: string;
  MSG_CN: string;
  RNUM: number;
  EMRGNCY_STEP_ID: string;
  REGIST_DT: string;
  REGISTER_ID: string;
  EMRGNCY_STEP_NM: string;
};

export type RtnResult = {
  totCnt: number;
  resultCode: string;
  pageSize: number;
  resultMsg: string;
};

export type DisasterSmsResponse = {
  disasterSmsList: DisasterSms[];
  rtnResult: RtnResult;
};

export type LocationEmd = {
    CBS_AREA_NM: string
    BDONG_CD: string
}

export type LocationSgg = {
    CBS_AREA_NM: string
    BDONG_CD: string
    cbs_emd_list: LocationEmd[]
}

export type LocationSido = {
    CBS_AREA_NM: string
    BDONG_CD: string
    cbs_sgg_list: LocationSgg[]
}

export type Favorite = {
    area1: { code: string; name: string };
    area2: { code: string; name: string };
    area3: { code: string; name: string };
} 