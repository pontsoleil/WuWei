import * as uuid from 'uuid';

export class Agent {
  _id: uuid;
  id: string;
  type: string;
  name: string;
  nickname?: string;
  email?: string;
  homepage?: string;
  creator_ref?: uuid;
  created?: Date;
  modifier_ref?: uuid;
  modified?: Date;
  generator_ref?: uuid;
  generated?: Date;

  constructor(id, type, name) {
    this._id = uuid.v4();
    this.id = id;
    this.name = name;
    this.type = type;
  }
}
