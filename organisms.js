import sha1 from 'sha1';
import fs from 'fs';
import Work from './models/work';

export function getNames(callback) {
  console.log('organism getNames');
  fs.readFile('data/unique.txt', 'utf8', (err, contents) => {
    const lines = contents.split('\n');
    callback(lines);
  });
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function generateName(names, chromosome) {
  const chromosomeNumber = parseInt(chromosome, 2);
  return toTitleCase(names[chromosomeNumber % names.length]);
}

export function saveOrganism(chromosome, parents = []) {
  const work = new Work();
  const hash = sha1(chromosome);

  work.hash = hash;
  work.chromosome = chromosome;
  work.filename = `${hash}.jpg`;
  work.parents = parents;
  work.ts = new Date().getTime();

  console.log('new work...');
  return new Promise((resolve) => {
    console.log('getNames');
    getNames((names) => {
      console.log('generateName...');
      work.title = generateName(names, chromosome);
      console.log(work.title);
      work.save(err => resolve(err));
    });
  });
}

function makeNewChromosome(parents) {
  if (parents[0].length !== parents[1].length) {
    throw new Error('chromosome lengths do not match');
  }

  let result = '';

  for (let i = 0; i < parents[0].length; i += 1) {
    const gene1 = parents[0].charAt(i);
    const gene2 = parents[1].charAt(i);
    result += Math.random() > 0.5 ? gene1 : gene2;
  }

  return result;
}

export function breed(parents, count) {
  parents.sort();

  return new Promise((resolve) => {
    Work.find({
      hash: { $in: parents }
    }).exec((err, docs) => {
      const newOrganismPromises = [];

      for (let i = 0; i < count; i += 1) {
        const newChromosome = makeNewChromosome(docs.map(doc => doc.chromosome));
        newOrganismPromises.push(saveOrganism(newChromosome, parents));
      }

      Promise.all(newOrganismPromises).then(() => {
        resolve();
      });
    });
  });
}
