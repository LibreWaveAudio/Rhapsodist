/*
    Copyright 2026 David Healey

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

/*
@description: Creates the interactive pedal diagram, note labels, key and scale controls.
@dependencies: Module tree must contain NoteTransposer.js, the ID of which is passed into the create function.
@entry: create()
*/

namespace HarpPedalPanel
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;
	const laf = Content.createLocalLookAndFeel();
	const sliderWidths = [0, 0.125, 0.25, 0.4375, 0.625, 0.75, 0.875, 1];
	const scales = buildScaleTable();

	reg transposer;

	inline function: ScriptObject create(panelId: string, processorId: string, options: JSON)
	{
		transposer = Synth.getSliderPackProcessor(processorId).getSliderPack(0);

		local panel = Content.getComponent(panelId);
		local pnlHarp = createContainer(panel, options);
		local sliderPack = createSliderPack(pnlHarp, options);
		local cmbHarpPedalKey = createKeyComboBox(pnlHarp, options);
		local cmbHarpPedalScale = createScalesComboBox(pnlHarp, options);

		pnlHarp.data.sliderPack = sliderPack;

		// Broadcasters
		pnlHarp.data.broadcasters.bcScaleChanged = Engine.createBroadcaster({id: "harpPedalScaleChanged", args: ["component", "value"]});
		pnlHarp.data.broadcasters.bcScaleChanged.attachToComponentValue([cmbHarpPedalKey, cmbHarpPedalScale], "");

		pnlHarp.data.broadcasters.bcScaleChanged.addListener({panel: pnlHarp, sliderPack: sliderPack, key: cmbHarpPedalKey, scale: cmbHarpPedalScale}, "Update the pedal values based on the selected scale", function(component, value)
		{
			setScale(this.sliderPack, this.key.getValue() - 1, this.scale.getValue() - 1);
			this.panel.repaint();
		});
		
		pnlHarp.data.broadcasters.sliderPackMouse = Engine.createBroadcaster({id: "harpPedalSliderPackMouse", args: ["component", "event"]});
		pnlHarp.data.broadcasters.sliderPackMouse.attachToComponentMouseEvents(sliderPack, "Clicks Only", "");
		pnlHarp.data.broadcasters.sliderPackMouse.addListener(cmbHarpPedalScale, "Alt click listener", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;
				
			this.setValue(1);
			this.changed();
		});
		
		bcslpPedalValue.addListener({key: cmbHarpPedalKey, scale: cmbHarpPedalScale}, "Reset combo box when sliderpack changed", function(component, index, value)
		{
			this.scale.setValue(getScaleIndex(this.key.getValue() - 1, component) + 1);
		});

		return pnlHarp;
	}
	
	inline function: ScriptObject createContainer(parentPanel: ScriptObject, options: JSON)
	{
		local id = "pnlHarp";
		local componentExists = Content.componentExists(id);
		local panel = Content.addPanel(id);
		panel.data.broadcasters = {};
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 0,
				y: 0,
				width: parentPanel.getWidth(),
				height: parentPanel.getHeight(),
				parentComponent: parentPanel.getId(),
				text: "",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		panel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var sliderPack = this.data.sliderPack;
			var noteNames = ["D", "C", "B", "E", "F", "G", "A"];
			
			g.setColour(this.get("textColour"));
			g.setFont(fonts.medium, 18 + fonts.size);

			for (i = 0; i < noteNames.length; i++)
			{
				var x = sliderPack.getWidth() * sliderWidths[i];
				var h = 40;
				var y = sliderPack.get("y") - h;
				var w = sliderPack.getWidth() * (sliderWidths[i + 1] - sliderWidths[i]);
				var centreX = sliderPack.get("x") + x + w * getSliderCenterFraction(i);
				var value = sliderPack.getSliderValueAt(i);
				
				var accidental = value == 0 ? "" : (value == -1 ? "#" : "b");

				g.drawAlignedText(noteNames[i] + accidental, [centreX - w / 2, y, w, h], "centred");
			}
		});
	
		bcslpPedalValue.addComponentRefreshListener(panel, "repaint", "Repaint panel when sliderpack changed");
	
		return panel;
	}
	
	inline function: ScriptObject createSliderPack(parentPanel: ScriptObject, options: JSON)
	{
		local id = "slpHarpPedals";
		local width = isDefined(options.width) ? options.width : parentPanel.getWidth() - 80;
		local height = isDefined(options.height) ? options.height : 100;
		local componentExists = Content.componentExists(id);

		local sliderPack = Content.addSliderPack(id);
		sliderPack.setControlCallback(onslpHarpPedalsControl);

		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: parentPanel.getWidth() / 2 - width / 2,
				y: 85,
				width: width,
				height: height,
				parentComponent: parentPanel.getId(),
				flashActive: false,
				showValueOverlay: false
			});
		}

		Content.setPropertiesFromJSON(id, {
			defaultValue: 0,
			sliderAmount: 7,
			min: -1,
			max: 1,
			stepSize: 1
		});
		
		sliderPack.setAllValueChangeCausesCallback(false);
		sliderPack.setWidthArray(sliderWidths);		
		sliderPack.setLocalLookAndFeel(laf);

		return sliderPack;
	}
	
	inline function onslpHarpPedalsControl(component, value)
	{
		if (typeof value != "number")
			return;

		local sliderValue = component.getSliderValueAt(value);

		setTransposer(value, sliderValue);	
		bcslpPedalValue.sendSyncMessage([component, value, sliderValue]);
	}
	
	inline function: number getSliderCenterFraction(index: number)
	{
		local normalWidth = sliderWidths[1] - sliderWidths[0];
		local sliderWidth = sliderWidths[index + 1] - sliderWidths[index];

		if (sliderWidth <= normalWidth * 1.001)
			return 0.5;

		if (index == 3 - 1)
			return 0.5 * normalWidth / sliderWidth;
	
		return 1.0 - 0.5 * normalWidth / sliderWidth;
	}
	
	inline function: ScriptObject createKeyComboBox(parentPanel: ScriptObject, options: JSON)
	{
		local id = "cmbHarpPedalKey";
		local items = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
		local componentExists = Content.componentExists(id);
		local comboBox = Content.addComboBox(id);
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 10,
				y: parentPanel.getHeight() - 30 - 15,
				width: 50,
				height: 30,
				parentComponent: parentPanel.getId(),
				text: "Key",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		comboBox.set("items", items.join("\n"));
		comboBox.setLocalLookAndFeel(CoreLookAndFeel.comboBox);
		
		return comboBox;
	}
	
	inline function: ScriptObject createScalesComboBox(parentPanel: ScriptObject, options: JSON)
	{
		local id = "cmbHarpPedalScales";
		local items = ["Major", "Natural Minor", "Harmonic Minor", "Major Pentatonic", "Minor Pentatonic", "Dominant 7th", "Octatonic", "Half Diminished", "Full Diminished", "Augmented", "Whole Tone"];
		local componentExists = Content.componentExists(id);
		local comboBox = Content.addComboBox(id);

		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 70,
				y: parentPanel.getHeight() - 30 - 15,
				width: 170,
				height: 30,
				parentComponent: parentPanel.getId(),
				text: "Scale",
				saveInPreset: false,
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}

		comboBox.set("items", items.join("\n"));
		comboBox.setLocalLookAndFeel(CoreLookAndFeel.comboBox);
		
		return comboBox;
	}
	
	inline function: number getScaleIndex(key: number, sliderPack: ScriptObject)
	{
		local values = [];

		for (i = 0; i < sliderPack.getNumSliders(); i++)
			values.push(sliderPack.getSliderValueAt(i));

		for (i = 0; i < scales[key].length; i++)
		{
			if (values == scales[key][i])
				return i;
		}			

		return -1;
	}

	inline function setScale(sliderPack: ScriptObject, key: number, scaleIndex: number)
	{
		if (scaleIndex < 0)
			return;

		local scale = scales[key][scaleIndex];

		for (i = 0; i < sliderPack.getNumSliders(); i++)
		{
			setTransposer(i, scale[i]);
			sliderPack.setSliderAtIndex(i, scale[i]);
		}			
	}
	
	inline function setTransposer(index: number, value: number)
	{
		local pedalToTone = [2, 0, 11, 4, 5, 7, 9];		
		transposer.setValue(pedalToTone[index], -value);
	}
	
	inline function: Array buildScaleTable()
	{
		local result = [];
		local pitch = [0, 2, 4, 5, 7, 9, 11]; // natural pitch at each of the 7 positions
		local pedalIndex = [1, 0, 3, 4, 5, 6, 2]; // pedal that each position maps to
		local rootSlot = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]; // position the root sits on, per key
		local rootScales = [
			[0, 0, 0, 0, 0, 0, 0],   // Major
			[0, 0, 1, 1, 0, 0, 1],   // Natural Minor
			[0, 0, 0, 1, 0, 0, 1],   // Harmonic Minor
			[0, 0, -1, 0, 1, 0, 0],  // Major Pentatonic
			[-1, 0, 1, 1, 0, 0, -1], // Minor Pentatonic
			[0, 0, 1, 0, 0, 0, 0],   // Dominant 7th
			[1, 0, 1, 0,-1, 0, 0],   // Octatonic
			[0, 0, 1, 1, 0, 1, 1],   // Half Diminished
			[0, 0, 0, 1, 0, 1, 0],   // Full Diminished
			[-1, 0, 0, 0, 1, 0, 1],  // Augmented
			[0, 0,-1, 0,-1,-1,-1]   // Whole Tone
		];

		for (k = 0; k < 12; k++)
		{
			local keyRow = [];

			for (s = 0; s < rootScales.length; s++)
			{
				keyRow[s] = [0, 0, 0, 0, 0, 0, 0];
	
				for (i = 0; i < 7; i++)
				{
					local slot = (rootSlot[k] + i) % 7;
					local degree = pitch[i] - rootScales[s][pedalIndex[i]];
					local wanted = (k + degree + 12) % 12;
					local value = (pitch[slot] - wanted + 18) % 12 - 6; // wrap to -6..5
	
					keyRow[s][pedalIndex[slot]] = Math.range(value, -1, 1);
				}
			}

			result[k] = keyRow;
		}

		return result;
	}
		
	//! Look and Feel	
	laf.registerFunction("drawSliderPackBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawHarpPedalSliderPackBackground))
			return LookAndFeel.drawHarpPedalSliderPackBackground();
			
		var a = obj.area;
		var labelHeight = 30;
		
		g.setColour(obj.itemColour2);
		g.drawLine(a[0], a[2], a[3] / 2 - 1, a[3] / 2 - 1, 2);		
		g.drawLine(a[2] / 2.285, a[2] / 2.285, a[1] + 10, a[3] - 10, 2);
	});
	
	laf.registerFunction("drawSliderPackTextPopup", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawHarpPedalSliderPackTextPopup))
			return LookAndFeel.drawHarpPedalSliderPackTextPopup();
	});
		
	laf.registerFunction("drawLinearSlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawHarpPedalSlider))
			return LookAndFeel.drawHarpPedalSlider();

		var a = obj.area;
		var radius = isDefined(style.harpPanel.sliderRadius) ? style.harpPanel.sliderRadius : 1;
		var h = a[3] / 3;
		var w = 8;
		var x = a[2] * getSliderCenterFraction(parseInt(obj.id)) - w / 2;
		var y = (a[3] - h) * (1 - obj.valueNormalized);
	
		g.setColour(obj.itemColour2);
		g.fillRoundedRectangle([x, y, w, h], radius);
	});
	
	//! Broadcasters
	const bcslpPedalValue = Engine.createBroadcaster({id: "slpPedalValue", args: ["component", "index", "value"]});	
}
