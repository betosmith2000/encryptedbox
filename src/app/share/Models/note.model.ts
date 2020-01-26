export class NoteModel{
    id:string;
    fileUrl: string;

    fileName: string;
    fileNotes: string;
    date: Date;
    constructor(){
        this.date = new Date();
    }

}