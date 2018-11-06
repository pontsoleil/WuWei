import {
  Component,
  Output, EventEmitter,
  OnInit, AfterViewInit, AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { TranslatePipe } from '../services';
import { WuweiModel } from '../model/wuwei/wuwei.model';
import * as globals from '../model/wuwei-globals';

@Component({
  selector: 'app-filter',
  templateUrl: 'filter.component.html',
  styleUrls: ['filter.component.scss']
})
export class FilterComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @Output() filterEvent = new EventEmitter<any>();

  model: WuweiModel;

  lang;
  selectedFilter: string = '';

  groupsSelect;
  rolesSelect;

  showAll: boolean;
  hideAll: boolean;

  ngOnInit() {
    /**
     * see https://github.com/angular/angular/issues/22304
     * ExpressionChangedAfterItHasBeenCheckedError is thrown when you try to modify
     * a component's state after the change detection algorithm ended.
     * Your issue is that ngAfterViewInit happens, as the name suggests after the change
     * detection algorithm ended. At that point, Angular expects nothing else to change
     * in the component's state until the next tick. However, it does, because you set
     * the value of the properties to false. You can't something that would trigger a new
     * change detection after a change detection has ended.
     * You can do those assignments in ngOnInit and Angular won't complain.
     */
    const
    groups = [],
    roles = [];
    /**
     * check if filtering
     */
    if (globals.status.selectedFilter.length > 0) {
      this.selectedFilter = globals.status.selectedFilter;
    } else if (globals.status.selectedSearch.length > 0) {
      this.selectedFilter = globals.status.selectedSearch;
    }
    // Group
    for (const node of globals.graph.nodes) {
      const group = node.group;
      if (groups.indexOf(group) < 0) {
        groups.push(group);
      }
    }
    groups.sort();
    this.groupsSelect = [];
    for (let group of groups) {
      group = group || 'undefined';
      this.groupsSelect.push({
        value: 'g_' + group,
        label: group,
        checked: true
      });
    }
    // Role
    for (const link of globals.graph.links) {
      const role = link.role;
      if (roles.indexOf(role) < 0) {
        roles.push(role);
      }
    }
    roles.sort();
    this.rolesSelect = [];
    for (let role of roles) {
      role = role || 'undefined';
      this.rolesSelect.push({
        value: 'r_' + role,
        label: role,
        checked: true
      });
    }
  }

  ngAfterViewInit() {
    const json = JSON.stringify({
        command: 'hideIconMenu'
      });
    this.filterEvent.emit(json);
  }

  ngOnDestroy() {
    const json = JSON.stringify({
        command: 'showIconMenu'
      });
    this.filterEvent.emit(json);
  }

  constructor(
    private translate: TranslatePipe
  ) {
    const self = this;

    self.model = globals.module.wuweiModel;

    const _language = localStorage.getItem('language');
    if (_language) {
      globals.nls.LANG = _language;
    }
    self.lang = globals.nls.LANG;

    self.showAll = false;
    self.hideAll = false;
  }

  filter() {
    this.filterEvent.emit(
      JSON.stringify({
        command: 'filter',
        param: {
          groupsSelect: this.groupsSelect,
          rolesSelect: this.rolesSelect
        }
      })
    );
  }

  onCheckboxChange($event, attribute) {
    const
      self = this,
      target = $event.target,
      id = target.id,
      checked = target.checked;
    if ('group' === attribute) {
      const groupsSelect = self.groupsSelect;
      for (const group of groupsSelect) {
        if (id === group.value) {
          group.checked = checked;
        }
      }
    } else if ('role' === attribute) {
      const rolesSelect = self.rolesSelect;
      for (const role of rolesSelect) {
        if (id === role.value) {
          role.checked = checked;
        }
      }
    }
    this.filter();
  }
  // clicked(menu) {
  //   const icons = document.querySelectorAll('.menu a');
  //   for (let i = 0; i < icons.length; i++) {
  //     icons[i].classList.remove('selected');
  //   }
  //   const classList = document.querySelector('#' + menu).classList;
  //   classList.add('selected');
  //   if ('ISO_PC295' === menu) {
  //     this.selectedFilter = 'ISO_PC295';
  //   } else if ('GENERIC' === menu) {
  //     this.selectedFilter = 'GENERIC';
  //   }
  //   globals.status.selectedFilter = this.selectedFilter;
  // }

  onFilter(attribute) {
    console.log(attribute);
    if ('showAll' === attribute) {
      Promise.resolve(attribute)
        .then(attribute => {
          return this.model.showAll();
        })
        .then(value => {
          this.filterEvent.emit(JSON.stringify({
            command: 'filter',
            param: 'showAll'
          }));
        });
    } else if ('hideAll' === attribute) {
      Promise.resolve(attribute)
        .then(attribute => {
          return this.model.hideAll();
        })
        .then(value => {
          this.filterEvent.emit(JSON.stringify({
            command: 'filter',
            param: 'hideAll'
          }));
        });
    }
  }

  filterDismiss() {
    this.filterEvent.emit(JSON.stringify({
      command: 'filterDismiss'
    }));
  }

/*  genericEvent(map: string) {
    console.log('- Filteromponent genericEvent map:', map);
    // const
    //   parsed = JSON.parse(map),
    //   command = parsed.command;
    // console.log(command);
    this.filterEvent.emit(map);
  }

  pc295Event(map: string) {
    console.log('- FilterComponent pc295Event map:', map);
    // const
    //   parsed = JSON.parse(map),
    //   command = parsed.command;
    // console.log(command);
    this.filterEvent.emit(map);
  }
*/
  searchOpen() {
    this.filterEvent.emit(JSON.stringify({
      command: 'searchOpen',
    }));
  }

}
