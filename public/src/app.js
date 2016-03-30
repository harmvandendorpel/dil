import State from './state';

class App {

  remember(hash) {
    window.state.remember(hash);
    this.render();
  }
  
  render() {
    
  }
  
  constructor() {
    window.state = new State();

    $('.btn-remember').bind('mousedown', (e) => {
      const hash = $(e.target).data().hash;
      this.remember(hash);
    });
    
    this.render();
  }
}

new App();