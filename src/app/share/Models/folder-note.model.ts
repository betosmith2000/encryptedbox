import { NoteModel } from './note.model';

export class FolderNoteModel{
    id:string;
    folderName : string;
    folderNotes: string;
    date : Date;
    filename:string;
    notes: NoteModel[];
    folders: FolderNoteModel[];
    constructor(){
        this.date = new Date();
        this.notes = [];
        this.folders = [];
    }
}