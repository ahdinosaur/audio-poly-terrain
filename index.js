var through = require('through2')
var ndarray = require('ndarray')
var readAudio = require('read-audio')
var frequencies = require('ndsamples-frequencies/stream')
var hop = require('ndarray-hop/stream')
var rms = require('node-audio-rms')
var createScene = require('gl-plot3d')
var createSurfacePlot = require('gl-surface3d')

var opts = {
  buffer: 256,
  channels: 1
}

var scene = createScene()
var surface = createSurfacePlot({
  gl: scene.gl,
  field: ndarray([], [opts.buffer, opts.channels]),
  contourProject: true
})
scene.add(surface)

// get audio
readAudio({
  buffer: opts.buffer,
  channels: opts.channel
}, function (err, stream) {
  if (err) { throw err }

  stream
  // extrude samples through time
  .pipe(hop({
    frame: { shape: [opts.buffer * 4, opts.channels] },
    hop: { shape: [opts.buffer, opts.channels]}
  }))
  // split audio into frequencies
  .pipe(frequencies())
  // extrude samples through time
  .pipe(hop({
    frame: { shape: [opts.buffer * 4, opts.buffer] },
    hop: { shape: [opts.buffer, opts.buffer]}
  }))
  // format to 3d alpha
  // apply rainbow colors
  .pipe(through.obj({
    highWaterMark: 1,
  }, function (frame, enc, cb) {
    //console.log("frame", frame)
    surface.update({
      field: frame
    })
    cb()
  }))
})
