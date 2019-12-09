export class PasswordModel{
    id:string;
    fileUrl: string;
    fileUserName: string;
    filePassword: string;
    fileNotes: string;
    date: Date;
    constructor(){
        this.date = new Date();
    }

}