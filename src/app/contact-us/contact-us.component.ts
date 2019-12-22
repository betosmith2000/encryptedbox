import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../share/api.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  form: FormGroup;
  name: FormControl;
  email: FormControl;
  message: FormControl;
  public selectedTheme:string='';

  constructor(private _api:ApiService, private ngxService: NgxUiLoaderService,
    private toastr:ToastrService) {
    this._api.setApi("Contact");
   }

  ngOnInit() {
    this.name = new FormControl('', Validators.required);
    this.email = new FormControl('', [Validators.required,Validators.email]);
    this.message = new FormControl('',[Validators.required] );
    this.form = new FormGroup({
      name: this.name,
      email: this.email,
      message: this.message,
    });
  }

  sendMessage():void{
    let p = Object.assign({}, this.form.value);
    this._api.setApi("Contact");
    this.ngxService.start();
    this._api.add(p)
    .subscribe(res => {
      
      console.log('Send message:');
      this.toastr.success("The message has been sent, thank you!",'Success');      

      this.ngxService.stop();
      this.form.reset();
    }, error =>{
      console.log('Error to send message');
      this.ngxService.stop();

    });


  }

}
