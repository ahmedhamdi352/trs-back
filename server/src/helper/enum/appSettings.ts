export enum EAppMode {
  development = 'development',
  production = 'production',
}

export enum EEmailStatus {
  acceptance = 0,
  rejection = 1,
}
export enum ETemplateNames {
  documentApproved = 'documentApproved',
  documentRejected = 'documentRejected',
}

export enum ESettings {
  documentCronjob = 'doc:cronjob',
  settingsEmailConfig = 'setting:email-config',
  settingsEmailStatus = 'setting:email-status',
}
