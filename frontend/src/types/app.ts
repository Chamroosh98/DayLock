export type StatusType = 'ok' | 'err' | 'warn';

export interface StatusState {
  type: StatusType;
  msg: string;
}

export interface ViewErrorState {
  type: 'geo' | 'time' | 'asn' | 'dms' | 'expired' | 'burned' | 'rate_limit' | 'generic';
  data: any;
}

export interface E2EMessage {
  id: string | number;
  text: string;
  timestamp: number;
  isSelf?: boolean;
}

export interface E2EKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface E2EChannelDetails {
  id: string;
  expires_at: number;
}

export interface DecryptedPayload {
  kind?: string;
  type?: string;
  url?: string;
  name?: string;
  base64?: string;
  stegoText?: string;
  text?: string;
  [key: string]: any;
}
