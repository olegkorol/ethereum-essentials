// first we'll require web3
var Web3 = require('web3');

// next we'll create a new instance of web3.
var web3 = new Web3('ws://localhost:8546');

// import the ABI
const abi = require('./MillionEther_abi.json');

const mepAddress =
  '0x51b354b256d6edae9c50a8bd43d4f019dcd4da9a';

var mep = new web3.eth.Contract(abi, mepAddress);

function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    let imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    let data = imageData.data;
    console.log(canvas.width, canvas.height, data.length);

    function writePixelWithEvent(event) {
      let { x, y, color } = event.returnValues;
      writePixel(
        parseInt(x),
        parseInt(y),
        parseColor(color)
      );
    }

    function parseColor(rawColor) {
      let rgb = [];
      for (let i = 0; i < rawColor.length; i += 2) {
        let chunk = rawColor.substring(i, i + 2);
        if (chunk !== '0x') {
          rgb.push(parseInt(chunk, 16).toString(10));
        }
      }
      return rgb;
    }

    function writePixel(x, y, color) {
      // console.log(x, y, color);
      let data = imageData.data;

      let columns = canvas.width;
      let rows = canvas.height;

      console.log('color:', color[0], color[1], color[2])

      let i = (y * columns + x) * 4;
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = 255; // alpha

      ctx.putImageData(imageData, 0, 0);
    }

    mep.getPastEvents(
      'pixelChanged',
      {
        fromBlock: 800
        // toBlock: 1200
      },
      function(error, events) {
        events.map(e => writePixelWithEvent);
      }
    );

    mep.events.pixelChanged(
      {
        fromBlock: 0
      },
      function(error, event) {
        writePixelWithEvent(event);
      }
    );
  }
}

document.body.onload = function() {
  draw();
};

