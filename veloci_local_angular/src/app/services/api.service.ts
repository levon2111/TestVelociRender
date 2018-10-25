import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

@Injectable()
export class ApiService {
    private headers: HttpHeaders;

    constructor(private http: HttpClient,
                @Inject(PLATFORM_ID) private platformId: Object) {
    }


    public sendFiles(body: any): Observable<any> {
        const formData = new FormData();
        formData.append('process_file', body.process_file);
        formData.append('form_file', body.form_file);

        return this.http
            .post('http://localhost:9001/process-files/', formData);
    }

    public checkFiles(body: any): Observable<any> {
        return this.http
            .post('http://localhost:9001/check-files/', body);
    }
}
