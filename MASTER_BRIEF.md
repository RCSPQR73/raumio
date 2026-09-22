# RAUMIO — Master Brief

## Zweck dieses Dokuments

Dieses Dokument ist die gemeinsame Referenz für Produktidee, Website, Demo, Kommunikation und nächste Entwicklungsschritte. Es beschreibt bewusst den Unterschied zwischen dem, was RAUMIO langfristig leisten soll, und dem, was die aktuelle Website bereits zuverlässig zeigt.

RAUMIO ist eine Produktidee für Menschen, die ihren Wohnraum verstehen, den Wert vorhandener Möbel einschätzen und neue Einrichtung im eigenen Raum ausprobieren möchten.

## Die Kernbotschaft

**Dein Raum. Neue Möglichkeiten.**

RAUMIO macht aus einem realen Raum eine verständliche, interaktive Entscheidungsgrundlage:

1. Raum mit iPhone oder iPad erfassen.
2. Raumgeometrie und Gegenstände in einem navigierbaren 3D-Modell zusammenführen.
3. Möbelgruppen sichtbar zuordnen und Unsicherheit offen anzeigen.
4. Ähnliche Second-Hand-Angebote recherchieren und eine nachvollziehbare Wertspanne zeigen.
5. Neue Möbel im selben Raum virtuell testen.
6. Aus der Entscheidung heraus passende Verkaufs- oder Kaufoptionen öffnen.

RAUMIO soll nicht nur einen Raum abbilden. Es soll helfen, aus dem bereits Vorhandenen bessere Entscheidungen zu treffen.

## Das langfristige Produktziel

Die vollständige Produktversion soll eine mobile Scan-Erfahrung für iPhone und iPad anbieten. Eine Person bewegt sich mit der Kamera durch den Raum, erfasst Wände, Ecken, Türen, Fenster und Möbel aus mehreren Blickwinkeln und erhält anschließend ein maßhaltiges digitales Raumabbild.

Das Produkt soll dabei:

- Raumgröße und Raumgeometrie aus mehreren Aufnahmen ableiten.
- Unvollständige oder widersprüchliche Scanbereiche markieren.
- einzelne Möbel und Gegenstände möglichst genau erkennen.
- zwischen sicherer Kategorie und wahrscheinlicher Zuordnung unterscheiden.
- Hersteller, Modell, Maße, Zustand und Material nur dann behaupten, wenn die Evidenz ausreicht.
- für jedes bewertbare Objekt konkrete Vergleichsangebote mit Preis, Datum, Ort und Ähnlichkeitsbegründung zeigen.
- einen Teilwert und später, bei ausreichender Abdeckung, einen vollständigen Raumwert berechnen.
- Verkäufe über geeignete Plattformen wie Kleinanzeigen vorbereiten.
- neue Möbel maßstäblich, verschiebbar und drehbar im Raum platzieren.
- passende Kaufmöglichkeiten und später gekennzeichnete Affiliate-Angebote anzeigen.

## Was die aktuelle Website ist

Die Website ist eine hochwertige Konzeptdemo und Landingpage. Sie erklärt das Produkt, zeigt den vorgesehenen Ablauf und macht den wichtigsten Interaktionskern früh sichtbar: einen breiten 3D-Raumviewer mit festem Kamerastandpunkt.

Die aktuelle Demo verwendet das eingebettete Sketchfab-Modell **Hotel Room + Hallway** von Rafael Rodrigues. Die Herkunft bleibt im Seitenfuß transparent angegeben. Das Modell wird nicht als eigenes Werk ausgegeben und darf nicht ohne passende Rechte heruntergeladen oder weiterverwendet werden.

Die Demo enthält:

- eine responsive Landingpage mit Hero, Produktüberblick, Ablauf, Wertbereich, Möbelplatzierung, Funktionsbeschreibung und FAQ.
- eine große 3D-Ansicht mit festem Standpunkt und rotierbarem Blick.
- invertierte vertikale Steuerung: Nach oben ziehen blickt nach oben.
- Blicksteuerung per Maus, Touch und Pfeiltasten.
- einen Fadenkreuz-/Retikel-Zustand, der zeigt, welches Modellteil anvisiert wird.
- sechs manuell zugeordnete Objektgruppen.
- Objektkarten für bestätigte, wahrscheinliche und offene Zuordnungen.
- Beispielwerte aus recherchierten Kleinanzeigen-Angeboten.
- Preis-An/Aus, Objektfilter und Quellen-Dialog.
- eine Scan-Ablaufsimulation ohne Kamerazugriff.
- eine separate Three.js-Möbelplatzierungsdemo mit Draufsicht und ausgeblendetem Flur.
- ein English/Deutsch-Sprachmodul; English ist bei einem neuen Besuch die Standardsprache.
- Tests für Preisberechnung, Marktquellen, Kamerainvarianten und eindeutige Objektzuordnung.

## Was bereits funktioniert

### 3D-Raumviewer

- Der Blick rotiert um einen festen Standpunkt.
- Die Kameraposition verändert sich beim Umsehen nicht.
- Horizontales und vertikales Ziehen steuern die Blickrichtung.
- Pfeiltasten und die sichtbaren Links-/Rechts-/Reset-Schaltflächen sind verfügbar.
- Das Blickzentrum wird gegen zugeordnete Modellteile geprüft.
- Nur zugeordnete Modellteile können eine Objektkarte auslösen.
- Wand- oder unbekannte Geometrie erzeugt keinen erfundenen Preis.

### Objekt- und Wertlogik

- Das Modell ist in sechs kuratierte Gruppen gegliedert.
- Zwei Betten werden als zwei Stück gezählt.
- Vergleichswerte verwenden transparente untere und obere Angebotspreise.
- Nicht ausreichend belegte Kategorien bleiben offen.
- Die Website zeigt klar, dass Angebotspreise keine garantierten Verkaufspreise sind.
- Vergleichsquellen enthalten individuelle Links und Ähnlichkeitsgrenzen.

### Möbel ausprobieren

- Sessel und Beistelltisch sind als Demoobjekte vorhanden.
- Position, Drehung und Farbe lassen sich ändern.
- Die Platzierungsansicht bleibt im gleichen Raumkonzept und blendet den Flur aus.
- Eine spätere zusätzliche 3D-Datei kann an dieser Stelle integriert werden.

### Sprache und Kommunikation

- English ist die Standardsprache bei einem neuen Besuch.
- Deutsch kann oben rechts ausgewählt werden.
- Statische und dynamische Inhalte wechseln gemeinsam: Navigation, Objektkarten, Preise, Filter, Viewer-Hinweise und Platzierungsdemo.

## Was noch nicht vollständig stimmt oder nur simuliert ist

Diese Punkte müssen in jeder Produkt- und Investorendarstellung klar bleiben:

- Die Website scannt aktuell keine reale Wohnung.
- Die Website fordert keinen Kamerazugriff an.
- Die Raumgeometrie wird nicht aus einer Nutzeraufnahme rekonstruiert.
- Die Objektzuordnung ist für die Demo manuell kuratiert und nicht durch ein allgemeines Erkennungsmodell erzeugt.
- Die Preise werden nicht live von Second-Hand-Plattformen abgefragt.
- Die Vergleichsangebote sind recherchierte Beispiele und keine bestätigten Verkaufspreise.
- Hersteller, exakte Modellnummer, Zustand, Maße und Lieferumfang sind bei den Modellobjekten nicht verifiziert.
- Der angezeigte Wert ist ein belegter Teilwert; ein vollständiger Raumwert wird nicht behauptet.
- Die Platzierungsobjekte sind erzeugte Demo-Geometrien und noch nicht die später gelieferte zusätzliche Möbeldatei.
- Die Platzierung ist noch keine maßhaltige gemeinsame Rekonstruktion des Originalraums.
- Affiliate-Links und Provisionen sind noch nicht eingerichtet.
- Nutzerkonten, Scan-Speicherung, Datenschutzverwaltung und Cloud-Synchronisation fehlen.

## Produktprinzipien

### Vertrauen vor Behauptung

RAUMIO soll Unsicherheit sichtbar machen. Eine Kategorie darf bestätigt sein, während Hersteller oder exakte Identität offen bleiben. Ein fehlender Vergleichswert ist besser als ein erfundener Wert.

### Evidenz vor Genauigkeitsschein

Jede Wertspanne braucht eine nachvollziehbare Grundlage: konkrete Angebote, Datenstand, Ähnlichkeit, Unterschiede und Mengenlogik. Das Produkt soll keine scheinpräzise Zahl erzeugen, wenn die Datenlage nur eine Spanne erlaubt.

### Entscheidung statt Datensammlung

Die Oberfläche soll nicht wie ein technisches Scanprotokoll wirken. Jede Ansicht muss auf eine verständliche Entscheidung einzahlen: behalten, verkaufen, prüfen, platzieren oder kaufen.

### Raum zuerst

Der 3D-Raum ist der zentrale Produktmoment. Die Landingpage erklärt genug, damit die Ansicht verständlich ist, führt aber früh in die Interaktion.

### Vergleichbar und teilbar

Ein Nutzer soll Ergebnisse mit anderen besprechen können. Dafür braucht die spätere Produktversion stabile Objektkarten, gespeicherte Szenen, Quellenlinks und reproduzierbare Wertberechnungen.

## Zielgruppen

### Privatpersonen beim Umzug oder Ausmisten

Sie möchten schnell verstehen, was vorhanden ist, was verkauft werden kann und welche Dinge keinen Aufwand für eine Bewertung rechtfertigen.

### Menschen bei einer Neueinrichtung

Sie möchten neue Möbel vor dem Kauf im eigenen Raum sehen und Größen- oder Platzierungsfehler vermeiden.

### Second-Hand-Verkäufer

Sie benötigen nachvollziehbare Preisorientierung, passende Plattformen und eine strukturierte Objektübersicht.

### Partner und Händler

Sie können später passende Produkte oder geprüfte Ersatz-/Ergänzungsstücke anbieten. Jede kommerzielle Empfehlung muss als solche gekennzeichnet werden.

## Inhaltliche Anforderungen an jede Objektkarte

Eine fertige Objektkarte sollte mindestens enthalten:

- Objektname und Menge.
- Status: Kategorie bestätigt, wahrscheinlich oder Identität offen.
- kurze Beschreibung des Modellteils.
- Preisbereich pro Stück und gegebenenfalls Gesamtmenge.
- Anzahl und Links der Vergleichsangebote.
- Datum und Markt der Recherche.
- Ähnlichkeiten und relevante Abweichungen.
- Hinweis, ob der Wert in die Teilsumme einfließt.
- Möglichkeit, das Objekt im Raum anzusehen.

## Preis- und Datenmodell für die nächste Version

Die spätere Marktdatenintegration sollte nicht einfach einen einzelnen Preis ausgeben. Sie sollte pro Vergleichsangebot strukturierte Felder führen:

- Quelle und URL.
- Titel und Kategorie.
- Preis, Verhandlungsstatus und Währung.
- Standort und Veröffentlichungsdatum.
- Zustand, Maße und Lieferumfang, soweit angegeben.
- Ähnlichkeitsmerkmale.
- Abrufzeitpunkt und Verfügbarkeitsstatus.

Der angezeigte Bereich sollte aus einer nachvollziehbaren Auswahl entstehen. Ausreißer, doppelte Anzeigen und nicht vergleichbare Produkte müssen markiert oder ausgeschlossen werden.

## Roadmap

### Stufe 1 — Konzeptdemo

- aktuelle Landingpage und 3D-Viewer.
- feste Kamera, Retikel und Objektkarten.
- kuratierte Beispielangebote.
- Platzierungsdemo.
- zweisprachige Oberfläche.

### Stufe 2 — echter Scan-Prototyp

- iPhone-/iPad-Aufnahmefluss.
- Raumgeometrie aus mehreren Kameraposen.
- Scanfortschritt und unvollständige Bereiche.
- exportierbares Raumprojekt.

### Stufe 3 — Erkennung und Bewertung

- automatische Objektvorschläge.
- sichtbare Confidence-Werte.
- manuelle Korrektur durch den Nutzer.
- Marktquellen mit Aktualisierungszeitpunkt.
- gespeicherte Quellen- und Berechnungsgrundlage.

### Stufe 4 — maßhaltige Platzierung

- echte Raumgeometrie als gemeinsame Szene.
- importierte Möbeldateien.
- Maßstab, Bodenhöhe, Ausrichtung und Kollisionen.
- Vergleich mehrerer Möbelvarianten.

### Stufe 5 — Produkt- und Marktplatz

- Verkaufsvorbereitung und Plattformwahl.
- Händler- und Produktsuche.
- klar gekennzeichnete Affiliate-Links.
- Nutzerkonto, Projekte, Freigaben und Datenschutzkontrollen.

## Definition of Done für die nächste Produktversion

Eine nächste Version ist erst bereit, wenn:

- ein echter Scan reproduzierbar einen nutzbaren Raum erzeugt.
- ein Nutzer erkannte Objekte korrigieren kann.
- jede Preiszahl auf konkrete, gespeicherte Vergleichsdaten zurückgeht.
- unbekannte Objekte nicht automatisch bewertet werden.
- ein importiertes Möbelmodell maßstabsgetreu in derselben Szene platziert werden kann.
- Nutzer klar sehen, welche Daten gespeichert, geteilt oder an externe Anbieter weitergegeben werden.
- Website, mobile Nutzung und Tastaturbedienung geprüft sind.
- externe Modell- und Plattformrechte dokumentiert sind.

## Kommunikationsleitfaden

### So soll RAUMIO beschrieben werden

> RAUMIO verwandelt deinen Raum in eine interaktive Entscheidungsgrundlage. Scanne, was da ist, verstehe den ungefähren Second-Hand-Wert und probiere aus, was als Nächstes passen könnte.

### So soll RAUMIO nicht beschrieben werden

- nicht als bereits fertige automatische KI-Erkennung.
- nicht als garantierte Marktwert- oder Verkaufspreis-App.
- nicht als vollständiger Raumscan, solange die Scan-Anbindung fehlt.
- nicht als exakte Hersteller- oder Modellidentifikation ohne belastbare Quelle.
- nicht als eigenes 3D-Modell, wenn das externe Sketchfab-Modell gemeint ist.

## Repository und Verantwortlichkeit

Das öffentliche Repository ist:

<https://github.com/RCSPQR73/raumio>

Die zentrale Website liegt unter `dist/`. Die aktuelle Demo ist statisch auslieferbar und benötigt keinen Build-Schritt. Änderungen an Produktbotschaft, Erkennungslogik, Preisquellen oder externen Assets sollen zuerst in diesem Master Brief nachvollziehbar gemacht werden.

Vor jeder Veröffentlichung prüfen:

1. Ist klar, was Demo und was echte Produktfunktion ist?
2. Sind externe Modell- und Quellenhinweise erhalten?
3. Sind Preise und Datenstand nachvollziehbar?
4. Funktionieren beide Sprachen und der mobile Viewer?
5. Sind neue Assets und Rechte dokumentiert?
