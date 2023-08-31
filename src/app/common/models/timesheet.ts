import { TimesheetRow } from "./timesheet-row";

// export interface empWithTime{
//     timeToCalculate:number,
//     timeToShow:string,
//     emp:string
// }

export class Timesheet {
    selectedCrew: string;
    date: null | Date;
    checkInTime: null | string;
    checkOutTime: null | string;
    breakDuration: null | string;
    netShiftHours: number;
    // totalHoursSpent: number;
    totalHoursSpent: string;
    // empAndTime: Map<string, number>;
    empAndTime: Map<string, string>;
    UserWithTimeInMin: Map<string, number>;
    // empAndTime: Map<string, empWithTime>;
    rows: TimesheetRow[]; // Assuming 'rows' is an array of some type
    userName: string;
    selectedImage: any | null;

    constructor() {
        this.selectedCrew = '';
        this.date = null;
        this.checkInTime = null;
        this.checkOutTime = null;
        this.breakDuration = null;
        this.netShiftHours = 0;
        this.totalHoursSpent = "00:00";
        this.empAndTime = new Map();
        this.UserWithTimeInMin = new Map();
        this.rows = [];
        this.userName = '';
        this.selectedImage = null;
    }
}
