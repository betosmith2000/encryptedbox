import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SiteGoHome } from './share/site-go-home';
import { NotesComponent } from './notes/notes.component';
import { PasswordsComponent } from './passwords/passwords.component';
import { ContactUsPageComponent } from './contact-us-page/contact-us-page.component';


const routes: Routes = [
  { path: "all", component:DashboardComponent},
  { path: "notes", component:NotesComponent},
  { path: "passwords", component:PasswordsComponent},
  { path: "contactus", component:ContactUsPageComponent },
  { path: "home", component:HomeComponent, canActivate:[SiteGoHome]},
  
  { path: "", component: HomeComponent, canActivate:[SiteGoHome]},
  { path: "*", component: HomeComponent, canActivate:[SiteGoHome]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    useHash:true,
    enableTracing:true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
