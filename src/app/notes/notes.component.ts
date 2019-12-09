import { Component, OnInit } from '@angular/core';
import { faCopy, faEyeSlash, faEye, faTrash, faExternalLinkAlt, faFolderOpen, faShareAlt, faEdit  } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataNoteService } from '../share/data-note.service';
import { NoteModel } from '../share/Models/note.model';
import { FolderNoteModel } from '../share/Models/folder-note.model';

declare var $: any;


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  
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



  constructor(public dataService: DataNoteService, private toastr: ToastrService) {     }


  ngOnInit() {
    
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


}
