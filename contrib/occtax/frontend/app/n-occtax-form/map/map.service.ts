import { Injectable } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  Validators
} from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { GeoJSON } from "leaflet";
import { filter, map, tap } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { OcctaxFormService } from '../occtax-form.service';

@Injectable()
export class OcctaxFormMapService {
 
  private _geometry: FormControl;
  public geojson: BehaviorSubject<GeoJSON> = new BehaviorSubject(null);

  get geometry() { return this._geometry; }
  set geometry(geojson: GeoJSON) { 
    if (JSON.stringify(geojson.geometry) !== JSON.stringify(this._geometry.value) ) {
      this._geometry.setValue(geojson.geometry); 
    }
  }

  constructor(
    private _fb: FormBuilder,
    private _http: HttpClient,
    private occtaxFormService: OcctaxFormService
  ) {
     this.initForm();
     this.setObservables();
  } 

  initForm(): void {
    this._geometry = new FormControl(null, Validators.required);
  }

  /**
  * Initialise les observables pour la mise en place des actions automatiques
  **/
  private setObservables() {
    //Observe les données, si édition patch le formulaire par la valeur du relevé
    this.occtaxFormService.editionMode
            //.subscribe((editionMode: boolean)=>{console.log("edition", editionMode); this.occtaxFormService.disabled = !editionMode});

    //Observe les données, si édition patch le formulaire par la valeur du relevé
    this.occtaxFormService.occtaxData
            .pipe(
              filter(data=> data && data.releve.geometry),
              map(data=>data.releve.geometry)
            )
            .subscribe(geometry=>this._geometry.setValue(geometry));

    //active la saisie si la geometry est valide
    this._geometry.valueChanges
                .pipe(
                  tap(()=>this.occtaxFormService.disabled = this._geometry.invalid),
                  map(geometry=>this._geometry.valid ? {geometry: geometry} : null)
                )
                .subscribe(geojson => {                 
                  this.geojson.next(geojson);
                });
  }

  reset() {
    this._geometry.setValue(null);
    this._geometry.updateValueAndValidity();
  }

}