import sha1 from 'sha1';
import Work from './models/work';
import { WorkImageStatus } from './const/const';

export function saveOrganism(title, chromosome, parents = []) {
  const work = new Work();
  const hash = sha1(chromosome);
  
  work.title = title;
  work.hash = hash;
  work.chromosome = chromosome;
  work.filename = `${hash}.jpg`;
  work.parents = parents;
  work.ts = new Date().getTime();
  
  return new Promise((resolve, reject) => {
    work.save(function(err) {
      resolve(err);
    });
  });
}

function makeNewChromosome(parents) {
  let result = '';
  if (parents[0].length !== parents[1].length) {
    throw "chromosome lengths do not match";
  }

  for (let i = 0; i < parents[0].length;i++) {
    const gen1 = parents[0].charAt(i);
    const gen2 = parents[1].charAt(i);
    result += Math.random() > 0.5 ? gen1 : gen2;
  }

  return result;
}

export function breed(parents, count) {
  parents.sort();

  return new Promise((resolve) => {

    Work.find({
      hash:  {$in:parents}
    }).exec(function (err, docs) {
      let newOrganismPromises = [];

      for (let i = 0; i < count; i++) {
        const newChromosome = makeNewChromosome(docs.map((doc) => doc.chromosome));
        newOrganismPromises.push(saveOrganism('Untitled', newChromosome, parents));
      }

      Promise.all(newOrganismPromises).then(() => {
        resolve();
      });
    });
  });
}