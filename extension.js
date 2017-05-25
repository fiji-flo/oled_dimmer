/* global global imports */
const Lang = imports.lang;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;

const BUS_NAME = 'org.gnome.SettingsDaemon.Power';
const OBJECT_PATH = '/org/gnome/SettingsDaemon/Power';

const BrightnessInterface = '<node> \
<interface name="org.gnome.SettingsDaemon.Power.Screen"> \
<property name="Brightness" type="i" access="readwrite"/> \
</interface> \
</node>';

const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper(BrightnessInterface);

let text, dimmer, onWindowCreated, slider, darker, mouseSprite, mouseDarker;

const Darker = new Lang.Class({
  Name: 'Darker',
  _init: function(actor) {
    this._effect = new Clutter.BrightnessContrastEffect();
    actor.add_effect(this._effect);
    this.actor = actor;
  },
  cleanup: function(actor) {
    actor.remove_effect(this._effect);
  }
})

function slide() {
}

const Dimmer = new Lang.Class({
  Name: 'Dimmer',
  _init: function() {
    this._proxy = new BrightnessProxy(
      Gio.DBus.session, BUS_NAME, OBJECT_PATH,
      Lang.bind(this, function(proxy, error) {
        if (error) {
          global.log(error.message);
          return;
        }
        this._connectId = this._proxy.connect('g-properties-changed', Lang.bind(this, this._sync));
        this._sync();
      })
    );
    mouseSprite = new Clutter.Texture();
    let cursorTracker = Meta.CursorTracker.get_for_screen(global.screen);
    Shell.util_cursor_tracker_to_clutter(cursorTracker, mouseSprite);
    this._cursorTrackerId = cursorTracker.connect('cursor-changed', Lang.bind(this, this._updateMouseSprite));
    this._cursorTracker = cursorTracker;
  },
  _updateMouseSprite: function() {
    Shell.util_cursor_tracker_to_clutter(this._cursorTracker, mouseSprite);
    let [xHot, yHot] = this._cursorTracker.get_hot();
    mouseSprite.set_anchor_point(xHot, yHot);
  },
  _sync: function() {
    let level = this._proxy.Brightness / 100.0 - 1.0;
    darker._effect.set_brightness(level);
    mouseDarker._effect.set_brightness(level);
  },
  cleanup: function() {
    if (this._connectId > -1) {
      this._proxy.disconnect(this._connectId);
    }
    if (this._cursorTrackerId > -1) {
      this._cursorTracker.disconnect(this._cursorTrackerId);
    }
  }
});

function init() {
}

function enable() {
  dimmer = new Dimmer();
  let actor = Main.uiGroup;
  darker = new Darker(actor);
  mouseDarker = new Darker(mouseSprite);
}

function disable() {
  let actor = Main.uiGroup;
  darker.cleanup(actor);
  delete darker;
  mouseDarker.cleanup(mouseSprite);
  delete mouseDarker;
  dimmer.cleanup();
  delete dimmer;
}
