import type { SwingArticleCopy } from '@/features/learn/swing/swing-article.types'
import {
  SWING_BIRE_ROWS,
  SWING_ON3_ROWS,
  SWING_ON4_ROWS,
  row,
} from '@/features/learn/swing/swing-table-data'

export const SWING_ARTICLE_PL: SwingArticleCopy = {
  locale: 'pl',
  eyebrow: 'Learn · Badanie',
  title: 'Timing i swing w bębnieniu Mande',
  lead: [
    'Ten tekst streszcza artykuł Rainera Polaka i Justina Londona Timing and Meter in Mande Drumming from Mali (2014), a następnie zestawia istniejące wzorce swing w dunsy.app z proporcjami podziału beatu, które autorzy zmierzyli na nagraniach studyjnych.',
    'Celem badania porównawczego było pytanie: jak kształty swing dostępne dziś w dunsy.app układają się względem realnych, nagranych i chronometrycznie zmierzonych podziałów beatu — jako lektura dla grających i uczących, a nie jako wewnętrzny plan rozwoju aplikacji.',
  ],
  sourceLabel: 'Źródło',
  sourceHref: 'https://mtosmt.org/issues/mto.14.20.1/mto.14.20.1.polak-london.php',
  sourceText: 'Polak & London, Music Theory Online 20/1 (2014)',
  languagePanel: {
    message: 'Ten artykuł jest też dostępny po angielsku.',
    action: 'Czytaj po angielsku',
    targetLocale: 'en',
  },
  sections: [
    {
      id: 'corpus',
      title: 'Co zbadano w artykule',
      paragraphs: [
        'Polak nagrał w Mali w 2012 roku bębnienie Bamana (bòn) oraz Khasonka (dundunba). Do szczegółowej analizy wybrano dwa społecznie ważne i stylistycznie typowe utwory: Ngòn Fariman (Bamana) oraz Bire (Khasonka). Około czterdziestu minut wielośladowych nagrań studyjnych oznaczono pod kątem ponad 20 000 onsetów, a następnie sprawdzono ręcznie.',
        'Faktura zespołu dzieli się na trzy warstwy funkcjonalne: krótki, gęsty akompaniament artykułujący podział beatu; dłuższy hook identyfikujący utwór; oraz bęben prowadzący, który improwizuje, reguluje przebieg wydarzenia i często prowadzi charakterystyczne przyspieszenie całego wykonania.',
      ],
    },
    {
      id: 'findings',
      title: 'Główne wyniki',
      paragraphs: [
        'Na poziomie tactusu beaty są zasadniczo izochroniczne — niemal idealnie równe. Wewnątrz beatu podziały są jednak stabilnie nieizochroniczne. Ta nierówność nie jest przypadkowym „humanizowaniem” równej siatki; stanowi część samego metrum.',
        'Dominują dwie jakościowe kategorie czasu trwania: Long (L) i Short (S). W gęstszych figurach leadu pojawia się także Very Short (s). Mniejsze, ciągłe różnice wokół tych kategorii zależą od wykonawcy, zespołu, roli instrumentalnej, pozycji we frazie i niekiedy tempa.',
        'Najmocniejsze sformułowanie autorów brzmi, że wzory akompaniamentu nie są „po prostu proporcjami czasowymi … lecz bezpośrednim wyrazem struktury metrycznej”.',
      ],
    },
    {
      id: 'ngon',
      title: 'Ngòn — L–S–S',
      paragraphs: [
        'Akompaniament kèngèbu obejmuje jeden beat trzema uderzeniami low–high–high w porządku L–S–S. Średnia z sześciu wykonań to 40,8 : 30,7 : 28,5 — ani równy trójpodział (33:33:33), ani feel 2:1:1 (50:25:25).',
        'Frazy leadu często dzielą wyłącznie element Long, tworząc gęstszy układ s–s–S–S. Pierwotne Shorty pozostają na miejscu. Słuchacze lokalni zwykle słyszą grupowanie anakruzyczne — od dwóch krótkich offbeatów do długiego onbeatu — choć pomiary najczęściej podaje się od onsetu beatu.',
      ],
    },
    {
      id: 'bire',
      title: 'Bire — L–S',
      paragraphs: [
        'Dzwonek akompaniujący w Bire to dwuelementowe L–S ze średnią 58,6 : 41,4 (około 1,42:1, nie 2:1). Zakresy charakterystyczne dla wykonawców leżą mniej więcej między 57:43 a 60:40.',
        'W gęstszych otwarciach leadu Long jest dzielony nierówno na s–S₁–S₂ (około 25,4 : 35,3 : 40,4), a Short akompaniamentu pozostaje końcowym Shortem tej gęstszej figury. Dodane jembe podąża za dzwonkiem wyjątkowo ściśle (R = 0,958).',
      ],
    },
    {
      id: 'theory',
      title: 'Kategorie, nie jeden uniwersalny swing',
      paragraphs: [
        'Ngòn i Bire są ilościowo wielowartościowe: Bire może być jednocześnie binarne (L–S) i trójdzielne (s–S–S); Ngòn — trójdzielne (L–S–S) i czwórdzielne (s–s–S–S). To zagnieżdżanie w tej samej nierównej strukturze, a nie zmiana metrum.',
        'Artykuł wspiera więc londyńską ideę „many meters”: słuchacze przyswajają szablony timingowe związane z gatunkami, stylami, zakresami tempa, wykonawcami i utworami. Pokrewne rodziny mogą dzielić profil — Ngòn z Sunun (L–S–S), Bire z Manjanin (L–S) — ale jedna globalna wartość swing nie opisuje repertuaru.',
        'Zastrzeżenie: korpus empiryczny to dwa celowo wybrane utwory i dziesięć wykonań. Dokładne średnie są średnimi badania, nie uniwersalnymi prawami całej muzyki Mande.',
      ],
    },
    {
      id: 'dunsy',
      title: 'Jak wypadają wzorce dunsy.app',
      paragraphs: [
        'W dunsy.app swing zapisuje się krótkim ciągiem znaków nad komórkami ósemkowymi. Wizualne chevrony oznaczają, jak mocno komórka jest ściągnięta wcześniej lub później na siatce 12 ticków: . to prosto; < / << / <<< ciągną wcześniej; > / >> / >>> odpychają później. Główne downbeaty pozostają proste.',
        'Tabele poniżej przekładają wybrane wzorce na odstępy między onsetami (IOI) jako procenty jednego beatu — w tym samym języku, którego używają Polak i London — i ustawiają je obok zmierzonych średnich z artykułu. Długość beatu odpowiada oznaczeniu głównego pulsu w dunsy: trzy komórki w on 3, cztery komórki w on 4.',
      ],
    },
  ],
  symbolMapTitle: 'Mapa symboli',
  symbolMapCaption:
    'Wizualne oznaczenia swing widoczne dla gracza, znak w zapisie oraz przesunięcie w tickach.',
  symbolMapHeaders: ['Wizualnie', 'Zapis', 'Offset (ticki)'],
  symbolMapRows: [
    ['.', '-', '0'],
    ['< / << / <<<', '( / < / {', '−1 / −2 / −4'],
    ['> / >> / >>>', ') / > / }', '+1 / +2 / +4'],
  ],
  tables: [
    {
      id: 'on3',
      title: 'On 3 — trzy podziały na beat (36 ticków)',
      caption:
        'Późne trójdzielne . >> > to najbliższy kształt dunsy względem Ngòn L–S–S od downbeatu. Wczesne . << < daje krótki pierwszy odcinek — odwrotną fazę wobec Bu–Kèn–Gè mierzonego od onsetu beatu.',
      headers: ['Feel', 'Wzorzec', 'Onsety', 'IOI', '% beatu', 'Uwaga'],
      rows: [
        row('dunsy early', SWING_ON3_ROWS.early, 'S–L–L; to nie Ngòn od downbeatu'),
        row('dunsy late', SWING_ON3_ROWS.late, 'Δ vs Ngòn: −1,9 / −0,1 / +2,1 pp'),
        row('Artykuł Ngòn', SWING_ON3_ROWS.ngon, 'Średnia referencyjna'),
        row(
          'Najbliższa siatka',
          SWING_ON3_ROWS.quantized,
          '* Wymaga offsetów +3/+2 — poza drabinką ±1/±2/±4 w dunsy',
        ),
      ],
    },
    {
      id: 'on4',
      title: 'On 4 — cztery podziały na beat (48 ticków)',
      caption:
        'Żaden z wymienionych wzorców czterokomórkowych nie reprodukuje binarnego L–S z Bire. Jako dwie pary . > . > daje tylko 54,2:45,8 na pół-beat — dalej od Bire niż zwykła para . >>.',
      headers: ['Feel', 'Wzorzec', 'Onsety', 'IOI', '% beatu', 'Uwaga'],
      rows: [
        row('dunsy late', SWING_ON4_ROWS.late, 'Słabe powtarzane pary long–short'),
        row('dunsy early', SWING_ON4_ROWS.early, 'Bliżej gęstych / samba-like kształtów niż Bire'),
        row('Ngòn dense', SWING_ON4_ROWS.ngonDense, 'Równy podział Long z Ngòn'),
        row(
          'Samba Bahia',
          SWING_ON4_ROWS.samba,
          'Przywołana w artykule jako pokrewny nieizochroniczny dialekt',
        ),
      ],
    },
    {
      id: 'bire-binary',
      title: 'Kontekst Bire — dwa podziały na beat (24 ticki)',
      caption:
        'Artykuł mierzy binarne L–S wewnątrz jednego beatu. Para . >> w dunsy trafia niemal dokładnie w średnią badania.',
      headers: ['Feel', 'Wzorzec', 'Onsety', 'IOI', '% beatu', 'Uwaga'],
      rows: [
        row('dunsy', SWING_BIRE_ROWS.strong, 'Δ vs Bire: −0,3 / +0,3 pp'),
        row('Artykuł Bire', SWING_BIRE_ROWS.paper, 'Średnia referencyjna'),
        row('dunsy weak', SWING_BIRE_ROWS.weak, 'Δ vs Bire: −4,4 / +4,4 pp'),
      ],
    },
  ],
  closingTitle: 'Jak czytać porównanie',
  closingParagraphs: [
    'Swingi, które brzmią podobnie, nie muszą być tym samym metrum. Binarne L–S z Bire i trójdzielne L–S–S z Ngòn to różne szablony kategorialne; gęstsze figury leadu zagnieżdżają się w nich bez zacierania Shortów akompaniamentu.',
    'Na tym tle obecne wzorce dunsy już z dużą dokładnością oddają jeden zmierzony przypadek: późną binarną parę . >> wobec Bire. Trójdzielne późne . >> > przybliża Long i pierwszy Short Ngòn, wyrównując jednak oba Shorty i zostawiając Long nieco krótszym od średniej badania.',
    'Średnie z artykułu warto czytać jako dowód z konkretnych malijskich wykonań, a kolumny dunsy — jako to, co obecny alfabet swing aplikacji potrafi wyrazić na siatce 12 ticków: porównanie badawcze dla każdego, kogo ciekawi związek zapisanego swing z nagranym feelem.',
  ],
}
