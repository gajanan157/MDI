export interface InsurerList {
 insurerId: string,
 insurerName: string,
 insurerType: string
}

export interface InsurerListResponse {
  status: string;
  message: string;
  statusCode: number;
  data: InsurerList[];
}
