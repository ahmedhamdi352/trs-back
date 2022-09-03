import axios from 'axios';
import config from '../../config';
import { IDocument, IDocSubmitionResponse } from '../../helper';

// Egyption Tax Authority  Controller
class ETADocumentController {
  public getDocuments = async (accessToken: string, pageSize = 10, pageNo = 1) => {
    try {
      const { apiBaseUrl } = config.taxAuthority;
      const result = await axios.get(`${apiBaseUrl}/api/v1.0/documents/recent?pageSize=${pageSize}&pageNo=${pageNo}`, {
        headers: { Authorization: accessToken },
      });
      return result.data;
      // return result;
    } catch (error) {
      console.log('error=>', error);
      return null;
    }
  };

  public submit = async (accessToken: string, documents: any): Promise<IDocSubmitionResponse> => {
    try {
      const { apiBaseUrl } = config.taxAuthority;
      const result = await axios.post(
        `${apiBaseUrl}/api/v1/documentsubmissions`,
        {
          documents: documents,
        },
        { headers: { Authorization: accessToken } }
      );
      return result.data;
    } catch (error) {
      console.log('submit_error', error.response.data.error);
      return error.response;
    }
  };
  public getDocumentByUUID = async (accessToken: string, uuid: string) => {
    try {
      const { apiBaseUrl } = config.taxAuthority;
      let resp = await axios.get(`${apiBaseUrl}/api/v1/documents/${uuid}/raw`, { headers: { Authorization: accessToken } });
      return resp.data;
    } catch (error) {
      console.log('error', uuid, error.response.data.error);
      return error.response.data.error;
    }
  };

  public validate = async (accessToken: string, uuids: string[]) => {
    return new Promise(function (resolve, reject) {
      const { apiBaseUrl } = config.taxAuthority;
      console.log('Validating...', uuids);
      Promise.all(uuids.map((uuid) => axios.get(`${apiBaseUrl}/api/v1/documents/${uuid}/raw`, { headers: { Authorization: accessToken } })))
        .then((result) => {
          const validation = result.map((item) => item.data);
          resolve(validation);
        })
        .catch((err) => {
          console.log('validate_err', err.response.data.error);
          reject(err.response.data.error);
        });
    });
  };
}

export default new ETADocumentController();
