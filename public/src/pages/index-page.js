import AbstractPage from './abstract-page';

export default class IndexPage extends AbstractPage {
  constructor() {
    super();
    $(window).bind('scroll', () => {
      this.updateLazyLoadedImages();
    });

    this.updateLazyLoadedImages();

    this.position();
  }

  updateLazyLoadedImages() {
    $('img[data-src]').each((index, image) => {
      this.loadImage($(image));
    });
  }

  loadImage($image) {
    const imageTop = $image.offset().top;
    // const imageHeight = $image.height();
    const windowHeight = $(window).height();
    const scrollTop = $(window).scrollTop();

    if (imageTop < windowHeight + scrollTop) {
      $image.prop('src', $image.data().src);
    }
  }
}