
export interface Me {
    is_guest: boolean;
    created_at: string;
    name: string;
    id: number;
  }
  
  export interface Data {
    me: Me;
  }
  
  export interface User {
    data: Data;
    account_id: number;
  }
  