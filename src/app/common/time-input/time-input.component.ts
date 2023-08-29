import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {

 hour : string = '00';

 @Output()
 totalTime : EventEmitter<string> = new EventEmitter();

 min : string = '00';

 @Input()
 isMaridianTime = false;

 @Input()
 hourLength = 24;

 minLength = 60;

 hourArray : string[] = [];
 minArray : string[] = [];


 meridian = 'AM';

  constructor() { }

  ngOnInit(): void {

    for(let i=0;i<this.hourLength;i++){
      let num='';
      if(i<10){
        num = "0"+i;
      }else{
      num = ""+i;
      }
        this.hourArray.push(num);
    }

    if(!this.isMaridianTime){
      this.minLength = this.minLength +61;
      for(let i=0;i<this.minLength;){
        let num='';
        if(i<10){
          num = "0"+i;
        }else{
        num = ""+i;
        }
          this.minArray.push(num);
          i=i+30;
      }
    }else{
      for(let i=0;i<this.minLength;){
        let num='';
        if(i<10){
          num = "0"+i;
        }else{
        num = ""+i;
        }
          this.minArray.push(num);
          i=i+15;
      }
    }

      
  }

  onTimeChange(){
    let hrInNum = 0;
    // if(this.meridian == 'PM'){
    //   hrInNum = parseInt(this.hour) + 12;
    // }else{
    //   hrInNum = parseInt(this.hour);
    // }

    hrInNum = parseInt(this.hour);
    let totalMin = hrInNum * 60;
    
    totalMin = totalMin + parseInt(this.min);
    this.totalTime.emit(totalMin.toString());
  }
}

