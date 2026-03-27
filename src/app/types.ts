export enum PolicyType{
  ROLE = 'ROLE',
}

export type DTOWithPolicies = {    policies: { [key: string]: any; }};
