import State from './state';
import { clone } from 'lodash';
import sha1 from 'sha1';

class App {

  remember(hash) {
    window.state.remember(hash);
    this.render();

    if (window.state.data.memory.length == 2) {
      const parents = clone(window.state.data.memory).sort();
      $.post(`/api/breed`, {
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
  
  freeze(hash, frozen) {
    $.ajax({
      url: `/api/freeze/${hash}`,
      method: frozen ? 'post' : 'delete'
    }).done(() => {
      console.log(hash, frozen)
    });
  }
  
  rerender(hash) {
    $.ajax({
      url: `/api/rerender/${hash}`,
      method: 'post'
    }).done(() => {
      
    });
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
  
    $('.btn-rerender').bind('mousedown', (e) => {
      const hash = $(e.target).data().hash;
      this.rerender(hash);
    });

    $('.btn-kill').bind('mousedown', (e) => {
      const $target = $(e.target);
      const hash = $target.data().hash;
      this.kill(hash);
    });
  
    $('.btn-link').bind('mousedown', (e) => {
      const link = $(e.target).data().link;
      location.href=link;
    });
    
    $('.btn-freeze').bind('mousedown', (e) => {
      const $sender = $(e.target);
      const data = $sender.data();
      const hash = data.hash;
      const frozen = data.frozen
      this.freeze(hash, frozen)
      $sender.fadeOut();
    });
  
    this.render();
  }
}

new App();