import { each } from 'lodash';
import templateWindow from './templates/work-info-window.handlebars';
import templateContent from './templates/work-info-content.handlebars';

export default class MoreInfo {

  constructor(hash, $sender) {
    MoreInfo.instanceNumber = MoreInfo.instanceNumber === undefined ? 0: MoreInfo.instanceNumber + 1;
    this.namespace = `MoreInfo${MoreInfo.instanceNumber}`;
    if (MoreInfo.instance) {
      MoreInfo.instance.destructor();
    }
    MoreInfo.instance = this;

    this.hash = hash;
    this.$sender = $sender;
    this.$element = $(templateWindow());
    this.$content = this.$element.find('.more-info__content');

    $('body').append(this.$element);
    this.$element.css({opacity:0});
    const $arrow = this.$element.find('.more-info-arrow');
    const arrowOffset = $arrow.offset();
    const senderOffset = $sender.offset();
  
    this.$tools = $sender.closest('.work__tools');
    this.$tools.addClass('active');
    this.$sender.addClass('active');

    this.initClickOutside();

    this.$element.css({
      left: senderOffset.left - arrowOffset.left - 5,
      top: senderOffset.top + $sender.height() + $arrow.height()
    });

    this.loadContent();
  }

  loadContent() {
    $.ajax({
      url: this.url()
    }).done((data) => {
      this.$content.html(templateContent(data));
      this.$element.css({opacity:1});
    })
  }
  url() {
    return `/api/work/${this.hash}`;  
  }
  
  namespaceEvent(eventname) {
    return `${eventname}.${this.namespace}`;
  }

  initClickOutside() {
    this.outsideEvents = [
      this.namespaceEvent('mousedown'),
      this.namespaceEvent('touchstart')
    ];

    $('body').one('fakescroll', () => this.destructor());
    $(window).one(this.namespaceEvent('resize'), () => this.destructor());

    $('body').bind(this.outsideEvents.join(' '), (e) => {
      e.preventDefault();
      if (!this.$element[0].contains(e.target)) this.destructor();
      return false;
    });
  }

  destructor() {
    each(this.outsideEvents, (event) => {
      $('body').off(event);
    });
    //$('body').off(this.namespaceEvent('fakescroll'));
    $(window).off(this.namespaceEvent('resize'));
    this.$element.remove();
    this.$tools.removeClass('active');
    this.$sender.removeClass('active');
    MoreInfo.instance = null;
  }
}