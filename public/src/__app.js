import $ from 'jquery';
import { shuffle, filter, each, map, sortBy } from 'lodash';
import Data from './Data';

window.$ = window.jQuery = $;
const speed = 1;
const SPEEDUNIT = 3500;
const CSS_TRANSFORM_DURATION = 750;

let backgroundColor = null;
let data = null;
let failImage = null;
let pulseTimeoutId = null;
const pulseTimeout = 15000;

function pulse() {
  console.log('pulse');
  if (pulseTimeoutId) {
    clearTimeout(pulseTimeoutId);
  }

  pulseTimeoutId = setTimeout(() => {
    location.href = location.href;
  }, pulseTimeout);
}

function getRandomParents() {
  window.state.currentParents = data.randomParents();
  window.state.currentFullWork = window.state.currentParents[Math.round(Math.random())];
}

function imagePath(filename) {
  // return `works/${filename}`;
  return `works/full/${filename}`;
}

function loadImage(filename) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      pulse();
      console.log(`...load success ${filename}`);
      resolve(image);
    };

    image.onerror = () => {
      console.error(`...load failed ${filename}`, failImage);
      const clonedImage = $(failImage).clone()[0];
      setTimeout(() => {
        resolve(clonedImage);
      }, 100);
    };

    image.crossOrigin = 'Anonymous';
    image.src = imagePath(filename);
  });
}

function createCountdown($el, duration) {
  const $spinner = $('<div></div>').pietimer({
    timerSeconds: duration / 1000,
    color: 'white',
    fill: false,
    showPercentage: false,
    callback: function() {
      console.log("yahoo, timer is done!");
      $('#timer').pietimer('reset');
    }
  })

  $el.append($spinner);
  setTimeout(() => {
    $spinner.remove()
  }, duration)
}

function setBackgroundColor(col) {
  const dimmed = map(col, c => parseInt(c * 0.75, 10));
  backgroundColor = `rgb(${dimmed[0]},${dimmed[1]},${dimmed[2]})`;
  $('body').css({
    backgroundColor
  });
}

function actionShowFullTitle() {
  pulse();
  const work = window.state.currentFullWork;
  window.state.$fullTitle = $workTitle(work);
  $('body').append(window.state.$fullTitle);
  setTimeout(() => {
    window.state.$fullTitle.remove();
    actionScaleFullToParent();
  }, SPEEDUNIT / speed * 2);
}

function actionLoadRandomFull() {
  pulse();
  getRandomParents();

  const work = window.state.currentFullWork;
  loadImage(work.filename).then((image) => {
    const colorThief = new window.ColorThief();
    if (image && image.width > 0) {
      setBackgroundColor(colorThief.getColor(image));
    } else {
      console.log('error reading image for color');
    }

    window.state.$mainImage = $(image);
    window.state.$mainImage.addClass('work__full').addClass('work__full--hidden');
    $('body').append(window.state.$mainImage);

    setTimeout(() => {
      window.state.$mainImage.removeClass('work__full--hidden');
      if (window.state.$mainWorkMessage) {
        window.state.$mainWorkMessage.remove();
        window.state.$mainWorkMessage = null;
      }
    }, 50);
  });

  setTimeout(() => actionShowFullTitle(), SPEEDUNIT * 2 / speed);
}

function actionSearchingForMainWork() {
  pulse();
  const wait = SPEEDUNIT * 0.5 / speed;
  setBackgroundColor([0, 0, 0]);
  window.state.$mainWorkMessage = $mainWorkMessage('');
  createCountdown(window.state.$mainWorkMessage, wait);
  $('body').append(window.state.$mainWorkMessage);

  setTimeout(() => actionLoadRandomFull(), wait);
}

function actionSearchingPartner() {
  pulse();
  const wait = parseInt(SPEEDUNIT / speed * 0.5 / 1000, 10) * 1000;
  const work = window.state.currentFullWork;
  window.state.$searchingPartnerMsg = $partnerMessage('');
  $('body').append(window.state.$searchingPartnerMsg);
  createCountdown(window.state.$searchingPartnerMsg, wait);
  window.state.partner = data.findPartner(work);

  setTimeout(() => {
    if (window.state.partner === undefined) {
      window.state.currentParents = [];
      actionNoPartnerFound();
    } else {
      window.state.currentParents = [window.state.partner, work];
      actionSearchingPartnerHide();
    }
  }, wait);
}

function actionScaleFullToParent() {
  pulse();
  transform(window.state.$mainImage, 'translate', '-25%,-25%');
  transform(window.state.$mainImage, 'scale', '0.5');

  setTimeout(() => {
    actionSearchingPartner();
  }, SPEEDUNIT / speed * 0.5);
}

function actionNoPartnerFound() {
  pulse();
  setBackgroundColor([0, 0, 0]);
  window.state.$searchingPartnerMsg.remove();
  window.state.$searchingPartnerMsg = null;
  window.state.$noPartnerFoundMessage = $partnerMessage('&times;');
  $('body').append(window.state.$noPartnerFoundMessage);

  setTimeout(() => {
    window.state.$mainImage.css({ opacity: 0 });
    window.state.$noPartnerFoundMessage.css({ opacity: 0 });

    setTimeout(() => {
      window.state.$noPartnerFoundMessage.remove();
      window.state.$noPartnerFoundMessage = null;
      window.state.$mainImage.remove();
      window.state.$mainImage = null;
      actionSearchingForMainWork();
    }, SPEEDUNIT / speed * 0.5);
  }, SPEEDUNIT / speed * 0.5);
}

function actionSearchingPartnerHide() {
  pulse();
  window.state.$searchingPartnerMsg.remove();
  window.state.$searchingPartnerMsg = null;
  createPartnerImage().then(() => {
    setTimeout(() => {
      actionShowPartnerImage();
    }, 100);
  });
}

function actionShowPartnerImage() {
  pulse();
  // window.state.$partnerImage.removeClass('work__partner--hidden');
  transform(window.state.$partnerImage, 'translate', '100%,0%');
  setTimeout(() => actionShowBreedingIcon(), SPEEDUNIT / speed);
}

function actionKillOffspring() {
  pulse();
  const childPopTime = CSS_TRANSFORM_DURATION;
  const kids = shuffle(window.state.kids);
  let index = 0;

  for (let i = 0; i < window.state.kids.length; i++) {
    const kid = kids[i];
    if (!kid.enabled) {
      setTimeout(() => {
        const $kid = $workByHash(kid.hash);
        if ($kid.length > 0) {
          transform($kid, 'scale', '0');
          setTimeout(() => $kid.remove(), CSS_TRANSFORM_DURATION);
        } else {
          console.warn('child not there yet');
        }
      }, index * childPopTime / speed);
      index++;
    }
  }

  setTimeout(() => actionHideParents(), (index + 1) * childPopTime / speed);
}

function actionShowOffspring() {
  pulse();

  const parents = window.state.currentParents;
  const childPopTime = CSS_TRANSFORM_DURATION;
  window.state.kids = data.getKids(parents);
  window.state.kids = shuffle(window.state.kids).slice(0, 6);
  const kidsCount = window.state.kids.length;

  const createChildrenPromises = [];
  for (let index = 0; index < kidsCount; index++) {
    createChildrenPromises.push(new Promise((resolve) => {
      setTimeout(() => {
        createChild(
          window.state.kids[parseInt(index, 10)],
          parseInt(index, 10)).then(() => resolve());
      }, index * childPopTime / speed);
    }));
  }

  Promise.all(createChildrenPromises).then(() => {
    setTimeout(() => {
      window.state.$breedingMessage.remove();
    }, (kidsCount + 2) * childPopTime / speed);

    setTimeout(() => actionKillOffspring(), (kidsCount + 6) * childPopTime / speed);
  });
}

function actionShowBreedingIcon() {
  pulse();

  const $breedingMessage = $('<div></div>').addClass('breeding-message');
  const $parent1 = $('<div></div>').addClass('breeding-message-parent').text(window.state.currentFullWork.title);
  const $icon = $('<div></div>').addClass('breeding-message-icon');
  const $parent2 = $('<div></div>').addClass('breeding-message-parent').text(window.state.partner.title);
  $breedingMessage.append($parent1);
  $breedingMessage.append($icon);
  $breedingMessage.append($parent2);
  window.state.$breedingMessage = $breedingMessage;
  $('body').append($breedingMessage);

  setTimeout(() => actionShowOffspring(), SPEEDUNIT / speed);
}

function transform($node, prop, value) {
  const currentTransform = $node.data('transform') || {};
  currentTransform[prop] = value;
  let transformString = '';
  for (const element in currentTransform) {
    transformString += ' ' + element + '(' + currentTransform[element] + ')';
  }

  $node.css({ transform: transformString });
  $node.data('transform', currentTransform);
}

function $workByHash(hash) {
  const selector = `*[data-hash='${hash}']`;

  const $result = $(selector);
  if ($result.length === 0) {
    console.error(` -- can not find ${selector} --`);
  }
  if ($result.length > 1) {
    console.error(' -- this should not happen! -- ');
  }
  return $result;
}

function actionHideParents() {
  pulse();

  window.state.$partnerImage.css({ opacity: 0 });
  window.state.$mainImage.css({ opacity: 0 });

  setTimeout(() => {
    window.state.$partnerImage.remove();
    window.state.$mainImage.remove();

    const kids = shuffle(window.state.kids);
    window.state.nextToSearchAPartnerFor = null;

    each(kids, (kid) => {
      kid.childrenCount = data.getKidsFromOneParent(kid).length;
    });

    const candidates = filter(kids, kid => kid.enabled);

    if (!candidates.length) {
      setBackgroundColor([0, 0, 0]);
      setTimeout(() => actionNoKidsAvailable(), SPEEDUNIT / speed);
      return;
    }

    const orderedCandidates = sortBy(candidates, candidate => -candidate.childrenCount);

    window.state.nextToSearchAPartnerFor = orderedCandidates[0];

    setTimeout(() => actionChildToAdult(), SPEEDUNIT / speed * 0.5);
  }, CSS_TRANSFORM_DURATION);
}

function actionNoKidsAvailable() {
  pulse();

  actionSearchingForMainWork();
}

function actionChildToAdult() {
  pulse();

  window.state.$mainImage = $workByHash(window.state.nextToSearchAPartnerFor.hash)
    .addClass('work__full')
    .removeClass('work__child');

  if (window.state.$mainImage.length === 0) {
    console.error(`could not find ${window.state.nextToSearchAPartnerFor.hash}`);
    return;
  }

  if (window.state.$mainImage.data().image && window.state.$mainImage.data().image.width > 0) {
    const colorThief = new window.ColorThief();
    setBackgroundColor(colorThief.getColor(window.state.$mainImage.data().image));
  } else {
    console.log('error reading image for color');
  }

  window.state.currentFullWork = window.state.nextToSearchAPartnerFor;
  $('.work__child').css({ opacity: 0 });
  setTimeout(() => $('.work__child').remove(), CSS_TRANSFORM_DURATION);

  transform(window.state.$mainImage, 'translate', '0,0');
  transform(window.state.$mainImage, 'scale', '1');

  setTimeout(() => actionShowFullTitle(), SPEEDUNIT / speed);
}

function createPartnerImage() {
  pulse();

  return new Promise((resolve) => {
    const partner = window.state.partner;
    loadImage(partner.filename).then((image) => {
      const colorThief = new window.ColorThief();
      if (
        image &&
        window.state.$mainImage[0] &&
        image.width > 0 &&
        window.state.$mainImage[0].width > 0
      ) {
        const colA = colorThief.getColor(image);
        const colB = colorThief.getColor(window.state.$mainImage[0]);

        setBackgroundColor([
          (colA[0] + colB[0]) / 2,
          (colA[1] + colB[1]) / 2,
          (colA[2] + colB[2]) / 2
        ]);
      } else {
        console.log('error reading image for color');
      }
      window.state.$partnerImage = $(image)
        .addClass('work__partner')
        .addClass('work__partner--hidden');
      $('body').append(window.state.$partnerImage);
      transform(window.state.$partnerImage, 'translate', '100%,-100%');
      resolve();
    });
  });
}

function createChild(work, index) {
  pulse();

  return new Promise((resolve) => {
    loadImage(work.filename).then((image) => {
      const $image = $(image);
      $image.data({ image });
      $('body').append($image);
      const cols = 3;
      const x = (index % cols) * 100 / cols;
      const y = (Math.floor(index / cols) + 1) * 100 / cols;

      $image
        .addClass('work__child')
        .attr({ 'data-hash': work.hash });

      transform($image, 'translate', `${x}vw,calc(100vh - ${y}vw)`);
      transform($image, 'scale', '1');

      setTimeout(() => {
        $image.css({ opacity: 1 });
      }, 50);

      resolve();
    });
  });
}

function $workTitle(work) {
  const fullName = data.makeFullName(work);
  const $caption = $('<div></div>')
      .addClass('work__caption')
      .text(fullName)
      .css({ top: $(window).width() + 5 });

  return $caption;
}

function $partnerMessage(text) {
  const size = $(window).width() / 2;
  const $message =
    $(`<div><div>${text}</div></div>`)
      .addClass('msg-searching-partner')
      .css({
        height: size
      });
  return $message;
}

function $mainWorkMessage(text) {
  const size = $(window).width();
  const $message =
    $(`<div><div>${text}</div></div>`)
      .addClass('msg-main-work')
      .css({
        height: size
      });
  return $message;
}

function init() {
  window.state = {};
  data = new Data();

  failImage = new Image();
  failImage.crossOrigin = 'Anonymous';
  failImage.onload = () => {
    data.load().then(() => actionSearchingForMainWork());
  };

  failImage.src = 'fail.jpg';
}

init();
