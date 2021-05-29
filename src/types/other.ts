export type Filter = string;
export type FilterCollection = Array<Filter>;
export type InquirerTableCell = {
    name: string;
    value: string;
};
export type InquirerTableConfig = {
    message: string | number;
    columns: Array<InquirerTableCell>;
    pageSize?: number;
};