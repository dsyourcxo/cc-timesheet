import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-multi-select-modal',
  templateUrl: './multi-select-modal.component.html',
  styleUrls: ['./multi-select-modal.component.scss']
})
export class MultiSelectModalComponent implements OnInit {

  @Input()
  list : any = [];

  @Output() onClosed: any = new EventEmitter();

  val1 : any;

  listArray : any[] = [];

  constructor() { 
  }

  ngOnInit(): void {
  }

  addEl(el:any, index : number){
    if(el.isSelected){
      this.listArray.push(el);
    }else{
      this.listArray.splice(index);
    }
  }

  onCancel(){
      const clo = {
        list: this.list,
        reason:"closed"
      }
      this.onClosed.emit(clo);
  }

  onDone(){
    const clo = {
      list: this.list,
      reason:"done"
    }
    this.onClosed.emit(clo);
}
}
