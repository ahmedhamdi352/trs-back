import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import settingRepo from '../repository/setting';
import { ESettings } from '../helper';

export const sendMailWithTemplate = async (receivers: string[], template: string, locals: object) => {
  try {
    const { value } = await settingRepo.get(ESettings.settingsEmailConfig);
    const smtpConfig = JSON.parse(value);
    const transport = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false, // upgrade later with STARTTLS
      // ignoreTLS: true,
      auth: {
        user: smtpConfig.sender,
        pass: smtpConfig.password,
      },
    });
    const email = new Email({
      transport,
      send: true,
      preview: false,
      views: { options: { extension: 'ejs' }, root: path.join(__dirname, '/templates') },
    });

    for (const receiver of receivers) {
      await email.send({ template, message: { from: smtpConfig.sender, to: receiver }, locals });
      console.log(`Email Sent succssfully to ${receiver}`);
    }
  } catch (error) {
    console.log('ERROR', error);
    throw error;
  }
};
