export default class DetailPage {

  constructor() {
    this.initCurrent();
    this.initParents();
    this.initSiblings();
    this.initChildren();

    $(window).resize(() => this.position());
    $('.slides-container').fullpage({
      afterRender: () => this.position(),
      onLeave: () => {
        $('body').trigger('fakescroll');
      }
    });
  }
  
  initCurrent() {
    this.$currentSection = $('.section--current');
    this.$workTitle   = this.$currentSection.find('.full-image-title').show();
    this.$parentLeft  = this.$currentSection.find('.link-to-parent.left').show();
    this.$parentRight = this.$currentSection.find('.link-to-parent.right').show();
    this.$tools       = this.$currentSection.find('.work__tools');
  }

  initParents() {
    this.$parentsSection = $('.section--parents');
    this.$parents = this.$parentsSection.find('.work--medium');

    // this.$parents.bind('click touch', (e) => {
    //   const hash = $(e.currentTarget).data().hash;
    //   location.href = `/language/${hash}`;
    // });
  }

  initSiblings() {
    this.$siblingsSection = $('.section--siblings');
    this.$siblingsTitle = this.$siblingsSection.find('.siblings-title');
    this.$siblingsItems = this.$siblingsSection.find('.siblings__items');
  }

  initChildren() {
    this.$childrenSection = $('.section--children');
    this.$childrenTitle = this.$childrenSection.find('.children-title');
    this.$childrenItems = this.$childrenSection.find('.children__items');
  }

  positionTitle() {
    const pos = (this.$currentSection.width() - this.$currentSection.height()) / 2 - this.$workTitle.width() / 2 - this.$workTitle.height() / 2;

    this.$workTitle.css({
      right: pos
    });
  }

  positionTools() {
    const workWidth = $(window).width();
    this.$tools.css({
      right: (workWidth - this.$currentSection.height()) / 2
    });
  }

  positionParentLinks() {
    const workWidth = $(window).height(); // this is not an error

    this.$parentLeft.css({
      left: (this.$currentSection.width() - workWidth) / 4 - this.$parentLeft.width()/2
    });

    this.$parentRight.css({
      right: (this.$currentSection.width() - workWidth) / 4 - this.$parentRight.width()/2
    });
  }

  positionCurrent() {
    this.positionTitle();
    this.positionTools();
    this.positionParentLinks();
  }

  positionSiblings() {
    if (!this.$siblingsTitle.length) return;
    this.$siblingsTitle.css({
      top: this.$siblingsItems.position().top/2 
    });
  }

  positionChildren() {
    if (!this.$childrenTitle.length) return;
    this.$childrenTitle.css({
      top: this.$childrenItems.position().top/2
    });
  }

  // scrollToSection(section) {
  //   console.log('scroll to', section);
  //   $.fn.fullpage.silentMoveTo(section);
  // }

  position() {
    this.positionCurrent();
    this.$parents.height(this.$parents.width());
    this.positionSiblings();
    this.positionChildren();
  }
}