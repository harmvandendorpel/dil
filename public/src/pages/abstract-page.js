export default class AbstractPage {
  constructor() {
    console.log('x');
    $(window).resize(() => this.position());
    this.position();
  }

  position() {}

  isMobile() {
    return $(window).width() > 320 && $(window).width() < 480;
  }
}
