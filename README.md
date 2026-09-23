# RAUMIO

Zweisprachige Landingpage und interaktive Raumscanner-Konzeptdemo. English ist die Standardsprache; Deutsch kann über den Sprachumschalter aktiviert werden.

Die gemeinsame Produktbeschreibung, aktuelle Grenzen, Kernbotschaft und Roadmap stehen in [`MASTER_BRIEF.md`](MASTER_BRIEF.md).

## Live ansehen und gemeinsam bearbeiten

Das Projekt ist öffentlich auf GitHub verfügbar: <https://github.com/RCSPQR73/raumio>.
Ein GitHub-Pages-Workflow ist eingerichtet und veröffentlicht den aktuellen Stand aus `dist/` nach jedem akzeptierten Push oder Merge. Einmalig muss unter **Settings → Pages** als Quelle **GitHub Actions** ausgewählt werden; danach ist die Website unter `https://rcspqr73.github.io/raumio/` erreichbar.

Ein Link allein gibt keine Schreibrechte. Für direkte Änderungen muss eine Person als Repository-Mitwirkende mit Schreibzugriff eingeladen werden. Alternativ kann jede Person das Repository forken, Änderungen vorschlagen und einen Pull Request öffnen. Erst nach dem Merge in `main` wird der Stand veröffentlicht.

## Starten

Im Projektordner: `python3 -m http.server 4173 --directory dist --bind 127.0.0.1`

Dann `http://127.0.0.1:4173` öffnen. Keine Installation und kein Build erforderlich; die statischen Dateien sind direkt auslieferbar. Die lokale Vorschau wird während der Entwicklung auf diesem Port bereitgestellt.

## Implementiert

- Große, früh sichtbare Sketchfab-Ansicht des vorgegebenen Hotelzimmers.
- Feste Kamera bei `[-10.25, 14.25, 1.62]`, ausschließlich Blickrotation per Maus, Touch oder Pfeiltasten. Home setzt den Blick zurück.
- Echte Strahlprüfung durch das Blickzentrum über die Sketchfab Viewer API. Manuell zugeordnete Mesh-IDs bestimmen die Objektkarte. Wände oder nicht zugeordnete Geometrie zeigen keinen Preis.
- Sechs zugeordnete Modellgruppen; zwei Betten werden in der Bewertung zweifach gezählt.
- Vierzehn individuell recherchierte Kleinanzeigen-Angebote, einschließlich Datenstand, Preis, Einheit und Ähnlichkeitsgrenzen. Fünf Kategorien fließen in die bewertete Teilsumme ein; unsichere Identitäten bleiben ausdrücklich offen.
- Filterbare Übersicht, Quellen-Dialog mit konkreten Anzeigen und transparenter Berechnung, Preis-An/Aus, direkter Blick auf ausgewählte Objekte.
- Scan-Ablaufsimulation ohne Kameraaufnahme.
- Möbelvorschau über dem live gerenderten Explore-Zimmer: Die Sketchfab-Kamera zeigt den Raum von oben, die Zimmerdecke und separaten Flurelemente sind per Viewer API ausgeblendet. Beispiel-Sessel oder -Tisch werden als ungefähr maßstäbliche Three.js-Vorschau über dem offenen Boden angezeigt und können gezogen, gedreht, zurückgesetzt oder animiert werden. Der angezeigte Neupreis ist ein Demo-Wert.
- Ausführliche Funktionsbeschreibungen und FAQ, responsive Gestaltung, Tastaturbedienung und reduzierte Bewegung für Oberflächenübergänge.
- Optional WebMCP: `read_room_demo` und `focus_room_object`, mit derselben UI-Zustandslogik.

## Grenzen

Kein tatsächlicher Raumscan, keine automatische KI-Erkennung, keine Live-Preissuche. Die Modellkategorie identifiziert keine Handelsmarke. Hersteller, Material, tatsächlicher Zustand und Abmessungen der Szene sind nicht bestätigt. Preisangaben sind ausgewählte Angebotspreise, keine erzielten Verkäufe oder zugesicherten Marktwerte.

Stand 22.09.2026: Bettrahmen 70–180 € je Stück, Nachttisch 10–35 €, Tischleuchte 5–10 €, Polsterstuhl 20–30 €, Ottomane 15–22 €. Bewertete Teilsumme: **190–457 €** für zwei Betten und je eines der übrigen vier Objekte. Der vollständige Raumwert bleibt offen. Weitere sichtbare Objekte außerhalb der Liste sind nicht bewertet. Die Beispiele sind nur begrenzt visuell vergleichbar; Abweichungen stehen bei jeder Quelle. Anzeigen waren bei Prüfung erreichbar; Verkäufer wurden nicht kontaktiert.

Die zusätzliche Möbeldatei fehlt noch. Sie kann später die erzeugte Beispielgeometrie in `dist/placement.js` ersetzen; Dateiformat, Maßstab, Ausrichtung und Material müssen dann geprüft werden. Der Sketchfab-Embed erlaubt keinen Import beliebiger neuer 3D-Geometrie, und das konkrete Raummodell ist nicht zum Download freigegeben. Die Vorschau liegt deshalb als separat gerenderte Schicht über demselben Live-Raum. Physikalisch korrekte Verdeckung, Kollisionen und Schatten im Originalmodell erfordern eine vom Urheber bereitgestellte Raumdatei und Nutzungsrechte.

## Dateien

- `dist/index.html`: Landingpage, Funktionsbeschreibungen, FAQ und Dialogstruktur.
- `dist/styles.css`: Basis- und Interaktionslayouts.
- `dist/design.css`: überarbeitete Markenwelt mit dunklem Einstieg und hellen redaktionellen Abschnitten.
- `dist/assets/lounge-editorial.jpg`: KI-generierte, explizit illustrative Einrichtungsinspiration.
- `dist/app.js`: gemeinsamer UI-Zustand, Quellen, Übersicht, Scan-Simulation, WebMCP.
- `dist/camera.js`: kalibrierte Kamera und Strahlprüfung.
- `dist/data.js`: Objektgruppen, Mesh-Zuordnung, Stückzahlen und Berechnung.
- `dist/comparables.js`: konkrete, recherchierte Anzeigen und Vergleichsgrenzen.
- `dist/placement.js`: ungefähr maßstäbliche, interaktive Möbelvorschau, an die Kameraperspektive des live eingebetteten Raums angepasst.
- `tests/contract.test.mjs`: relevante Berechnungs- und Kamerainvarianten.

## Prüfen

`node --test tests/contract.test.mjs`

Syntax: `node --check dist/app.js`, `node --check dist/camera.js`, `node --check dist/placement.js`.

Browser-Abnahme: Preisquelle öffnen; bestätigte/wahrscheinliche/offene Kategorie filtern; mit Blicksteuerung Bett, Nachttisch und Leuchte treffen; Blick auf Wand richten; feste Kameraposition vergleichen; Möbel wechseln, Position und Drehung ändern, Animation und Reset; Scan-Simulation durchlaufen; breite und mobile Ansichten auf Überlauf prüfen.

## Externe Dienste und Herkunft

3D-Modell: [Hotel Room + Hallway](https://sketchfab.com/3d-models/hotel-room-hallway-f5d2584af20c4c778e22544c1c1334c6), [Rafael Rodrigues](https://sketchfab.com/RafaelBR873D). Originalmodell bleibt extern eingebettet. Quellenhinweis im Seitenfuß und native Sketchfab-Kennzeichnung bleiben erhalten. Das Modell wird nicht als eigenes Werk ausgegeben.

Sketchfab Viewer API 1.12.1 vom offiziellen Anbieter; Three.js 0.180.0 (MIT, Lizenz in `dist/vendor/LICENSE`). Schriftarten werden von Google Fonts geladen. Vergleichsangebote führen zu Kleinanzeigen; die Möbelvorschau zeigt nur illustrative Neupreise. Keine Benutzerkonten, Formulardaten, API-Schlüssel oder Affiliate-IDs erforderlich.

## Gestaltungsüberarbeitung

Dunkler immersiver Hero und Viewer, kontrastierende helle Inhaltskapitel, großzügige Typografie, konsistente Bedienelemente und eine eigene Möbelillustration. Ergänzende Funktionsinformationen sind aufklappbar. Die Illustration zeigt kein verifiziertes Handelsprodukt und ersetzt nicht das später gelieferte Möbelmodell.
