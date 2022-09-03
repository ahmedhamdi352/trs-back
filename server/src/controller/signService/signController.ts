import axios from 'axios';
import config from '../../config';

class SignService {
  public serialize = async (docuemnt: any) => {
    try {
      const { signServiceUrl } = config;
      const result = await axios.post(`${signServiceUrl}/api/InvoiceHasher/Serialize`, docuemnt);
      return result.data;
    } catch (error) {
      return null;
    }
  };

  public sign = async (serialized: any) => {
    try {
      const { signServiceUrl } = config;
      const result = await axios.post(`${signServiceUrl}/api/InvoiceHasher/Hash`, serialized);
      return result.data;
    } catch (error) {
      return null;
    }
  };
}

export default new SignService();
