import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
// Interceptador no usado, no lo consegui
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private http: HttpClient, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;
    return next.handle(request).pipe( catchError((err: HttpErrorResponse)=>{

      if (err.status === 401) {
        console.log("Dentro del interceptor");
        this.refreshToken().subscribe((data: any)=>{
          environment.token = data.access_token;
        });
        this.reloadCurrentRoute();
      }
      return throwError( err );
    })
    );
  }

  refreshToken() {
    const headers = new HttpHeaders({
      'Authorization': 'Basic YTNjNzIwM2QyM2I1NDJmMGEzMTIyODNkMzI5MTc0Mzk6YjRjYWJiYzEwZjJiNGQwY2I3MzYzMjcxYTRiYWIwNjQ=',
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post(`https://accounts.spotify.com/api/token`,'grant_type=client_credentials', { headers });
  }
  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
    });
}
}
