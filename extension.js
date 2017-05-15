/* global global imports */
const Lang = imports.lang;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;

const BUS_NAME = 'org.gnome.SettingsDaemon.Power';
const OBJECT_PATH = '/org/gnome/SettingsDaemon/Power';

const BrightnessInterface = '<node> \
<interface name="org.gnome.SettingsDaemon.Power.Screen"> \
<property name="Brightness" type="i" access="readwrite"/> \
</interface> \
</node>';

const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper(BrightnessInterface);

let text, dimmer, onWindowCreated, slider, darker;

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
  },
  _sync: function() {
    let level = this._proxy.Brightness / 100.0 - 1.0;
    darker._effect.set_brightness(level);
  },
  cleanup: function() {
    if (this._connectId > -1) {
      this._proxy.disconnect(this._connectId);
    }
  }
});

function init() {
}

function enable() {
  dimmer = new Dimmer();
  let actor = Main.uiGroup;
  darker = new Darker(actor);
}

function disable() {
  let actor = Main.uiGroup;
  darker.cleanup(actor);
  delete darker;
  dimmer.cleanup();
  delete dimmer;
}
