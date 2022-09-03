import axios from 'axios';
import qs from 'querystring';
import jwt_decode from 'jwt-decode';
import config from '../../config';
import { IToken } from '../../helper';
import { Token } from '../../entity/Token';
import taxAuthorityTokenRepository from '../../repository/taxAuthorityToken';

class ETAAuthController {
  public generateAccessToken = async (clientId, clientSecret) => {
    try {
      const { idSrvBaseUrl } = config.taxAuthority;
      const body = { grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret };
      const result = await axios.post(`${idSrvBaseUrl}/connect/token`, qs.stringify(body));
      return `${result.data.token_type} ${result.data.access_token}`;
    } catch (error) {
      console.log('error=>', error.response);
      return null;
    }
  };

  public isTokenExpired = (accessToken: string): boolean => {
    if (!accessToken) return true;
    const decoded: any = jwt_decode(accessToken);
    const expireTime = decoded.exp;
    const currentTime = Date.now() / 1000;
    return expireTime < currentTime;
  };

  public generateTokenIfExpired = async (taxToken: Token): Promise<Token> => {
    if(this.isTokenExpired(taxToken.accessToken)){
      taxToken.accessToken = await this.generateAccessToken(taxToken.clientID, taxToken.clientSecret)
      taxToken.save()
    }
    return taxToken;
  }
}

export default new ETAAuthController();
