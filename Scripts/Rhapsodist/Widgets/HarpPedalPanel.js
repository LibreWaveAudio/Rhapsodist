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
	const scales = buildScaleTable();

	reg transposer;

	inline function: ScriptObject create(panelId: string, processorId: string, options: JSON)
	{
		transposer = Synth.getSliderPackProcessor(processorId).getSliderPack(0);

		local panel = Content.getComponent(panelId);
		local pnlHarp = createContainer(panel, options);
		local sliders = createSliders(pnlHarp, options);		
		local cmbHarpPedalKey = createKeyComboBox(pnlHarp, options);
		local cmbHarpPedalScale = createScalesComboBox(pnlHarp, options);

		pnlHarp.data.sliders = sliders;

		// Broadcasters
		pnlHarp.data.broadcasters.bcScaleChanged = Engine.createBroadcaster({id: "harpPedalScaleChanged", args: ["component", "value"]});
		pnlHarp.data.broadcasters.bcScaleChanged.attachToComponentValue([cmbHarpPedalKey, cmbHarpPedalScale], "");

		pnlHarp.data.broadcasters.bcScaleChanged.addListener({panel: pnlHarp, sliders: sliders, key: cmbHarpPedalKey, scale: cmbHarpPedalScale}, "Update the pedal values based on the selected scale", function(component, value)
		{
			setScale(this.sliders, this.key.getValue() - 1, this.scale.getValue() - 1);
			this.panel.repaint();
		});
		
		pnlHarp.data.broadcasters.sliderMouse = Engine.createBroadcaster({id: "harpPedalSliderMouse", args: ["component", "event"]});
		pnlHarp.data.broadcasters.sliderMouse.attachToComponentMouseEvents(sliders, "Clicks Only", "");
		pnlHarp.data.broadcasters.sliderMouse.addListener(cmbHarpPedalScale, "Alt click listener", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;

			this.setValue(1);
			this.changed();
		});

		bcPedalValue.addListener({key: cmbHarpPedalKey, scale: cmbHarpPedalScale, sliders: sliders}, "Reset combo box when sliderpack changed", function(component, index, value)
		{
			this.scale.setValue(getScaleIndex(this.key.getValue() - 1, this.sliders) + 1);
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
				itemColour2: style.palette.accent,
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		panel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var sliders = this.data.sliders;
			var noteNames = ["D", "C", "B", "E", "F", "G", "A"];
			var sliderWidth = sliders[0].getWidth();
			
			g.setColour(this.get("textColour"));
			g.setFont(fonts.medium, 18 + fonts.size);

			for (i = 0; i < sliders.length; i++)
			{
				var x = sliders[i].get("x");
				var h = 40;
				var y = sliders[i].get("y") - h;
				var w = sliderWidth;
				var value = sliders[i].getValue();				
				var accidental = value == 0 ? "" : (value == -1 ? "#" : "b");

				g.drawAlignedText(noteNames[i] + accidental, [x, y, w, h], "centred");
			}
			
			g.setColour(this.get("itemColour2"));
			
			var x0 = sliders[0].get("x") - sliderWidth / 2;
			var x1 = sliders[6].get("x") + sliderWidth + sliderWidth / 2;
			var y = sliders[0].get("y") + sliders[0].getHeight() / 2;
			
			g.drawLine(x0, x1, y, y, 2);			

			x0 = (sliders[2].get("x") + sliders[3].get("x") + sliderWidth) / 2 - 1;
			
			g.drawLine(x0, x0, sliders[0].get("y") + 10, sliders[0].get("y") + sliders[0].getHeight() - 10, 2);
		});
	
		bcPedalValue.addComponentRefreshListener(panel, "repaint", "Repaint panel when a slider changes");
	
		return panel;
	}
	
	inline function: Array createSliders(parentPanel: ScriptObject, options: JSON)
	{
		local result = [];
		
		local width = isDefined(options.width) ? options.width : parentPanel.getWidth() - 80;
		local height = isDefined(options.height) ? options.height : 100;

		for (i = 0; i < 7; i++)
		{
			local x = (width / 7 + width / 7 * i) + (20 * (i > 2));
			local id = "knbHarpPedal" + i;
			local componentExists = Content.componentExists(id);
			local slider = Content.addKnob(id);

			if (!componentExists)
			{
				Content.setPropertiesFromJSON(id, {		
					pluginParameterName: "Pedal" + (i + 1)
				});
			}

			Content.setPropertiesFromJSON(id, {
				x: x,
				y: 85,
				width: 20,
				height: height,	
				parentComponent: parentPanel.getId(),
				isPluginParameter: true,		
				defaultValue: 0.0,
				min: -1.0,
				max: 1.0,
				stepSize: 1.0,
				style: "Vertical"
			});
			
			slider.setControlCallback(onknbHarpPedalControl);
			slider.setLocalLookAndFeel(laf);
			result.push(slider);
		}

		return result;
	}

	inline function onknbHarpPedalControl(component, value)
	{
		local index = component.getId().getTrailingIntValue();
	
		setTransposer(index, value);
		bcPedalValue.sendSyncMessage([component, index, value]);
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
				enableMidiLearn: true,
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
				enableMidiLearn: true,
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
	
	inline function: number getScaleIndex(key: number, sliders: Array)
	{
		local values = [];

		for (i = 0; i < sliders.length; i++)
			values.push(sliders[i].getValue());

		for (i = 0; i < scales[key].length; i++)
		{
			if (values == scales[key][i])
				return i;
		}			

		return -1;
	}

	inline function setScale(sliders: Array, key: number, scaleIndex: number)
	{
		if (scaleIndex < 0)
			return;

		local scale = scales[key][scaleIndex];

		for (i = 0; i < sliders.length; i++)
		{
			setTransposer(i, scale[i]);
			sliders[i].setValue(scale[i]);
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
	laf.registerFunction("drawLinearSlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawHarpPedalSlider))
			return LookAndFeel.drawHarpPedalSlider();

		var a = obj.area;
		var radius = isDefined(style.harpPanel.sliderRadius) ? style.harpPanel.sliderRadius : 1;
		var h = a[3] / 3;
		var w = 8;
		var x = a[0] + a[2] / 2 - w / 2;
		var y = (a[3] - h) * (1 - obj.valueNormalized);
	
		g.setColour(obj.itemColour2);
		g.fillRoundedRectangle([x, y, w, h], radius);
	});
	
	//! Broadcasters
	const bcPedalValue = Engine.createBroadcaster({id: "PedalValue", args: ["component", "index", "value"]});	
}
