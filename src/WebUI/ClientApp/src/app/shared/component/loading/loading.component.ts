import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  @Input()
  public _loading = false;

  @Input() set loading(value: boolean) {
    this._loading = value;
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

}
