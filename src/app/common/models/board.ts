export class ColumnValue {
    title?: string;
    id?: string;
    type?: string;
    text?: string | null;
  }

  
  
  export class Item {
    name?: string;
    id?: string;
    column_values?: ColumnValue[];
    subitems?: Subitem[];
    group?:any;
  }

  export class Subitem {
    id?: string;
    name?: string;
    column_values?: ColumnValue[];
  }
  
  export class Board {
    name?: string;
    id?: string;
    description?: string | null;
    items?: Item[];
  }
  
  export class Data {
    boards?: Board[];
  }
  
  export class Warning {
    message?: string;
    locations?: {
      line?: number;
      column?: number;
    }[];
    path?: string[];
    extensions?: {
      code?: string;
      typeName?: string;
      fieldName?: string;
    };
  }
  
  export class Extensions {
    warnings?: Warning[];
  }
  
  export class ModalData {
    data?: Data;
    extensions?: Extensions;
    account_id?: number;
  }
  