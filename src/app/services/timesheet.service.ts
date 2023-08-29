import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, find, of, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { GoogleSheetsServiceService } from './google-sheets-service.service';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  httpOptions : any = null;

  public apiCallArray : Observable<Object>[] = [];
  public isloader = new BehaviorSubject<boolean>(true);
  apiTokenKey: string = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI3NzA2MjA5OSwiYWFpIjoxMSwidWlkIjo0NzczNTI2OCwiaWFkIjoiMjAyMy0wOC0yM1QxOTo1MDoyMC4xODFaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTYxODIyNzEsInJnbiI6InVzZTEifQ.P6wvQZ_6eDt1El1QWiNsjVzxR08EFYla3cHxowfSZTs";
  constructor(private http: HttpClient,private googleService: GoogleSheetsServiceService) { 
    localStorage.setItem("token",this.apiTokenKey);
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.apiTokenKey,
      })
    };
    
  }

  public crewBoardApi(){
    let query1 = "{ boards (ids: 5020092650) { name id description board_folder_id items { name id column_values { title id type text} } } }";
    let body2 = JSON.stringify({
      'query' : query1
    });
    return this.http.post('https://api.monday.com/v2',body2 , this.httpOptions);
  }

  public ProjectBoardApi(){
  
    let query3 = "query { folders (ids: 11988014) { name id children { id name }}}";
        // let query1 = "{ boards (ids:4951609072) { name id description board_folder_id items (limit:1){ name id column_values { title id type text} subitems { id name column_values { title id } } } } }";
        let body1 = JSON.stringify({
          'query' : query3
        });
  
        return this.http.post('https://api.monday.com/v2',body1 , this.httpOptions)    
  }

  public TaskItemApi(itemId : any){
  
    let query1 = "{ items (ids:"+itemId+") {  name id column_values { title id type text} subitems { id name column_values { title id text} board{id}} } }";
    let body = JSON.stringify({
      'query' : query1
    });

    return this.http.post('https://api.monday.com/v2',body , this.httpOptions) 
  }

public PostForMaterial(timesheet: any) {
    timesheet.rows.forEach((row: any) => {
      row.materialDetails.forEach((m:any)=>{
        if(isNaN(m.actual)){
          m.actual = 0;
        }
        if(isNaN(m.removed)){
          m.removed = 0;
        }
        let totalSpent = m.actual + m.todayHoursSpent;
        let totalRemovedQty = m.removed + m.todaysRemoved;
        totalSpent = totalSpent==0?'':totalSpent;
        totalRemovedQty = totalRemovedQty==0?'':totalRemovedQty;
        let query = "mutation{change_multiple_column_values(item_id: "+m.material.id+" , board_id: "+m.material.board.id+", column_values:\"{\\\"numbers_1\\\": \\\""+totalSpent+"\\\",\\\"numbers4\\\": \\\""+totalRemovedQty+"\\\"}\") { id }}";
        let body1 = JSON.stringify({
          'query': query
        });
        this.apiCallArray.push(this.http.post('https://api.monday.com/v2', body1, this.httpOptions));
        });
      });
  }

  public PostForActivity(timesheet: any) {
  timesheet.rows.forEach((row: any) => {
      row.activityArray.forEach((act:any)=>{
        if(row.activityType.includes(act.name)){
          let actualTimeInString = act.column_values.find((x:any)=>x.id == "numbers_12").text==''?'0' 
          :act.column_values.find((x:any)=>x.id == "numbers_12").text;

          let actualTime = parseInt(actualTimeInString);
          let totalSpent = actualTime + row.manHoursSpent;
          totalSpent = totalSpent==0?'':totalSpent;
          let query = "mutation{change_multiple_column_values(item_id: "+act.id+" , board_id: "+act.board.id+", column_values:\"{\\\"numbers_12\\\": \\\""+totalSpent+"\\\"}\") { id }}";
          console.log(query);
          let body1 = JSON.stringify({
            'query': query
          });
          
        this.apiCallArray.push(this.http.post('https://api.monday.com/v2', body1, this.httpOptions));
        }
    });
  });
      
  }

  public PostForActivityUpdate(timesheet: any) {
     timesheet.rows.forEach((row: any) => {
      if(row.isStatusCheckBox){
        row.activityType = row.statusCheckBox;
      }
          let query = "mutation{change_multiple_column_values(item_id: "+row.selectedItem.id+" , board_id: "+row.project.id+", column_values:\"{\\\"status3\\\": \\\""+row.activityType+"\\\"}\") { id }}";
          let body1 = JSON.stringify({
            'query': query
          });
          this.apiCallArray.push(this.http.post('https://api.monday.com/v2', body1, this.httpOptions));
    });
  }

  // public prepareForPost(timesheet: any) {

  //   let timeSheetMapArray: string[] = [];
  //   timesheet.rows.forEach((row: any) => {
  //     // {"Project Name" :"`+ row.project.name+`",`+
  //     row.labours.forEach((labName: any) => {
  //       if(row.isStatusCheckBox){
  //         row.activityType = row.statusCheckBox;
  //       }
  //       let quearyString = `item_name: "`+ row.project.name+`", column_values:`+
  //       `"{\\"text\\" : \\"`+row.selectedItem.name+`\\",`+
  //       `\\"activity_type\\" :\\"`+row.activityType+`\\",`+
  //       `\\"crew_name\\":\\"`+ timesheet.selectedCrew+`\\",`+
  //       `\\"text7\\":\\"`+ labName.empObject.name+`\\",`+
  //       `\\"text2\\":\\"`+ timesheet.empAndTime.get(labName.empObject.name) +`\\",`+
  //       `\\"text_1\\":\\"`+ row.comment+`\\",`+
  //       `\\"text87\\":\\"`+ timesheet.userName+`\\",`+
  //       `\\"date\\":\\"`+ timesheet.date+`\\",`+
  //       `\\"check_out_time1\\":\\"`+ timesheet.checkOutTime+`\\",`+
  //       `\\"check_in_time4\\":\\"`+ timesheet.checkInTime+`\\"}"){id}}`;
  //       let query = `mutation { create_item (board_id: 4971609612,`+quearyString;

  //   let body = JSON.stringify({
  //     'query': query
  //   });
  //      this.apiCallArray.push(this.http.post('https://api.monday.com/v2', body, this.httpOptions));
         
  //     });
  //   });
  //     return timeSheetMapArray;
  // }


// this.preparePostForMaterial(timesheet).forEach(element => {
 

// public postActivityUpdate(timesheet : any) {
//   let index = 0;

//   const this.httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization': localStorage.getItem("token") ?? ''
//     })
//   };

//   this.preparePostForActivityUpdate(timesheet).forEach(r=>{

//  let body1 = JSON.stringify({
//   'query': r
// });
// this.http.post('https://api.monday.com/v2', body1, this.httpOptions).subscribe((x: any) =>{});
// });
// }

// public postActivity(timesheet : any) {
//   let index = 0;
// console.log("inside post Activity");
//   const this.httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization': localStorage.getItem("token") ?? ''
//     })
//   };

//   this.preparePostForActivity(timesheet).then(x=>{x.forEach(r=>{
//     console.log("inside post loop");
//  let body1 = JSON.stringify({
//   'query': r
// });
// this.http.post('https://api.monday.com/v2', body1, this.httpOptions).subscribe((x: any) =>{});
// })
//   });
// }

public makeCall(){
  this.isloader.next(true);
  setTimeout(()=>{
    combineLatest(this.apiCallArray).subscribe(x=>{
      this.isloader.next(false);
            Swal.fire({
              title: 'Success',
              text: 'Timesheet Saved Successfully',
              icon: 'success',
              confirmButtonText: 'Done'
            });
    });
  },2000);
    
}

  // public postTimeSheet(timesheet : any) {
  //   this.isloader.next(true);
  //   let index = 0;

  //   let readyForPostArray = this.prepareForPost(timesheet);
  //   readyForPostArray.forEach(r=>{
  //  let query = `mutation { create_item (board_id: 4971609612,`+r;

  //   let body = JSON.stringify({
  //     'query': query
  //   });
  //      this.http.post('https://api.monday.com/v2', body, this.httpOptions).subscribe((x: any) => {
  //       index++;
  //         if(readyForPostArray.length == index){
  //           Swal.fire({
  //             title: 'Success',
  //             text: 'Timesheet Saved Successfully',
  //             icon: 'success',
  //             confirmButtonText: 'Done'
  //           });
  //           this.isloader.next(false);
  //         }
  //   });
  // });
  // }

  }
    
      // const uploadData = new FormData();

      // uploadData.append('query', data);
      // uploadData.append('map', `{"image":"variables.file"}`);
      // uploadData.append('file', row.selectedImage, data1);

      // this.httpOptions = {
      //   headers: new HttpHeaders({
      //     'Authorization': this.apiTokenKey,
      //     "Content-Type" : "multipart/form-data; boundary="+boundary,
          // "Content-Disposition": "form-data"
          // "Access-Control-Allow-Origin":"*"
      //   })
      // };
  // 
//        this.http.post('https://api.monday.com/v2/file', payload, this.httpOptions).subscribe();
        
//   });
// });
//   }

  // readFileContent(file:any) {
  //   if (!file) {
  //     return;
  //   }

   
  // }
