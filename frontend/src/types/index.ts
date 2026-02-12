export interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Group {
    _id: string;
    name: string;
    description?: string;
    members: User[];
    createdBy: User;
    createdAt: string;
    updatedAt: string;
  }
  
  export enum SplitType {
    EQUAL = 'equal',
    PERCENTAGE = 'percentage',
    CUSTOM = 'custom',
  }
  
  export interface Split {
    user: string | User;
    amount: number;
    percentage?: number;
  }
  
  export interface Expense {
    _id: string;
    group: string | Group;
    description: string;
    amount: number;
    paidBy: string | User;
    splitType: SplitType;
    splits: Split[];
    category?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Settlement {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
  }
  
  export interface Balance {
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
  }
  
  export interface GroupBalance {
    balances: Balance[];
    settlements: Settlement[];
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
      user: User;
      token: string;
    };
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
  }
  
  export interface CreateGroupData {
    name: string;
    description?: string;
    members?: string[];
  }
  
  export interface CreateExpenseData {
    groupId: string;
    description: string;
    amount: number;
    paidBy: string;
    splitType?: SplitType;
    splits?: Split[];
    category?: string;
    date?: string;
  }