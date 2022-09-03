import { RequestHandler } from 'express';
import { In, Not } from 'typeorm';
import docRepository from '../../repository/document';
import docStatusHistoryRepository from '../../repository/documentStatusHistory';
import docErrorRepository from '../../repository/documentError';
import taxAuthorityTokenRepository from '../../repository/taxAuthorityToken';
import companyRepository from '../../repository/company';
import userRepoisotry from '../../repository/user';
import notificationSubsRepository from '../../repository/notificationSubscribers';
import settingRepository from '../../repository/setting';
import ETADocController from '../ETA/documentController';
import ETAAuthController from '../ETA/authController';
import SignerController from '../signService/signController';
import {
  EDocumentStatus,
  IUser,
  IDocument,
  IDocSubmitionResponse,
  serialize,
  chunkArray,
  delay,
  formateDateTimeIssued,
  IToken,
} from '../../helper';
import config from '../../config';
import { EAppMode, ESettings, EEmailStatus, ETemplateNames } from '../../helper';
import { sendMailWithTemplate } from '../../mailer';
import { Token } from '../../entity/Token';
import { EHttpStatusCode, appPermissions } from '../../helper';
import { User } from '../../entity/User';

class DocumentsController {
  public getDocuments: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.viewInvoices
      );
      if (!neededPermissions || !neededPermissions.length)
        return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { type } = req.query;
      if (!type || (type !== 'all' && type !== 'active')) {
        return res.status(500).json({ error: 'Invalid type' });
      }
      let where = {};
      if (type === 'active') {
        where = { status: Not(EDocumentStatus.approved) };
      }
      const docs = await docRepository.getAllDocuments(where);
      return res.json({ data: docs });
    } catch (error) {
      return res.status(500).json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public getDocument: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.viewInvoicesDetails
      );
      if (!neededPermissions || !neededPermissions.length)
        return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const docInternalId = req.params.documentId;
      if (!docInternalId) {
        return res.status(400).json({ error: 'Invalid document internal Id.' });
      }
      const document = await docRepository.findOne({ docInternalId });
      if (!document) return res.status(404).json({ error: 'Document not found.' });
      return res.json(document);
    } catch (error) {
      return res.status(500).json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public cronJobHandler = async () => {
    const docs = await docRepository.getDocuments(['internalId'], {
      status: In([EDocumentStatus.pending]),
    });
    const doctsIds = docs.map((item) => item.internalId);

    if (doctsIds.length) {
      const sysuser = await userRepoisotry.findOne({ username: 'sysuser' });
      this.handleSubmitDocuments(doctsIds, sysuser.internalId);
    }
  };

  private async signDocuemnts(documents: IDocument[]): Promise<IDocument[]> {
    return new Promise((resolve, reject) => {
      let promises = documents.map(async (doc) => {
        if (config.env === EAppMode.production) {
          let serializedDocument = await this.serialize(doc);
          var signature = await this.signDocument(serializedDocument);
        } else {
          var signature: any = '0';
        }
        let document = {
          ...doc,
          signatures: [
            {
              signatureType: 'I',
              value: signature,
            },
          ],
        };
        return document;
      });
      Promise.all(promises)
        .then((results) => {
          resolve(results);
        })
        .catch((e) => {
          console.error(e);
          reject(e);
        });
    });
  }
  private async submitDocumentsToETA(
    documents: IDocument[],
    accessToken: string
  ): Promise<IDocSubmitionResponse> {
    return new Promise((resolve, reject) => {
      ETADocController.submit(accessToken, documents)
        .then((resp) => resolve(resp))
        .catch((err) => reject(err));
    });
  }

  private async serialize(document: IDocument) {
    return await SignerController.serialize(document);
  }
  private async signDocument(serialized: any) {
    return await SignerController.sign(serialized);
  }

  private async updateDocStatus(validatedDocuments: any, documentsAccepted, userId) {
    validatedDocuments.forEach(async ({ uuid, validationResults, status }) => {
      console.log('============================');
      const selectedDoc = documentsAccepted.find((d) => d.uuid === uuid);
      if (status === 'Valid' || (validationResults && validationResults.status === 'Valid')) {
        console.log(uuid, '======', 'Valid');
        // update docs status to inprocess
        await docRepository.updateDocuments(
          { internalId: selectedDoc.internalId },
          { status: EDocumentStatus.approved }
        );
        // Change document status history
        await docStatusHistoryRepository.createStatus(
          selectedDoc.internalId,
          EDocumentStatus.approved,
          userId
        );
      } else if (
        status === 'Invalid' ||
        (validationResults && validationResults.status === 'Invalid')
      ) {
        console.log(uuid, '======', 'Invalid');
        if (validationResults) {
          let allErrors = validationResults.validationSteps.filter((item) => {
            if (item.error && Array.isArray(item.error.innerError)) {
              return item.error.innerError;
            }
          });
          console.log('allErrors_new', allErrors);

          const errorSaved = await docErrorRepository.saveDocumentError(
            selectedDoc?.error?.internalId,
            selectedDoc.uuid,
            JSON.stringify(allErrors)
          );
          // update document to rejected
          await docRepository.updateDocuments(
            { uuid: uuid },
            { status: EDocumentStatus.rejected, error: { internalId: errorSaved.internalId } }
          );
          // update histroy
          docStatusHistoryRepository.createStatus(
            selectedDoc.internalId,
            EDocumentStatus.rejected,
            userId
          );
        } else {
          // update document to rejected
          await docRepository.updateDocuments({ uuid: uuid }, { status: EDocumentStatus.rejected });
          // update histroy
          docStatusHistoryRepository.createStatus(
            selectedDoc.internalId,
            EDocumentStatus.rejected,
            userId
          );
        }
      } else if (
        status === 'Cancelled' ||
        (validationResults && validationResults.status === 'Cancelled')
      ) {
        console.log(uuid, '======', 'Cancelled');
        // update docs status to inprocess
        await docRepository.updateDocuments(
          { internalId: selectedDoc.internalId },
          { status: EDocumentStatus.cancelled }
        );
        // Change document status history
        await docStatusHistoryRepository.createStatus(
          selectedDoc.internalId,
          EDocumentStatus.cancelled,
          userId
        );
      }
    });
  }
  private async validate(result: IDocSubmitionResponse, taxToken: Token, userId: number) {
    let validatedDocuments = [];

    console.log('In validation method');
    const { acceptedDocuments, rejectedDocuments } = result;
    if (acceptedDocuments && acceptedDocuments.length) {
      //
      // update documents with uuids,submissionUUID and longId
      await Promise.all(
        acceptedDocuments.map((item) =>
          docRepository.updateDocuments(
            { docInternalId: item.internalId },
            { submissionUUID: result.submissionId, uuid: item.uuid, longId: item.longId }
          )
        )
      );
      //
      // get all uuids
      const uuids = acceptedDocuments.map((item) => item.uuid);
      const documentsIds = result.acceptedDocuments.map((a) => a.internalId);
      const documentsAccepted = await docRepository.getDocuments(
        ['internalId', 'uuid'],
        { docInternalId: In(documentsIds) },
        ['error']
      );

      //
      // convert uuids to chunks
      let chunksDocuments = chunkArray(uuids, 5);
      console.log('chunkArray', chunksDocuments);
      //
      //
      //
      let sleepTime = 0;

      for (let chunk of chunksDocuments) {
        let uuidsNotFound = [];
        console.log('chunk===>', chunk);
        sleepTime = Math.min((5 + 2 * chunk.length) * 1000, 60000);
        console.log(`Validating will start after ${sleepTime / 1000} seconds.`);
        console.log('Before delay');
        await delay(sleepTime);
        console.log('After delay');
        taxToken = await ETAAuthController.generateTokenIfExpired(taxToken);
        for (let uuid of chunk) {
          console.log('uuidsNotFound', uuidsNotFound);
          const docFound = await ETADocController.getDocumentByUUID(taxToken.accessToken, uuid);
          if (docFound) {
            console.log('uuid:', uuid, '===>', docFound.status);
            if (docFound.status === 'Valid' || docFound.status === 'Invalid') {
              validatedDocuments.push(docFound);
            } else {
              console.log('Status_not_valid_or_invalid');
              uuidsNotFound.push(uuid);
            }
          } else {
            if (docFound.error.code === 'NotFound') {
              console.log('uuid:', uuid, '===>', 'NotFound');
              uuidsNotFound.push(uuid);
            }
          }
        }
        if (uuidsNotFound.length) {
          console.log('PUSH_TO_MAIN_ARRAY', uuidsNotFound);
          chunksDocuments.push(uuidsNotFound);
        }
        // update
        this.updateDocStatus(validatedDocuments, documentsAccepted, userId);
      }

      //
      //
    }
    if (rejectedDocuments && rejectedDocuments.length) {
      const documentsIds = rejectedDocuments.map((a) => a.internalId);
      const docsRejected = await docRepository.getDocuments(
        ['internalId', 'uuid', 'docInternalId'],
        { docInternalId: In(documentsIds) },
        ['error']
      );

      rejectedDocuments.forEach(async (rejectedDoc) => {
        const selectedDoc = docsRejected.find((d) => d.docInternalId === rejectedDoc.internalId);
        const allErrors = rejectedDoc.error.details.map((details) => {
          const { code, message, propertyPath } = details;
          return { errorCode: code, error: message, propertyPath };
        });
        const currentErrors = [{ error: { innerError: allErrors } }];
        console.log('currentErrors_new', currentErrors);

        const errorSaved = await docErrorRepository.saveDocumentError(
          selectedDoc?.error?.internalId,
          selectedDoc.uuid,
          JSON.stringify(currentErrors)
        );
        // Save errors
        if (errorSaved) {
          // update document to rejecte
          await docRepository.updateDocuments(
            { internalId: selectedDoc.internalId },
            { status: EDocumentStatus.rejected, error: { internalId: errorSaved.internalId } }
          );
          // Change document status history
          await docStatusHistoryRepository.createStatus(
            selectedDoc.internalId,
            EDocumentStatus.rejected,
            userId
          );
        }
      });
    }

    return { validatedDocuments, rejectedDocuments };
  }

  public async handleSubmitDocuments(docsIds: number[], userId: number) {
    // update docs status to inprocess
    await docRepository.updateDocuments(docsIds, { status: EDocumentStatus.inprocess });
    // Change document status history
    await Promise.all(
      docsIds.map((docId: number) =>
        docStatusHistoryRepository.createStatus(docId, EDocumentStatus.inprocess, userId)
      )
    );
    // get docs from database
    const documents = await docRepository.getDocumentsByIds(docsIds);
    // prepare docs to send them to tax authority
    const inProcessDocuments = this.prepareDocumentStructure(documents);
    // Sign documemts
    const signedDocuments = await this.signDocuemnts(inProcessDocuments);
    // submit documents to egyption tax authority
    const results = await this.handleMultiCompanySubmission(signedDocuments, userId);

    return results;
  }

  private async handleMultiCompanySubmission(signedDocuments: IDocument[], userId: number) {
    let results = [];
    const taxAuthorityTokens = await taxAuthorityTokenRepository.findAll();
    for (let token of taxAuthorityTokens) {
      const documentsPerCompany = signedDocuments.filter(
        (d) => d.issuer.id === token.company.taxNumber
      );
      if (documentsPerCompany.length > 0) {
        console.log(`${documentsPerCompany.length} documents found, submitting....`);
        token = await ETAAuthController.generateTokenIfExpired(token);
        const resultPerCompany = await this.submitDocumentsToETA(
          documentsPerCompany,
          token.accessToken
        );
        console.log('resultPerCompany', resultPerCompany);
        const { validatedDocuments, rejectedDocuments } = await this.validate(
          resultPerCompany,
          token,
          userId
        );
        this.sendStatusMailToSubscribers(validatedDocuments, rejectedDocuments);
        console.log('After Validation');
        results.push({ ...resultPerCompany });
      }
    }
    return results;
  }
  private async sendStatusMailToSubscribers(validatedDocuments, rejectedDocuments) {
    let documentIdWithStatus = [];
    const subscribers = await notificationSubsRepository.findAll();
    const emails = subscribers.map((s) => s.email);
    const setting = await settingRepository.get(ESettings.settingsEmailStatus);
    const emailStatus = JSON.parse(setting.value);
    if (validatedDocuments) {
      for (const doc of validatedDocuments) {
        documentIdWithStatus.push({
          internalId: doc.internalId,
          status: doc.validationResults.status,
        });
      }
    }

    if (rejectedDocuments) {
      for (const doc of rejectedDocuments) {
        documentIdWithStatus.push({ internalId: doc.internalId, status: 'Invalid' });
      }
    }

    console.log('documentIdWithStatus', documentIdWithStatus);

    if (emailStatus.includes(EEmailStatus.rejection)) {
      console.log('SEND_REJECTION_MAILS');
      const rejected = documentIdWithStatus.filter((d) => d.status === 'Invalid');
      if (rejected.length) {
        sendMailWithTemplate(emails, ETemplateNames.documentRejected, {
          data: rejected,
          frontendURL: config.clientURL,
        });
      }
    }
    if (emailStatus.includes(EEmailStatus.acceptance)) {
      console.log('SEND_ACCEPTANCE_MAILS');
      const accepted = documentIdWithStatus.filter((d) => d.status === 'Valid');
      if (accepted.length) {
        sendMailWithTemplate(emails, ETemplateNames.documentApproved, {
          data: accepted,
          frontendURL: config.clientURL,
        });
      }
    }
  }
  public submitDocumets: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.submitInvoices
      );
      if (!neededPermissions || !neededPermissions.length)
        return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { docsIds } = req.body;
      const { internalId: userId } = req.user as IUser;
      if (!docsIds || docsIds.length === 0) {
        return res.status(400).json({ error: 'Empty arguments.' });
      }
      const result = await this.handleSubmitDocuments(docsIds, userId);
      return res.json(result);
    } catch (error) {
      console.log('catch_error', error);
      return res.status(500).json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  private prepareDocumentStructure = (documents: IDocument[]): IDocument[] => {
    const docs = documents.map((doc: IDocument) => {
      const docInoviceLines = doc.invoiceLines.map((invoiceLine) => {
        if (invoiceLine.unitValue.currencySold.toUpperCase() === 'EGP') {
          invoiceLine.unitValue = {
            ...invoiceLine.unitValue,
            internalId: undefined,
            amountSold: undefined,
            currencyExchangeRate: undefined,
            amountEGP: Number(invoiceLine.unitValue.amountEGP.toFixed(5)),
          };
          invoiceLine.internalId = undefined;
          invoiceLine.description = invoiceLine?.description.trim();
          invoiceLine.quantity = Number(invoiceLine.quantity.toFixed(5));
          invoiceLine.itemsDiscount = Number(invoiceLine.itemsDiscount.toFixed(5));
          invoiceLine.valueDifference = Number(invoiceLine.valueDifference.toFixed(5));
          invoiceLine.netTotal = Number(invoiceLine.netTotal.toFixed(5));
          invoiceLine.salesTotal = Number(invoiceLine.salesTotal.toFixed(5));
          invoiceLine.total = Number(invoiceLine.total.toFixed(5));
          invoiceLine.taxableItems = invoiceLine.taxableItems.map((i) => ({
            ...i,
            internalId: undefined,
            amount: Number(i.amount.toFixed(5)),
          }));
          return invoiceLine;
        }
        invoiceLine.internalId = undefined;
        invoiceLine.description = invoiceLine?.description.trim();
        invoiceLine.quantity = Number(invoiceLine.quantity.toFixed(5));
        invoiceLine.itemsDiscount = Number(invoiceLine.itemsDiscount.toFixed(5));
        invoiceLine.valueDifference = Number(invoiceLine.valueDifference.toFixed(5));
        invoiceLine.netTotal = Number(invoiceLine.netTotal.toFixed(5));
        invoiceLine.salesTotal = Number(invoiceLine.salesTotal.toFixed(5));
        invoiceLine.unitValue = {
          ...invoiceLine.unitValue,
          internalId: undefined,
          amountEGP: Number(invoiceLine.unitValue.amountEGP.toFixed(5)),
          currencyExchangeRate: Number(invoiceLine.unitValue.currencyExchangeRate.toFixed(5)),
          amountSold: Number(invoiceLine.unitValue.amountSold.toFixed(5)),
        };
        invoiceLine.total = Number(invoiceLine.total.toFixed(5));
        invoiceLine.taxableItems = invoiceLine.taxableItems.map((i) => ({
          ...i,
          internalId: undefined,
          amount: Number(i.amount.toFixed(5)),
        }));

        return invoiceLine;
      });
      let yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();

      return {
        issuer: {
          name: doc.issuer.name,
          type: doc.issuer.type,
          id: doc.issuer.taxNumber,
          address: { ...doc.issuerAddress, internalId: undefined },
        },
        receiver: {
          name: doc.receiver.name,
          type: doc.receiver.type,
          id: doc.receiver.taxNumber === null ? '' : doc.receiver.taxNumber,
          address: {
            ...doc.receiverAddress,
            internalId: undefined,
            branchId: undefined,
            room: doc.receiverAddress.room ? doc.receiverAddress.room : undefined,
            floor: doc.receiverAddress.floor ? doc.receiverAddress.floor : undefined,
            landmark: doc.receiverAddress.landmark ? doc.receiverAddress.landmark : undefined,
            postalCode: doc.receiverAddress.postalCode ? doc.receiverAddress.postalCode : undefined,
          },
        },
        documentType: doc.documentType,
        documentTypeVersion: config.env === EAppMode.production ? doc.documentTypeVersion : '0.9',
        dateTimeIssued:
          config.env === EAppMode.production
            ? formateDateTimeIssued(doc.dateTimeIssued)
            : formateDateTimeIssued(yesterday),
        taxpayerActivityCode: doc.taxpayerActivityCode,
        internalID: doc.docInternalId,
        purchaseOrderReference: doc.purchaseOrderReference,
        purchaseOrderDescription: doc.purchaseOrderDescription,
        salesOrderReference: doc.salesOrderReference,
        salesOrderDescription: doc.salesOrderDescription,
        payment: {
          bankName: '',
          bankAddress: '',
          bankAccountNo: '',
          bankAccountIBAN: '',
          swiftCode: '',
          terms: '',
        },
        delivery: {
          approach: '',
          packaging: '',
          dateValidity: '',
          exportPort: '',
          countryOfOrigin: 'EG',
          grossWeight: 0,
          netWeight: 0,
          terms: '',
        },
        invoiceLines: docInoviceLines,
        // totalSales: Number(doc.totalSalesAmount.toFixed(5)),
        totalSalesAmount: Number(doc.totalSalesAmount.toFixed(5)),
        totalDiscountAmount: Number(doc.totalDiscountAmount.toFixed(5)),
        netAmount: Number(doc.netAmount.toFixed(5)),
        taxTotals: doc.taxTotals.map((i) => ({
          ...i,
          internalId: undefined,
          amount: Number(i.amount.toFixed(5)),
        })),
        extraDiscountAmount: Number(doc.extraDiscountAmount.toFixed(5)),
        totalItemsDiscountAmount: Number(doc.totalItemsDiscountAmount.toFixed(5)),
        totalAmount: Number(doc.totalAmount.toFixed(5)),

        // signatures: [
        //   {
        //     signatureType: 'I',
        //     value: '0',
        //   },
        // ],
      };
    });
    return docs;
  };

  // public getRecentDocumets: RequestHandler = async (req, res) => {
  //   const { taxAuthorityAccessKey: accessToken } = req.user as IUser;
  //   if (accessToken) {
  //     const result = await ETADocController.getDocuments(accessToken);
  //     if (result) {
  //       return res.json(result);
  //     } else {
  //       return res.json({ error: "Can't fetch data" });
  //     }
  //   } else {
  //     return res.json({ done: true, error: 'No access token found' });
  //   }
  // };

  public changeDocumentStatus: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.editInvoices
      );
      if (!neededPermissions || !neededPermissions.length)
        return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { status, docId } = req.body;
      const { internalId: userId } = req.user as IUser;
      if (!status || !docId) {
        return res.status(500).json({ error: 'Invalid arguments.' });
      }
      const doc = await docRepository.findOne({ internalId: docId });
      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }
      if (status !== EDocumentStatus.postponed && status !== EDocumentStatus.pending) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const data = await docRepository.updateDocuments({ internalId: docId }, { status });
      // Change document status history
      await docStatusHistoryRepository.createStatus(docId, status, userId);
      return res.json(data);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public generateSignature: RequestHandler = async (req, res) => {
    const serialized = serialize({});
    // const hashed = hashSHA256(serialized);
    return res.json(serialized);
  };

  public sign: RequestHandler = async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'data property is required.' });
      }
      const result = await SignerController.sign(data);
      return res.send(result.data);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public getDocumentJson: RequestHandler = async (req, res) => {
    try {
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.viewInvoicesDetails
      );
      if (!neededPermissions || !neededPermissions.length)
        return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      if (!req.params.documentId) {
        return res.status(400).json({ error: 'Document internl Id not found' });
      }
      const documentId = req.params.documentId;
      let doc = await docRepository.findOne({ docInternalId: documentId });
      if (doc) {
        let data = this.prepareDocumentStructure([doc]);
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'Document not found' });
      }
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'There might be a problem. Please, try again.' });
    }
  };
}

export default new DocumentsController();
