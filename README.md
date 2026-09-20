# Message

Statisches Katzenrätsel im DnD-Stil. Über `content/settings.json` lässt sich die Lösung festlegen:

```json
{
  "solution": ["3", "1", "7"],
  "video": "Loesung.mp4",
  "audioExtension": "mp3",
  "sounds": ["1", "2", "3", "4", "5", "6", "7"]
}
```

`solution` enthält die Dateinamen der Geräusche **ohne Dateiendung**, in genau der gewünschten Reihenfolge. `video` ist der Dateiname unter `content/video`.

Die Reihenfolge unter `sounds` bestimmt die Nummer der Katzen in der Oberfläche: Der erste Eintrag ist Katze 1, der zweite Katze 2 usw. Mit `audioExtension` wird das Audioformat definiert.

Ist `soundsCsv` gesetzt, wird stattdessen `content/sounds.csv` verwendet. Jeder nicht-leere Eintrag definiert einen Sound; die Zeilenreihenfolge wird unverändert als Reihenfolge der Katzenbuttons übernommen. Die Überschrift `sound` ist optional.

`sequenceOverlapMs` bestimmt, wie viele Millisekunden vor dem Ende eines Katzengeräuschs der nächste Ton bei der Übermittlung beginnt. Der Wert `500` halbiert die hörbare Pause zwischen den neuen Audios.

Zum lokalen Testen muss die Seite über einen kleinen Webserver geöffnet werden, z. B. mit `npx serve .`, da Browser eine JSON-Datei bei einem direkten `file:///`-Aufruf häufig nicht laden dürfen.
