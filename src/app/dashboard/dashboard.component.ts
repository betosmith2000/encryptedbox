import { Component, OnInit } from '@angular/core';
import { DataService } from '../share/data.service';
import { faCopy, faEyeSlash, faEye, faTrash, faExternalLinkAlt, faFolderOpen, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { PasswordModel } from '../share/Models/password.model';
import { SharedDataService } from '../share/shared-data.service';
import { ShareModel } from '../share/Models/share.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  copyIcon = faCopy;
  viewPassIcon = faEye;
  deleteIcon= faTrash;
  linkIcon = faExternalLinkAlt;
  folderIcon= faFolderOpen;
  removeFavIcon= faMinusCircle;
  
  constructor(public dataService: DataService, private toastr: ToastrService,public sharedService:SharedDataService) { }

  ngOnInit() {
    this.sharedService.getSharedContent();
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
  
  validURL(str) {
    var pattern = new RegExp('^(https|http?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  
  removeBookmark(p:PasswordModel){
    this.dataService.removeBookmark(p);
  }

  loadSharedContent(p: ShareModel){
    this.sharedService.loadSharedContent(p);
  }

  deleteSharedContent(p:ShareModel){
    this.sharedService.deleteSharedContent (p);
  }
}
