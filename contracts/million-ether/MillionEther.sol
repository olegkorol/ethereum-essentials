pragma solidity ^0.4.18;

contract MillionEther {
  bytes3[1000][1000] public pixels;
  event pixelChanged(
      uint x,
      uint y,
      bytes3 color
      );

  function colorPixel(uint x, uint y, bytes3 color) public {
    pixels[x][y] = color;
    pixelChanged(x, y, color);
  }
}