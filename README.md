# OLED DIMMER: GNOME extension for OLED display dimming

Unfortunately, regular display dimming does not work on OLED displays. Regular
dimming is done by reducing the brightness of the display backlight. However,
OLED displays don't have a backlight. Therefore, dimming has to be done by
reducing the brightness of the scene.

## A simple GNOME extension to the rescue

This is a simple GNOME extension which:

* Attaches to the brightness level of the GNOME settings daemon.
* Adds an effect [ClutterBrightnessContrastEffect](https://developer.gnome.org/clutter/stable/ClutterBrightnessContrastEffect.html).
* Keeps them in sync.

## Installation

```
git clone https://github.com/fiji-flo/oled_dimmer.git ~/.local/share/gnome-shell/extensions/oled_dimmer@flomerz.gmail.com
gnome-shell-extension-tool -e oled_dimmer@flomerz.gmail.com
```

## Known issues

* Cursor is not affected by dimming.
