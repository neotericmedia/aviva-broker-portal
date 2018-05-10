export class DnBResponse {
    private ADR_LINE: string;
    private BR_IND: string;
    private CTRY_CD: string;
    private DUNS_NBR: string;
    private NME: string;
    private NON_POST_TOWN: string;
    private PRIM_GEO_AREA: string;
    private POST_CODE: string;
    private TLCM_NBR: string;

    get getDunsNbr():string {
        return this.DUNS_NBR;
    }
}
