import State from './state';

class App {

  remember(hash) {
    window.state.remember(hash);
    this.render();
  }
  
  render() {
    const $tools = $('<div></div>').addClass('tools');
    const $memory = $('<div></div>').addClass('memory');

    window.state.data.memory.forEach((hash) => {
      const $img = $('<img>')
        .attr('src', `/works/thumb/${hash}.jpg`)
        .addClass('work-thumb work shadow');
      $memory.append($img);
    });

    $tools.append($memory);

    $('.tools-container').html($tools.html());
  }
  
  constructor() {
    window.state = new State();
    window.state.on('change', () => {
      this.render();
    });

    $('.btn-remember').bind('mousedown', (e) => {
      const hash = $(e.target).data().hash;
      this.remember(hash);
    });
    
    this.render();
  }
}

new App();