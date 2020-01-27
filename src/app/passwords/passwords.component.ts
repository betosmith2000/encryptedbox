import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { faCopy, faEyeSlash, faEye, faTrash, faExternalLinkAlt, faKey, faCog, faFolderOpen, faStar, faMinusCircle, faShareAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { PasswordModel } from '../share/Models/password.model';
import { DataService } from '../share/data.service';
import { FolderPasswordModel } from '../share/Models/folder-password.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ApiService } from '../share/api.service';
import { ShareModel } from '../share/Models/share.model';
import * as passgenerator from 'generate-password-browser';
declare var $: any;

@Component({
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.scss']
})
export class PasswordsComponent implements OnInit {
  userSession :any;

  copyIcon = faCopy;
  viewPassIcon = faEye;
  deleteIcon= faTrash;
  linkIcon = faExternalLinkAlt;
  folderIcon= faFolderOpen;
  favIcon =faStar;
  removeFavIcon= faMinusCircle;
  shareIcon = faShareAlt;
  editIcon = faEdit;
  generateIcon = faKey;
  settingsIcon = faCog;
  userName :string  = 'User name';

  readOptions : any = {decrypt: false, username: null};
  writeOptions : any = {encrypt:false};


  fileForm :FormGroup;
  fileUrl:FormControl;
  fileUserName:FormControl;
  filePassword:FormControl;
  fileNotes:FormControl;
  editingPassword:PasswordModel;
  sharingPassword:PasswordModel;

  folderForm :FormGroup;
  folderName:FormControl;
  folderNotes:FormControl;
  editingFolder: FolderPasswordModel;



  allowNumbers:boolean= true ;
  allowSymbols:boolean= true ;
  allowUpercase:boolean= true ;
  passwordLength:number= 10;

  blockstackIdToShare : string;
  pkToShare:string ='';

  constructor(public dataService: DataService, private toastr: ToastrService,
    private ngxService: NgxUiLoaderService, private api: ApiService) {
    const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
    this.userSession = new blockstack.UserSession({appConfig:appConfig});
   }



  ngOnInit() {

    document.addEventListener("dragstart", function( event:any ) {

      event.target.style.backgroundColor  = "#47BFC1";
    }, false);
      document.addEventListener("dragend", function( event:any ) {

        event.target.style.backgroundColor  = "";
    }, false);

    document.addEventListener("drop", function( event :any ) {
     // event.preventDefault();
      event.target.style.color="";
      event.target.style.fontSize="";
      event.target.style.backgroundColor  = "";
    
    }, false);

    // document.addEventListener("dragenter", function( event:any ) {
    //   // highlight potential drop target when the draggable element enters it
    //   if ( event.target.className.indexOf("dropzone")>=0 ) {
    //       event.target.style.opacity = "1";
    //   }
    // }, false);

    // document.addEventListener("dragleave", function( event:any ) {
    //   // highlight potential drop target when the draggable element enters it
    //   if ( event.target.className.indexOf("dropzone")>=0 ) {
    //       event.target.style.opacity = ".5";
    //   }
    // }, false);


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



    this.initializeForm();
    this.dataService.getRootPasswords();
    this.dataService.onSavePassword.subscribe(
      function(res){
        if(res){
          $("#divFile").modal('hide');

        }
      }
    );

    this.dataService.onSaveFolder.subscribe(
      function(res){
        if(res){
          $("#divFolder").modal('hide');
        }
      }
    );
  }

  initializeForm(){
    this.fileUrl = new FormControl('', [Validators.required]);
    this.fileUserName = new FormControl('');
    this.filePassword = new FormControl('');
    this.fileNotes = new FormControl('');
    this.fileForm = new FormGroup({
      fileUrl:this.fileUrl,
      fileUserName:this.fileUserName,
      filePassword:this.filePassword,
      fileNotes:this.fileNotes
    });




    this.folderName = new FormControl('', [Validators.required]);
    this.folderNotes = new FormControl('');



    this.folderForm = new FormGroup({
      folderName: this.folderName,
      folderNotes:this.folderNotes
    });


  }

  newPassword(){
    $("#divGenerateSettings").hide();

    this.editingPassword = new PasswordModel();
  }
  savePassword(){
    let p = Object.assign({}, this.editingPassword, this.fileForm.value );
    this.dataService.addPassword(p, this.fileForm);
  }

  newFolder(){
    this.editingFolder = new FolderPasswordModel();
  }
  saveFolder(){
    let p = Object.assign({}, this.editingFolder,  this.folderForm.value);
    this.dataService.addFolder(p, this.folderForm);

  }

  copy(inputElement){
    inputElement.disabled=false;
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    inputElement.disabled=true;
    this.toastr.success("Copied!",'Success')
  }

  viewPassword(inputElement){
    if(inputElement.className.indexOf('input-password')>=0)
    {
      inputElement.className = inputElement.className.replace('input-password','');
      //this.viewPassIcon = faEye;
    }
    else{
      inputElement.className = inputElement.className + " input-password";
      //this.viewPassIcon = faEyeSlash;
    }

  }

  delete(p:PasswordModel){
    this.dataService.deletePassword(p);
  }

  deleteFolder(event:Event, p:FolderPasswordModel){
    event.stopPropagation();
    this.dataService.deleteFolder(p);

  }

  launchApp(p:PasswordModel){
    if(this.validURL(p.fileUrl))
      if(!(p.fileUrl.indexOf('http://')>=0))
      {
        var url = 'http://' + p.fileUrl;
        window.open(url,'_blank')
      }
      else{
        window.open(p.fileUrl,'_blank')
      }
  }

  folderEnter(p:FolderPasswordModel){
    this.dataService.setCurrentFolder(p);

  }

  navigateFolder(p:FolderPasswordModel){
    this.dataService.navigateToFolder(p);
  }


  validURL(str) {
    var pattern = new RegExp('^(https|http?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  addBookmark(p: PasswordModel){
    this.dataService.addBookmark(p);
  }


  isBookmark(p:PasswordModel){
    let idx = this.dataService.bookmarkPasswords.findIndex(e=> e.id == p.id);
    if(idx>=0)
      return true;
    else
      return false;

  }

  removeBookmark(p:PasswordModel){
    this.dataService.removeBookmark(p);
  }

  showEditPassword(p:PasswordModel){
    this.editingPassword=p;
    this.fileUrl.setValue(p.fileUrl);
    this.fileUserName.setValue(p.fileUserName);
    this.filePassword.setValue(p.filePassword);
    this.fileNotes.setValue(p.fileNotes);
    $("#divGenerateSettings").hide();

    $("#divFile").modal('show');

  }

  showEditFolder(event:Event, p:FolderPasswordModel){
    event.stopPropagation();
    this.editingFolder=p;
    this.folderName.setValue(p.folderName);
    this.folderNotes.setValue(p.folderNotes);
    $("#divFolder").modal('show');
  }

  showSharePassword(p:PasswordModel){
    this.blockstackIdToShare="";
    this.sharingPassword=p;
    $("#divSharePassword").modal('show');
  }


  seachPKBlockstackId(type:number){
    if(!this.blockstackIdToShare || this.blockstackIdToShare ==  ''){
        this.toastr.warning("You must indicate the Blockstack Id of the user.", "Public Key unknown");
        return;
    }
    this.ngxService.start();

    this.readOptions.username = this.blockstackIdToShare;
    this.readOptions.decrypt = false;
    this.userSession.getFile("publickey.txt", this.readOptions)
        .then(fileContent =>{
          if(fileContent!=null && fileContent != '')
          {
            this.pkToShare = fileContent;
            this.encryptPasswordContents(type);
          }
          else{
              this.toastr.warning("The Blockstack ID is not yet a user of this application, it is not possible to share the password.", "Public Key unknown");
          }
          this.ngxService.stop();
      })
      .catch((error)=>{
        this.toastr.warning("The public key of the indicated user was not found.", "Public Key unknown");
        console.log('Error loading public key');
        this.ngxService.stop();

      });



  }


  encryptPasswordContents(type:number){
    var fileName =this.sharingPassword.id + ".txt";

    var encryptedBS = this.userSession.encryptContent(JSON.stringify(this.sharingPassword), { publicKey:this.pkToShare});
    this.userSession.putFile(fileName, encryptedBS, this.writeOptions)
       .then(cipherTextUrl => {
         var share= new ShareModel();
         share.id = this.sharingPassword.id;
         share.source = this.userName;
         share.target = this.blockstackIdToShare;
         share.fileName = fileName;
         share.type = type;
         share.name =this.sharingPassword.fileUrl;
         this.api.setApi("share");
         this.api.add<ShareModel>(share)
         .subscribe(res => {
          $("#divSharePassword").modal('hide');
          this.toastr.success("Password sharing success", "Success");

          console.log('Password sharing success' );
          this.ngxService.stop();
          }, error =>{
            console.log('Error sharing password');
            this.toastr.error("Error password sharing.", "Error");
            this.ngxService.stop();

          });


         //aqui vamos a guardar al servicio
        })
        .catch((error)=>{
          console.log('Error sharing password');
          this.toastr.error("Error file saving.", "Error");

          this.ngxService.stop();

        });

  }

  getNewPassword(){
   if(!(this.passwordLength>0))
    this.passwordLength = 10;

    var password = passgenerator.generate({
      numbers:this.allowNumbers,
      length:this.passwordLength,
      symbols:this.allowSymbols,
      uppercase:this.allowUpercase,
      strict:true
    });
    this.filePassword.setValue(password);

  }

  showGenerateSettings(){
    $("#divGenerateSettings").toggle( "slow");
  }

  resetPasswordGenerationSettings(){
    $("#divGenerateSettings").toggle( "slow");
  }

  //Drag&Drop
  passwordDragging:PasswordModel;
  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev, p:PasswordModel) {
    this.passwordDragging = p;
    ev.dataTransfer.setData("text", ev.target.id);
  }

  drop(ev, f:FolderPasswordModel) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    this.dataService.addPasswordToFolder(this.passwordDragging, f);
  }

  dragEnter(event:any){
    event.target.style.backgroundColor="green"
     event.target.style.opacity=".6";
    // event.target.style.filter="grayscale(0%);";
   }

   dragLeave(event:any){
    event.target.style.backgroundColor=""
    event.target.style.opacity="1"
    // event.target.style.filter="grayscale(100%);";
   }

   dropEnd(event:any){
    event.target.style.backgroundColor=""
    event.target.style.opacity="1"
   }

   dragEnterFont(event:any){
    event.target.style.color="green";
    event.target.style.fontSize="x-large";
   }

   dragLeaveFont(event:any){
    event.target.style.color="";
    event.target.style.fontSize="";

   }
   dropEndFont(event:any){
    event.target.style.color="";
    event.target.style.fontSize="";
   }

}
