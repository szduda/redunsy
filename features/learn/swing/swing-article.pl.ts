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
  title: 'Timing i swing w bębnieniu ludów Mande',
  lead: [
    'Ten materiał przybliża pracę Rainera Polaka i Justina Londona Timing and Meter in Mande Drumming from Mali (2014), a następnie zestawia wzorce swing dostępne w dunsy.app z proporcjami podziału beatu, które autorzy zmierzyli na nagraniach studyjnych.',
    'Cel porównania jest prosty: sprawdzić, jak kształty swing dostępne dziś w dunsy.app układają się względem realnych, nagranych i chronometrycznie zmierzonych podziałów beatu. To lektura dla grających i uczących, nie wewnętrzny plan rozwoju aplikacji.',
  ],
  sourceLabel: 'Źródło',
  sourceHref: 'https://mtosmt.org/issues/mto.14.20.1/mto.14.20.1.polak-london.php',
  sourceText: 'Polak & London, Music Theory Online 20/1 (2014)',
  languagePanel: {
    message: 'Ten artykuł istnieje też w wersji angielskiej.',
    action: 'Czytaj po angielsku',
    targetLocale: 'en',
  },
  sections: [
    {
      id: 'corpus',
      title: 'Materiał badawczy',
      paragraphs: [
        'Polak nagrał w Mali w 2012 roku bębnienie ludu Bamana (bòn) oraz ludu Khasonka (dundunba). Do szczegółowej analizy wybrano dwa społecznie ważne i stylistycznie typowe utwory: Ngòn Fariman (Bamana) oraz Bire (Khasonka). Około czterdziestu minut wielościeżkowych nagrań studyjnych oznaczono pod kątem ponad dwudziestu tysięcy onsetów, a każdy z nich sprawdzono następnie ręcznie.',
        'Faktura zespołu opiera się na trzech warstwach funkcjonalnych: krótkim, gęstym akompaniamencie, który artykułuje podział beatu; dłuższym hooku, który identyfikuje utwór; oraz bębnie prowadzącym — improwizującym, regulującym przebieg wydarzenia i najczęściej odpowiedzialnym za charakterystyczne, narastające przyspieszenie całego wykonania.',
      ],
    },
    {
      id: 'findings',
      title: 'Najważniejsze ustalenia',
      paragraphs: [
        'Na poziomie tactusu, czyli głównego pulsu, beaty są niemal idealnie równe — zasadniczo izochroniczne. Wewnątrz beatu podziały są jednak stabilnie nieizochroniczne. Ta nierówność nie jest przypadkowym „humanizowaniem” równej siatki; stanowi część samego metrum.',
        'Rytmem rządzą dwie jakościowo odrębne kategorie długości: Long (L) i Short (S). W gęstszych figurach leadu pojawia się także Very Short (s). Mniejsze, ciągłe różnice wokół tych kategorii zależą od wykonawcy, zespołu, roli instrumentalnej, pozycji we frazie i niekiedy tempa.',
        'Autorzy formułują to najostrzej: wzory akompaniamentu nie są „po prostu proporcjami czasowymi (…), lecz bezpośrednim wyrazem struktury metrycznej”.',
      ],
    },
    {
      id: 'ngon',
      title: 'Ngòn — L–S–S',
      paragraphs: [
        'Akompaniament kèngèbu wypełnia jeden beat trzema uderzeniami — niskim, wysokim, wysokim — w układzie L–S–S. Średnia z sześciu wykonań wynosi 40,8 : 30,7 : 28,5 — to ani równy trójpodział (33:33:33), ani proporcja 2:1:1 (50:25:25).',
        'Frazy grane przez lead najczęściej dzielą wyłącznie element Long, tworząc gęstszy układ s–s–S–S — oba pierwotne Shorty zostają przy tym nietknięte. Słuchacze lokalni zwykle słyszą tu grupowanie anakruzyczne, od dwóch krótkich offbeatów do długiego onbeatu, choć pomiary podaje się najczęściej od onsetu beatu.',
      ],
    },
    {
      id: 'bire',
      title: 'Bire — L–S',
      paragraphs: [
        'Dzwonek akompaniujący w Bire gra dwuelementowe L–S ze średnią 58,6 : 41,4, czyli około 1,42:1 — nie 2:1. Charakterystyczne dla poszczególnych wykonawców zakresy leżą mniej więcej między 57:43 a 60:40.',
        'W gęstszych otwarciach partii leadu Long dzieli się nierówno na s–S₁–S₂ (około 25,4 : 35,3 : 40,4); Short akompaniamentu staje się wtedy ostatnim elementem tej rozbudowanej figury. Dołączone jembe podąża za dzwonkiem wyjątkowo ściśle (R = 0,958).',
      ],
    },
    {
      id: 'theory',
      title: 'Kategorie, nie jeden uniwersalny swing',
      paragraphs: [
        'Ngòn i Bire mają podwójną tożsamość liczbową: Bire bywa jednocześnie dwudzielne (L–S) i trójdzielne (s–S–S); Ngòn — trójdzielne (L–S–S) i czwórdzielne (s–s–S–S). To zagnieżdżenie w tej samej nierównej strukturze — nie zmiana metrum.',
        'Artykuł wpisuje się w koncepcję Londona zwaną hipotezą „wielu metrów” (many meters hypothesis): słuchacze przyswajają szablony czasowe związane z konkretnym gatunkiem, stylem, zakresem tempa, wykonawcą czy utworem — nie z jedną, abstrakcyjną miarą. Pokrewne rodziny mogą dzielić ten sam profil — Ngòn z Sunun (L–S–S), Bire z Manjanin (L–S) — ale jedna globalna wartość swing nie opisuje całego repertuaru.',
        'Zastrzeżenie na uczciwość: korpus to dwa celowo wybrane utwory i dziesięć wykonań. Podane średnie są średnimi tego konkretnego badania, nie uniwersalnym prawem całej muzyki Mande.',
      ],
    },
    {
      id: 'dunsy',
      title: 'Jak wypada na tym tle dunsy.app',
      paragraphs: [
        'W dunsy.app swing zapisuje się krótkim ciągiem znaków nad komórkami ósemkowymi. Wizualne znaczki mówią, o ile komórka jest przesunięta wcześniej lub później na siatce dwunastu ticków: . oznacza „prosto”; < / << / <<< ciągną wcześniej; > / >> / >>> odpychają później. Główne uderzenia na raz (downbeaty) zawsze grane są prosto, bez przesunięcia.',
        'Tabele poniżej przeliczają wybrane wzorce na odstępy między onsetami (IOI, inter-onset interval) wyrażone w procentach jednego beatu — tym samym językiem, którym posługują się Polak i London — i stawiają je obok zmierzonych przez nich średnich. Długość beatu odpowiada oznaczeniu głównego pulsu w dunsy: trzy komórki w on 3, cztery komórki w on 4.',
      ],
    },
  ],
  symbolMapTitle: 'Mapa symboli',
  symbolMapCaption:
    'Wizualne oznaczenia swing widoczne dla gracza, znak zapisany w patternie oraz odpowiadające mu przesunięcie w tickach.',
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
        'Późny wzorzec trójdzielny . >> > to najbliższe podejście dunsy do Ngòn L–S–S liczonego od downbeatu. Wczesny . << < daje odwrotną fazę: krótki odcinek na początku tam, gdzie Bu–Kèn–Gè zaczyna się od długiego.',
      headers: ['Feel', 'Wzorzec', 'Onsety', 'IOI', '% beatu', 'Uwaga'],
      rows: [
        row('dunsy early', SWING_ON3_ROWS.early, 'S–L–L; to nie Ngòn liczony od downbeatu'),
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
        'Żaden z wymienionych wzorców czterokomórkowych nie oddaje binarnego L–S z Bire. Rozłożony na dwie pary . > . > daje tylko 54,2:45,8 na pół-beat — dalej od Bire niż zwykła para . >>.',
      headers: ['Feel', 'Wzorzec', 'Onsety', 'IOI', '% beatu', 'Uwaga'],
      rows: [
        row('dunsy late', SWING_ON4_ROWS.late, 'Słabe, powtarzane pary long–short'),
        row('dunsy early', SWING_ON4_ROWS.early, 'Bliżej gęstych kształtów samba niż Bire'),
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
        'Artykuł mierzy binarne L–S wewnątrz jednego beatu. Para . >> w dunsy trafia niemal dokładnie w średnią z badania.',
      headers: ['Feel', 'Wzorzec', 'Onsety', 'IOI', '% beatu', 'Uwaga'],
      rows: [
        row('dunsy', SWING_BIRE_ROWS.strong, 'Δ vs Bire: −0,3 / +0,3 pp'),
        row('Artykuł Bire', SWING_BIRE_ROWS.paper, 'Średnia referencyjna'),
        row('dunsy weak', SWING_BIRE_ROWS.weak, 'Δ vs Bire: −4,4 / +4,4 pp'),
      ],
    },
  ],
  closingTitle: 'Jak czytać to porównanie',
  closingParagraphs: [
    'Swingi, które brzmią podobnie, nie muszą być tym samym metrum. Binarne L–S z Bire i trójdzielne L–S–S z Ngòn to dwa różne szablony kategorialne; gęstsze figury leadu zagnieżdżają się w nich, nie zacierając Shortów akompaniamentu.',
    'Na tym tle obecne wzorce dunsy z zaskakującą dokładnością oddają jeden zmierzony przypadek: późną, binarną parę . >> wobec Bire. Trójdzielne późne . >> > przybliża Long i pierwszy Short z Ngòn, choć wyrównuje przy tym oba Shorty i zostawia Long odrobinę krótszym niż średnia z badania.',
    'Średnie z artykułu warto czytać jako dowód z konkretnych malijskich wykonań, a kolumny dunsy — jako to, co obecny alfabet swing aplikacji potrafi wyrazić na siatce dwunastu ticków. To porównanie badawcze dla każdego, kogo interesuje związek między zapisanym swingiem a nagranym feelem.',
  ],
  closingJoke:
    'Na koniec, bez naukowej ścisłości: jeden ze współautorów tego artykułu nazywa się Polak. Rytmu to jednak nie tłumaczy — na naszych weselach obowiązuje inny podział beatu: Long trwa do czwartej lampki, Short do siódmej, a Very Short to czas, w którym ktoś jeszcze pamięta figury oberka. Kategorie stabilne, tempo rośnie, izochronia kończy się przy barze.',
}
