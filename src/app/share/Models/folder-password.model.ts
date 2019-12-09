import { PasswordModel } from './password.model';

export class FolderPasswordModel{
    id:string;
    folderName : string;
    folderNotes: string;
    date : Date;
    filename:string;
    passwords: PasswordModel[];
    folders: FolderPasswordModel[];
    constructor(){
        this.date = new Date();
        this.passwords = [];
        this.folders = [];
    }
}