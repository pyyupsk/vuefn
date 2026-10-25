# vuefn logo

The mark is a function ƒ, slanted like ƒ(x). Its crossbar runs on into the n, so the symbol reads "fn": the server function that vuefn puts in a page.

## Files

| File                                                       | Use                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| `vuefn-symbol.svg`                                         | The symbol alone: avatar, social card                     |
| `vuefn-horizontal.svg`                                     | The default lockup: site header, README                   |
| `vuefn-stacked.svg`                                        | Square spaces: slides, posters                            |
| `vuefn-wordmark.svg`                                       | The name alone, in Geist SemiBold outlines                |
| `*-black.svg`, `*-white.svg`                               | One-colour versions for light and dark grounds            |
| `*-mono-028557.svg`, `*-mono-42b883.svg`                   | Green versions: 600 on light grounds, 500 on dark grounds |
| `vuefn-symbol-square.svg`, `-app-icon.svg`, `-favicon.svg` | Square artwork for icons                                  |

`og.html` is the source of `apps/docs/public/og.png`, the 1200 × 630 image for link previews. Open it in a browser at that size and take a screenshot to make the PNG again.

The built web icons (`favicon.ico`, `favicon.svg`, `icon-*.png`, `site.webmanifest`) live in `apps/docs/public`.

## Colour

### Core

| Role           | HEX       | RGB         | OKLCH                      | On white | On ink |
| -------------- | --------- | ----------- | -------------------------- | -------- | ------ |
| Ink (the logo) | `#09090b` | 9 9 11      | `oklch(14.1% 0.004 285.8)` | 19.9:1   | none   |
| Reversed       | `#ffffff` | 255 255 255 | `oklch(100% 0 0)`          | none     | 19.9:1 |

### Brand green

The brand green is Vue green, `#42b883`. The scale keeps its hue (160° in OKLCH) and changes only lightness and chroma, so every step reads as the same green. Step 500 is Vue green itself.

| Step | HEX       | RGB         | OKLCH                      | On white | On ink | Use                                                  |
| ---- | --------- | ----------- | -------------------------- | -------- | ------ | ---------------------------------------------------- |
| 50   | `#ecfdf3` | 236 253 243 | `oklch(97.9% 0.022 160.2)` | 1.1:1    | 18.9:1 |                                                      |
| 100  | `#d4f9e4` | 212 249 228 | `oklch(95.0% 0.047 160.5)` | 1.1:1    | 17.5:1 |                                                      |
| 200  | `#b1f1ce` | 177 241 206 | `oklch(90.6% 0.080 160.3)` | 1.3:1    | 15.5:1 |                                                      |
| 300  | `#86e1b2` | 134 225 178 | `oklch(84.0% 0.111 160.2)` | 1.6:1    | 12.7:1 | Strings in dark code                                 |
| 400  | `#5dcc97` | 93 204 151  | `oklch(76.6% 0.129 160.3)` | 2.0:1    | 10.0:1 |                                                      |
| 500  | `#42b883` | 66 184 131  | `oklch(70.3% 0.132 160.4)` | 2.5:1    | 8.0:1  | Vue green: dots, "browser" marks, green logo on dark |
| 600  | `#028557` | 2 133 87    | `oklch(54.4% 0.122 160.3)` | 4.7:1    | 4.3:1  | `primary`: buttons, focus ring, green logo on light  |
| 700  | `#066e48` | 6 110 72    | `oklch(47.6% 0.105 160.5)` | 6.3:1    | 3.2:1  | Button hover, green text and strings in light code   |
| 800  | `#075738` | 7 87 56     | `oklch(40.4% 0.088 160.1)` | 8.6:1    | 2.3:1  |                                                      |
| 900  | `#0c442d` | 12 68 45    | `oklch(34.5% 0.070 160.9)` | 11.2:1   | 1.8:1  |                                                      |
| 950  | `#072a1a` | 7 42 26     | `oklch(25.5% 0.050 159.6)` | 15.5:1   | 1.3:1  |                                                      |

Text needs a contrast of 4.5:1, and marks and shapes need 3:1. These rules follow from the table:

1. White text goes on 600 or darker. The `primary` button is 600 with white text (4.7:1).
2. Green text on a light ground is 700 or darker.
3. Vue green (500) is too light for text or thin marks on white (2.5:1). Use it on dark grounds, or for marks that sit next to a label.
4. Keep green for actions and small accents. Large areas stay ink or white.

### Logo colour

Use the logo in ink on light grounds and in white on dark grounds. For a green logo, use 600 on light grounds and 500 on dark grounds, at 24 px or larger.

## Clear space

Keep a space around the logo that is equal to the stroke width of the n, on all sides.

## Minimum size

| Version           | Smallest size |
| ----------------- | ------------- |
| Symbol            | 16 px         |
| Horizontal lockup | 80 px wide    |

## Do not

1. Do not redraw the wordmark in another font.
2. Do not change the slant of the ƒ.
3. Do not add shadows, outlines or gradients.
4. Do not put the logo on a photo without a plain area behind it.

## Type

The wordmark is Geist SemiBold, outlined. Geist is under the SIL Open Font License 1.1, which allows this use.
