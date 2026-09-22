# RAUMIO

Zweisprachige Landingpage und interaktive Raumscanner-Konzeptdemo. English ist die Standardsprache; Deutsch kann über den Sprachumschalter aktiviert werden.

Die gemeinsame Produktbeschreibung, aktuelle Grenzen, Kernbotschaft und Roadmap stehen in [`MASTER_BRIEF.md`](MASTER_BRIEF.md).

## Live ansehen und gemeinsam bearbeiten

Das Projekt ist öffentlich auf GitHub verfügbar: <https://github.com/RCSPQR73/raumio>.
Die veröffentlichte Website wird über GitHub Pages aus dem `main`-Branch bereitgestellt. Nach einem akzeptierten Push oder Merge baut der Pages-Workflow den aktuellen Stand automatisch aus `dist/`.

Ein Link allein gibt keine Schreibrechte. Für direkte Änderungen muss eine Person als Repository-Mitwirkende mit Schreibzugriff eingeladen werden. Alternativ kann jede Person das Repository forken, Änderungen vorschlagen und einen Pull Request öffnen. Erst nach dem Merge in `main` wird der Stand veröffentlicht.

## Starten

Im Projektordner: `python3 -m http.server 4173 --directory dist --bind 127.0.0.1`

Dann `http://127.0.0.1:4173` öffnen. Keine Installation und kein Build erforderlich; die statischen Dateien sind direkt auslieferbar. Die lokale Vorschau wird während der Entwicklung auf diesem Port bereitgestellt.

## Implementiert

- Große, früh sichtbare Sketchfab-Ansicht des vorgegebenen Hotelzimmers.
- Feste Kamera bei `[-10.25, 14.25, 1.62]`, ausschließlich Blickrotation per Maus, Touch oder Pfeiltasten. Home setzt den Blick zurück.
- Echte Strahlprüfung durch das Blickzentrum über die Sketchfab Viewer API. Manuell zugeordnete Mesh-IDs bestimmen die Objektkarte. Wände oder nicht zugeordnete Geometrie zeigen keinen Preis.
- Sechs zugeordnete Modellgruppen; zwei Betten werden in der Bewertung zweifach gezählt.
- Neun individuell recherchierte Kleinanzeigen-Angebote, einschließlich Datenstand, Preis, Einheit und Ähnlichkeitsgrenzen. Nur drei Kategorien mit jeweils zwei Vergleichspreisen fließen in die Teilsumme ein. Zwei weitere Kategorien zeigen Recherchebelege, bleiben aber unbewertet.
- Filterbare Übersicht, Quellen-Dialog mit konkreten Anzeigen und transparenter Berechnung, Preis-An/Aus, direkter Blick auf ausgewählte Objekte.
- Scan-Ablaufsimulation ohne Kameraaufnahme.
- Separate Three.js-Platzierungsszene mit Sessel/Tisch, Position, Drehung, Farben, Reset, Ziehen und animiertem Ablauf; Produktsuche ohne Affiliate-ID.
- Ausführliche Funktionsbeschreibungen und FAQ, responsive Gestaltung, Tastaturbedienung und reduzierte Bewegung für Oberflächenübergänge.
- Optional WebMCP: `read_room_demo` und `focus_room_object`, mit derselben UI-Zustandslogik.

## Grenzen

Kein tatsächlicher Raumscan, keine automatische KI-Erkennung, keine Live-Preissuche. Die Modellkategorie identifiziert keine Handelsmarke. Hersteller, Material, tatsächlicher Zustand und Abmessungen der Szene sind nicht bestätigt. Preisangaben sind ausgewählte Angebotspreise, keine erzielten Verkäufe oder zugesicherten Marktwerte.

Stand 22.09.2026: Bettrahmen 70–180 € je Stück (Vergleichsangebote ohne Matratze), Nachttisch 10–20 €, gebrauchte Tischleuchte 6–10 €. Bewertete Teilsumme: **156–390 €** für zwei Bettrahmen, einen Nachttisch und eine Leuchte. Der vollständige Raumwert bleibt offen. Weitere sichtbare Objekte außerhalb der Liste sind nicht bewertet. Die Beispiele sind nur begrenzt visuell vergleichbar; Abweichungen stehen bei jeder Quelle. Anzeigen waren bei Prüfung erreichbar; Verkäufer wurden nicht kontaktiert.

Die zusätzliche Möbeldatei fehlt noch. Sie kann anschließend in `dist/placement.js` anstelle der erzeugten Beispielgeometrie integriert werden. Dafür sind Dateiformat, Maßstab, Ausrichtung und Material zu prüfen. Das fremde Sketchfab-Modell stellt keinen beliebigen GLB-Import bereit und ist nicht als Download freigegeben. Eine exakte gemeinsame Platzierung in dessen Originalgeometrie benötigt eine nutzbare Raumdatei samt Nutzungsrechten.

## Dateien

- `dist/index.html`: Landingpage, Funktionsbeschreibungen, FAQ und Dialogstruktur.
- `dist/styles.css`: Basis- und Interaktionslayouts.
- `dist/design.css`: überarbeitete Markenwelt mit dunklem Einstieg und hellen redaktionellen Abschnitten.
- `dist/assets/lounge-editorial.jpg`: KI-generierte, explizit illustrative Einrichtungsinspiration.
- `dist/app.js`: gemeinsamer UI-Zustand, Quellen, Übersicht, Scan-Simulation, WebMCP.
- `dist/camera.js`: kalibrierte Kamera und Strahlprüfung.
- `dist/data.js`: Objektgruppen, Mesh-Zuordnung, Stückzahlen und Berechnung.
- `dist/comparables.js`: konkrete, recherchierte Anzeigen und Vergleichsgrenzen.
- `dist/placement.js`: separate interaktive 3D-Möbelszene.
- `tests/contract.test.mjs`: relevante Berechnungs- und Kamerainvarianten.

## Prüfen

`node --test tests/contract.test.mjs`

Syntax: `node --check dist/app.js`, `node --check dist/camera.js`, `node --check dist/placement.js`.

Browser-Abnahme: Preisquelle öffnen; bestätigte/wahrscheinliche/offene Kategorie filtern; mit Blicksteuerung Bett, Nachttisch und Leuchte treffen; Blick auf Wand richten; feste Kameraposition vergleichen; Möbel wechseln, Farbe und Position ändern, Animation und Reset; Scan-Simulation durchlaufen; breite und mobile Ansichten auf Überlauf prüfen.

## Externe Dienste und Herkunft

3D-Modell: [Hotel Room + Hallway](https://sketchfab.com/3d-models/hotel-room-hallway-f5d2584af20c4c778e22544c1c1334c6), [Rafael Rodrigues](https://sketchfab.com/RafaelBR873D). Originalmodell bleibt extern eingebettet. Quellenhinweis im Seitenfuß und native Sketchfab-Kennzeichnung bleiben erhalten. Das Modell wird nicht als eigenes Werk ausgegeben.

Sketchfab Viewer API 1.12.1 vom offiziellen Anbieter; Three.js 0.180.0 (MIT, Lizenz in `dist/vendor/LICENSE`). Schriftarten werden von Google Fonts geladen. Anzeigen/Produktsuche führen zu Kleinanzeigen beziehungsweise IKEA. Keine Benutzerkonten, Formulardaten, API-Schlüssel oder Affiliate-IDs erforderlich.

## Gestaltungsüberarbeitung

Dunkler immersiver Hero und Viewer, kontrastierende helle Inhaltskapitel, großzügige Typografie, konsistente Bedienelemente und eine eigene Möbelillustration. Ergänzende Funktionsinformationen sind aufklappbar. Die Illustration zeigt kein verifiziertes Handelsprodukt und ersetzt nicht das später gelieferte Möbelmodell.
