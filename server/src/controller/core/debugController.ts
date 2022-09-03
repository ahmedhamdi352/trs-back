import { RequestHandler } from 'express';
import { sendMailWithTemplate } from '../../mailer';

class DebugController {
  public sendMail: RequestHandler = async (req, res) => {
    try {
      // {
      //     "to":["info@example.com"],
      //     "template":"documentApproved",
      //     "data": [{"internalId":"1234", "status":"Valid"}, {"internalId":"5678", "status":"Valid"}]
      // }
      const { to, template, locals } = req.body;
      sendMailWithTemplate(to, template, locals);
      return res.json({ message: 'Email sent succesufuly' });
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
}

export default new DebugController();
