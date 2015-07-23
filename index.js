var readAudio = require('read-audio')
var frequencies = require('ndsamples-frequencies/stream')
var hop = require('ndarray-hop/stream')
var rms = require('node-audio-rms')
var createScene = require('gl-plot3d')
var createSurfacePlot = require('gl-surface3d')

var scene = createScene()
var surface = createSurfacePlot({
  gl: scene.gl,
  field: null,
  contourProject: true
})
scene.add(surface)

var opts = {
  buffer: 1024,
  channels: 1
}

// get audio
readAudio({
  buffer: opts.buffer,
  channels: opts.channel
}, function (err, stream) {
  if (err) { throw err }

  stream
  // split audio into frequencies
  .pipe(frequencies())
  // get room mean square of samples
  .pipe(rms())
  // extrude samples through time
  .pipe(hop({
    frame: { shape: [opts.buffer * 8, opts.channel] }
    hop: { shape: [opts.buffer, opts.channel ]}
  }))
  // format to 3d alpha
  // apply rainbow colors
  .pipe(through.obj(function (frame, enc, cb) {
    surface.update({
      field: frame
    })
  }))
})
