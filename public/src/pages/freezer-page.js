import AbstractPage from './abstract-page';

export default class DetailPage extends AbstractPage {
  constructor() {
    super();
    this.position();
  }

  position() {
    const $tools = $('.work__tools');
    const $imageContainer = $('.freezer--image-container');
    console.log($imageContainer);
    const workWidth = $imageContainer.width();
    const workHeight = $imageContainer.height();

    $tools.css({
      right: (workWidth - workHeight) / 2
    });
  }
}
