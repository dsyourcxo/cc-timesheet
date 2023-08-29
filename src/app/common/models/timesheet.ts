import { TimesheetRow } from "./timesheet-row";

export class Timesheet {
    selectedCrew: string;
    date: null | Date;
    checkInTime: null | string;
    checkOutTime: null | string;
    breakDuration: null | string;
    netShiftHours: number;
    totalHoursSpent: number;
    empAndTime: Map<string, number>;
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
        this.totalHoursSpent = 0;
        this.empAndTime = new Map();
        this.rows = [];
        this.userName = '';
        this.selectedImage = null;
    }
}
