import Backbone from 'backbone';

export default class Router extends Backbone.Router {
  get routes() {
    return {
      'language/:hash/children(/)': 'showChildren',
      'language/:hash/siblings(/)': 'showSiblings',
      'language/:hash(/)': 'showWork'
    };
  }
}
