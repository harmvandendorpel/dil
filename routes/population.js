import Work from '../models/work';
import { saveOrganism } from '../organisms';
import {
  render,
  randomWork,
  auth
} from '../helpers/helpers';

export default function (router) {
  router.get('/', (req, res) => {
    Work
      .find({ enabled: true })
      .sort({ ts: -1 })
      .exec((err, works) => {
        render('pages/index', {
          script: 'IndexPage',
          title: 'Death Imitates Language',
          metaDescription: 'A speculative genealogy exploring the emergence of meaning in generative aesthetics using micro feedback and a genetic algorithm. By Harm van den Dorpel, 2016.',
          works
        }, req, res);
      });
  });

  router.get('/images/:size/random.jpg', (req, res) => {
    const size = req.params.size;
    randomWork(size, req, res);
  });

  router.post('/work/new', (req, res) => {
    if (!auth(req, res)) return;

    const chromosome = req.body.chromosome;
    const parents = req.body.parents || [];

    saveOrganism(chromosome, parents).then(
      err => res.send({
        status: 'ok',
        chromosome,
        err
      }),
      err => res.send(err)
    );
  });
}
