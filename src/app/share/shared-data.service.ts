import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ApiService } from './api.service';
import { ShareModel } from './Models/share.model';
import { ConfirmationService, ResolveEmit } from '@jaspero/ng-confirmations';
import { ToastrService } from 'ngx-toastr';

declare var $: any;


@Injectable({
    providedIn: 'root',
  })
  export class SharedDataService {

    
    userSession :any;
    userName :string  = 'User name';
    readOptions : any = {decrypt: false, username: null};
    writeOptions : any = {encrypt:false};

    sharedPasswordsContents:Array<ShareModel>;
    sharedNotesContents:Array<ShareModel>;

    private isSharedContentLoaded: boolean=false;


    constructor(private ngxService: NgxUiLoaderService,  private _confirmation: ConfirmationService,
        private toastr: ToastrService, private api: ApiService){

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
                this.sharedPasswordsContents =res.data.filter(e=> e.type==1);
                this.sharedNotesContents =res.data.filter(e=> e.type==2);

                this.ngxService.stop();        
                this.sharedPasswordsContents.forEach(e=>{
                  this.loadSharedContent(e);

                });
                this.sharedNotesContents.forEach(e=>{
                  this.loadSharedContent(e);

                });
            }, error =>{
                console.log('Error getting shared content');
                this.ngxService.stop();
        
            });
        }
    }

    deleteSharedContent(p: ShareModel){

      this._confirmation.create('Are you sure to delete \'' + p.name +'\' content?')
      .subscribe((ans: ResolveEmit) => {
          if (ans.resolved) {

            this.ngxService.start();
            this.api.delete(p.id)
            .subscribe(res=>{
              if(p.type==1){
                let idx = this.sharedPasswordsContents.findIndex(e=> e.id == p.id);
                this.sharedPasswordsContents.splice(idx,1);
              }
              else if(p.type==2){
                let idx = this.sharedNotesContents.findIndex(e=> e.id == p.id);
                this.sharedNotesContents.splice(idx,1);
              }
              this.ngxService.stop();
      
            }, error =>{
                console.log('Error deleting shared content');
                this.ngxService.stop();
              });
          }
      });
      setTimeout(() => {
          $(".jaspero__confirmation_dialog").css("position","fixed")    
      }, 10);
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