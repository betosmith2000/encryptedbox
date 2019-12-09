import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import {  faAd } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  readOptions : any = {decrypt: false};

  isSignIn : boolean = false;
  userName :string  = 'User name';
  userSession :any;
  
  constructor(private route: Router){

  }
  ngOnInit(): void {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    if (this.userSession.isSignInPending()) {
      this.userSession.handlePendingSignIn()
      .then(userData => {
        //const profile = userData.profile;

        this.setUp(userData)
      })
    } 
    else  if (this.userSession.isUserSignedIn()) {

      const userData = this.userSession.loadUserData();
      this.setUp(userData);
     } 
    
    // this.themeConfig();


  }

  setUp(userData:any){
    this.isSignIn = true;
    this.userName = userData.username;
    this.route.navigate(['all']);
  }


  signIn():void{
    this.userSession.redirectToSignIn();
    if (this.userSession.isSignInPending()) {
        this.userSession.handlePendingSignIn()
        .then(userData => {
          const profile = userData.profile;
          debugger
          this.setUp(userData)
        })
    }
  }

  signOut():void{
    this.userSession.signUserOut(window.location.origin);
  }

}
