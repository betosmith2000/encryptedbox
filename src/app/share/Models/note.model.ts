export class NoteModel{
    id:string;
    fileName: string;
    fileNotes: string;
    date: Date;
    constructor(){
        this.date = new Date();
    }

}