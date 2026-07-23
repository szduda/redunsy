import type { SwingArticleCopy } from '@/features/learn/swing/swing-article.types'
import { BIRE_PERCENTS, NGON_PERCENTS, compareRow } from '@/features/learn/swing/swing-table-data'

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
        'W dunsy.app swing zapisuje się nad komórkami ósemkowymi za pomocą wizualnych znaczków na siatce dwunastu ticków. Znaczek „późny” wydłuża pierwszy odcinek beatu i skraca to, co po nim; znaczek „wczesny” robi odwrotnie. Główne uderzenia na raz (downbeaty) zawsze grane są prosto.',
        'Na binarnym beacie (dwie komórki, 24 ticki) każdy stopień „późnego” przesunięcia zmienia Long o około 4,2 punktu procentowego: > → 54,2 : 45,8, >> → 58,3 : 41,7, >>> → 66,7 : 33,3. Hipotetyczny stopień +3 wylądowałby na 62,5 : 37,5 — między >> a >>>. Beaty trójdzielne (trzy komórki, 36 ticków) łączą dwa znaczki offbeatowe, więc trzy procenty ruszają się razem.',
        'Poniżej: po jednej tabeli na utwór z Polaka. Podświetlony pierwszy wiersz to zmierzona średnia; kolejne to próby odtworzenia tego feelu znaczkami dostępnymi w apce — oraz jeden hipotetyczny krok ±3, gdy pomaga.',
      ],
    },
  ],
  symbolMapTitle: 'Mapa symboli',
  symbolMapCaption:
    'Wizualne oznaczenia swing i ich przesunięcia na siatce dwunastu ticków. Pary wczesne i późne są symetryczne.',
  symbolMapHeaders: ['Wizualnie', 'Offset (ticki)'],
  symbolMapRows: [
    ['.', '0'],
    ['<', '−1'],
    ['<<', '−2'],
    ['<<<', '−4'],
    ['>', '+1'],
    ['>>', '+2'],
    ['>>>', '+4'],
  ],
  tables: [
    {
      id: 'ngon',
      title: 'Ngòn Fariman — L–S–S (beat trójdzielny, 36 ticków)',
      caption:
        'Liczone od downbeatu. Najbliższy wzorzec w apce to . >> >; najbliższe całkowite dopasowanie wymagałoby kroku +3, którego drabinka nie ma.',
      headers: ['', '% beatu', 'Uwagi'],
      rows: [
        compareRow('Polak & London', NGON_PERCENTS.pl.paper, 'Średnia z sześciu wykonań', true),
        compareRow(
          '. >> >',
          NGON_PERCENTS.pl.late21,
          'Najbliższy dostępny wzorzec. Środkowy Short prawie idealny (−0,1 pp); Long za krótki o ~1,9 pp; ostatni Short za długi o ~2,1 pp',
        ),
        compareRow(
          '. >> >>',
          NGON_PERCENTS.pl.late22,
          'Ostatni Short blisko 28,5 (−0,7 pp); środkowy Short za długi (+2,6 pp)',
        ),
        compareRow(
          '. >>> >>',
          NGON_PERCENTS.pl.late42,
          'Ostatni Short blisko średniej (−0,7 pp); Long za długi (+3,6 pp)',
        ),
        compareRow(
          'hipotetyczne . +3 +2',
          NGON_PERCENTS.pl.hyp32,
          'Najlepsze całkowite dopasowanie. Wszystkie trzy odcinki w granicach ~1 pp od średniej badania — ale +3 nie ma w drabince ±1/±2/±4',
        ),
      ],
    },
    {
      id: 'bire',
      title: 'Bire — L–S (beat binarny, 24 ticki)',
      caption:
        'Dwa odcinki na beat. . >> trafia niemal w średnią z badania; słabszy i mocniejszy znaczek późny biorą ją w nawias.',
      headers: ['', '% beatu', 'Uwagi'],
      rows: [
        compareRow('Polak & London', BIRE_PERCENTS.pl.paper, 'Średnia z czterech wykonań', true),
        compareRow(
          '. >>',
          BIRE_PERCENTS.pl.late2,
          'Praktycznie dokładne (Δ −0,3 / +0,3 pp). Najlepsze trafienie w całym porównaniu',
        ),
        compareRow(
          '. >',
          BIRE_PERCENTS.pl.late1,
          'Za równe — Long za krótki o ~4,4 pp względem artykułu',
        ),
        compareRow('. >>>', BIRE_PERCENTS.pl.late4, 'Za blisko feelu 2:1; Long za długi o ~8,1 pp'),
        compareRow(
          'hipotetyczne . +3',
          BIRE_PERCENTS.pl.hyp3,
          'Między >> a >>>. Dalej od Bire niż . >>; przydatne tylko jako punkt odniesienia drabinki',
        ),
      ],
    },
  ],
  closingTitle: 'Jak czytać to porównanie',
  closingParagraphs: [
    'Swingi, które brzmią podobnie, nie muszą być tym samym metrum. Binarne L–S z Bire i trójdzielne L–S–S z Ngòn to dwa różne szablony kategorialne; gęstsze figury leadu zagnieżdżają się w nich, nie zacierając Shortów akompaniamentu.',
    'Na tym tle obecne znaczki dunsy z zaskakującą dokładnością oddają jeden zmierzony przypadek: późną, binarną parę . >> wobec Bire. Dla Ngòn najlepszym dostępnym przybliżeniem jest . >> > — blisko środkowego Shorta, odrobinę za krótko na Longu — a hipotetyczny krok +3/+2 wylądowałby bliżej średniej badania niż cokolwiek z obecnej drabinki.',
    'Średnie z artykułu warto czytać jako dowód z konkretnych malijskich wykonań, a wiersze pod nimi — jako to, co obecny alfabet swing aplikacji potrafi wyrazić na siatce dwunastu ticków. To porównanie badawcze dla każdego, kogo interesuje związek między zapisanym swingiem a nagranym feelem.',
  ],
  closingJoke:
    'Na koniec, bez naukowej ścisłości: jeden ze współautorów tego artykułu nazywa się Polak. Rytmu to jednak nie tłumaczy — na naszych weselach obowiązuje inny podział beatu: Long trwa do czwartej lampki, Short do siódmej, a Very Short to czas, w którym ktoś jeszcze pamięta figury oberka. Kategorie stabilne, tempo rośnie, izochronia kończy się przy barze.',
}
