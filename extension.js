/* global global imports */
const St = imports.gi.St;
const Meta = imports.gi.Meta;
const Lang = imports.lang;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

let text, button, onWindowCreated, slider, darker;
let level = -0.2;

const Darker = new Lang.Class({
  Name: 'Darker',
  _init: function(actor) {
    this._effect = new Clutter.BrightnessContrastEffect();
    this._effect.set_brightness(level);
    actor.add_effect(this._effect);
    this.actor = actor;
  },
})

function slide() {
  level = slider.value - 1.0;
  darker._effect.set_brightness(level);
}

const DimmerMenu = Lang.Class({
  Name: 'DimmerMenu',
  Extends: PanelMenu.Button,
  _init: function() {
    this.parent(0.0, _('OLED Dimmer'));
    let buttonIcon = new St.Icon({
      icon_name: 'display-brightness-symbolic',
      style_class: 'system-status-icon'
    });
    this.actor.add_actor(buttonIcon);
    let sliderItem = new PopupMenu.PopupMenuItem('', {
      style_class: 'popup-menu-icon'
    });
    let sliderValue = level + 1.0;
    let sliderIcon = new St.Icon({
      icon_name: 'display-brightness-symbolic',
      style_class: 'popup-menu-icon'
    });
    sliderItem.actor.add(sliderIcon);
    slider = new Slider.Slider(sliderValue);
    slider.connect('value-changed', slide);
    sliderItem.actor.add(slider.actor, { expand: true });
    sliderItem.actor.connect('key-press-event', Lang.bind(sliderItem, function(actor, event) {
      return slider.onKeyPressEvent(actor, event);
    }));
    this.menu.addMenuItem(sliderItem);
  }
});

function _hideLevel() {
  Main.uiGroup.remove_actor(text);
  text = null;
}

function _showLevel() {
  if (!text) {
    text = new St.Label({ style_class: 'darker-label', text: `${level}` });
    Main.uiGroup.add_actor(text);
  }

  text.opacity = 255;

  let monitor = Main.layoutManager.primaryMonitor;

  text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                    monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

  Tweener.addTween(text,
                   { opacity: 0,
                     time: 2,
                     transition: 'easeOutQuad',
                     onComplete: _hideLevel });
}

function init() {
}

function enable() {
  button = new DimmerMenu();
  Main.panel.addToStatusArea('dimmer', button, 0);
  let actor = Main.uiGroup;
  darker = new Darker(actor);
}

function disable() {
  let actor = Main.uiGroup;
  if(darker) {
    actor.remove_effect(darker._effect);
    delete darker;
  }
  button.destroy();
}
