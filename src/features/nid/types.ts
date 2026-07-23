export interface NidData {
  name_bn: string;
  name_en: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  nid_number: string;
  address: string;
  photo?: string;
}

export interface NidLookupRequest {
  nid_number: string;
  date_of_birth: string;
  full_name: string;
  father_name: string;
}
