export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IGroup {
    _id: string;
    name: string;
    description?: string;
    members: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum SplitType {
    EQUAL = 'equal',
    PERCENTAGE = 'percentage',
    CUSTOM = 'custom',
  }
  
  export interface ISplit {
    user: string;
    amount: number;
    percentage?: number;
  }
  
  export interface IExpense {
    _id: string;
    group: string;
    description: string;
    amount: number;
    paidBy: string;
    splitType: SplitType;
    splits: ISplit[];
    category?: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ISettlement {
    from: string;
    to: string;
    amount: number;
  }
  
  export interface IBalance {
    user: string;
    balance: number;
  }
  
  export interface IGroupBalance {
    groupId: string;
    balances: IBalance[];
    settlements: ISettlement[];
  }