export default class IndexPage {
  
  constructor() {
    $(window).bind('scroll', () => {
      this.updateLazyLoadedImages();
    });

    this.updateLazyLoadedImages();
  }

  updateLazyLoadedImages() {
    $('img[data-src]').each((index, image)=> {
      const $image = $(image);
      this.loadImage($image);
    })
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