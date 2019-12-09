import { Injectable } from '@angular/core';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';
import { FolderPasswordModel } from './Models/folder-password.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { PasswordModel } from './Models/password.model';
import { Md5 } from 'ts-md5/dist/md5';
import { ReplaySubject } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class DataService {
    readonly currentFolderFileName:string = '/rootpassword03.json';
    readonly recentPasswordsFileName: string = '/recentPasswords.json'
    readonly bookmarkPasswordsFileName: string = '/bookmarkPasswords.json'

    readonly idcurrentFolder:string = '123456879';
    currentFolder : FolderPasswordModel = new FolderPasswordModel();
    readOptions : any = {decrypt: true};
    writeOptions : any = {encrypt: true};
    userSession :any;

    private isPasswordsLoaded: boolean=false;
    onSavePassword = new ReplaySubject(1);
    onDeletePassword = new ReplaySubject(1);
    onSaveFolder = new ReplaySubject(1);
    onDeleteFolder = new ReplaySubject(1);

    accessedFolders= new Array<FolderPasswordModel>();
    recentPasswords= new Array<PasswordModel>();
    bookmarkPasswords= new Array<PasswordModel>();

    constructor(private ngxService: NgxUiLoaderService,private toastr: ToastrService){
        const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
        this.userSession = new blockstack.UserSession({appConfig:appConfig});
        this.InitialiceRoot();      
    }

    private InitialiceRoot(){
        this.currentFolder = new FolderPasswordModel();
        this.currentFolder.filename = this.currentFolderFileName;
        this.currentFolder.id = this.idcurrentFolder;
        this.currentFolder.folderName = "root";
        var exist = this.accessedFolders.filter(e=> this.currentFolder.id);
        if(exist.length==0)
            this.accessedFolders.push(this.currentFolder);
        this.userSession.getFile(this.recentPasswordsFileName,this.readOptions)
            .then((fileContents) => {
                if(fileContents!=null)
                    this.recentPasswords= JSON.parse(fileContents);
                this.ngxService.stop(); 
            }).catch((error) => {
                console.log('Error reading passwords!')
                this.ngxService.stop();
            });

        this.userSession.getFile(this.bookmarkPasswordsFileName,this.readOptions)
            .then((fileContents) => {
                if(fileContents!=null)
                    this.bookmarkPasswords= JSON.parse(fileContents);
                this.ngxService.stop(); 
            }).catch((error) => {
                console.log('Error reading bookmark passwords!')
                this.ngxService.stop();
            });
    }

    getRootPasswords(){
        if(!this.isPasswordsLoaded){
            this.ngxService.start(); 
            this.userSession.getFile(this.currentFolder.filename,this.readOptions)
            .then((fileContents) => {
                this.currentFolder= JSON.parse(fileContents);
                this.ngxService.stop(); 
                this.isPasswordsLoaded=true;
                if(fileContents==null)
                    this.InitialiceRoot();
            }).catch((error) => {
                console.log('Error reading passwords!')
                this.ngxService.stop();
                this.InitialiceRoot();
            });
        }
    }

    navigateToFolder(p:FolderPasswordModel){
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

    setCurrentFolder(p: FolderPasswordModel)
    {
        this.currentFolder = p;
        this.ngxService.start(); 
        this.userSession.getFile(this.currentFolder.filename,this.readOptions)
        .then((fileContents) => {
            this.currentFolder= JSON.parse(fileContents);
            this.ngxService.stop(); 
            this.isPasswordsLoaded=true;
            this.accessedFolders.push(p);
            if(fileContents==null)
                this.InitialiceRoot();
        }).catch((error) => {
            console.log('Error reading passwords!')
            this.ngxService.stop();
            this.InitialiceRoot();
        });
    
    }

    addPassword(p:PasswordModel, f:any){
        if(this.currentFolder.passwords==null)
            this.currentFolder.passwords=[];

        if(p.id==null){
            p.id = Md5.hashStr(new Date().toISOString(),false).toString();
            p.date = new Date();
            this.currentFolder.passwords.push(p);
        }
        else{
            let idx = this.currentFolder.passwords.findIndex(e=> e.id == p.id);
            this.currentFolder.passwords[idx].fileUrl = p.fileUrl;
            this.currentFolder.passwords[idx].fileUserName = p.fileUserName;
            this.currentFolder.passwords[idx].filePassword = p.filePassword;
            this.currentFolder.passwords[idx].fileNotes= p.fileNotes;
        }

        this.ngxService.start(); 
    
       return this.userSession.putFile(this.currentFolder.filename,JSON.stringify(this.currentFolder) , this.writeOptions)
        .then(() =>{
         // 
          this.onSavePassword.next(true);  
          this.toastr.success("The password was saved correctly","Success")
          if(this.recentPasswords.length>2)
            this.recentPasswords.shift();
          this.recentPasswords.push(p);
          return this.userSession.putFile(this.recentPasswordsFileName,JSON.stringify(this.recentPasswords) , this.writeOptions)
            .then(() =>{
                this.ngxService.stop(); 
                f.reset();
            }).catch((error) => {
                console.log('Error saving password!')
                this.ngxService.stop();
                this.onSavePassword.next(false);
          });
          

        }).catch((error) => {
          console.log('Error saving password!')
          this.ngxService.stop();
          this.onSavePassword.next(false);
        });
        
    }

    addFolder(p: FolderPasswordModel,  f:any){
        if(this.currentFolder.folders==null)
            this.currentFolder.folders=[];

        if(p.id==null){
            p.id = Md5.hashStr(new Date().toISOString(),false).toString();
            p.filename = p.id +".json";
            p.date = new Date();
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
          console.log('Error savin folder root!')
          this.ngxService.stop();
          this.onSaveFolder.next(false);
        });
    }

    deletePassword(p:PasswordModel){
        if(confirm('Are you sure to delete ' + p.fileUrl +' Password?')){
            let idx = this.currentFolder.passwords.findIndex(e=> e.id == p.id);
            this.currentFolder.passwords.splice(idx,1);
            this.ngxService.start(); 
            this.userSession.putFile(this.currentFolder.filename,JSON.stringify(this.currentFolder) , this.writeOptions)
                .then(() =>{
                
                this.toastr.success("The password was deleted correctly","Success")
                this.ngxService.stop(); 
                this.onDeletePassword.next(true);
            }).catch((error) => {
                console.log('Error deleting password!')
                this.ngxService.stop();
                this.onDeletePassword.next(false);
            });
        }
    }

    deleteFolder(p:FolderPasswordModel){
        if(confirm('Are you sure to delete \'' + p.folderName +'\' Folder?')){
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
    }

    addBookmark(p:PasswordModel){
        let idx = this.bookmarkPasswords.findIndex(e=> e.id == p.id);
        if(idx<0){
            this.bookmarkPasswords.push(p);
            this.saveBookmarksFile("Bookmark added!");
        }
    }

    removeBookmark(p:PasswordModel){
        let idx = this.bookmarkPasswords.findIndex(e=> e.id == p.id);
        this.bookmarkPasswords.splice(idx,1);
        this.saveBookmarksFile("Bookmark removed!");
    }


    saveBookmarksFile(message:string){
        this.ngxService.start(); 
        this.userSession.putFile(this.bookmarkPasswordsFileName,JSON.stringify(this.bookmarkPasswords) , this.writeOptions)
            .then(() =>{
                this.ngxService.stop(); 
                this.toastr.success(message,"Success")
                
            }).catch((error) => {
                console.log('Error saving bookmark!')
                this.ngxService.stop();
                this.onSavePassword.next(false);
          });
    }

}