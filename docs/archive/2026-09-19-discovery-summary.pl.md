# MFD Design System — ustalenia

Stan decyzji: 2026-09-19.

> Ten plik jest zachowanym polskim podsumowaniem sesji. Kanoniczna, utrzymywana specyfikacja znajduje się w [specyfikacji](../specification.md), a historia decyzji w [dzienniku decyzji](../decision-log.md). Nie aktualizuj tych dokumentów niezależnie.

## Cel i zakres

- System jest przeznaczony dla wielu marek i wdrożeń white-label.
- Początkowi konsumenci to kontrolowane zespoły wewnętrzne realizujące własne produkty i aplikacje klientów.
- Główne cele: spójny kontrakt komponentów, szybka dystrybucja przez shadcn registry oraz wspólne dostępne tokeny.
- V1 jest web-first: React, Next.js, Tailwind CSS v4 i Base UI.
- Expo/React Native oraz Swift są planowanymi platformami. V1 ma zachować neutralne kontrakty i tokeny, ale nie implementuje jeszcze komponentów mobilnych.
- shadcn/ui jest punktem odniesienia i mechanizmem dystrybucji. Base UI dostarcza webowe zachowanie. MFD posiada własne API, tokeny, kompozycje i dokumentację.
- System jest wdrażany wyłącznie w nowych aplikacjach.
- Komponenty powstają z pionowych przepływów produktu, nie alfabetycznie według dokumentacji i nie przez wcześniejsze zbudowanie kompletnego katalogu atomów.

## Źródła prawdy

- Kod i testy są źródłem prawdy dla API, zachowania i dostępności runtime.
- Repozytorium tokenów jest źródłem prawdy dla wartości wizualnych.
- Figma reprezentuje, dokumentuje i umożliwia eksplorację systemu, ale nie zastępuje kontraktu runtime.
- Registry jest kanałem dystrybucji, a nie źródłem prawdy.
- Obecna biblioteka Figma nie jest źródłem dla nowego systemu. System może zostać zbudowany od zera.
- Kanoniczne nazwy tokenów, komponentów, propsów, plików i dokumentacji technicznej są angielskie.

## Platformy, dostępność i kierunek treści

- Poziom docelowy: WCAG 2.2 AA.
- Wymagane są: obsługa klawiatury, widoczny focus-visible, light/dark, szerokość 320 px, 200% zoom, reduced motion, długa treść oraz testy zachowania.
- Figma dostarcza specyfikację a11y-ready; zgodność dostępności potwierdza implementacja i testy runtime.
- RTL pozostaje obsługiwaną możliwością systemu.
- Kierunek dokumentu wynika z języka lub kontekstu treści. Komponenty korzystają z logicznych start/end.
- `Direction` nie jest publicznym wariantem każdego komponentu.
- Odwracane są tylko ikony o znaczeniu kierunkowym.

## White-label i motywy

- Marka może zmieniać kolory, fonty, radius, elevation, logo i assety oraz ograniczony zakres motion.
- Density i rozmiary są oddzielnymi presetami.
- Semantyka, dostępność, anatomia interakcji i kontrakty zachowania pozostają wspólne.
- Layout ekranów, treść i wzorce produktowe nie należą do prostego themingu marki.
- Niepoprawne motywy są odrzucane przez automatyczne bramki oraz manualny przegląd. System nie koryguje automatycznie kolorów marki.
- Początkowo powstają dwie kontrastujące, fikcyjne marki:
  - Atlas — techniczna, precyzyjna, chłodna, geometryczna i powściągliwa;
  - Bloom — przyjazna, miękka, cieplejsza i bardziej ekspresyjna.
- Obie marki obsługują niezależnie light/dark i comfortable/compact.
- Osie motywu są niezależne:
  - `brand` wynika z tenantu;
  - `colorScheme` ma wartości light/dark/system;
  - `density` ma wartości comfortable/compact.
- Marka jest wybierana w runtime na podstawie tenantu i ustawiana przed renderowaniem, aby uniknąć mignięcia nieprawidłowego motywu.

## Tokeny i foundations

- Tokeny mają trzy warstwy:
  1. reference — surowe skale i wartości;
  2. semantic — role i przeznaczenie;
  3. component — uzasadnione wyjątki konkretnego komponentu.
- Komponenty nie używają bezpośrednio surowych kolorów.
- Kanoniczne tokeny są zapisane ściśle w stabilnym formacie DTCG 2025.10 jako pliki `*.tokens.json` w repozytorium.
- Pliki źródłowe używają standardowych właściwości DTCG, a metadane specyficzne dla MFD są przechowywane wyłącznie w `$extensions`. TypeScript, YAML ani własny wariant JSON nie stanowią równoległego źródła prawdy.
- Stabilny DTCG Resolver Module 2025.10 opisuje składanie zestawów oraz konteksty `brand`, `colorScheme` i `density`; projekt nie utrzymuje własnego równoległego formatu manifestu.
- Resolver generuje osiem rzeczywistych kombinacji Atlas/Bloom × light/dark × comfortable/compact. `system` jest regułą runtime wybierającą light albo dark, a nie oddzielnym kontekstem wartości tokenów.
- Z tokenów generowane są zmienne CSS, a w przyszłości formaty React Native i Swift.
- Zmiana może rozpocząć się w Figma, ale staje się oficjalna po synchronizacji, przeglądzie i zatwierdzeniu w repozytorium.
- Publicznym kontraktem webowym są tokeny i zmienne CSS. Tailwind jest adapterem implementacyjnym.
- Początkowy kontrakt kolorów obejmuje canvas/surfaces, tekst, borders/focus, actions, statusy, overlay, selection i focus ring.
- Spacing korzysta z bazy 4 px i pomocniczego kroku 2 px.
- `size` komponentu i globalne `density` są oddzielnymi osiami.
- Typografia używa wspólnych ról: display, heading, body, label, caption i code. Marki mogą dostarczać różne rodziny fontów, wagi i tracking w ramach wspólnych ograniczeń czytelności.
- Marka może zmieniać skalę radius i elevation, ale nie wprowadza przypadkowych wyjątków per komponent.

## Klasyfikacja elementów

- Foundations — kolor, typografia, spacing, motion i elevation.
- Primitives — podstawowe kontrakty interakcji i układu.
- Components — kompletne elementy UI.
- Patterns — kompozycje rozwiązujące powtarzalne zadania.
- Reference app — rzeczywiste przepływy pokazujące użycie systemu.
- Nie każdy wrapper DOM lub headless primitive musi mieć osobny komponent w Figma.

## Reference CRM

- Aplikacją referencyjną jest fikcyjny CRM klient/projekt.
- Główna rola: account/project manager.
- Zakres obejmuje:
  - listę klientów z wyszukiwaniem i filtrowaniem;
  - dodawanie i edycję klienta;
  - szczegóły klienta z listą projektów;
  - tworzenie projektu i zmianę statusu;
  - usuwanie z potwierdzeniem;
  - ustawienia użytkownika i demonstrację marek;
  - empty, loading, error, no-results i success.
- Poza V1 pozostają billing, rozbudowane uprawnienia, komunikator, pliki, kalendarz i kanban.
- Pierwszy pionowy przepływ:
  1. lista klientów;
  2. otwarcie formularza dodawania klienta;
  3. walidacja;
  4. zapis;
  5. dodanie klienta do listy;
  6. komunikat sukcesu.
- Formularz jest Dialogiem na szerokim ekranie i pełnoekranową prezentacją tego samego formularza na wąskim ekranie.
- Długi lub wieloetapowy formularz może później stać się osobną stroną.
- `Input`, `Textarea` i `Select` są kontrolkami.
- `Field` składa Label, kontrolkę, Description i Error oraz utrzymuje relacje dostępności.
- Komponenty formularzy nie zależą od konkretnej biblioteki zarządzania formularzem.
- Błędy są pokazywane po pierwszej próbie wysłania. Następnie poprawiane pole aktualizuje błąd na bieżąco.
- Po błędnym wysłaniu fokus przechodzi do pierwszego błędu lub podsumowania.
- Sukces jest komunikowany zmianą danych i krótkim Toastem. Błąd serwera używa trwałego Alertu w formularzu.

## Komponenty i API

- Wariant oznacza świadomy wybór publicznego API, np. `variant` lub `size`.
- Hover, pressed i focus-visible wynikają z interakcji, invalid z walidacji, a disabled z funkcji.
- Nie modelujemy niemożliwych kombinacji takich jak `disabled + hover` jako swobodnych wariantów.
- Figma pokazuje stany dokumentacyjne, ale nie udostępnia niekontrolowanego iloczynu wariantów.
- Ikony V1 pochodzą z Lucide i są używane przez wspólny kontrakt `Icon`.
- Logotypy oraz ilustracje marki są oddzielnymi assetami.
- Obsługiwane przeglądarki web V1: aktualna i poprzednia główna wersja Chrome, Edge, Firefox i Safari oraz mobilne Safari i Chrome. Brak wsparcia dla Internet Explorera i starych WebView.

## Definition of Done komponentu

- Komponent jest użyty w rzeczywistym przepływie Reference CRM.
- Ma mapowanie tokenów i specyfikację Figma.
- Ma implementację React, udokumentowaną anatomię i publiczne API.
- Obsługuje prawidłowe stany, klawiaturę i focus-visible.
- Ma przykłady dla Atlas/Bloom oraz light/dark.
- Ma testy zachowania, wąskiego widoku i długiej treści.
- Jest dostępny w registry i posiada dokumentację instalacji.

## Figma

- Powstają dwa pliki:
  1. DS Core Library — foundations, variables, komponenty i kontrakty;
  2. DS Reference CRM — projekt konsumujący opublikowaną bibliotekę.
- Reference CRM nie korzysta z nieopublikowanych lokalnych elementów Core Library.

## Repozytorium i architektura

- Nazwa publiczna: MFD Design System.
- Katalog projektu: `design-system.mflisikowski.dev`.
- Repozytorium pozostaje prywatne.
- Zakładany namespace do czasu sprawdzenia dostępności: `@mflisikowski`.
- Proponowane pakiety obejmują `@mflisikowski/tokens` i `@mflisikowski/lint-config`.
- Monorepo zawiera:
  - `apps/docs`;
  - `apps/reference-crm`;
  - `packages/tokens`;
  - `packages/lint-config`;
  - `registry/ui`;
  - `registry/blocks`;
  - `registry/themes`;
  - główny `registry.json`.
- Stos: Next.js App Router, TypeScript, pnpm workspace, Turborepo, Tailwind CSS v4 i Base UI.
- Dokumentacja i registry są publiczne. Repozytorium oraz motywy i assety prawdziwych klientów pozostają prywatne.
- Generic components, token schema i konfiguracja lintowania będą publikowane na licencji MIT.

## Portal i wdrożenie

- Hosting: Vercel. DNS jest zarządzany przez właściciela projektu.
- Dokumentacja i registry: `design-system.mflisikowski.dev`.
- Reference CRM jest osobną aplikacją i osobnym projektem Vercel: `crm.design-system.mflisikowski.dev`.
- `/reference` w dokumentacji prowadzi do Reference CRM.
- Portal zawiera `/`, `/foundations`, `/components`, `/patterns`, `/themes`, `/reference`, `/changelog` i `/r/*`.
- Pierwsze publiczne wydanie `0.1.0` następuje po ukończeniu przepływu „Dodaj klienta”.
- Dokumentacja oznacza elementy jako stable, experimental, planned lub deprecated.

## Registry i dystrybucja

- Model dystrybucji jest hybrydowy:
  - wersjonowany pakiet dostarcza tokeny i kontrakt motywów;
  - shadcn registry dostarcza edytowalny kod komponentów React;
  - repozytorium design systemu pozostaje źródłem kanonicznym.
- Source registry składa się z `registry.json` i plików w `registry/`.
- Build generuje pliki instalacyjne do `apps/docs/public/r`.
- Wygenerowane JSON-y nie są edytowane ręcznie.
- CI waliduje registry i instaluje elementy w czystym projekcie testowym.
- Reference CRM konsumuje publiczny kontrakt tak samo jak zewnętrzna aplikacja i nie importuje prywatnych plików registry.
- Lokalnie zmodyfikowany komponent registry staje się forkiem i traci automatyczną zgodność z kolejnymi aktualizacjami.

## Governance

- Mały zespół właścicielski zatwierdza API i tokeny.
- Zespoły produktowe proponują zmiany.
- Nowy komponent wymaga potwierdzonego użycia w Reference CRM.
- Wyjątki i odstępstwa są dokumentowane.
- Automatyczne bramki jakości są uzupełniane manualnym przeglądem.

## Lintowanie i agenci

- Biome odpowiada za formatowanie oraz organizację importów.
- Oxlint odpowiada za lintowanie TypeScript/React i uruchamianie `@shadcn/lint`.
- ESLint nie jest częścią podstawowego toolchainu.
- `@shadcn/lint` jest obowiązkowym, eksperymentalnym quality gate'em z przypiętą dokładną wersją.
- Początkowe reguły jako `error`:
  - `no-restyle`;
  - `no-raw-colors`;
  - `no-arbitrary-values`;
  - `no-inline-styles`;
  - `require-static-classes`.
- `no-unknown-classes` zaczyna jako `warn` i przechodzi na `error` po ustabilizowaniu pierwszego przepływu.
- `apps/reference-crm` podlega pełnemu zestawowi reguł.
- `apps/docs` sprawdza uruchamialne przykłady, ale nie skanuje całej treści MDX.
- `registry/ui` i `registry/blocks` zachowują walidację kolorów, inline styles i nieznanych klas; reguły blokujące implementację wewnętrzną mają odpowiednie overrides.
- `apps/docs/public/r` jest wykluczone jako kod wygenerowany.
- Wyjątek od reguły dotyczy najmniejszego zakresu, musi zawierać uzasadnienie i podlega code review.
- Komunikat lintowania wyjaśnia naruszenie, przyczynę, właściwe rozwiązanie oraz link do dokumentacji komponentu.
- `AGENTS.md` wymaga uruchomienia lintowania po zmianach UI i zabrania nieuzasadnionego wyłączania reguł MFD.
- Kanoniczna polityka lintowania znajduje się w `packages/lint-config`. Publiczne registry może dostarczyć opcjonalny element `lint-setup`.
- Aktualizacje `@shadcn/lint` nie są scalane automatycznie. Każda aktualizacja przechodzi Reference CRM, źródła registry, czysty projekt instalacyjny i porównanie diagnostyk.
- Powrót do ESLinta nastąpi tylko przy powtarzalnej niestabilności CI, niewyrażalnych false positives, problemach z monorepo lub braku działającej przypiętej wersji.
- Minimalny spike Oxlint + `@shadcn/lint` zakończył się powodzeniem: wykrył niedozwolone restylowanie Buttona i zaakceptował dozwolone klasy layoutowe. Odtwarzalna kopia znajduje się w `spikes/oxlint-shadcn-lint/`.

## Stan projektu i punkt wznowienia

- Katalog projektu zawiera specyfikację i odtwarzalny spike. Lokalne repozytorium Git jest zainicjalizowane, ale nie ma jeszcze pierwszego commita, zdalnego repozytorium ani scaffoldu właściwych aplikacji.
- Nie rozpoczęto implementacji ani tworzenia nowych plików Figma.
- Następny temat: dokładny format tokenów oraz konkretne wartości foundations dla Atlas i Bloom.
