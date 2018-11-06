import { Component,
         OnInit       } from '@angular/core';
import { Http         } from '@angular/http';
import { FormGroup,
         FormControl,
         Validators,
         FormBuilder  } from '@angular/forms';

import { AgentService   } from '../services/agent.service';
import { UserService    } from '../services/user.service';
import { CognitoUserService    } from '../services';
import { ToastService } from '../mdb-type/pro/alerts';

import { Agent } from '../model';

import * as uuid from 'uuid';

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss']
})
export class AgentsComponent implements OnInit {

  currentUser;

  agent: Agent;
  agents: Agent[] = [];
  isLoading = true;
  isEditing = false;
  localhost = window.location.protocol + '://' + window.location.host;

  addAgentForm: FormGroup;
  type = new FormControl('', Validators.required);
  name = new FormControl('', [ Validators.required, Validators.minLength(2) ]);
  nickname = new FormControl('', Validators.minLength(2));
  email = new FormControl('', Validators.minLength(3));
  homepage = new FormControl('', Validators.minLength(3));

  constructor(
    private agentService: AgentService,
    private userService: UserService,
    private auth: CognitoUserService,
    private fb: FormBuilder,
    private http: Http,
    public toast: ToastService
  ) { }

  ngOnInit() {
    let currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      currentUser = JSON.parse(currentUser);
      if (currentUser) {
        this.currentUser = currentUser;
      } else {
        this.currentUser = {};
      }
    } else {
      this.currentUser = {};
    }
    this.getAgents(this.currentUser);
    this.addAgentForm = this.fb.group({
      type: this.type,
      name: this.name,
      nickname: this.nickname,
      email: this.email,
      homepage: this.homepage
    });
  }

  getAgents(currentUser) {
    this.agentService.getAgents(currentUser).subscribe(
      data => this.agents = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addAgent() {
    const formValue = this.addAgentForm.value;
    formValue.creator_id = this.auth.currentUser._id;
    // alert('addAgent() formValue:' + JSON.stringify(formValue));
    this.userService.getUsers().subscribe(
      data => {
        formValue._id = uuid.v4();
        for (const key in data) { if (data.hasOwnproperty(key)) {
          const item = data[key];
          if (formValue.email === item.email) {
            formValue._id = item._id;
          }
        }}
        // alert('addAgent() formValue:' + JSON.stringify(formValue));
        this.agentService.addAgent(formValue).subscribe(
          res => {
            const newAgent = res.json();
            // alert('addAgent() newAgent:' + JSON.stringify(newAgent));
            this.agents.push(newAgent);
            this.addAgentForm.reset();
            this.toastMessage(newAgent.name + ' added successfully.', 'success');
          },
          error => console.log(error)
        );
      },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  enableEditing(agent) {
    this.isEditing = true;
    this.agent = agent;
  }

  cancelEditing() {
    this.isEditing = false;
    this.agent = {
      _id: null,
      id: null,
      type: '',
      name: '',
      nickname: '',
      email: '',
      homepage: ''
    };
    this.toastMessage('item editing cancelled.', 'warning');
    // reload the agents to reset the editing
    this.getAgents(this.currentUser);
  }

  editAgent(agent) {
    this.agentService.editAgent(agent).subscribe(
      res => {
        this.isEditing = false;
        // shasum.update(this.email);
        // agent.email_sha1 = '';// shasum.digest('hex');
        this.agent = agent;
        this.toastMessage(agent.name + ' edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteAgent(agent) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.agentService.deleteAgent(agent).subscribe(
        res => {
          const pos = this.agents.map(elem => { return elem._id; }).indexOf(agent._id);
          this.agents.splice(pos, 1);
          this.toastMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

  toastMessage(message: string, action: string) {
    const
      options = {
        closeButton: true,
        positionClass: 'toast-bottom-center'
      };
    this.toast[action](message, action.toUpperCase(), options);
  }

}
