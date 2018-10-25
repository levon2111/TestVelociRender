import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from './services/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    public form: FormGroup;
    public formIsSubmitted = false;
    public process_file: File;
    public form_file: File;
    public form_error = false;
    public response_data = '';
    public response_url = '';
    public disable_input = false;

    constructor(private fb: FormBuilder, private api: ApiService) {
        this.buildForm();
    }

    ngOnInit() {
    }

    private buildForm(): void {
        this.form = this.fb.group({
            process_file: [null, Validators.required],
            form_file: [null, Validators.required]
        });
    }

    public onSubmit(): void {
        this.formIsSubmitted = true;
        if (this.form.valid) {
            this.disable_input = true;
            this.api.sendFiles({process_file: this.process_file, form_file: this.form_file}).subscribe((data) => {
                this.response_data = JSON.stringify(data);
                if (data.message === 'success') {
                    const checkerBody = {
                        sid: '1',
                        process_file_store: 'sandbox-processes',
                        form_file_store: 'sandbox',
                        process_id: data.process_id,
                        published_file_store: 'sandbox-publish'
                    };
                    console.log(checkerBody);
                    this.api.checkFiles(checkerBody).subscribe((checkerData) => {
                        this.response_data = JSON.stringify(checkerData);
                        this.response_url = `http://127.0.0.1:5005?customer_id=eeda5230-55b2-4b74-b2f0-d4fd37711bba&process_id=${data.process_id}&published_filestore=sandbox-publish&section_id=${data.section_id}&stage_id=${data.stage_id}&user_id=valid+user+id`;
                        this.disable_input = false;
                    });
                }
            });

        }
        return;
    }

    public onProcessFileUpload(e): void {
        this.process_file = e.target.files[0];
        const reader = new FileReader();
        let self = this;
        reader.onload = function (event) {
            const target: any = event.target;
            const obj = JSON.parse(target.result);
            if (!obj.processName) {
                self.form_error = true;
            }
        };
        reader.readAsText(this.process_file);
    }

    public onFormFileUpload(e): void {
        this.form_file = e.target.files[0];

        const reader = new FileReader();
        let self = this;
        reader.onload = function (event) {
            const target: any = event.target;
            const obj = JSON.parse(target.result);
            if (!obj.formName) {
                self.form_error = true;
            }
        };
        reader.readAsText(this.form_file);
    }


    public openUrl(response_url: string) {
        window.open(response_url);
    }
}
