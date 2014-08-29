/**
 * Created by ville on 30/06/14.
 */
var CircuitEditor = function(options) {
  this.options = $.extend({useImages: false}, options);
  this.element = this.options.element;
  this.circuit = new LogicCircuit(options);
  this.createToolbar();
  this.initToolbar();
};
var editorproto = CircuitEditor.prototype;
editorproto.createToolbar = function() {
  var comps = this.options.components || ["and", "nand", "not", "or", "nor", "xor", "eqv"],
      html = "";
  for (var i = 0; i < comps.length; i++) {
    var c = comps[i];
    html += '<button class="add' + c + '" title="' + c + '">' +
            (this.options.useImages?'<img src="images/' + c + '.svg" />': c.toUpperCase()) +
            '</button>';
  }
  var $buttonPanel = this.options.buttonPanelElement || this.element.find(".circuit-buttonpanel");
  $buttonPanel.html(html);
  this.buttonPanel = $buttonPanel;
};
editorproto.initToolbar = function() {
  var $buttonPanel = this.buttonPanel;
  $(".addnot", $buttonPanel).click(function() {
    var comp = this.circuit.notComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addand", $buttonPanel).click(function() {
    var comp = this.circuit.andComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addnand", $buttonPanel).click(function() {
    var comp = this.circuit.nandComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addor", $buttonPanel).click(function() {
    var comp = this.circuit.orComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addnor", $buttonPanel).click(function() {
    var comp = this.circuit.norComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addxor", $buttonPanel).click(function() {
    var comp = this.circuit.xorComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addeqv", $buttonPanel).click(function() {
    var comp = this.circuit.eqvComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addha", $buttonPanel).click(function() {
    var comp = this.circuit.halfAdderComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
  $(".addhs", $buttonPanel).click(function() {
    var comp = this.circuit.halfSubstractorComponent();
    this.element.trigger("circuit-changed");
    this.setInteractive(comp);
  }.bind(this));
};
editorproto.setInteractive = function(comp) {
  var x, y,
      editor = this,
      canvasOffset = this.circuit.element.offset();
  comp.element.find('.circuit-output').draggable({
    revert: true,
    helper: "clone",
    start: function(evt, ui) {
      var offset = comp.element.offset(),
          helper = ui.helper,
          helperPos = helper.position();
      x = offset.left - canvasOffset.left + helperPos.left + helper.outerWidth();
      y = offset.top - canvasOffset.top + helperPos.top + helper.outerHeight()/2.0;
      editor.path = editor.circuit._snap.path("M" + x + " " + y + " Q" + x + " " + y + " " + x + " " + y);
      editor.path.addClass("circuit-connector circuit-unconnected");
      editor.circuit.clearFeedback();
    },
    drag: function(evt, ui) {
      var newX = ui.offset.left - canvasOffset.left + ui.helper.outerWidth()/2.0,
          newY = ui.offset.top - canvasOffset.top + ui.helper.outerHeight()/2.0;
      editor.path.attr("path", "M" + x + " " + y + // move to the starting point
        " C" + (x + newX)/2.0 + " " + y + // cubic bezier, first control point
        " " + (x + newX)/2.0 + " " + newY + // cubic bezier, second control point
        " " + newX + " " + newY); // cubix bezier, end point
    },
    stop: function(evt, ui) {
      if (editor.selected) {
        editor.selected.inputComponent(editor.pos, ui.helper.data("pos"), comp);
      }
      editor.path.remove();
      editor.path = null;
      editor.selected = null;
      editor.element.trigger("circuit-changed");
    }.bind(this)});
  comp.element.find(".circuit-input").droppable({
    accept: ".circuit-output",
    drop: function(evt, ui) {
      if (editor.path) {
        editor.pos = $(this).data("pos");
        editor.selected = comp;
        editor.element.trigger("circuit-changed");
      }
    },
    over: function(evt, ui) {
      if (editor.path) {
        editor.path.removeClass("circuit-unconnected");
      }
    },
    out: function(evt, ui) {
      if (editor.path) {
        editor.path.addClass("circuit-unconnected");
      }
    }
  });
};
editorproto.state = function(newState) {
  if (typeof newState === "undefined") {
    return this.circuit.state();
  } else {
    this.circuit.state(newState);
    var comps = this.circuit._components;
    for (var i = comps.length; i--; ) {
      this.setInteractive(comps[i]);
    }
  }
};