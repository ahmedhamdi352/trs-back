export interface IAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface IAcceptedDocuments {
  uuid?: string;
  longId?: string;
  internalId?: number;
  hashKey?: string;
}
interface IRejectedDocumentsErrorDetails {
  code?: number | null;
  message?: string;
  target?: string;
  propertyPath?: string;
  details?: string | null;
}
interface IRejectedDocuments {
  internalId?: string;
  error: {
    code?: string;
    message?: string;
    target?: string;
    propertyPath?: string | null;
    details: [IRejectedDocumentsErrorDetails];
  };
}

export interface IDocSubmitionResponse {
  submissionId?: string;
  acceptedDocuments: IAcceptedDocuments[];
  rejectedDocuments: IRejectedDocuments[];
}

export interface IToken{
  internalId?: number;
  clientID?: string;
  clientSecret?: string;
  pin?: string;
  port?: string;
  accessToken?: string;
  company?: any;
}
