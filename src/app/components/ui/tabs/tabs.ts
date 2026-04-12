import {Component, ContentChildren, Input} from '@angular/core';
import {Tab, TabContent, TabList, TabPanel, Tabs as T} from '@angular/aria/tabs';
import {TabItem} from './tab-item';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-tabs',
  imports: [
    TabPanel,
    TabContent,
    TabList,
    Tab,
    T,
    NgTemplateOutlet
  ],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class Tabs {

  @Input() tabs!: string[];

  tabContentChilds:any = ContentChildren(TabItem);
  getTemplate(value: string):any {
    return this.tabContentChilds().find((t:any) => t.value === value)?.template;
  }
}
