type DrumInfo = {
  variable: string
  url: string
  pitch: number
  title: string
}

const getUrl = (filename: string) => `/sounds/${filename}.js`

export const africanSounds: Record<number, DrumInfo> = {
  3305: { variable: '_shaker', url: getUrl('shaker'), pitch: 78, title: 'shaker' },
  3306: { variable: '_bell', url: getUrl('bell'), pitch: 78, title: 'bell' },
  3310: {
    variable: '_drum_sangban_open',
    url: getUrl('sangbanOpen'),
    pitch: 78,
    title: 'sangban open',
  },
  3311: {
    variable: '_drum_sangban_closed',
    url: getUrl('sangbanClosed'),
    pitch: 78,
    title: 'sangban closed',
  },
  3312: {
    variable: '_drum_dundunba_open',
    url: getUrl('dundunbaOpen'),
    pitch: 78,
    title: 'dundunba open',
  },
  3313: {
    variable: '_drum_dundunba_closed',
    url: getUrl('dundunbaClosed'),
    pitch: 78,
    title: 'dundunba closed',
  },
  3314: {
    variable: '_drum_kenkeni_open',
    url: getUrl('kenkeniOpen'),
    pitch: 78,
    title: 'kenkeni open',
  },
  3315: {
    variable: '_drum_kenkeni_closed',
    url: getUrl('kenkeniClosed'),
    pitch: 78,
    title: 'kenkeni closed',
  },
  3316: {
    variable: '_drum_kenkeni_open_2',
    url: getUrl('kenkeniOpen2'),
    pitch: 78,
    title: 'kenkeni open 2',
  },
  3317: {
    variable: '_drum_kenkeni_closed_2',
    url: getUrl('kenkeniClosed2'),
    pitch: 78,
    title: 'kenkeni closed 2',
  },
  3318: {
    variable: '_drum_djembe_open_tone',
    url: getUrl('djembeOpenTone'),
    pitch: 78,
    title: 'djembe open tone',
  },
  3319: {
    variable: '_drum_djembe_flam_slap',
    url: getUrl('djembeFlamSlap'),
    pitch: 78,
    title: 'djembe flam slap',
  },
  3320: {
    variable: '_drum_djembe_open_slap',
    url: getUrl('djembeOpenSlap'),
    pitch: 78,
    title: 'djembe open slap',
  },
  3321: {
    variable: '_drum_djembe_open_bass',
    url: getUrl('djembeOpenBass'),
    pitch: 78,
    title: 'djembe open bass',
  },
  3322: {
    variable: '_drum_djembe_mute_tone',
    url: getUrl('djembeMuteTone'),
    pitch: 78,
    title: 'djembe mute tone',
  },
}
