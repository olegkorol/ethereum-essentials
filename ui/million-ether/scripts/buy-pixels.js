const getPixels = require('get-pixels');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

let imagePath = process.argv[2];
let xPos = parseInt(process.argv[3]);
let yPos = parseInt(process.argv[4]);
console.log(imagePath, xPos, yPos);

// node scripts/buy-pixels.js resourhelmet-mario-running.gif 700 450

const abi = require('../src/MillionEther_abi.json');
const mepAddress =
  '0x51b354b256d6edae9c50a8bd43d4f019dcd4da9a';
const mep = new web3.eth.Contract(abi, mepAddress);

const fromAccount =
  '0x586ff73108a2a8d86f55186c9ef416e6f216a293';

function dec2hex(dec) {
  return ('00' + parseInt(dec, 10).toString(16)).slice(-2);
}

getPixels(imagePath, function(err, pixels) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  let [
    width,
    height,
    channels
  ] = pixels.shape.slice();
  console.log(
    `Shape: ${width}x${height} (${width * height} total)`
  );

  console.log('I got some pixels:', pixels.shape.slice());
  console.log('pixels.shape', width, height, channels);

  async function sendPixels() {
    let promises = [];
    let i = 0;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let r = pixels.get(0, x, y, 0);
        let g = pixels.get(0, x, y, 1);
        let b = pixels.get(0, x, y, 2);

        console.log(x, y, ['0x', dec2hex(r), dec2hex(g), dec2hex(b)].join(''));

        let resp = mep.methods
          .colorPixel(
            xPos + x,
            yPos + y,
            ['0x', dec2hex(r), dec2hex(g), dec2hex(b)].join('')
          )
          .send({
            from: fromAccount
          });
        promises.push(resp);

        if (i > 0 && i % 640 == 0) {
          await Promise.race(promises);
          promises = [];
        }

        i++;
      }
    }
  }
  sendPixels().then(() => console.log('Done'));
});
