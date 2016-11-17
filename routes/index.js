import population from './population';
import about from './about';
import API from './api';
import detailPage from './detail';
import dissect from './dissect';
import render from './render';
import freezer from './freezer';

export default function (router) {
  population(router);
  about(router);
  API(router);
  detailPage(router);
  dissect(router);
  render(router);
  freezer(router);
}
