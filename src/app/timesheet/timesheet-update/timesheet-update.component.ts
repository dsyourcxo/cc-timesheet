import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Item, ModalData } from 'src/app/common/models/board';
import { Timesheet } from 'src/app/common/models/timesheet';
import { TimesheetRow } from 'src/app/common/models/timesheet-row';
import { GoogleSheetsServiceService } from 'src/app/services/google-sheets-service.service';
import { TimesheetService } from 'src/app/services/timesheet.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-timesheet-update',
  templateUrl: './timesheet-update.component.html',
  styleUrls: ['./timesheet-update.component.scss'],
})
export class TimesheetUpdateComponent implements OnInit, OnChanges {
  @Input()
  data: ModalData | null = null;

  @Input()
  userName: string = '';

  error = false;

  isModalOpen: boolean = false;

  crewMap: Map<string, any[]> = new Map();

  itemGroupMap: Map<string, any[]> = new Map();

  isLoading: boolean = true;

  projects: any[] = [];

  groups: any[] = [];

  totalTime: Map<string, number> = new Map();

  openMaterialModal: string = '';

  selectChanged = false;

  timeSelected = false;

  colunms: String[] = [
    'Actions',
    'Select Project',
    'Task Type',
    'Select Task',
    'Estimated Time',
    'Time Spent till date',
    'Activity Type',
    'Crew Member',
    'Man Hours Spent',
    'Material Count',
    'Mark Completed',
    'Comments',
  ];

  items: Map<string, any[]> = new Map();

  validation = {
    ischeckInTime: false,
    ischeckOutTime: false,
    isDate: false,
    isCrew: false,
    isbreak: false,
  };

  rows: TimesheetRow[] = [];
  timesheet: Timesheet = new Timesheet();
  crewType: any;

  row: TimesheetRow = new TimesheetRow();

  activityDropDownValues: any[] = ['Maintenance at Site'];
  labourAndHours: any = {
    totalTime: 0,
    empName: '',
  };

  laboursArray: any[] = [];
  diffInShiftHours: string | undefined = undefined;
  materials: Map<string, any[]> = new Map();
  totalHoursSpent: number = 0;
  rowIndex: number = -1;
  activityRows: any[] = [];
  // totalShiftHours: number = 0;
  totalShiftHours: string | undefined = undefined;
  isLoadingTask: boolean = true;
  rowLoading: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private http: HttpClient,
    private timesheetService: TimesheetService,
    public googleSheetService: GoogleSheetsServiceService
  ) {
    this.timesheet.userName = this.userName;
    this.timesheetService.isloader.subscribe((x) => {
      this.isLoading = x;
    });

    this.isLoading = true;
    this.timesheetService.ProjectBoardApi().subscribe((x: any) => {
      this.projects = x.data.folders[0].children;
      this.isLoading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    if (this.data?.data?.boards && this.data.data?.boards[0].items) {
      this.data.data?.boards[0].items.forEach((item) => {
        item.column_values?.forEach((x) => {
          if (x.title == 'Crew Name') {
            if (x.text?.includes('Crew')) {
              let emp = this.crewMap.get(x.text ?? '') ?? [];
              const listEmp = {
                isSelected: false,
                empObject: item,
              };
              emp.push(listEmp);
              this.crewMap.set(x.text ?? '', emp);
            }
          }
        });
      });
    }
    this.crewType = Array.from(this.crewMap.keys());
    this.addRow();
  }

  selectedProject(index: number) {
    this.rows[index].selectGroup = null;
    this.rows[index].selectedItem = null;
    this.rows[index].itemGroupMap = new Map();
    this.rows[index].items = [];
    this.rows[index].groups = [];
    // this.rowLoading = true;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token') ?? '',
      }),
    };

    let query1 =
      '{ boards (ids:' +
      this.rows[index].project?.id +
      ') { name id description board_folder_id items { name id column_values { title id type text} group { id title }} } }';
    let body = JSON.stringify({
      query: query1,
    });

    this.http
      .post('https://api.monday.com/v2', body, httpOptions)
      .subscribe((x: any) => {
        this.data = x as ModalData;
        if (this.data?.data?.boards && this.data.data?.boards[0].items) {
          this.data.data?.boards[0].items.forEach((item) => {
            let items =
              this.rows[index].itemGroupMap.get(item.group.title ?? '') ?? [];
            items.push(item);
            this.rows[index].itemGroupMap.set(item.group.title ?? '', items);
          });
          this.rows[index].groups = Array.from(
            this.rows[index].itemGroupMap.keys()
          );
        }
      });
  }

  selectedGroup(index: number) {
    this.rows[index].selectedItem = null;
    this.rows[index].items = this.rows[index].itemGroupMap.get(
      this.rows[index].selectGroup
    ) as Item[];
  }

  public selectedTask(index: number) {
    this.isLoadingTask = true;

    this.timesheetService
      .TaskItemApi(this.rows[index].selectedItem?.id)
      .subscribe((x: any) => {
        this.rows[index].materialDetails = [];
        this.rows[index].selectedItem?.id,
          x.data.items[0].subitems.forEach((x: any) => {
            if (
              x.name == 'Installation' ||
              x.name == 'Maintenance' ||
              x.name == 'Removal'
            ) {
              this.rows[index].activityArray.push(x);
            } else {
              let obj = {
                material: x,
                todayHoursSpent: null,
                todaysRemoved: null,
                estimated: parseInt(
                  x.column_values.find(
                    (x: { title: string }) => x.title == 'Est Qty'
                  ).text
                ),
                actual: parseInt(
                  x.column_values.find(
                    (x: { title: string }) => x.title == 'Actual Qty'
                  ).text
                ),
                removed: parseInt(
                  x.column_values.find(
                    (x: { title: string }) => x.title == 'Removal Qty'
                  ).text
                ),
              };
              this.rows[index].materialDetails.push(obj);
            }
          });

        this.rows[index].estimatedTime = this.sum(
          this.rows[index]?.selectedItem?.column_values
            ?.find((x: any) => x.title == 'Est Hours')
            ?.text!.split(',')
        );
        this.rows[index].timeSpentTillDate = this.sum(
          this.rows[index].selectedItem?.column_values
            ?.find((x: any) => x.title == 'Actual Hours')
            ?.text!.split(',')
        );
        this.rows[index].activityType = this.rows[
          index
        ].selectedItem?.column_values?.find(
          (x: any) => x.title == 'Activity'
        )?.text;
        this.rows[index].actualActivityType = this.rows[index].activityType;
        if (
          this.rows[index].activityType?.includes('Installation to Start') ||
          this.rows[index].activityType?.includes('Installation WIP') ||
          this.rows[index].activityType?.includes('Installation In Progress')
        ) {
          this.rows[index].statusCheckBox = 'Installation Completed';
          this.rows[index].showMarkCompletedCol = true;
        }

        if (
          this.rows[index].activityType?.includes('Removal to Start') ||
          this.rows[index].activityType?.includes('Removal WIP') ||
          this.rows[index].activityType?.includes('Removal In Progress')
        ) {
          this.rows[index].statusCheckBox = 'Removal Completed';
          this.rows[index].showMarkCompletedCol = true;
        }

        this.isLoadingTask = false;
      });
  }

  public onCrewSelect(val: any) {
    this.crewMap.get(this.timesheet.selectedCrew);
    this.selectChanged = true;
  }

  public onModelClose(event: any) {
    this.isModalOpen = false;
    if (this.rows[this.rowIndex] != undefined)
      this.rows[this.rowIndex].labours = event.list?.filter((x: any) => {
        if (x.isSelected) return Object.assign({}, x);
      });
    // this.rows[index].labours = this.crewMap.get(this.timesheet.selectedCrew)?.filter((x:any)=>{ if(x.isSelected) return Object.assign({},x)});
    if (this.rows[this.rowIndex].manHoursSpent > 0) this.onHoursSpentChange();
  }

  public addRow() {
    this.row = new TimesheetRow();
    this.rows.push(Object.assign({}, this.row));
  }

  public onHoursSpentChange() {
    this.timesheet.empAndTime = new Map();
    this.timesheet.UserWithTimeInMin = new Map();
    // this.timesheet.totalHoursSpent = ;

    this.rows.forEach((r) => {
      console.log(this.rows);
      if (r.manHoursSpent > -1) {
        r.labours?.forEach((e: any) => {
          let time = (r.manHoursSpent * 60) / r.labours.length;
          // Create an object to represent the data you want to add
          const projectData = {
            projectName: r.project?.name,
            empName: e.empObject.name,
            time: this.toHoursAndMinutes(time),
          };

          // Check if the projectData is not already in the array
          const isDuplicate = r.timePerProject.some(
            (existingData) =>
              existingData.projectName === projectData.projectName &&
              existingData.empName === projectData.empName
            // && existingData.time === projectData.time
            // task name and user name
          );

          // If it's not a duplicate, push the projectData object into the array
          if (!isDuplicate) {
            r.timePerProject.push(projectData);
          }
          // console.log("Split time :", time);

          // time = parseFloat(parseFloat(time.toString()).toFixed(2));
          // if (this.timesheet.empAndTime.get(e.empObject.name)) {
          //   time = time + this.timesheet.empAndTime.get(e.empObject.name)!;
          //   this.timesheet.empAndTime.set(e.empObject.name, time);
          // } else {
          //   this.timesheet.empAndTime.set(e.empObject.name, time);
          // }

          // let parsedTime = parseInt((time / 60).toString());
          // parsedTime = parseFloat(parsedTime + '.' + (time % 60));
          // this.timesheet.empAndTime.set(
          //   e.empObject.name,
          //   parseFloat(parsedTime.toFixed(2))
          // );

          // this.timesheet.empAndTime.set(
          //   e.empObject.name,
          //   parseFloat(this.toHoursAndMinutes(time))
          // );

          if (this.timesheet.UserWithTimeInMin.get(e.empObject.name)) {
            time =
              time + this.timesheet.UserWithTimeInMin.get(e.empObject.name)!;
            this.timesheet.UserWithTimeInMin.set(e.empObject.name, time);
          } else {
            this.timesheet.UserWithTimeInMin.set(e.empObject.name, time);
          }
        });

        // this.timesheet.totalHoursSpent =
        //   this.timesheet.totalHoursSpent + r.manHoursSpent;
      } else {
        alert('Man Hour Spent Should Be Positive Number');
        r.manHoursSpent = 0;
      }
    });

    let totalReportedTimeInMin = 0; // this is total hours spent by users
    for (let [key, value] of this.timesheet.UserWithTimeInMin) {
      console.log(key, value);
      let timeInMin = Number(value);

      totalReportedTimeInMin = totalReportedTimeInMin + timeInMin;

      // console.log("user and time :",key,this.toHoursAndMinutes(timeInMin))
      this.timesheet.empAndTime.set(key, this.toHoursAndMinutes(timeInMin));
    }

    //set totalReportedTimeInMin for UI
    this.timesheet.totalHoursSpent = this.toHoursAndMinutes(
      totalReportedTimeInMin
    );

    let totalnetShiftInMin = this.timesheet.netShiftHours;

    this.diffInShiftHours = undefined;

    //no need to calcaulate again
    // this.timesheet.rows.forEach((x) => {
    //   this.timesheet.totalHoursSpent =
    //     this.timesheet.totalHoursSpent + x.manHoursSpent;
    // });

    //get user names
    this.laboursArray = Array.from(this.timesheet.empAndTime.keys());
    // console.log("this.laboursArray:", this.laboursArray);

    this.totalShiftHours = undefined;

    //calcualtge total shift hours
    totalnetShiftInMin = this.laboursArray.length * totalnetShiftInMin;

    console.log('totalnetShift:', totalnetShiftInMin);
    // this.diffInShiftHours = this.timesheet.totalHoursSpent * 60 - totalnetShift;
    let diffInShifTimeInMin = totalReportedTimeInMin - totalnetShiftInMin;
    this.diffInShiftHours = this.toHoursAndMinutes(diffInShifTimeInMin);

    // let time = parseInt((totalnetShift / 60).toString());

    // time = parseFloat(time + '.' + (totalnetShift % 60));

    // this.totalShiftHours = time;

    // this.totalShiftHours = parseFloat(
    //   parseFloat(this.totalShiftHours.toString()).toFixed(2)
    // );

    this.totalShiftHours = this.toHoursAndMinutes(totalnetShiftInMin);

    // if (this.diffInShiftHours < 0.0) {
    //   time = parseInt((Math.abs(this.diffInShiftHours) / 60).toString());
    //   time = parseFloat(time + '.' + (Math.abs(this.diffInShiftHours) % 60));
    //   time = -1 * time;
    // } else {
    //   time = parseInt((this.diffInShiftHours / 60).toString());
    //   time = parseFloat(time + '.' + (this.diffInShiftHours % 60));
    // }
    // this.diffInShiftHours = time;

    // this.diffInShiftHours = parseFloat(
    //   parseFloat(this.diffInShiftHours.toString()).toFixed(2)
    // );
  }

  toHoursAndMinutes(totalMinutes: number) {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    return `${this.padTo2Digits(hours)}:${this.padTo2Digits(minutes)}`;
    // return `${hours.toString()}:${this.padTo2Digits(minutes)}`;
  }

  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  convertStringToTime(durationString: string): any {
    const parts = durationString.split(' ');

    const daysIndex = parts.findIndex((part) => part === 'days');
    const days = parseInt(parts[daysIndex - 1]);

    const timeParts = parts[daysIndex + 1].split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    return { days, hours, minutes };
  }

  materialModelAction(val: any, index: any) {
    this.rows[index].materialDetails = val;
    this.openMaterialModal = '';
    this.rows[index].materialDetails.forEach((x: any) => {
      if (
        (x.todaysRemoved > -1 && x.todaysRemoved != null) ||
        (x.todayHoursSpent > -1 && x.todayHoursSpent != null)
      ) {
        this.rows[index].isMaterialFilled = true;
      } else {
        this.rows[index].isMaterialFilled = false;
      }
    });
  }

  onTimeChange(val: any, inputLabel: any) {
    this.timesheet.netShiftHours = 0;
    if (inputLabel == 'CheckOut') {
      this.timesheet.checkOutTime = val;
    } else if (inputLabel == 'CheckIn') {
      this.timesheet.checkInTime = val;
    } else {
      this.timesheet.breakDuration = val;
    }

    if (
      this.timesheet.checkOutTime != null &&
      this.timesheet.checkInTime != null
    ) {
      let checkIn = parseInt(this.timesheet.checkInTime);
      let checkOut = parseInt(this.timesheet.checkOutTime);
      let breakDur = parseInt(this.timesheet.breakDuration ?? '0');

      let diff = 0;

      if (checkIn > checkOut) {
        diff = 24 * 60 - (checkIn - checkOut) - breakDur;
      } else {
        diff = checkOut - checkIn - breakDur;
      }

      this.timesheet.netShiftHours = diff;
    }

    this.onHoursSpentChange();
    this.timeSelected = true;
  }

  openModal(num: number) {
    this.rowIndex = num;
    if (this.rows[num].labours?.length < 1) {
      let resetlist = this.crewMap
        .get(this.timesheet.selectedCrew)
        ?.map((x: any) => {
          x.isSelected = false;
          return Object.assign({}, x);
        });
      if (resetlist != undefined) {
        this.rows[num].deflautlabours = resetlist.map((x: any) => {
          return Object.assign({}, x);
        });
      }
    }
    this.isModalOpen = true;
  }

  public onSubmit() {
    this.error = false;
    let errorText = 'Please fill out mendatory fields';
    this.rows.forEach((x) => {
      if (x.comment == null) {
        this.error = true;
      }
      if (x.manHoursSpent == null) {
        this.error = true;
      }
      if (x.labours.length < 1) {
        this.error = true;
      }
      if (!x.isMaterialFilled) {
        this.error = true;
      }
    });
    if (
      this.timesheet.checkInTime == null ||
      this.timesheet.date == null ||
      this.timesheet.checkOutTime == null ||
      this.timesheet.selectedCrew == '' ||
      this.timesheet.breakDuration == null
    ) {
      this.error = true;
    }
    // if (this.timesheet.selectedImage == null) {
    //   this.error = true;
    //   errorText = 'please select the image';
    // }

    if (!this.error) {
      if (!this.diffInShiftHours) {
        Swal.fire({
          title: 'Error',
          text: 'Total Reported Hours Is Less than Total Shift Hours',
          icon: 'error',
          confirmButtonText: 'Done',
        });
      } else {
        this.timesheet.rows = this.rows;
        this.timesheet.checkInTime = this.timeToString(
          parseInt(this.timesheet.checkInTime ?? '')
        );
        this.timesheet.checkOutTime = this.timeToString(
          parseInt(this.timesheet.checkOutTime ?? '')
        );

        // this.timesheetService.prepareForPost(this.timesheet);
        this.timesheetService.PostForActivity(this.timesheet);
        this.timesheetService.PostForActivityUpdate(this.timesheet);
        this.timesheetService.PostForMaterial(this.timesheet);

        this.googleSheetService.uploadFile(
          this.timesheet.selectedImage,
          this.timesheet
        );
        this.timesheetService.makeCall();

        this.googleSheetService.makeCall(this.timesheet);
        this.rows = <TimesheetRow[]>[];
        this.timesheet = new Timesheet();
        this.addRow();
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: errorText,
        icon: 'error',
        confirmButtonText: 'Done',
      });
    }
  }

  sum(val: string[] | undefined | null) {
    let total = 0;
    val?.forEach((x) => {
      total = total + parseInt(x);
    });
    return total;
  }

  deleteRow() {
    if (this.rows.length > 1) this.rows.splice(this.rows.length - 1, 1);
    this.onHoursSpentChange();
  }

  timeToString(time: number) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    let timeInString: any = '';

    if (minutes < 10) timeInString = hours + ':0' + minutes;
    else timeInString = hours + ':' + minutes;

    return timeInString;
  }

  duplicateRow(val: number) {
    this.rows.push(Object.assign({}, this.rows[val]));
    this.rows[val + 1].deflautlabours = this.rows[val].deflautlabours.map(
      (x: any) => {
        return Object.assign({}, x);
      }
    );
    this.onHoursSpentChange();
  }

  copyLabours(val: number) {
    if (this.rows.length > val)
      this.rows[val].labours = Array.from(this.rows[val - 1].labours);
  }

  cssClassDecider(val: any) {
    if (
      val.includes('Crew Member') ||
      val == 'Material Count' ||
      val == 'Comments' ||
      val == 'Man Hours Spent'
    ) {
      return true;
    }
    return false;
  }

  isRowLoading(i: number) {
    if (this.rows[i].project == null) {
      return true;
    } else if (this.rows[i].selectedItem == null) {
      return true;
    } else {
      return false;
    }
  }

  onImageSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    this.timesheet.selectedImage = fileInput.files![0];
  }

  makeProperTime(val: string) {
    let isMinus = false;
    console.log('entered value:', val);
    if (val[0] == '-') {
      isMinus = true;
      val = val.replace('-', '');
    }
    let array = val.split(':');
    console.log(array);
    if (array.length == 2) {
      const hours = parseInt(array[0]);
      const minutes = parseInt(array[1]);
      return hours + minutes;
    }
    if (array[0]?.length == 2 && array[1]?.length == 1) val = val + 0;
    else if (array[0]?.length == 1 && array[1]?.length == 1) val = val + 0;
    else if (array?.length < 2) val = val + ':00';

    if (isMinus) val = '-' + val;
    // console.log(val);
    return val;
  }

  // existing
  // makeProperTime(val: string) {
  //   let isMinus = false;
  //   // console.log(val)
  //   if (val[0] == '-') {
  //     isMinus = true;
  //     val = val.replace('-', '');
  //   }
  //   let array = val.split(':');
  //   console.log(array);
  //   if (array.length == 2) {
  //     const hours = parseInt(array[0]);
  //     const minutes = parseInt(array[1]);
  //     return hours + minutes;
  //   }
  //   if (array[0]?.length == 2 && array[1]?.length == 1) val = val + 0;
  //   else if (array[0]?.length == 1 && array[1]?.length == 1) val = val + 0;
  //   else if (array?.length < 2) val = val + ':00';

  //   if (isMinus) val = '-' + val;
  //   // console.log(val);
  //   return val;
  // }
}
