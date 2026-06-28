/*
    Copyright 2024, 2025, 2026 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

namespace ValueEdit
{
	const style = CoreLookAndFeel.style;
	const fonts = CoreLookAndFeel.fonts;

	inline function create(panelId: string, options: JSON)
	{
		local styleSheetPrefix = isDefined(options.styleSheetPrefix) ? (options.styleSheetPrefix + "_") : "";

		local panel = Content.getComponent(panelId);
		
		for (x in options)
			panel.data[x] = options[x];

		panel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var radius = isDefined(style.inputBox.borderRadius) ? style.inputBox.borderRadius : 2;
			var borderSize = isDefined(style.inputBox.borderSize) ? style.inputBox.borderSize : 0;

			g.setColour(Colours.withAlpha(this.get("bgColour"), this.get("enabled") ? 1.0 : 0.5));
			g.fillRoundedRectangle(a, radius);

			if (!isDefined(style.useNoise) || !style.useNoise)
				g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});

			if (borderSize == 0)
				return;

			g.setColour(this.get("itemColour"));
			g.drawRoundedRectangle(a, radius, borderSize);
		});

		local knob = Content.addKnob("knb" + panelId.replace("pnl"), 0, 0);
		knob.set("parentComponent", panelId);
		knob.setPosition(panel.getWidth() / 6, 0, panel.getWidth() / 1.5, panel.getHeight());
		knob.set("style", "Knob");
		knob.set("dragDirection", "Vertical");
		knob.set("bgColour", 0x0);
		knob.set("itemColour", 0x0);
		knob.set("showTextBox", false);

		local knobLaf = Content.createLocalLookAndFeel();
		knob.setLocalLookAndFeel(knobLaf);

		knobLaf.registerFunction("drawRotarySlider", function(g, obj)
		{
			var font = fonts.regular;
			var fontSize = 16 + fonts.size;

			g.setFont(font, fontSize);

			var c = Colours.withMultipliedBrightness(obj.textColour, obj.hover ? 1.0 - 0.1 * obj.clicked : 0.9);
			g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));

			g.drawAlignedText(obj.valueAsText, obj.area, "centred");
		});

		panel.data.knob = knob;

		for (c in panel.getChildPanelList())
			c.removeFromParent();

		panel.data.bc = Engine.createBroadcaster({id: "Panel enabled", args: ["component", "property", "value"]});
		panel.data.bc.attachToComponentProperties([panel, knob], "enabled", "Parent enabled watcher");
		panel.data.buttons = createButtons(panel);
		
		return panel;
	}
	
	inline function createButtons(panel: ScriptObject)
	{
		local result = [];
		
		for (i = 0; i < 2; i++)
		{
			local b = panel.addChildPanel();
			local pHeight = panel.getHeight() / 2;

			b.set("width", 20);
			b.set("height", pHeight / 1.4);
			b.set("x", panel.getWidth() - b.getWidth());
			b.set("y", pHeight - b.getHeight() + b.getHeight() * i);
			b.set("allowCallbacks", "All Callbacks");
			b.set("text", i == 0 ? "Up" : "Down");
			b.set("textColour", panel.get("textColour"));
			b.data.icon = i == 0 ? "\ue13c" : "\ue136";

			b.setPaintRoutine(function(g)
			{
				var a = this.getLocalBounds(0);

				var c = Colours.withMultipliedBrightness(this.get("textColour"), this.data.hover ? 1.0 - 0.1 * this.getValue() : 0.8);
				g.setColour(Colours.withMultipliedAlpha(c, this.get("enabled") ? 1.0 : 0.5));

				g.setFont("phosphor", 12);
				g.drawAlignedText(this.data.icon, [a[0], a[1], a[2], a[3]], "centred");
			});

			b.setMouseCallback(function(event)
			{
				var index = this.getParentPanel().data.buttons.indexOf(this);
				var knob = this.getParentPanel().data.knob;

				if (event.rightClick)
					return;
		
				this.setValue(event.clicked ? 1.0 : 0.0);
				this.data.hover = event.hover;
				this.repaint();
		
				if (!event.clicked || event.mouseUp)
					return;
		
				var stepSize = parseFloat(knob.get("stepSize"));
				var newValue = index == 0 ? (knob.getValue() + stepSize) : knob.getValue() - stepSize;
		
				if (newValue < knob.get("min") || newValue > knob.get("max"))
					return;
		
				knob.setValue(newValue);
				knob.changed();
			});
			
			panel.data.bc.addListener(b, "button " + i + " update enabled",	function(component, property, value)
			{
				this.set("enabled", value);
				this.repaint();
			});		
		
			result.push(b);
		}
		
		return result;
	}
}
