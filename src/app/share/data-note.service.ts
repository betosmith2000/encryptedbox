import { Injectable } from '@angular/core';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Md5 } from 'ts-md5/dist/md5';
import { ReplaySubject } from 'rxjs';
import { FolderNoteModel } from './Models/folder-note.model';
import { NoteModel } from './Models/note.model';
import { ConfirmationService, ResolveEmit } from "@jaspero/ng-confirmations";

declare var $: any;


@Injectable({
  providedIn: 'root',
})
export class DataNoteService {
    readonly currentFolderFileName:string = '/rootnotes03.json';
    readonly recentNotesFileName: string = '/recentNotes.json'
    readonly idcurrentFolder:string = '125687987';
    currentFolder : FolderNoteModel = new FolderNoteModel();
    readOptions : any = {decrypt: true};
    writeOptions : any = {encrypt: true};
    userSession :any;

    private isNotesLoaded: boolean=false;
    onSaveNote = new ReplaySubject(1);
    onDeleteNote = new ReplaySubject(1);
    onSaveFolder = new ReplaySubject(1);
    onDeleteFolder = new ReplaySubject(1);

    accessedFolders= new Array<FolderNoteModel>();
    recentNotes= new Array<NoteModel>();

    constructor(private ngxService: NgxUiLoaderService,private toastr: ToastrService,
        private _confirmation: ConfirmationService){
        const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
        this.userSession = new blockstack.UserSession({appConfig:appConfig});
        this.InitialiceRoot();      
    }

    private InitialiceRoot(){
        this.currentFolder = new FolderNoteModel();
        this.currentFolder.filename = this.currentFolderFileName;
        this.currentFolder.id = this.idcurrentFolder;
        this.currentFolder.folderName = "root";
        var exist = this.accessedFolders.filter(e=> this.currentFolder.id);
        if(exist.length==0)
            this.accessedFolders.push(this.currentFolder);
        this.userSession.getFile(this.recentNotesFileName,this.readOptions)
            .then((fileContents) => {
                if(fileContents!=null)
                    this.recentNotes= JSON.parse(fileContents);
                this.ngxService.stop(); 
            }).catch((error) => {
                console.log('Error reading notes!')
                this.ngxService.stop();
            });
    }

    getRootNotes(){
        if(!this.isNotesLoaded){
            this.ngxService.start(); 
            this.userSession.getFile(this.currentFolder.filename,this.readOptions)
            .then((fileContents) => {
                this.currentFolder= JSON.parse(fileContents);
                this.ngxService.stop(); 
                this.isNotesLoaded=true;
                if(fileContents==null)
                    this.InitialiceRoot();
            }).catch((error) => {
                console.log('Error reading notes!')
                this.ngxService.stop();
                this.InitialiceRoot();
            });
        }
    }

    navigateToFolder(p:FolderNoteModel){
        var busqueda = false;
        var folder = null;
        var idx=1;
        while(!busqueda){
            var e = this.accessedFolders.pop();
            if(e.id==p.id ){
                busqueda=true;
                if(idx==1)
                    this.accessedFolders.push(e);
                break;
            }
            idx++;
        }
        if(idx>1)
            this.setCurrentFolder(p);
    }

    setCurrentFolder(p: FolderNoteModel)
    {
        this.currentFolder = p;
        this.ngxService.start(); 
        this.userSession.getFile(this.currentFolder.filename,this.readOptions)
        .then((fileContents) => {
            this.currentFolder= JSON.parse(fileContents);
            this.ngxService.stop(); 
            this.isNotesLoaded=true;
            this.accessedFolders.push(p);
            if(fileContents==null)
                this.InitialiceRoot();
        }).catch((error) => {
            console.log('Error reading notes!')
            this.ngxService.stop();
            this.InitialiceRoot();
        });
    }

    addNote(p:NoteModel, f:any){
        if(this.currentFolder.notes==null)
            this.currentFolder.notes=[];
        
        if(p.id==null){
            p.date = new Date();
            p.id = Md5.hashStr(new Date().toISOString(),false).toString();
            this.currentFolder.notes.push(p);
        }
        else{
            let idx = this.currentFolder.notes.findIndex(e=> e.id == p.id);
            this.currentFolder.notes[idx].fileName = p.fileName;
            this.currentFolder.notes[idx].fileNotes = p.fileNotes;
        }
        
        this.ngxService.start(); 
    
       return this.userSession.putFile(this.currentFolder.filename,JSON.stringify(this.currentFolder) , this.writeOptions)
        .then(() =>{
         // 
          this.onSaveNote.next(true);  
          this.toastr.success("The note was saved correctly","Success")
          if(this.recentNotes.length>2)
            this.recentNotes.shift();
          this.recentNotes.push(p);
          return this.userSession.putFile(this.recentNotesFileName,JSON.stringify(this.recentNotes) , this.writeOptions)
            .then(() =>{
                this.ngxService.stop(); 
                f.reset();
            }).catch((error) => {
                console.log('Error saving note!')
                this.ngxService.stop();
                this.onSaveNote.next(false);
          });
          

        }).catch((error) => {
          console.log('Error saving note!')
          this.ngxService.stop();
          this.onSaveNote.next(false);
        });
        
    }

    addFolder(p: FolderNoteModel,  f:any){
        if(this.currentFolder.folders==null)
            this.currentFolder.folders=[];

        if(p.id==null){
            p.date = new Date();
            p.id = Md5.hashStr(new Date().toISOString(),false).toString();
            p.filename = p.id +".json";
            this.currentFolder.folders.push(p);
        }
        else{
            let idx = this.currentFolder.folders.findIndex(e=> e.id == p.id);
            this.currentFolder.folders[idx].folderName = p.folderName;
            this.currentFolder.folders[idx].folderNotes = p.folderNotes;
        }
        
        this.ngxService.start(); 

        
       return this.userSession.putFile(this.currentFolder.filename,JSON.stringify(this.currentFolder) , this.writeOptions)
        .then(() =>{
         // 
          this.onSaveFolder.next(true);  
          this.userSession.putFile(p.filename, JSON.stringify(p), this.writeOptions)
          .then(() =>{ 
            this.toastr.success("Folder was saved correctly","Success")
            this.ngxService.stop(); 
            f.reset();
          }).catch((error) => {
            console.log('Error saving folder!')
            this.ngxService.stop();
            this.onSaveFolder.next(false);
          });

        }).catch((error) => {
          console.log('Error saving folder root!')
          this.ngxService.stop();
          this.onSaveFolder.next(false);
        });
    }

    deleteNote(p:NoteModel){
        this._confirmation.create('Are you sure to delete ' + p.fileName +' Note?')
        .subscribe((ans: ResolveEmit) => {
            if (ans.resolved) {
        
                let idx = this.currentFolder.notes.findIndex(e=> e.id == p.id);
                this.currentFolder.notes.splice(idx,1);
                this.ngxService.start(); 
                this.userSession.putFile(this.currentFolder.filename,JSON.stringify(this.currentFolder) , this.writeOptions)
                    .then(() =>{
                    
                    this.toastr.success("The note was deleted correctly","Success")
                    this.ngxService.stop(); 
                    this.onDeleteNote.next(true);
                }).catch((error) => {
                    console.log('Error deleting note!')
                    this.ngxService.stop();
                    this.onDeleteNote.next(false);
                });
            }
        });
        setTimeout(() => {
            $(".jaspero__confirmation_dialog").css("position","fixed")    
        }, 10);
    }

    deleteFolder(p:FolderNoteModel){
        this._confirmation.create('Are you sure to delete \'' + p.folderName +'\' Folder?')
        .subscribe((ans: ResolveEmit) => {
            if (ans.resolved) {

        
                let idx = this.currentFolder.folders.findIndex(e=> e.id == p.id);
                this.currentFolder.folders.splice(idx,1);
                this.ngxService.start(); 
                this.userSession.putFile(this.currentFolder.filename,JSON.stringify(this.currentFolder) , this.writeOptions)
                    .then(() =>{
                    
                    this.toastr.success("Folder was deleted correctly","Success")
                    this.ngxService.stop(); 
                    this.onDeleteFolder.next(true);
                }).catch((error) => {
                    console.log('Error deleting folder!')
                    this.ngxService.stop();
                    this.onDeleteFolder.next(false);
                });
            }
        });
        setTimeout(() => {
            $(".jaspero__confirmation_dialog").css("position","fixed")    
        }, 10);
    }

}