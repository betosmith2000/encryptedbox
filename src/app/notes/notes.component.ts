import { Component, OnInit } from '@angular/core';
import { faCopy, faEyeSlash, faEye, faTrash, faExternalLinkAlt, faFolderOpen, faShareAlt, faEdit  } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataNoteService } from '../share/data-note.service';
import { NoteModel } from '../share/Models/note.model';
import { FolderNoteModel } from '../share/Models/folder-note.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService } from '../share/api.service';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { ShareModel } from '../share/Models/share.model';

declare var $: any;


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  userSession :any;

  
  readOptions : any = {decrypt: false, username: null};
  writeOptions : any = {encrypt:false};
  userName :string  = 'User name';


  copyIcon = faCopy;
  viewPassIcon = faEye;
  deleteIcon= faTrash;
  linkIcon = faExternalLinkAlt;
  folderIcon= faFolderOpen;
  shareIcon = faShareAlt;
  editIcon = faEdit;

  fileForm :FormGroup;
  fileName:FormControl;
  fileNotes:FormControl;
  editingNote: NoteModel;

  folderForm :FormGroup;
  folderName:FormControl;
  folderNotes:FormControl;
  editingFolderNote:FolderNoteModel;
  sharingNote:NoteModel;


  blockstackIdToShare : string;
  pkToShare:string ='';
  
  constructor(public dataService: DataNoteService, private toastr: ToastrService,
    private ngxService: NgxUiLoaderService, private api: ApiService) {   
      const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
      this.userSession = new blockstack.UserSession({appConfig:appConfig});
     }


  ngOnInit() {
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
    this.dataService.getRootNotes();
    this.dataService.onSaveNote.subscribe(
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
    
    this.fileName = new FormControl('', [Validators.required]);
    this.fileNotes = new FormControl('');
    this.fileForm = new FormGroup({
      fileName:this.fileName,
      fileNotes:this.fileNotes
    });


    this.folderName = new FormControl('', [Validators.required]);
    this.folderNotes = new FormControl('');

    this.folderForm = new FormGroup({
      folderName: this.folderName,
      folderNotes:this.folderNotes
    });


  }

  
  newNote(){
    this.editingNote = new NoteModel();
  }

  saveNote(){
    let p = Object.assign({}, this.editingNote, this.fileForm.value);
    this.dataService.addNote(p, this.fileForm);
  }

  newFolder(){
    this.editingFolderNote = new FolderNoteModel();
  }
  saveFolder(){
    let p = Object.assign({}, this.editingFolderNote, this.folderForm.value);
    this.dataService.addFolder(p, this.folderForm);

  }


  viewPassword(inputElement){
    if(inputElement.className.indexOf('input-password')>=0)
    {
      inputElement.className = inputElement.className.replace('input-password','');
    }
    else{
      inputElement.className = inputElement.className + " input-password";
    }
    
  }

  
  delete(p:NoteModel){
    this.dataService.deleteNote(p);
  }

  deleteFolder(event:Event, p:FolderNoteModel){
    event.stopPropagation();    
    this.dataService.deleteFolder(p);

  }

  
  folderEnter(p:FolderNoteModel){
    this.dataService.setCurrentFolder(p);
    
  }

  navigateFolder(p:FolderNoteModel){
    this.dataService.navigateToFolder(p);
  }

  showEditNote(p:NoteModel){
    this.editingNote=p;
    this.fileName.setValue(p.fileName);
    this.fileNotes.setValue(p.fileNotes);
    $("#divFile").modal('show');       

  }

  showEditFolder(event:Event, p:FolderNoteModel){
    event.stopPropagation();
    this.editingFolderNote=p;
    this.folderName.setValue(p.folderName);
    this.folderNotes.setValue(p.folderNotes);
    $("#divFolder").modal('show');       
  }


  showShareNote(p:NoteModel){
    this.blockstackIdToShare="";
    this.sharingNote=p;
    $("#divShareNote").modal('show');       
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
            this.encryptNoteContents(type);
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

  
  encryptNoteContents(type:number){
    debugger
    var fileName =this.sharingNote.id + ".txt";
            
    var encryptedBS = this.userSession.encryptContent(JSON.stringify(this.sharingNote), { publicKey:this.pkToShare});
    this.userSession.putFile(fileName, encryptedBS, this.writeOptions)
       .then(cipherTextUrl => { 
         var share= new ShareModel();
         share.id = this.sharingNote.id;
         share.source = this.userName;
         share.target = this.blockstackIdToShare;
         share.fileName = fileName;
         share.type = type;
         share.name =this.sharingNote.fileName;
         this.api.setApi("share");
         this.api.add<ShareModel>(share)
         .subscribe(res => {
          $("#divShareNote").modal('hide');       
          this.toastr.success("Note sharing success", "Success");
           
          console.log('Note sharing success' );
          this.ngxService.stop();        
          }, error =>{
            console.log('Error sharing note');
            this.toastr.error("Error note sharing.", "Error");
            this.ngxService.stop();

          });

        
        })
        .catch((error)=>{
          console.log('Error sharing note');
          this.toastr.error("Error file saving.", "Error");

          this.ngxService.stop();        
          
        });
   
  }

//Drag&Drop
noteDragging:NoteModel;
allowDrop(ev) {
  ev.preventDefault();
}

drag(ev, p:NoteModel) {
  this.noteDragging = p;
  ev.dataTransfer.setData("text", ev.target.id);
}

drop(ev, f:FolderNoteModel) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  this.dataService.addNoteToFolder(this.noteDragging, f);
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
