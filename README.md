# MySmart Wrapper Card

A simple container card for Home Assistant. It holds other cards and lets you style the container with normal CSS.

I use it in a few places on my kitchen tablet dashboard. Around the whole dashboard it adds padding, so nothing ends up hidden behind the edge of the 3D printed frame. On the Home tab it's a CSS grid that puts the weather, the calendar and the small cards side by side.

## Installation

### HACS

1. Open HACS in Home Assistant.
2. Click the three dots in the upper right corner and choose **Custom repositories**.
3. Paste `https://github.com/agoberg85/mysmart-wrapper-card` into the repository field, select **Dashboard** as the type, and click **Add**.
4. Search for **MySmart Wrapper Card** in HACS, open it, and click **Download**.
5. Reload your browser when HACS asks you to.

On Home Assistant 2026.11 and later, the built-in Marketplace replaces HACS. Go to **Settings > Marketplace**, choose **Add from link**, and paste the same URL. You need a connected GitHub account for this.

### Manual

1. Download `mysmart-wrapper-card.js` from the [latest release](https://github.com/agoberg85/mysmart-wrapper-card/releases/latest) and copy it to `config/www/`.
2. Go to **Settings > Dashboards**, open the three dots menu, and choose **Resources**.
3. Add `/local/mysmart-wrapper-card.js` as a **JavaScript module**.
4. Reload your browser.

## Configuration

| Option | Default | Description |
|---|---|---|
| `cards` | `[]` | The cards to show inside the wrapper. |
| `column` | `1` | Number of equal columns. |
| `cell-gap` | `var(--custom-layout-card-padding, 8px)` | Gap between the cards. A number is read as pixels. `cell_gap` also works. |
| `card_style` | none | CSS for the container, as a list of properties or a CSS string. It's applied after `column` and `cell-gap`, so it can override them. |

In the visual editor the card uses Home Assistant's own vertical stack editor, so you can add and edit the inner cards there.

## Examples

Padding around a whole dashboard:

```yaml
type: custom:mysmart-wrapper-card
card_style:
  width: 100%
  height: 100%
  padding: 20px
  box-sizing: border-box
cards:
  - type: custom:my-header-card
  - type: custom:simple-tabs
    tabs: ...
```

A grid with one wide column and two narrower ones:

```yaml
type: custom:mysmart-wrapper-card
card_style:
  display: grid
  grid-template-columns: 1fr 0.7fr 0.7fr
cards:
  - type: weather-forecast
    entity: weather.home
  - type: calendar
    entities:
      - calendar.home
  - type: entities
    entities:
      - sun.sun
```

`card_style` also takes a plain string:

```yaml
type: custom:mysmart-wrapper-card
card_style: "background: none; padding: 12px;"
cards: ...
```
