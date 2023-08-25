import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input()
  items : any[] = [];

  @Output()
  itemEvent = new EventEmitter<any>();

  selectedItem : any ;

  constructor() { }

  ngOnInit(): void {
  }

  selectedtask(){
    this.itemEvent.emit(this.selectedItem);
  }
}
