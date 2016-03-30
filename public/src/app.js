import State from './state';
import { clone } from 'lodash';

class App {

  remember(hash) {

    window.state.remember(hash);
    this.render();

    if (window.state.data.memory.length == 2) {
      setTimeout(function () {
        const pair = clone(window.state.data.memory).sort();
        location.href = `/breed/${pair[0]}/${pair[1]}`;
        window.state.clearMemory();
      },500);
    }
  }
  
  render() {
    const $tools = $('<div></div>').addClass('tools');
    const $memory = $('<div></div>').addClass('memory');
    window.state.data.memory.forEach((hash) => {
      const $img = $('<img>')
        .attr('src', `/works/thumb/${hash}.jpg`)
        .addClass('work-thumb work shadow')
        .attr('data-hash', hash)
        .bind('mousedown', (e) => {
          const hash = $(e.target).data().hash;
          window.state.forget(hash);
        });

      $memory.append($img);
    });

    $tools.append($memory);

    $('.tools-container').html('');
    $('.tools-container').append($tools);
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