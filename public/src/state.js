import { uniq, findIndex } from 'lodash';
import EventEmitter from 'events';
const LOCALSTORAGE_ID = 'DIL';


export default class State extends EventEmitter {
  
  remember(hash) {
    this.data.memory.push(hash);
    this.data.memory = uniq(this.data.memory);
    this.persist();
  }

  forget(hash) {
    const indexToDelete = findIndex(this.data.memory, (el) => {
      return el === hash;
    });

    this.data.memory.splice(indexToDelete, 1);
    this.persist();
  }

  persist() {
    localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(this.data));
    this.emit('change');
  }

  load() {
    const ls = localStorage.getItem(LOCALSTORAGE_ID);
    if (ls) {
      this.data = JSON.parse(localStorage.getItem(LOCALSTORAGE_ID));
    } else {
      this.data =  {
        memory: []
      };
      this.persist();
    }
    console.log(this.data);
  }

  constructor() {
    super();
    this.load();
  }
}