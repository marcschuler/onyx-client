import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-key-visualizer',
  imports: [
    NgClass
  ],
  templateUrl: './key-visualizer.html',
  styleUrl: './key-visualizer.css'
})
export class KeyVisualizer implements OnInit, OnChanges {


  @Input() keyId: string | undefined | null;

  bits: boolean[] | undefined;

  ngOnInit(): void {
    this.base64ToBitString(this.keyId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.base64ToBitString(this.keyId);
  }

  public base64ToBitString(keyId: string | undefined|null) {
    if (!keyId) {
      this.bits = undefined
      return;
    }
    const base64 = btoa(keyId);
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const bits = [...bytes]
      .map(b => b.toString(2).padStart(8, '0'))
      .flatMap(s => s.split(""))
      .map(s => s == "1")
    if (this.bits==undefined){
      this.bits = bits;
    }else{
      bits.forEach((value, index) => this.bits![index]=value)
    }
  }

}
