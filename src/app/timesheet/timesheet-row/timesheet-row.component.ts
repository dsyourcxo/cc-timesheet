import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ModalData } from 'src/app/common/models/board';

@Component({
  selector: 'app-timesheet-row',
  templateUrl: './timesheet-row.component.html',
  styleUrls: ['./timesheet-row.component.scss']
})
export class TimesheetRowComponent implements OnInit {

  @Input()
  rows : any[] = [];

  isLoading : boolean = true;

  confirmRows : any[] = [];

  row : any = {
    selectedProjectId : '',
    selectedTask : null
  };

  data: ModalData | undefined;
  items: any;


  constructor(private http : HttpClient) {
    // console.log(this.projects);
   }

  ngOnInit(): void {

    this.rows.forEach(x=>{

    });
  }

 

}

//   selectedProject(){
//     this.isLoading = true;
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'Authorization' : localStorage.getItem(\\"token\\")??''
//        })
//     };
  
//         let query1 = \\"{ boards (ids:\\"+this.row.selectedProjectId+\\") { name id description board_folder_id items (limit:30){ name id column_values { title id type text} subitems { id name column_values { title id } } } } }\\";
//         let body = JSON.stringify({
//           'query' : query1
//         });
//         this.http.post('https://api.monday.com/v2',body , httpOptions).subscribe((x : any)=>{
//           this.data = x as ModalData;
//           if(this.data?.data?.boards && this.data.data?.boards[0].items){
//                 this.items = this.data.data?.boards[0].items;
//                 this.isLoading = false;
//           }
//         });
//      }

//      selectedTask(){
//       this.timesheetColunms.push({
//         title : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"status\\").title,
//         val : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"status\\")?.text
//       });
//       this.timesheetColunms.push({
//         title : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"Estimated Time\\").title,
//         val : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"Estimated Time\\")?.text
//       });
//       this.timesheetColunms.push({
//         title : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"Time Spent Till Date\\").title,
//         val : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"Time Spent Till Date\\")?.text
//       });
//       this.timesheetColunms.push({
//         title : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"status\\").title,
//         val : this.row.selectedItem?.column_values?.find((x:any)=>x.title==\\"status\\")?.text
//       });
//       // const httpOptions = {
//       //   headers: new HttpHeaders({
//       //     'Content-Type': 'application/json',
//       //     'Authorization' : localStorage.getItem(\\"token\\")??''
//       //    })
//       // };
    
//       //     let query1 = \\"{ boards (ids:\\"+this.row.selectedProjectId+\\") { name id description board_folder_id items (limit:30){ name id column_values { title id type text} subitems { id name column_values { title id } } } } }\\";
//       //     let body = JSON.stringify({
//       //       'query' : query1
//       //     });
//       //     this.http.post('https://api.monday.com/v2',body , httpOptions).subscribe((x : any)=>{
//       //       this.data = x as ModalData;
//       //       if(this.data?.data?.boards && this.data.data?.boards[0].items){
//       //             this.items = this.data.data?.boards[0].items;
//       //       }
//       //     });
//        }
// }
