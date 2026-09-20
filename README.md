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

Zum lokalen Testen muss die Seite über einen kleinen Webserver geöffnet werden, z. B. mit `npx serve .`, da Browser eine JSON-Datei bei einem direkten `file:///`-Aufruf häufig nicht laden dürfen.
