import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './component/loading/loading.component';
import { NgxLoadingModule } from 'ngx-loading';



@NgModule({
  declarations: [
    LoadingComponent
  ],
  imports: [
    CommonModule,
    NgxLoadingModule
  ],
  exports:[
    CommonModule,
    LoadingComponent
  ]
})
export class SharedModule { }
