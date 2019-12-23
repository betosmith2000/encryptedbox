import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PasswordsComponent } from './passwords/passwords.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotesComponent } from './notes/notes.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ShareModule } from './share/share.module';
import { ToastrModule} from 'ngx-toastr';
import { NgxUiLoaderModule,  NgxUiLoaderConfig, SPINNER, POSITION, PB_DIRECTION, NgxUiLoaderHttpModule  } from 'ngx-ui-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ContactUsPageComponent } from './contact-us-page/contact-us-page.component';


const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  // bgsColor: 'red',
   bgsPosition: POSITION.bottomCenter,
   bgsSize: 40,
   bgsType: SPINNER.rectangleBounce, // background spinner type
   fgsType: SPINNER.cubeGrid, // foreground spinner type
   pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
   pbThickness: 3, // progress bar thickness
 };



@NgModule({
  declarations: [
    AppComponent,
    PasswordsComponent,
    HomeComponent,
    DashboardComponent,
    NotesComponent,
    ContactUsComponent,
    ContactUsPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FontAwesomeModule,
    ShareModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderHttpModule.forRoot({showForeground:true}),


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
