import sharp from 'sharp';

const WORK_PATH = 'public/works';

export default function saveWorkImage(req) {
  return new Promise((resolve) => {

    const { chromosome, hash, image } = req.body;

    const inputFullFilename  = `${WORK_PATH}/full/${hash}.jpg`;
    const mediumFullFilename = `${WORK_PATH}/medium/${hash}.jpg`;
    const thumbFullFilename  = `${WORK_PATH}/thumb/${hash}.jpg`;

    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");

    require("fs").writeFile(inputFullFilename, base64Data, 'base64', function(err) {

      sharp(inputFullFilename)
        .resize(900, 900)
        .quality(80)
        .toFile(mediumFullFilename, function (err) {
          sharp(inputFullFilename)
            .resize(450, 450)
            .quality(80)
            .toFile(thumbFullFilename, function (err) {

              resolve({
                hash,
                chromosome
              });

            });
        });
    });
  });
}
