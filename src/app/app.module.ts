import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule} from '@angular/common/http';
import { NavbarComponent } from './common/navbar/navbar.component';
import { MaterialConsumedUpdateComponent } from './MaterialConsumed/material-consumed-update/material-consumed-update.component';
import { TimesheetUpdateComponent } from './timesheet/timesheet-update/timesheet-update.component';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './common/loader/loader.component';
import { DropdownComponent } from './common/components/dropdown/dropdown.component';
import { TimesheetRowComponent } from './timesheet/timesheet-row/timesheet-row.component';
import { MultiSelectModalComponent } from './common/components/multi-select-modal/multi-select-modal.component';
import { NotificationsComponent } from './common/notifications/notifications.component';
import { TimeInputComponent } from './common/time-input/time-input.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MaterialConsumedUpdateComponent,
    TimesheetUpdateComponent,
    LoaderComponent,
    DropdownComponent,
    TimesheetRowComponent,
    MultiSelectModalComponent,
    NotificationsComponent,
    TimeInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
