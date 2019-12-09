import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
//import { NgxUiLoaderModule, NgxUiLoaderConfig, POSITION } from 'ngx-ui-loader';



@NgModule({

  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
//    NgxUiLoaderModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
//    NgxUiLoaderModule,
  ]
})
export class ShareModule { }
