import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ApiService } from './api.service';
import { ShareModel } from './Models/share.model';



@Injectable({
    providedIn: 'root',
  })
  export class SharedDataService {

    
    userSession :any;
    userName :string  = 'User name';
    readOptions : any = {decrypt: false, username: null};
    writeOptions : any = {encrypt:false};

    sharedContents:Array<ShareModel>;

    private isSharedContentLoaded: boolean=false;


    constructor(private ngxService: NgxUiLoaderService, 
        private api: ApiService){

        const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
        this.userSession = new blockstack.UserSession({appConfig:appConfig});
        if (this.userSession.isSignInPending()) {
            this.userSession.handlePendingSignIn()
            .then(userData => {
              this.userName = userData.userName;
            })
          } 
          else  if (this.userSession.isUserSignedIn()) {
            const userData = this.userSession.loadUserData();
            this.userName = userData.username;
           } 
  
    }


    getSharedContent(){

        if(!this.isSharedContentLoaded){
            this.ngxService.start();        
            this.api.setApi("share");
            this.api.getAll<any>("target=" + this.userName) 
            .subscribe(res => {
                this.isSharedContentLoaded= true;
                this.sharedContents =res.data;
                this.ngxService.stop();        
                this.sharedContents.forEach(e=>{
                  this.loadSharedContent(e);

                });
            }, error =>{
                console.log('Error getting shared content');
                this.ngxService.stop();
        
            });
        }
    }

    loadSharedContent(p: ShareModel){
      this.readOptions.username = p.source;
      //this.ngxService.start();        

      this.userSession.getFile(p.fileName, this.readOptions )
        .then( fileContent =>{
          if(fileContent!=null){
            var decrypted = this.userSession.decryptContent(fileContent);
            p.content = JSON.parse(decrypted);
          }
          //this.ngxService.stop();        
        })
        .catch((error)=>{
          console.log('Error reading file!');
          //this.ngxService.stop();        
        });

    }

  }