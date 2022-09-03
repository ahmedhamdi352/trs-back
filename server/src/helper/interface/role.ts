export interface IRole {
    internalId?: number;
    name?: string;
    user?: any;
    permissions?: IPermission[]
}

export interface IPermission{
    internalId?: number;
    name?: string;
}