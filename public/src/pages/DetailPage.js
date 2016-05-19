export default class DetailPage {

  constructor() {
    this.initCurrent();
    this.initParents();
    this.initSiblings();

    $(window).resize(() => this.position());
    $('.slides-container').fullpage({
      afterRender: () => this.position()
    });
  }

  initCurrent() {
    this.$currentSection = $('.section--current');
    this.$workTitle   = this.$currentSection.find('.full-image-title').show();
    this.$parentLeft  = this.$currentSection.find('.link-to-parent.left').show();
    this.$parentRight = this.$currentSection.find('.link-to-parent.right').show();
  }

  initParents() {
    this.$parentsSection = $('.section--parents');
    this.$parents = this.$parentsSection.find('.work--medium');
    this.$parentTitles = this.$parentsSection.find('.title--parent');

    this.$parents.bind('click touch', (e) => {
      const hash = $(e.currentTarget).data().hash;
      location.href = `/language/${hash}`;
    });
  }

  initSiblings() {
    this.$siblingsSection = $('.section--siblings');
    this.$siblingsTitle = this.$siblingsSection.find('.siblings-title');
    this.$siblingsItems = this.$siblingsSection.find('.siblings__items');
  }

  positionTitle() {
    const pos = (this.$currentSection.width() - this.$currentSection.height()) / 2 - this.$workTitle.width() / 2 - this.$workTitle.height() / 2;

    this.$workTitle.css({
      right: pos
    });
  }

  positionParentLinks() {
    const workWidth = $(window).height();

    this.$parentLeft.css({
      left: (this.$currentSection.width() - workWidth) / 4 - this.$parentLeft.width()/2
    });

    this.$parentRight.css({
      right: (this.$currentSection.width() - workWidth) / 4 - this.$parentRight.width()/2
    });
  }

  positionParentsTitles() {
    this.$parentTitles.css({
      paddingTop:this.$parents.width() + this.$parentTitles.height()
    });
  }

  positionCurrent() {
    this.positionTitle();
    this.positionParentLinks();
  }

  positionParents() {
    this.positionParentsTitles();
  }

  positionSiblings() {
    console.log(this.$siblingsItems.position().top);
    this.$siblingsTitle.css({
      top: this.$siblingsItems.position().top/2 
    });
  }

  position() {
    this.positionCurrent();
    this.positionParents();
    this.positionSiblings();
  }
}