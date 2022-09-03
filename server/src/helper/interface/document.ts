import { EDocumentStatus } from '../enum';

export interface ICompanyAddress {
  internalId?: number;
  branchId?: string;
  country?: string;
  governate?: string;
  regionCity?: string;
  street?: string;
  buildingNumber?: string;
  postalCode?: string;
  floor?: string;
  room?: string;
  landmark?: string;
  additionalInformation?: string;
}

export interface ICompany {
  internalId?: number;
  name?: string;
  type?: string;
  taxNumber?: string;
  id?: string;
  addresses?: ICompanyAddress[];
}
export interface IInvoiceLineUnitValue {
  internalId?: number;
  currencySold?: string;
  amountEGP?: number;
  amountSold?: number;
  currencyExchangeRate?: number;
}
export interface IInvoiceLines {
  internalId?: number;
  description?: string;
  itemType?: string;
  itemCode?: string;
  unitType?: string;
  quantity?: number;
  salesTotal?: number;
  total?: number;
  valueDifference?: number;
  totalTaxableFees?: number;
  netTotal?: number;
  itemsDiscount?: number;
  internalCode?: string;
  unitValue?: IInvoiceLineUnitValue;
  taxableItems?: IInvoiceLinesTaxableItem[];
}
export interface IDocumentTaxTotal {
  internalId?: number;
  taxType?: string;
  amount?: number;
}

export interface ISignature {
  signatureType?: string;
  value?: number;
}

export interface IInvoiceLinesTaxableItem {
  internalId?: number;
  taxType?: string;
  amount?: number;
  subType?: string;
  rate?: number;
}

export interface IDocument {
  internalId?: number;
  uuid?: string;
  submissionUUID?: string;
  longId?: string;
  docInternalId?: string;
  status?: string;
  orgId?: string;
  documentType?: string;
  documentTypeVersion?: string;
  dateTimeIssued?: Date | string;
  taxpayerActivityCode?: string;
  purchaseOrderReference?: string;
  purchaseOrderDescription?: string;
  salesOrderReference?: string;
  salesOrderDescription?: string;
  totalSalesAmount?: number;
  totalDiscountAmount?: number;
  netAmount?: number;
  extraDiscountAmount?: number;
  totalItemsDiscountAmount?: number;
  totalAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  issuer?: ICompany;
  issuerAddress?: ICompanyAddress;
  receiver?: ICompany;
  receiverAddress?: ICompanyAddress;
  invoiceLines?: IInvoiceLines[];
  taxTotals?: IDocumentTaxTotal[];
  signatures?: ISignature[];
}
