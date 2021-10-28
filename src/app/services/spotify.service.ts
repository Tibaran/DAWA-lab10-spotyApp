import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  constructor(private http: HttpClient, private router: Router) {
    console.log('Spotify Service Listo');
  }

  getQuery( query: string ) {

    const url = `https://api.spotify.com/v1/${ query }`;

    //  Extrae el token de ambiente
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${ environment.token }`
    });
    // Atrapa el error de 401 que devuelve spotify por token expirado  y genera uno nuevo
    return this.http.get(url, { headers }).pipe(
      catchError((err: HttpErrorResponse)=>{
        if (err.status === 401){
          console.log("Token expirado, Refrescando Token");
          this.refreshToken().subscribe((data: any)=>{
            environment.token = data.access_token;
          });
        }
        return throwError( err );
      })
    );

  }

  // Hace la consulta post para generar el nuevo token.
  refreshToken() {
    const headers = new HttpHeaders({
      'Authorization': 'Basic YTNjNzIwM2QyM2I1NDJmMGEzMTIyODNkMzI5MTc0Mzk6YjRjYWJiYzEwZjJiNGQwY2I3MzYzMjcxYTRiYWIwNjQ=',
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post(`https://accounts.spotify.com/api/token`,'grant_type=client_credentials', { headers });
  }


  getNewReleases() {

    return this.getQuery('browse/new-releases?limit=20')
              .pipe( map( data => data['albums'].items ));

  }

  getArtistas( termino: string ) {

    return this.getQuery(`search?q=${ termino }&type=artist&limit=15`)
                .pipe( map( data => data['artists'].items));

  }

  getArtista( id: string ) {

    return this.getQuery(`artists/${ id }`);
                // .pipe( map( data => data['artists'].items));

  }

  getTopTracks( id: string ) {

    return this.getQuery(`artists/${ id }/top-tracks?country=us`)
                .pipe( map( data => data['tracks']));

  }

}
