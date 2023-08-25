import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalData } from 'src/app/common/models/board';
import { User } from 'src/app/common/models/user';

@Component({
  selector: 'app-material-consumed-update',
  templateUrl: './material-consumed-update.component.html',
  styleUrls: ['./material-consumed-update.component.scss']
})

export class MaterialConsumedUpdateComponent implements OnInit {

  @Input() 
  data : any =null;

  @Input() 
  activityType : String = '';

  @Output()
  material : EventEmitter<any> = new EventEmitter();

  showRemovalTable: boolean = false;

  constructor() {
    
   }

  ngOnInit(): void {
    if(this.activityType?.includes("Removal")){
      this.showRemovalTable = true;
    }else{
      this.showRemovalTable = false;
    }
  }

  onMaterialDone(){
    this.material.emit(this.data);
  }

  onMaterialCancel(){
    this.material.emit(this.data);
  }

  validate(i : number){
    if(this.data[i].todayHoursSpent < 0){
      alert("spent Qty should be greater than 0");
      this.data[i].todayHoursSpent = 0;
    }
    }
}
