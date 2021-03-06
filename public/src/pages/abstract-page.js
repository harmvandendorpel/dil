export default class AbstractPage {
  constructor() {
    $(window).resize(() => this.position());
  }

  position() {}

  isMobile() {
    return $(window).width() > 320 && $(window).width() < 480;
  }
}
