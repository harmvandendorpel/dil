import { clone } from 'lodash';

import State from './State';
import IndexPage from './pages/IndexPage';
import DetailPage from './pages/DetailPage';
import MoreInfo from './MoreInfo';
import { touchDown } from './events';
class App {

  remember(hash) {
    window.state.remember(hash);
    this.render();

    if (window.state.data.memory.length == 2) {
      const parents = clone(window.state.data.memory).sort();
      this.breed(parents, 9).then(() => {
        window.state.clearMemory();
      });
    }
  }

  breed(parents, count) {
    return new Promise(resolve => {
      console.log(parents);
      resolve();
      $.post(`/api/breed`, {
        parents,
        count
      }).done(() => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    });
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
        .bind(touchDown, (e) => {
          const hash = $(e.target).data().hash;
          window.state.forget(hash);
        });

      $memory.append($img);
    });

    $tools.append($memory);

    $('.tools-container').html('');
    $('.tools-container').append($tools);
  }

  requestMoreInfo(hash, $sender) {
    new MoreInfo(hash, $sender);
  }

  initRouter() {
    const router = new Router();

    router.on('route:showWork', () => {
    });

    router.on('route:showChildren', ()  => {
    });

    router.on('route:showSiblings', () => {
    });

    Backbone.history.start({
      pushState: true
      // silent: true
    });
  }
  
  constructor() {
    window.state = new State();
    window.state.on('change', () => this.render());

    $('.btn-more-info').bind(touchDown, (e) => {
      e.preventDefault();
      const $sender = $(e.target);
      const hash = $sender.data().hash;
      this.requestMoreInfo(hash, $sender);
      return false;
    });

    $('.btn-breed').bind(touchDown, (e) => {
      const hash = $(e.target).data().hash;
      this.remember(hash);
    });
  
    $('.btn-rerender').bind(touchDown, (e) => {
      const hash = $(e.target).data().hash;
      this.rerender(hash);
    });

    $('.btn-kill').bind(touchDown, (e) => {
      const $target = $(e.target);
      const hash = $target.data().hash;
      this.kill(hash);
    });

    $('.btn-add-sibling').bind(touchDown, (e) => {
      const $target = $(e.target);
      const parents = [
        $target.data().parent1,
        $target.data().parent2
      ].sort();

      this.breed(parents, 1);
    });

    $('.btn-link').bind(touchDown, (e) => {
      const link = $(e.target).data().link;
      location.href=link;
    });
    
    $('.btn-freeze').bind(touchDown, (e) => {
      const $sender = $(e.target);
      const data = $sender.data();
      const hash = data.hash;
      const frozen = data.frozen;
      this.freeze(hash, frozen);
      $sender.fadeOut();
    });

    this.render();
    
    if (window.pageClass) {
      switch (window.pageClass) {
        case 'IndexPage':
          new IndexPage();
          break;
        case 'DetailPage':
          new DetailPage();
          break;
      }
    }
  }
}

$(document).ready(() => {
  new App();
});
