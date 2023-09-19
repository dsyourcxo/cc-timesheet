import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { time } from 'console';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsServiceService {

  private readonly apiKey = 'YOUR_API_KEY';
  private readonly spreadsheetId = '1vy4ASlXc5onreOqVWfzywkFETZhETrnEJSiJYm4eGJ0';
  private url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Time_Sheet!A2:K:append?valueInputOption=USER_ENTERED`;
  private url2 = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Material_Consumption!A2:G:append?valueInputOption=USER_ENTERED`;
  private url3 = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Timesheet_files!A2:D:append?valueInputOption=USER_ENTERED`;
  private authToken: any = '';

  private httpOptions : any = null;


  constructor(private http: HttpClient) {
    let body = {
      grant_type: 'refresh_token',
      client_id: '974479645657-n6ek4oik4n2b5ngjvkecs3tsl1eaed9h.apps.googleusercontent.com',
      client_secret: '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',
      refresh_token: '1//0gwP9bqkBYn0nCgYIARAAGBASNwF-L9IrPFNyslQMqtd4XRCBSP8VyINLnc5ws40Sbvh8seChdlSk0zk9BkjETBvhVlxLCUMSHL8',
      redirect_uri: 'http://timesheet.christmascompany.com',
      //   range: "Sheet1!A2:G",
      // majorDimension: "ROWS",
      //   values: valueArray
    }

    const authUrl = 'https://www.googleapis.com/oauth2/v4/token';


    this.http.post(authUrl, body).subscribe((x: any) => {
      this.authToken = x.access_token;
      localStorage.setItem("token_google",x.access_token);
      
    });

  }
  

  async sendDataToSheet(timesheet: any): Promise<void> {

    let array = [];
    
    let materialArray : any[] = [];
   let materialValueArray : any[][] = [];
  
   let valueArray: any[][] = [];

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      'Authorization': "Bearer "+ localStorage.getItem('token_google')
      })
    };

    await timesheet.rows.forEach((row: any) => {

      row.materialDetails.forEach((m:any)=>{
        if(isNaN(m.actual)){
          m.actual = 0;
        }
        if(isNaN(m.removed)){
          m.removed = 0;
        }

        materialArray=[row.project.name,timesheet.date,row.selectedItem.name,timesheet.selectedCrew,m.material.name,m.todayHoursSpent,m.todaysRemoved];
        materialValueArray.push(materialArray);
      });
  
      // {"Project Name" :"`+ row.project.name+`",`+
      row.labours.forEach((labName: any) => {
        if (row.isStatusCheckBox) {
          row.activityType = row.statusCheckBox;
        }

        array = [row.project.name, timesheet.selectedCrew, labName.empObject.name
          , row.selectedItem.name, row.activityType, timesheet.date, timesheet.checkInTime, timesheet.checkOutTime, timesheet.empAndTime.get(labName.empObject.name)
          ,row.comment,localStorage.getItem("user")];

        valueArray.push(array);
      });

     

      let body1 = {
        range: "Time_Sheet!A2:K",
        majorDimension: "ROWS",
        values: valueArray
      }

      let body2 = {
        range: "Material_Consumption!A2:G",
        majorDimension: "ROWS",
        values: materialValueArray
      }

      this.http.post(this.url, body1, httpOptions).subscribe((y: any) => {});
      this.http.post(this.url2, body2, httpOptions).subscribe((y: any) => {});
    });
  }

   public makeCall(timesheet: any){
    this.sendDataToSheet(timesheet);
  }

  
  public uploadFile(file: File,timesheet : any) {
    const headers = new HttpHeaders({
      "Authorization": `Bearer `+localStorage.getItem('token_google'),
      "Access-Control-Allow-Origin": "*"
    });

    if(file != undefined && file != null ){

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: ['1V70v6xknjtCAEqo0Vwb3UbB_Dry0SU9W']
    };

    let fileArray = [[formatDate(new Date,'yyyy-MM-dd','en-US'),localStorage.getItem("user"),timesheet.selectedImage.name,'https://drive.google.com/drive/folders/1V70v6xknjtCAEqo0Vwb3UbB_Dry0SU9W']];

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    this.http.post<any>('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData, { headers }).subscribe(
      (response) => {
        console.log('File uploaded:', response);
      },
      (error) => {
        console.error('File upload error:', error);
      }
    );

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      'Authorization': "Bearer "+ localStorage.getItem('token_google')
      })
    };

    
    let body3 = {
      range: "Timesheet_files!A2:D",
      majorDimension: "ROWS",
      values: fileArray
    }

    this.http.post(this.url3, body3, httpOptions).subscribe((y: any) => {});
  }
}
}
