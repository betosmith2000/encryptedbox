import { Injectable } from '@angular/core';
import {Router, CanActivate } from '@angular/router';
import * as blockstack from 'node_modules/blockstack/dist/blockstack.js';

@Injectable({
    providedIn:'root'
})
export class SiteGoHome implements CanActivate{

    constructor(private router : Router){

    }

    canActivate() {
        let userSession = new blockstack.UserSession()
        if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            this.router.navigate(['/all/' + userData.username]);
            return true;
        }
        return true;
    }
}