import type { HelpSection } from '@/features/help/help.types'

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'website',
    title: 'Website features',
    topics: [
      {
        title: 'Player',
        description:
          'The GroovyPlayer loads rhythm patterns as scrollable notation and plays them with sampled djembe, dundun, bell, and shaker sounds.',
        subitems: [
          {
            icon: 'play',
            title: 'Player demo',
            description:
              'Open Player Demo from the menu to explore a built-in example without picking a rhythm from the Garage. Use it to try audio controls, tempo, metronome, swing, and player settings.',
          },
          {
            icon: 'fork',
            title: 'Fork a rhythm',
            description:
              'On any public rhythm page, choose Fork in the side panel to copy it into My Rhythms. You land in the editor with a private duplicate you can adapt without changing the original.',
          },
        ],
      },
      {
        title: 'Garage',
        tileBg: 'bg-redy/20',
        description:
          'The Garage is the main library browser. Search, filter, and open any published rhythm in the player.',
        subitems: [
          {
            icon: 'search',
            title: 'Search',
            description:
              'Use the search field on the homepage or in the Garage to find rhythms by title, artist, tag, region, or rhythm group. Results update as you type. Clear the field to reset text search and active filters.',
          },
          {
            icons: ['meter', 'instruments', 'artist', 'origin', 'tag'],
            title: 'Garage filters',
            description:
              'Narrow results with filter chips. On mobile, tap the icon buttons along the top of the Garage — meter, instruments, artist, origin (including rhythm group), and tags. On desktop, the same filters appear as chip lists in the sidebar. Switch between All Rhythms, Site Rhythms, and My Rhythms to browse the public catalog or your private collection.',
          },
        ],
      },
      {
        title: 'Rhythm Editor',
        tileBg: 'bg-yellowy/30',
        description:
          'Write your own patterns layer by layer. Pick instruments, set tempo and metadata, then edit bars on a canvas. Changes auto-save to My Rhythms.',
        subitems: [
          {
            icon: 'note16',
            title: 'Show in Player',
            description:
              'While editing, open Show in Player from the side panel to preview the current rhythm in the full GroovyPlayer with all tracks visible.',
          },
          {
            icon: 'edit',
            title: 'Creator',
            description:
              'Start New rhythm on the editor landing page to walk through a three-step wizard: optional metadata, instrument layers, then the bar editor. Djembe layers can be prefilled with a common accompaniment pattern.',
          },
          {
            icon: 'user',
            title: 'My Rhythms',
            description:
              'Your rhythms live at /editor. Open any saved draft from the picker, or create a new one. Rhythms you create or fork are stored in your browser — clearing site data removes them.',
          },
        ],
      },
    ],
  },
  {
    id: 'notation',
    title: 'Drum notation',
    tileBg: 'bg-yellowy/30',
    intro:
      'Bars use a fixed grid: 6 cells in 3/4, 8 cells in 4/4. Darker cells mark main beats — where you would stamp your foot. Lighter cells are off-beats.',
    topics: [
      {
        title: 'Bar and beats',
        description:
          'Every track is a stack of bars. Each bar fills a fixed grid of eighth-note cells — 8 in 4/4, 6 in 3/4 — matching the rhythm meter. Cells with a darker background are main beats; lighter cells are off-beats. While playing, the whole active bar turns green. In the editor, one cell at a time gets a yellow outline when selected.',
        demo: 'bar-beats',
      },
      {
        title: 'Dundun open / djembe bass',
        description:
          'Open stroke on dundun drums: strike and let the stick rebound. On djembe this is bass — a low, open hit.',
        glyphs: [
          { instrument: 'dundunba', note: 'o' },
          { instrument: 'djembe', note: 'b' },
        ],
      },
      {
        title: 'Dundun closed / djembe slap',
        description:
          'Closed stroke: strike and lightly press the stick on the skin to shorten the sound. On djembe this is slap — a sharp, high hit with a crossed ring.',
        glyphs: [
          { instrument: 'dundunba', note: 'x' },
          { instrument: 'djembe', note: 's' },
        ],
      },
      {
        title: 'Djembe tone',
        description:
          'A ringing mid pitch between bass and slap — the everyday hand tone on the djembe.',
        glyphs: [{ instrument: 'djembe', note: 't' }],
      },
      {
        title: 'Bell sound',
        description: 'Metal on metal — shown as a cross. Used on bell and kenkeni bell patterns.',
        glyphs: [{ instrument: 'bell', note: 'x' }],
      },
      {
        title: 'Rest',
        description: 'A silence on that subdivision — shown as a small dot.',
        glyphs: [{ instrument: 'djembe', note: '-' }],
      },
      {
        title: 'Flam',
        description:
          'Two quick hits before the main note. Grace notes are drawn slightly offset from the primary stroke.',
        glyphs: [
          { instrument: 'djembe', note: 'r' },
          { instrument: 'djembe', note: 'f' },
        ],
      },
      {
        icon: 'note16',
        title: 'Sixteenth notes',
        description:
          'One eighth slot can hold two sixteenth notes. Select a plain note in the editor and tap 16th to convert.',
        demoBar: { meter: 4, pattern: '[bt]ss-tt--' },
      },
      {
        icon: 'triplet',
        title: 'Triplets',
        description:
          'Three notes share two eighth cells as an eighth-note triplet. Select a plain note in the editor and tap Triplet to convert.',
        demoBar: { meter: 4, pattern: 's{bts}-tt--' },
      },
      {
        icon: 'polyrhythm',
        title: 'Polyrhythm',
        description:
          'Six slots over two eighth cells combine four sixteenth positions and three triplet positions on a shared 4:3 grid. Notation uses angle brackets, for example <fststs>, where s marks sixteenth slots and t marks triplet slots. Select a plain note in the editor and tap Polyrhythm to convert.',
        demoBar: { meter: 4, pattern: 's<fststs>-tt--' },
      },
    ],
  },
  {
    id: 'player',
    title: 'Player features',
    tileBg: 'bg-greeny/30',
    topics: [
      {
        icons: ['play', 'pause', 'stop', 'restart'],
        title: 'Audio Controls',
        description:
          'Play and pause from the bottom bar. Stop resets playback to the beginning. Restart jumps back to bar one while staying in play mode. Press Space anywhere outside a text field to toggle play and pause.',
      },
      {
        icon: 'tempo',
        title: 'Tempo',
        description:
          'Drag the tempo control to set speed between 60 and 200 BPM in steps of 5. Saved rhythms load with their stored tempo; you can adjust it live while listening.',
      },
      {
        icon: 'djembe',
        title: 'Signal pattern',
        description:
          'A djembe call that starts a rhythm can be stored in rhythm metadata (Signal pattern field in the editor). Playback from the player is not available yet — the field preserves the pattern for future use and catalog display.',
      },
      {
        icon: 'shekere',
        title: 'Shekere pulse',
        description:
          'The shekere button turns the metronome overlay on or off. When enabled, a shaker hit marks every pulse on top of the pattern — useful for keeping time while the highlighted bar moves through the groove.',
      },
      {
        icon: 'pepper',
        title: 'Paprika Afreaka spice',
        description:
          'The pepper toggles swing on or off. When on, the swing pattern shifts note timing across all tracks — a subtle push and pull on the grid. Edit the pattern in player settings; it must match the rhythm meter length (6 cells for 3/4, 8 for 4/4).',
      },
      {
        icon: 'speaker',
        title: 'Mute track',
        description:
          'Each track has a speaker control and volume slider. Tap the speaker to mute; tap again to restore the previous level. Drag the slider to balance parts. On mobile, open the volume popover from the percentage button when a track is collapsed.',
      },
      {
        icon: 'collapse',
        title: 'Collapse track',
        description:
          'Click a track name to collapse it into a compact strip that shows only a sliding window of bars. Expand again to see the full part — handy on small screens or dense arrangements.',
      },
    ],
  },
  {
    id: 'player-settings',
    title: 'Player settings',
    tileBg: 'bg-greeny/30',
    intro: 'Open the gear icon in the bottom bar to adjust layout and display options.',
    topics: [
      {
        icon: 'settings',
        title: 'Settings panel',
        description:
          'The settings panel slides in from the bottom on mobile or from the right on desktop. Close it with Escape, the backdrop, or the gear button.',
      },
      {
        icon: 'columns',
        title: 'Bars per row',
        description:
          'Use minus and plus to show fewer or more bars on each line. Fewer columns means wider bars and easier reading; more columns fits longer forms on one screen.',
      },
      {
        icon: 'pepper',
        title: 'Swing pattern',
        description:
          'Each character controls how notes in one eighth-note slot are shifted on the playback grid. `-` plays straight on the beat. Early chevrons pull hits earlier — `(` / `<` / `[` / `{` map to visual `<` / `<<` / `<<<` / `<<<<` (force 1 / 2 / 3 / 4 = ±1 / ±2 / ±3 / ±4 ticks). Late `)` / `>` / `]` / `}` map to `>` / `>>` / `>>>` / `>>>>`. Main downbeats are never shifted. The pattern length must match the rhythm meter — 6 characters for 3/4, 8 for 4/4. A warning icon appears when the length is wrong. Examples: Soli-style `-<(-<(`, Marakadon-style `->)->)`, common 4/4 swing `->->->->`, or the rarer delayed variant `--->--->`.',
      },
      {
        icon: 'barIndex',
        title: 'Show bar index',
        description:
          'When enabled, bar numbers appear beneath each bar so you can refer to sections while practicing or teaching.',
      },
      {
        icon: 'triplet',
        title: 'Show subdivision brackets',
        description:
          'Draws brackets above grouped subdivisions: “3” for triplets and “4:3” for polyrhythm groups, making tuplets easier to spot at a glance.',
      },
      {
        icon: 'screenAwake',
        title: 'Prevent screen sleep',
        description:
          'Keeps the screen awake during playback so the highlight bar stays visible through a long practice session. Uses the browser Screen Wake Lock API — macOS does not show a separate system permission dialog for this, but it only works while the tab is visible and may stop when you switch away or if the browser blocks wake lock (for example on low battery).',
      },
      {
        icon: 'fullBleed',
        title: 'Full bleed',
        description:
          'Desktop only. Stretches the player edge to edge for maximum notation width. Navigation actions move above the player instead of the fixed side panel.',
      },
    ],
  },
]
