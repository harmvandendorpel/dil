import State from './state';
import { clone } from 'lodash';
import sha1 from 'sha1';

class App {

  remember(hash) {
    window.state.remember(hash);
    this.render();

    if (window.state.data.memory.length == 2) {
      const parents = clone(window.state.data.memory).sort();
      $.post(`/work/breed`, {
        parents,
        count: 5
      }).done(() => {
        setTimeout(() => {
          window.state.clearMemory();
        }, 500);
      });
    }
  }

  kill(hash) {
    // if (confirm('really?')) {
      $.post(`/api/delete/${hash}`).done(() => {
        const $work = $(`.work[data-hash='${hash}']`);
        $work.slideUp(() => {
          $work.remove();
        });
      });
    // }
  }
  
  render() {
    const $tools = $('<div></div>').addClass('tools');
    const $memory = $('<div></div>').addClass('memory');
    window.state.data.memory.forEach((hash) => {
      const $img = $('<img>')
        .attr('src', `/works/thumb/${hash}.jpg`)
        .addClass('work--icon work shadow work--remove-button')
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

    $('.btn-breed').bind('mousedown', (e) => {
      const hash = $(e.target).data().hash;
      this.remember(hash);
    });

    $('.btn-kill').bind('mousedown', (e) => {
      const $target = $(e.target);
      const hash = $target.data().hash;
      this.kill(hash);
    });
    
    this.render();
  }
}

new App();