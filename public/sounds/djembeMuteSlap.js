const _drum_djembe_mute_slap = {
  zones: [
    {
      midi: 0, //MIDI program
      originalPitch: 78 * 100 - 36 * 100, //root pitch in cent, may be transpose up/down
      keyRangeLow: 12 * 3 + 6, //zone low key
      keyRangeHigh: 127, //zone high key
      loopStart: 0, //loop tart in seconds
      loopEnd: 40000, //loop end in seconds
      coarseTune: 0, //use fine tune
      fineTune: 4, //tune correction in cents
      sampleRate: 44100, //file sample rate
      ahdsr: true, // see example
      file: '',
    },
  ],
}
