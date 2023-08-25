import { query } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
// import mondaySdk from "monday-sdk-js";
import { title } from 'process';
import { User } from './common/models/user';
import { ModalData } from './common/models/board';
import { TimesheetService } from './services/timesheet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{


  public userName = '';
  apiTokenKey : string | null = null;

  // monday = mondaySdk();
  user : User | null = null;
  isAuthTokenAvailable : boolean = false;
  isLoading : boolean = false;
  data : ModalData | null= null;
  crewManagers : any[]=[];
  

  selectedTab : string = "";
  isUserPresent: boolean = false;

  
  ngOnInit(): void {  
    this.isLoading = true;
    
}
  constructor(private http: HttpClient,private timesheetService : TimesheetService){
   
 this.timesheetService.crewBoardApi().subscribe((x : any)=>{
      this.data = x as ModalData;
      
      if(this.data.data?.boards && this.data.data?.boards[0].items){
          this.data.data?.boards[0].items.forEach(item=>{item.column_values?.forEach(x=>{
            
            if(x.title == "Position"){
              if(x.text == 'Crew Managers' || x.text == 'Virtual Operations Manager' || x.text == 'Admin'){
                this.crewManagers.push(item.name);
              }
            }
        });
          });
        }
        this.isLoading = false;
      });
  }
  
  title = 'tracking';


  saveToken(){
    this.isLoading = true;
    localStorage.setItem("token",this.apiTokenKey??'');
  }

  onUserNameChange(){
    if(this.userName == ''){
    this.isUserPresent = false;
    }
  else{
    this.isUserPresent = true;
  }
  }
  
}
