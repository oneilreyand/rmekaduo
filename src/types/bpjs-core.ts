export type BpjsServiceType = 'PCARE' | 'VCLAIM' | 'ANTROL';

export interface BpjsSecurityHeaders {
  'X-cons-id': string;
  'X-timestamp': string;
  'X-signature': string;
  'user_key': string;
}

export interface BpjsApiMetadata {
  code: number | string;
  message: string;
}

export interface BpjsApiResponse<T> {
  metaData?: BpjsApiMetadata;
  metadata?: BpjsApiMetadata;
  response: T;
}

export interface BpjsEncryptedResponse {
  metaData?: BpjsApiMetadata;
  metadata?: BpjsApiMetadata;
  response: string; // Base64 ciphertext
}

export interface BpjsConfigState {
  consId: string;
  secretKey: string;
  pcareUserKey: string;
  vclaimUserKey: string;
  antrolUserKey: string;
  ppkCode: string;
  ppkName: string;
  facilityType: 'FKTP' | 'FKRTL';
  isConfigured: boolean;
}
