import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';


import 'rxjs/operators';
import { tap, catchError } from "rxjs/operators";
import { environment } from 'src/environments/environment';



@Injectable({
    providedIn: 'root'
  })
  export class ApiService {
    private _url:string;
  
    constructor(private _http: HttpClient ) { }
  
    public setApi(api:string){
      this._url = environment.apiURL + api;
    }
  
    public getAll<T>(queryString:string):Observable<T>{
      let t = +new Date(); //Evitar caache entre llamadas
      let qs = "?_t="+ t + ( queryString !== null && queryString!== '' ? '&' + queryString:'' ) ;
      return this._http.get<T>(this._url + qs)
      .pipe(
        tap(d=> console.log('Datos: ' + JSON.stringify(d))),
        catchError(this.handleError)
        );
    }
  
    public getSingle<T>(id:any):Observable<T>{
      let t = +new Date();
      let qs = "?ts=" + t;
      return this._http
          .get<T>(this._url + '/' + id + qs)
          .pipe(
            tap(data => console.log('Datos: ' + JSON.stringify(data))),
            catchError(this.handleError)
            );
    }
  
    public add<T>(item: T): Observable<T> {
      return this._http
          .post<T>(this._url, item)
          .pipe(
            tap(data => console.log('Datos: ' + JSON.stringify(data))),
  
            );
    }
  
    public update<T>(id: string, itemToUpdate: any): Observable<T> {
        return this._http
            .put<T>(this._url + '/' + id, itemToUpdate)
            .pipe(
              tap(data => console.log('Datos: ' + JSON.stringify(data))),
              catchError(this.handleError)
              );
    }
  
    public delete<T>(id: any): Observable<T> {
        return this._http
            .delete<T>(this._url + '/' + id)
            .pipe(
              tap(data => console.log('Datos: ' + JSON.stringify(data))),
              catchError(this.handleError)
              );
    }

    public deleteComment<T>(id: string, rootId:string): Observable<T> {
      return this._http
          .delete<T>(this._url + '/' + id+"?rootId=" + rootId)
          .pipe(
            tap(data => console.log('Datos: ' + JSON.stringify(data))),
            catchError(this.handleError)
            );
  }
  
    private handleError(err: HttpErrorResponse){
      let errorMessage = '';
      if(err.error instanceof ErrorEvent){
        errorMessage = 'Error en: ' + err.error.message;
      }
      else{
        errorMessage = 'Error en servidor:' + err.status +", mensaje:" + err.message;
      }
      console.error(errorMessage);
      return throwError(errorMessage);
    }
  }
  