import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { read } from 'fs';
import { groupBy, map, mergeMap, of, pipe, reduce, toArray, zip } from 'rxjs';
import { Item, ModalData } from 'src/app/common/models/board';
import { GoogleSheetsServiceService } from 'src/app/services/google-sheets-service.service';
import { TimesheetService } from 'src/app/services/timesheet.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-timesheet-update',
  templateUrl: './timesheet-update.component.html',
  styleUrls: ['./timesheet-update.component.scss']
})
export class TimesheetUpdateComponent implements OnInit,OnChanges{

  @Input()
  data : ModalData | null = null;

  @Input()
  userName : string ='';

  error = false;

  isModalOpen : boolean = false;

  crewMap : Map<string,any[]> = new Map();

  itemGroupMap : Map<string,any[]> = new Map();

  isLoading : boolean = true;

  projects : any[] = [];

  groups : any[] = [];

  totalTime : Map<string,number> = new Map();

  openMaterialModal : string = '';

  colunms:String[] = [
    "Actions",
"Select Project",
"Select Group",
"Select Task",
"Estimated Time",
"Time Spent till date",
"Activity Type",
"Crew Member",
"Man Hours Spent",
"Material Count",
"Mark Completed",
"Comments",
"Upload Image"
  ];

  availabeColunms:String[] = [
      ];
  items:  Map<string,any[]> = new Map();

  validation = {
    ischeckInTime : false,
    ischeckOutTime : false,
    isDate : false,
    isCrew : false,
    isbreak : false
  }


  rows: any[] = [];
  timesheet = {
    selectedCrew : '',
    date: null,
    checkInTime : null,
    checkOutTime : null,
    breakDuration : null,
    netShiftHours : 0,
    totalHoursSpent : 0,
    empAndTime : new Map<string,number>(),
    rows : this.rows,
    userName : ''
  }
  crewType: any;
  emps: Map<number,any[]> = new Map();
  
  row : any = {
    project : null,
    selectedProjectId :  null,
    itemGroupMap : new Map(),
    selectedItem : null,
    selectGroup : null,
    taskStatus : null,
    estimatedTime : null,
    timeSpentTillDate : null,
    activityType : null,
    comment : null,
    manHoursSpent : null,
    labours : [],
    materialDetails : null,
    activityArray : [],
    statusCheckBox : '',
    isStatusCheckBox : false,
    showMarkCompletedCol : false,
    items: <any[]>[],
    isMaterialFilled : false,
    actualActivityType : null,
    isComment : true,
    isManhourSpent : true,
    isLabours : true,
    groups : [],
    selectedImage : null,
    selectedImageBinary : null,
    date : formatDate(new Date,'yyyy-MM-dd','en-US')
  }

  activityDropDownValues : any[] = ['Programming','Removal','Installation','Maintenance','Warehouse'];
  labourAndHours: any = {
    totalTime : 0,
    empName : ''
  };

  laboursArray: any[] = []
  diffInShiftHours = 0;
  materials: Map<string,any[]> = new Map();
  totalHoursSpent: number = 0;
  rowIndex: number = -1;
  activityRows: any[] = [];
  totalShiftHours: number = 0;
  isLoadingTask: boolean = true;
  rowLoading: boolean = false;
  isUpdating: boolean = false;

  constructor(private http: HttpClient,private timesheetService : TimesheetService,public googleSheetService : GoogleSheetsServiceService) {

    this.timesheetService.isloader.subscribe(x=>{
      this.isLoading = x;
    });

    this.isLoading = true;
   this.timesheetService.ProjectBoardApi().subscribe((x : any)=>{
        this.projects = x.data.folders[0].children;
        this.isLoading = false;
      });
   }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {
    if(this.data?.data?.boards && this.data.data?.boards[0].items){
      this.data.data?.boards[0].items.forEach(item=>{item.column_values?.forEach(x=>{
        
        if(x.title == "Crew Name"){
          let emp = this.crewMap.get(x.text??'')??[];
          const listEmp = {
            isSelected : false,
            empObject : item
          }
          emp.push(listEmp);
          this.crewMap.set(x.text??'',emp);
        }
    });
      })
    }
   this.crewType =  Array.from(this.crewMap.keys());
   this.addRow();
  }

  selectedProject(index : number){

    this.rows[index].selectedGroup = null;
    this.rows[index].selectedItem = null;
    this.rows[index].itemGroupMap = new Map();
    this.rows[index].items = [];
    this.rows[index].groups = [];
    // this.rowLoading = true;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization' : localStorage.getItem("token")??''
       })
    };
  
        let query1 = "{ boards (ids:"+this.rows[index].project.id+") { name id description board_folder_id items { name id column_values { title id type text} group { id title }} } }";
        let body = JSON.stringify({
          'query' : query1
        });

        this.http.post('https://api.monday.com/v2',body , httpOptions).subscribe((x : any)=>{
          this.data = x as ModalData;
          if(this.data?.data?.boards && this.data.data?.boards[0].items){

            this.data.data?.boards[0].items.forEach(item=>{
                let items = this.rows[index].itemGroupMap.get(item.group.title??'')??[];
                items.push(item);
                this.rows[index].itemGroupMap.set(item.group.title??'',items);
              });
              this.rows[index].groups = Array.from(this.rows[index].itemGroupMap.keys());
              console.log(this.rows[index].groups);
              // this.rowLoading = false;
            }    // this.rows[index].items = Array.from(this.data.data?.boards[0].items);
        });
     }

     selectedGroup(index:number){
      this.rows[index].selectedItem = null;
      this.rows[index].items = this.rows[index].itemGroupMap.get(this.rows[index].selectedGroup);
     }

     selectedTask(index:number){
      this.isLoadingTask = true;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization' : localStorage.getItem("token")??''
         })
      };
          let query1 = "{ items (ids:"+this.rows[index].selectedItem?.id+") {  name id column_values { title id type text} subitems { id name column_values { title id text} board{id}} } }";
          let body = JSON.stringify({
            'query' : query1
          });

          this.http.post('https://api.monday.com/v2',body , httpOptions).subscribe((x : any)=>{
            this.rows[index].materialDetails = [];
            this.rows[index].selectedItem.id,x.data.items[0].subitems.forEach((x:any)=>{
                if(x.name == "Installation" || x.name == "Maintenance" || x.name == "Removal"){
                  this.rows[index].activityArray.push(x);
                }else{
                  let obj = {
                    material : x,
                    todayHoursSpent : null,
                    todaysRemoved : null,
                    estimated : parseInt(x.column_values.find((x: { title: string; })=>x.title == "Est Qty").text),
                    actual : parseInt(x.column_values.find((x: { title: string; })=>x.title == "Actual Qty").text),
                    removed : parseInt(x.column_values.find((x: { title: string; })=>x.title == "Removal Qty").text),
                  }
                  this.rows[index].materialDetails.push(obj);
                }
            });
            // this.data = x as ModalData;
            // if(this.data?.data?.boards && this.data.data?.boards[0].items){
            //       this.items.set(this.row.project.name , this.data.data?.boards[0].items);
            // }

            this.rows[index].estimatedTime = this.sum(this.rows[index].selectedItem?.column_values?.find((x:any)=>x.title=="Est Hours")?.text.split(","));
            this.rows[index].timeSpentTillDate = this.sum(this.rows[index].selectedItem?.column_values?.find((x:any)=>x.title=="Actual Hours")?.text.split(","));
            this.rows[index].activityType = this.rows[index].selectedItem?.column_values?.find((x:any)=>x.title=="Activity")?.text;
            this.rows[index].actualActivityType = this.rows[index].activityType;
            if(this.rows[index].activityType?.includes("Installation to Start") || this.rows[index].activityType?.includes("Installation WIP")){
              this.rows[index].statusCheckBox = "Installation Completed";
              this.rows[index].showMarkCompletedCol = true;
            }
  
            if(this.rows[index].activityType?.includes("Removal to Start") || this.rows[index].activityType?.includes("Removal WIP")){
              this.rows[index].statusCheckBox = "Removal Completed";
              this.rows[index].showMarkCompletedCol = true;
            }

            this.isLoadingTask = false;
          });

          // this.row.taskStatus = this.row.selectedItem?.column_values?.find((x:any)=>x.title=="Status")?.text;
     }

     onCrewSelect(val : any){
      this.crewMap.get(this.timesheet.selectedCrew);
     }

     onModelClose(event: any){
      this.isModalOpen = false;
      if(this.rows[this.rowIndex] != undefined)
      this.rows[this.rowIndex].labours = event.list?.filter((x:any)=>{ if(x.isSelected) return Object.assign({},x)});
      // this.rows[index].labours = this.crewMap.get(this.timesheet.selectedCrew)?.filter((x:any)=>{ if(x.isSelected) return Object.assign({},x)});
      
      if(this.rows[this.rowIndex].manHoursSpent > 0)
           this.onHoursSpentChange()
     }

     addRow(){
      this.row = {
        project : null,
        itemGroupMap : new Map(),
        selectedProjectId :  null,
        selectedItem : null, 
        selectGroup : null,
        taskStatus : null,
        estimatedTime : null,
        timeSpentTillDate : null,
        activityType : null,
        comment : null,
        manHoursSpent : null,
        labours : [],
        materialDetails : [],
        activityArray : [],
    statusCheckBox : '',
    isStatusCheckBox : false,
    showMarkCompletedCol : false,
    items: <any[]>[],
    isMaterialFilled : false,
    actualActivityType : null,
    isComment : true,
      isManhourSpent : true,
      isLabours : true,
      groups : [],
      selectedImage : null,
      selectedImageBinary : null,
      date : formatDate(new Date,'yyyy-MM-dd','en-US')
      }

      this.rows.push((Object.assign({},this.row)));
     }

     onHoursSpentChange(){
      this.timesheet.empAndTime = new Map();
      this.rows.forEach(r=>{
        if(r.manHoursSpent > -1){
        r.labours?.forEach((e:any)=>{

          let time = r.manHoursSpent/r.labours.length;

        time = parseFloat(parseFloat(time.toString()).toFixed(2));
          if(this.timesheet.empAndTime.get(e.empObject.name)){
            time = time + this.timesheet.empAndTime.get(e.empObject.name)!;
            this.timesheet.empAndTime.set(e.empObject.name,time);
          }else{
            this.timesheet.empAndTime.set(e.empObject.name,time);
          }
        });
      }else{
        alert("Man Hour Spent Should Be Positive Number");
        r.manHoursSpent = 0;
      }
      });

      this.timesheet.totalHoursSpent = 0;
      let totalnetShift = this.timesheet.netShiftHours;
      this.diffInShiftHours = 0;
      this.timesheet.rows.forEach(x=>{
        this.timesheet.totalHoursSpent = this.timesheet.totalHoursSpent+x.manHoursSpent; 
      });

      this.laboursArray = Array.from(this.timesheet.empAndTime.keys());

        this.totalShiftHours = 0;

        totalnetShift = this.laboursArray.length * totalnetShift;

        this.diffInShiftHours =  (this.timesheet.totalHoursSpent*60) - totalnetShift;

        console.log(this.diffInShiftHours);

        let time  = parseInt((totalnetShift/60).toString());

        time = parseFloat((time +'.'+(totalnetShift%60)));

        this.totalShiftHours = time;

        this.totalShiftHours = parseFloat(parseFloat(this.totalShiftHours.toString()).toFixed(2));

        if(this.diffInShiftHours < 0.0){
          time  = parseInt((Math.abs(this.diffInShiftHours)/60).toString());
        time = parseFloat((time +'.'+(Math.abs(this.diffInShiftHours)%60)));
        time = -1 * time;
        }else{
        time  = parseInt((this.diffInShiftHours/60).toString());
        time = parseFloat((time +'.'+(this.diffInShiftHours%60)));
        }

        this.diffInShiftHours = time;

        // if(this.timesheet.netShiftHours>(this.timesheet.totalHoursSpent*60)){
        //   this.diffInShiftHours = -1*time;
        // }

        this.diffInShiftHours = parseFloat(parseFloat(this.diffInShiftHours.toString()).toFixed(2));
        console.log(this.diffInShiftHours);
    }

     materialModelAction(val:any,index:any){
      this.rows[index].materialDetails = val;
      this.openMaterialModal = '';
      this.rows[index].materialDetails.forEach((x:any)=>{
        console.log(x);
        if(x.todaysRemoved > -1 && x.todaysRemoved != null || x.todayHoursSpent>-1 && x.todayHoursSpent!=null){
          this.rows[index].isMaterialFilled = true;
        }else{
          this.rows[index].isMaterialFilled = false;
        }
        
      });
      
     }

     onTimeSpent(val:any,i:number){
        this.rows[i].manHoursSpent = parseInt(val);;
     }

     onTimeChange(val:any,inputLabel : any){
      this.timesheet.netShiftHours = 0;
      if(inputLabel == 'CheckOut'){
        this.timesheet.checkOutTime = val;
      }
      else if(inputLabel == 'CheckIn'){
        this.timesheet.checkInTime = val;
      }
      else{
        this.timesheet.breakDuration = val;
      }

      if(this.timesheet.checkOutTime != null && this.timesheet.checkInTime != null){
         let checkIn = parseInt(this.timesheet.checkInTime);
         let checkOut = parseInt(this.timesheet.checkOutTime);
         let breakDur = parseInt(this.timesheet.breakDuration??'0');

         let diff = 0;
         
         if(checkIn > checkOut){
            diff = ((24*60)-(checkIn - checkOut)-breakDur);
         }else{
          diff = (checkOut - checkIn)-breakDur;
         }

        // diff = (checkOut - checkIn)-breakDur;
        console.log(diff);
         this.timesheet.netShiftHours = diff;
        }

      this.onHoursSpentChange();
     }

     openModal(num:number){
      this.rowIndex = num;
      if(this.rows[num].labours?.length < 1){
        let resetlist = this.crewMap.get(this.crewType)?.map((x:any)=>{ x.isSelected=false; return Object.assign({},x)});
        if(resetlist != undefined)
          this.crewMap.set(this.crewType,resetlist);
      }else{
        this.crewMap.set(this.crewType,this.rows[num].labours);
      }  
      this.isModalOpen = true;
     }

     onSubmit(){
      this.error = false;
      let errorText = "Please fill out mendatory fields";
      this.rows.forEach(x=>{
        if(x.comment == null){
          this.error = true;
        }
        if(x.manHoursSpent == null){
          this.error = true;
        }
        if(x.labours.length < 1){
          this.error = true;
        }
        if(!x.isMaterialFilled){
          this.error = true;
        }
      });
      if(this.timesheet.checkInTime == null || this.timesheet.date == null 
        || this.timesheet.checkOutTime == null||this.timesheet.selectedCrew == '' 
        || this.timesheet.breakDuration == null ){

        this.error = true;
      }

      if(!this.error){
        if(this.diffInShiftHours != 0.0){
          Swal.fire({
            title: 'Error',
            text: "Total Reported Hours Is Less than Total Shift Hours",
            icon: 'error',
            confirmButtonText: 'Done'
          });
        }else{
      this.timesheet.rows = this.rows;
      this.timesheet.checkInTime = this.timeToString(parseInt(this.timesheet.checkInTime??''));
      this.timesheet.checkOutTime = this.timeToString(parseInt(this.timesheet.checkOutTime??''));


      // this.timesheetService.prepareForPost(this.timesheet);
      this.timesheetService.PostForActivity(this.timesheet);
      this.timesheetService.PostForActivityUpdate(this.timesheet);
      this.timesheetService.PostForMaterial(this.timesheet);
      this.timesheetService.uploadImage(this.timesheet);
      this.timesheetService.makeCall();

      this.googleSheetService.makeCall(this.timesheet);
      this.rows = [];
      this.timesheet = {
        selectedCrew : '',
        date: null,
        checkInTime : null,
        checkOutTime : null,
        breakDuration : null,
        netShiftHours : 1,
        totalHoursSpent : 0,
        empAndTime : new Map<string,number>(),
        rows : [],
        userName : this.userName,
      };

      this.addRow();
    }
    }else{
      Swal.fire({
        title: 'Error',
        text: errorText,
        icon: 'error',
        confirmButtonText: 'Done'
      });
    }
     }

     sum(val : string[]){
      let total = 0;
      val.forEach(x=>{
        total = total + parseInt(x);
      });
      return total;
     }

     deleteRow(){
      if(this.rows.length > 1)
      this.rows.splice(this.rows.length-1,1);
    this.onHoursSpentChange();
     }

     timeToString(time : number){
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      let timeInString : any = '';

     if(minutes < 10)
     timeInString =  hours +":0"+minutes;
   else
   timeInString=  hours +":"+minutes;

      return timeInString;
   }

   duplicateRow(val : number){
    this.rows.push(Object.assign({},this.rows[val]));
    this.onHoursSpentChange();
   }

   copyLabours(val : number){
    if(this.rows.length > val)
     this.rows[val].labours = Array.from(this.rows[val-1].labours);
   }

   cssClassDecider(val : any){
        if(val.includes("Crew Member") || val == "Material Count" || val == "Comments" || val == "Man Hours Spent"){
          return true;
        }
        return false;
   }

   isRowLoading(i:number){
    if(this.rows[i].project == null){
        return true;
   }else if(this.rows[i].selectedItem == null){
      return true;
   }else{
    return false;
   }
  }

  onImageSelected(event: Event,i : number) {
    const fileInput = event.target as HTMLInputElement;
    this.rows[i].selectedImage = fileInput.files![0];
  }
  }
