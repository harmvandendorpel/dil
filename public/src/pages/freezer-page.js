import AbstractPage from './abstract-page';

export default class DetailPage extends AbstractPage {

  constructor() {
    super();

    this.$currentSection = $('.section--current');
    // this.$workTitle = this.$currentSection.find('.full-image-title').show();
    this.$tools = this.$currentSection.find('.work__tools');

    // $('.slides-container').fullpage({
    //   afterRender: () => this.position(),
    //   onLeave: () => {
    //     $('body').trigger('fakescroll');
    //   }
    // });
  }

  positionTitle() {
    // if (this.isMobile()) {
    //   const pos = this.$currentSection.width() / 2;
    //   this.$workTitle.css({
    //     right: 'auto',
    //     width: '100%',
    //     marginTop: pos
    //
    //   }).removeClass('rotate-90');
    // } else {
    //   const pos =
    //     (this.$currentSection.width() - this.$currentSection.height()) / 2 -
    //     this.$workTitle.width() / 2 - this.$workTitle.height() / 2;
    //
    //   this.$workTitle.css({
    //     right: pos,
    //     marginTop: 0
    //   }).addClass('rotate-90');
    // }
  }

  positionTools() {
    const workWidth = $(window).width();
    this.$tools.css({
      right: (workWidth - this.$currentSection.height()) / 2
    });
  }

  position() {
    this.positionTitle();
    this.positionTools();
  }
}
