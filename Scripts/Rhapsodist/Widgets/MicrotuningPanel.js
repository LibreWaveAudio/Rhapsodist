/*
    Copyright 2024 David Healey

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
	inline function: ScriptObject create(panelId: string, width: number, height: number)
	{
		local panel = Content.getComponent(panelId);

		//! Panel
		panel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];			
			
			if (!isDefined(this.data.sliderpack))
				return;

			var w = this.data.sliderpack.getWidth() / notes.length;
			var h = this.data.sliderpack.getHeight();
			var x = this.data.sliderpack.get("x");
			var y = this.data.sliderpack.get("y");
			
			g.setFont("regular", 14);
			g.setColour(this.get("textColour"));
			
			for (i = 0; i < notes.length; i++)
				g.drawAlignedText(notes[i], [x + w * i, y + h, w, 25], "centred");
		});
		
		//! Sliderpack
		local sliderpack = Content.addSliderPack(panelId.replace("pnl", "slp"), 0, 0);
		sliderpack.set("parentComponent", panelId);
		sliderpack.set("defaultValue", 0);
		sliderpack.set("sliderAmount", 12);
		sliderpack.set("min", -100);
		sliderpack.set("max", 100);
		sliderpack.set("stepSize", 5);
		sliderpack.setPosition(panel.getWidth() / 2 - width / 2, (panel.getHeight() - 25) / 2 - height / 2, width, height);
		sliderpack.setLocalLookAndFeel(lafsliderpack);
		
		panel.data.sliderpackMouse = Engine.createBroadcaster({"id": "sliderpackClickWatcher", "args": ["component", "event"]});
		
		panel.data.sliderpackMouse.attachToComponentMouseEvents(sliderpack, "Clicks Only", "");
		
		panel.data.sliderpackMouse.addListener({}, "Alt click listener", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;
		
			component.setAllValues(0);
		});
		
		panel.data.sliderpack = sliderpack;
		
		//! Reset button
		local btnReset = Content.addButton(panelId.replace("pnl", "btn") + "Reset", 0, 0);
		btnReset.set("parentComponent", panelId);
		btnReset.set("text", "Reset");
		btnReset.set("isMomentary", true);
		btnReset.set("saveInPreset", false);
		btnReset.set("enableMidiLearn", false);
		btnReset.setPosition(sliderpack.get("x"), sliderpack.get("y") - 20, 40, 15);
		btnReset.setLocalLookAndFeel(lafbtnReset);

		panel.data.bcResetButtonValue = Engine.createBroadcaster({id: "resetButton", args: ["component", "value"], tags: ["microtuner"]});
		panel.data.bcResetButtonValue.attachToComponentValue(btnReset, "Reset button clicked");

		panel.data.bcResetButtonValue.addListener(sliderpack, "Reset the sliderpack", function(component, value)
		{
			if (value)
				this.setAllValues(0);
		});

		//! btnShift
		local btnShift = [];
		
		for (i = 0; i < 2; i++)
		{
			btnShift.push(Content.addButton(panelId.replace("pnl", "btn") + "Shift" + i, 0, 0));
			btnShift[i].set("parentComponent", panelId);
			btnShift[i].setPosition(sliderpack.get("x") + sliderpack.getWidth() - 30 + 15 * i, sliderpack.get("y") - 20, 15, 15);
			btnShift[i].set("text", "Shift " + (i == 0 ? "left" : "right"));
			btnShift[i].set("isMomentary", true);
			btnShift[i].set("saveInPreset", false);
			btnShift[i].setLocalLookAndFeel(lafbtnShift);
		}

		panel.data.bcShiftButtonValue = Engine.createBroadcaster({id: "shiftButtons", args: ["component", "value"], tags: ["microtuner"]});
		panel.data.bcShiftButtonValue.attachToComponentValue(btnShift, "Shift button clicked");
		
		panel.data.bcShiftButtonValue.addListener({sliderpack: sliderpack, buttons: btnShift}, "Shift sliderpack values", function(component, value)
		{
			if (value)
				shiftSliderPackValues(this.sliderpack, this.buttons.indexOf(component));
		});

		return panel;
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

	inline function onNoteOn(panel: ScriptObject, note: number)
	{
		local sliderpack = panel.data.sliderpack;
		sliderpack.getSliderValueAt(note % 12);
	}
	
	//! lafsliderpack
	const lafsliderpack = Content.createLocalLookAndFeel();
	
	lafsliderpack.registerFunction("drawSliderPackBackground", function(g, obj) {});
	
	lafsliderpack.registerFunction("drawSliderPackTextPopup", function(g, obj)
	{
		var a = [obj.area[2] - 37, obj.area[1] + 2, 35, 15];
		
		g.setColour(obj.bgColour);
		g.fillRoundedRectangle(a, 2);
		
		g.setFont("medium", 12);
		g.setColour(obj.textColour);
		g.drawAlignedText(parseInt(obj.value), a, "centred");
	});
		
	lafsliderpack.registerFunction("drawLinearSlider", function(g, obj)
	{
		var a = obj.area;
		var radius = 1;
		var h = 2;	
		var y = Math.range(a[3] - a[3] * obj.valueNormalized, 0, a[3] - h);
	
		var isBlackNote = [1, 3, 6, 8, 10].contains((60 + parseInt(obj.id)) % 12);
		
		g.setColour(Colours.withAlpha(isBlackNote ? Colours.black : Colours.white, 0.03));
		g.fillRect(a);
	
		g.setColour(obj.itemColour2);
		g.fillRoundedRectangle([a[0], y, a[2], h], radius);
	
		if (obj.value == 0)
			return;
	
		g.setFont("medium", 10);
		y = obj.valueNormalized > 0.5 ? y + 8 : y - 8;
		g.drawAlignedText(obj.valueAsText, [a[0], y, a[2], h], "centred");
	});
	
	//! lafbtnReset
	const lafbtnReset = Content.createLocalLookAndFeel();
	
	lafbtnReset.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;
		var c = Colours.withMultipliedBrightness(obj.textColour, (obj.over ? 1.0 : 0.8) - 0.2 * obj.value);
		
		g.setColour(Colours.withAlpha(c, obj.enabled ? 1.0 : 0.5));
		
		g.setFont("regular", 14);
		g.drawAlignedText(obj.text, a, "left");
	});
	
	//! lafbtnShift
	const lafbtnShift = Content.createLocalLookAndFeel();

	lafbtnShift.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;
		var c = Colours.withMultipliedBrightness(obj.textColour, (obj.over ? 1.0 : 0.8) - 0.2 * obj.value);
		var icon = obj.id.contains("0") ? "\ue128" : "\ue12a";

		g.setColour(Colours.withAlpha(c, obj.enabled ? 1.0 : 0.5));				

		g.setFont("phosphor", 12);
		g.drawAlignedText(icon, a, "centred");
	});
}
