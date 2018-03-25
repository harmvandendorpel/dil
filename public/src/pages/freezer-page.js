import AbstractPage from './abstract-page';

export default class DetailPage extends AbstractPage {
  constructor() {
    super();
    this.position();
    $('*[data-href]').bind('mouseup touchend', (e) => {
      const href = $(e.currentTarget).data().href;
      location.href = href;
    });
  }

  position() {
    const $tools = $('.work__tools');
    const $imageContainer = $('.freezer--image-container');
    console.log($imageContainer);
    const workWidth = $imageContainer.width();
    const workHeight = $imageContainer.height();

    if (workWidth > workHeight) {
      $tools.css({
        top: 0,
        right: (workWidth - workHeight) / 2
      });
    } else {
      $tools.css({
        top: (workHeight - workWidth) / 2,
        right: 0
      });
    }
  }
}
