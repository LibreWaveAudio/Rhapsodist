/*
    Copyright 2024, 2026 David Healey

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

namespace MicrotuningPanel
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	inline function: ScriptObject create(panelId: string, options: JSON)
	{
		local panel = Content.getComponent(panelId);

		//! pnlMicrotune
		local pnlMicrotune;
		
		if (Content.componentExists("pnlMicrotune"))
		{
			pnlMicrotune = Content.getComponent("pnlMicrotune");
		}
		else
		{
			pnlMicrotune = Content.addPanel("pnlMicrotune", 0, 0);
			
			Content.setPropertiesFromJSON("pnlMicrotune", {
				width: panel.getWidth(),
				height: panel.getHeight(),
				text: "Microtuning",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				textColour: 0x0,
				borderRadius: 0,
				borderSize: 0 
			});
		}

		pnlMicrotune.setPaintRoutine(function(g)
		{
			if (!isDefined(this.data.sliderpack))
				return;
				
			if (isDefined(LookAndFeel.drawMicrotuningPanel))
				return LookAndFeel.drawMicrotuningPanel();

			var a = this.getLocalBounds(0);
			var font = fonts.medium;
			var fontSize = 16 + fonts.size;
			var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
			var w = this.data.sliderpack.getWidth() / notes.length;
			var h = this.data.sliderpack.getHeight();
			var x = this.data.sliderpack.get("x");
			var y = this.data.sliderpack.get("y");

			g.setFont(font, fontSize);
			g.setColour(this.get("textColour"));

			for (i = 0; i < notes.length; i++)
				g.drawAlignedText(notes[i], [x + w * i, y + h, w, 25], "centred");				
		});
		
		//! Sliderpack
		local width = isDefined(options.width) ? options.width : pnlMicrotune.getWidth() - 32;
		local height = isDefined(options.height) ? options.height : pnlMicrotune.getHeight() - 85;
		
		local sliderpack = Content.addSliderPack("slpMicrotune", 0, 0);
		sliderpack.set("parentComponent", "pnlMicrotune");
		sliderpack.set("defaultValue", 0);
		sliderpack.set("sliderAmount", 12);
		sliderpack.set("min", -100);
		sliderpack.set("max", 100);
		sliderpack.set("stepSize", 5);
		sliderpack.setPosition(pnlMicrotune.getWidth() / 2 - width / 2, (pnlMicrotune.getHeight() - 10) / 2 - height / 2, width, height);
		sliderpack.setLocalLookAndFeel(lafsliderpack);
		
		pnlMicrotune.data.sliderpackMouse = Engine.createBroadcaster({"id": "sliderpackClickWatcher", "args": ["component", "event"]});

		pnlMicrotune.data.sliderpackMouse.attachToComponentMouseEvents(sliderpack, "Clicks Only", "");
		
		pnlMicrotune.data.sliderpackMouse.addListener({}, "Alt click listener", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;
		
			component.setAllValues(0);
		});
		
		pnlMicrotune.data.sliderpack = sliderpack;
		
		//! Reset button
		local btnReset = Content.addButton("btnMicrotuneReset", 0, 0);
		btnReset.set("parentComponent", "pnlMicrotune");
		btnReset.set("text", "Reset");
		btnReset.set("isMomentary", true);
		btnReset.set("saveInPreset", false);
		btnReset.set("enableMidiLearn", false);
		btnReset.set("mouseCursor", "PointingHandCursor");
		btnReset.setPosition(sliderpack.get("x"), sliderpack.get("y") - 20, 40, 15);
		btnReset.setLocalLookAndFeel(lafbtnReset);

		pnlMicrotune.data.bcResetButtonValue = Engine.createBroadcaster({id: "resetButton", args: ["component", "value"], tags: ["microtuner"]});
		pnlMicrotune.data.bcResetButtonValue.attachToComponentValue(btnReset, "Reset button clicked");

		pnlMicrotune.data.bcResetButtonValue.addListener(sliderpack, "Reset the sliderpack", function(component, value)
		{
			if (value)
				this.setAllValues(0);
		});

		//! btnShift
		local btnShift = [];
		
		for (i = 0; i < 2; i++)
		{
			btnShift.push(Content.addButton("btnMicrotuneShift" + i, 0, 0));
			btnShift[i].set("parentComponent", "pnlMicrotune");
			btnShift[i].setPosition(sliderpack.get("x") + sliderpack.getWidth() - 30 + 15 * i, sliderpack.get("y") - 20, 15, 15);
			btnShift[i].set("text", "Shift " + (i == 0 ? "left" : "right"));
			btnShift[i].set("isMomentary", true);
			btnShift[i].set("saveInPreset", false);
			btnShift[i].set("mouseCursor", "PointingHandCursor");
			btnShift[i].setLocalLookAndFeel(lafbtnShift);
		}

		pnlMicrotune.data.bcShiftButtonValue = Engine.createBroadcaster({id: "shiftButtons", args: ["component", "value"], tags: ["microtuner"]});
		pnlMicrotune.data.bcShiftButtonValue.attachToComponentValue(btnShift, "Shift button clicked");
		
		pnlMicrotune.data.bcShiftButtonValue.addListener({sliderpack: sliderpack, buttons: btnShift}, "Shift sliderpack values", function(component, value)
		{
			if (value)
				shiftSliderPackValues(this.sliderpack, this.buttons.indexOf(component));
		});

		return pnlMicrotune;
	}
	
	inline function shiftSliderPackValues(sliderpack: ScriptObject, direction: int)
	{
		local currentValues = [];

		for (i = 0; i < sliderpack.getNumSliders(); i++)
			currentValues.push(sliderpack.getSliderValueAt(i));

		if (direction)
			currentValues.insert(0, currentValues.pop());
		else
			currentValues.push(currentValues.shift());
		
		for (i = 0; i < sliderpack.getNumSliders(); i++)
			sliderpack.setSliderAtIndex(i, currentValues[i]);
	}
	
	//! lafsliderpack
	const lafsliderpack = Content.createLocalLookAndFeel();
	
	lafsliderpack.registerFunction("drawSliderPackBackground", function(g, obj) {});
	
	lafsliderpack.registerFunction("drawSliderPackTextPopup", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMicrotuningSliderPackTextPopup))
			return LookAndFeel.drawMicrotuningSliderPackTextPopup();

		var a = [obj.area[2] - 37, obj.area[1] + 2, 35, 15];
		var font = fonts.regular;
		var fontSize = 14 + fonts.size;

		g.setColour(obj.bgColour);
		g.fillRoundedRectangle(a, 2);

		g.setFont(font, fontSize);
		g.setColour(obj.textColour);
		g.drawAlignedText(parseInt(obj.value), a, "centred");
	});
		
	lafsliderpack.registerFunction("drawLinearSlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMicrotuningSlider))
			return LookAndFeel.drawMicrotuningSlider();

		var a = obj.area;
		var font = fonts.medium;
		var fontSize = 10 + fonts.size;
		var radius = isDefined(style.microtuningPanel.sliderRadius) ? style.microtuningPanel.sliderRadius : 1;
		var h = 2;
		var y = Math.range(a[3] - a[3] * obj.valueNormalized, 0, a[3] - h);

		var isBlackNote = [1, 3, 6, 8, 10].contains((60 + parseInt(obj.id)) % 12);

		g.setColour(Colours.withAlpha(isBlackNote ? Colours.black : Colours.white, 0.03));
		g.fillRect(a);
	
		g.setColour(obj.itemColour2);
		g.fillRoundedRectangle([a[0], y, a[2], h], radius);
		
		if (obj.value == 0)
			return;

		g.setFont(font, fontSize);
		y = obj.valueNormalized > 0.5 ? y + 8 : y - 8;
		g.drawAlignedText(obj.valueAsText, [a[0], y, a[2], h], "centred");
	});
	
	//! lafbtnReset
	const lafbtnReset = Content.createLocalLookAndFeel();
	
	lafbtnReset.registerFunction("drawToggleButton", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMicrotuningResetButton))
			return LookAndFeel.drawMicrotuningResetButton();

		var a = obj.area;
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;
		var c = Colours.withMultipliedBrightness(obj.textColour, (obj.over ? 1.0 : 0.8) - 0.2 * obj.value);

		g.setColour(Colours.withAlpha(c, obj.enabled ? 1.0 : 0.5));

		g.setFont(font, fontSize);
		g.drawAlignedText(obj.text, a, "left");
	});
	
	//! lafbtnShift
	const lafbtnShift = Content.createLocalLookAndFeel();

	lafbtnShift.registerFunction("drawToggleButton", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMicrotuningShiftButton))
			return LookAndFeel.drawMicrotuningShiftButton();

		var a = obj.area;
		var c = Colours.withMultipliedBrightness(obj.textColour, (obj.over ? 1.0 : 0.8) - 0.2 * obj.value);
		var icon = obj.id.contains("0") ? "\ue128" : "\ue12a";

		g.setColour(Colours.withAlpha(c, obj.enabled ? 1.0 : 0.5));				

		g.setFont("phosphor", 12);
		g.drawAlignedText(icon, a, "centred");
	});
}
