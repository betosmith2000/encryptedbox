import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { faBars, faSignOutAlt, faPassport, faStickyNote, faLayerGroup, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';


declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  faBars = faBars;
  allIcon = faLayerGroup;
  passIcon = faPassport;
  notesIcon=faStickyNote ;
  signOutIcon=faSignOutAlt;
  contactUsIcon =faEnvelope;
  isOpenSideBar = true;

  writeOptions : any = {encrypt: false};


  public version : string = environment.VERSION;

  title = 'encrypted-box';
  
  readOptions : any = {decrypt: false};

  isSignIn : boolean = false;
  userName :string  = 'User name';
  userSession :any;
  
  constructor(private route: Router){

  }

  toggleMenu(){
    $("#wrapper").toggleClass("active");
    this.isOpenSideBar=!this.isOpenSideBar;
  }

  ngOnInit(): void {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
    $("#menu-toggle").click(function(e) {
      e.preventDefault();
    });


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
  }

  setUp(userData:any){
    this.isSignIn = true;
    this.userName = userData.username;
    this.route.navigate(['all']);
    this.savePK(this.getPublicKey());

  }


  signIn():void{
    this.userSession.redirectToSignIn();
    if (this.userSession.isSignInPending()) {
        this.userSession.handlePendingSignIn()
        .then(userData => {
          const profile = userData.profile;
          this.setUp(userData);
        })
    }
  }

  signOut():void{
    this.userSession.signUserOut(window.location.origin);
  }


  
  getPublicKey():string{
    const userData = this.userSession.loadUserData();
    
    var pk = userData.appPrivateKey;
    var privK = blockstack.hexStringToECPair(pk).publicKey.toString('hex')

    return privK;
  }

  savePK(pk:string){

    
  this.userSession.putFile("publickey.txt",pk , this.writeOptions)
  .then(() =>{
    console.log('saved pk!')
  }).catch((error) => {
    console.log('Error saving pk!')
    
});

  }

}
