/* eslint no-underscore-dangle: off */

'use strict';

const events = require('events');
const util = require('util');
const CBuffer = require('CBuffer');
const byline = require('byline');
const fst = require('fs-tail-stream');

function Tail(path, opts) {
  events.EventEmitter.call(this);

  const options = opts || {
    buffer: 0
  };
  this._buffer = new CBuffer(options.buffer);

  if (path[0] === '-') {
    byline(process.stdin,{ keepEmptyLines: true }).on('data', (line) => {
      const str = line.toString();
      this._buffer.push(str);
      this.emit('line', str);
    });
  } else {
    const tail = fst.createReadStream(path.join(), {
      encoding: 'utf8',
      start: 80,
      tail: true
    });

    //TODO: watch for truncation and empty buffer

    //TODO: watch ifor file disaperance and handle it as error

    byline(tail, { keepEmptyLines: true }).on('data', (line) => {
      const str = line.toString();
      this._buffer.push(str);
      this.emit('line', str);
    });
  }
}
util.inherits(Tail, events.EventEmitter);

Tail.prototype.getBuffer = function getBuffer() {
  return this._buffer.toArray();
};

module.exports = (path, options) => new Tail(path, options);
