/*
    Copyright 2024, 2025 David Healey

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

namespace Mixer
{
	inline function: ScriptObject create(panelId: string, numChannels: int)
	{
		local panel = Content.getComponent(panelId);
		local width = panel.getWidth() / numChannels;
		local muteButtons = [];
		local soloButtons = [];

		for (i = 0; i < numChannels; i++)
		{
			local area = [i * width, 0, width, panel.getHeight()];
			local pnlChannel = createChannelPanel(panel, i, area[2]);
			local components = [];

			pnlChannel.setPaintRoutine(function(g)
			{
				var a = this.getLocalBounds(0);

				g.setColour(this.get("textColour"));
				g.setFont("semibold", 14);
				g.drawAlignedText(this.get("text"), [a[0], a[1], a[2], a[3]], "centredTop");
			});

			local knbPan = createPanKnob(pnlChannel, i);
			knbPan.setLocalLookAndFeel(CoreLookAndFeel.smallKnob);
			components.push(knbPan);

			local knbGain = createGainKnob(pnlChannel, i, 180);
			knbGain.setLocalLookAndFeel(CoreLookAndFeel.verticalSlider);
			components.push(knbGain);
			
			local lblGain = createGainValueLabel(pnlChannel, i);
			components.push(lblGain);

			local fltMeter = createMeter(pnlChannel, i, 180);
			fltMeter.setLocalLookAndFeel(CoreLookAndFeel.peakMeter);
			
			setGainKnobAndMeterXPosition(pnlChannel, knbGain, fltMeter);
						
			local btnPurge = createPurgeButton(pnlChannel, i);
			btnPurge.setLocalLookAndFeel(CoreLookAndFeel.powerButton);
			components.push(btnPurge);
		
			local btnMuteSolo = createMuteSoloButtons(pnlChannel, i);
	
			for (x in btnMuteSolo)
				x.setLocalLookAndFeel(CoreLookAndFeel.textButton);

			components.push(btnMuteSolo[0]);
			muteButtons.push(btnMuteSolo[0]);
			soloButtons.push(btnMuteSolo[1]);

			local cmbOutput = createOutputMenu(pnlChannel, i, {autoHide: true});
			cmbOutput.setLocalLookAndFeel(CoreLookAndFeel.comboBox);

			if (cmbOutput.get("visible"))
				components.push(cmbOutput);

			positionComponents(pnlChannel, components);
			fltMeter.set("y", knbGain.get("y"));

			btnMuteSolo[1].set("y", btnMuteSolo[0].get("y"));
		}

		panel.setPaintRoutine(function(g) {});
		addMuteSoloIsolateBroadcasters(panel, muteButtons, soloButtons);
	
		return panel;
	}
	
	inline function: ScriptObject createChannelPanel(parent: ScriptObject, index: number, width: number)
	{
		local a = [index * width, 0, width, parent.getHeight()];
		local panel = Content.addPanel("pnlMixerChannel" + index, 0, 0);
		panel.set("parentComponent", parent.getId());
		panel.setPosition(a[0], a[1], a[2], a[3]);
		panel.data.index = index;
		panel.data.bc = {};
	
		return panel;
	}
	
	inline function: ScriptObject createPanKnob(parentPanel: ScriptObject, index: number)
	{
		local a = [parentPanel.getWidth() / 2 - 36 / 2, 0, 36, 60];

		local knbPan = Content.addKnob("knbMixerPan" + index, 0, 0);	

		Content.setPropertiesFromJSON("knbMixerPan" + index, {
			"x": a[0], "y": a[1], "width": a[2], "height": a[3],
			"parentComponent": parentPanel.getId(),
			"tooltip": "Set the channel's pan.",
			"isPluginParameter": true,
			"pluginParameterName": "Channel " + (index + 1) + " pan",
			"mode": "Pan",
			"style": "Knob",
			"showTextBox": false
		});
		
		return knbPan;
	}
		
	inline function: ScriptObject createMeter(parentPanel: ScriptObject, index: number, height: number)
	{
		local a = [0, 0, 8, height];

		local fltMeter = Content.addFloatingTile("fltMixerMeter" + index, 0, 0);

		Content.setPropertiesFromJSON("fltMixerMeter" + index, {
			"x": a[0], "y": a[1], "width": a[2], "height": a[3],
			"parentComponent": parentPanel.getId(),
			"ContentType": "MatrixPeakMeter",
			"saveInPreset": false
		});
		
		return fltMeter;
	}
		
	inline function: ScriptObject createGainKnob(parentPanel: ScriptObject, index: number, height: number)
	{
		local a = [0, 0, 15, height];

		local knbGain = Content.addKnob("knbMixerGain" + index, 0, 0);

		Content.setPropertiesFromJSON("knbMixerGain" + index, {
			"x": a[0], "y": a[1], "width": a[2], "height": a[3],
			"parentComponent": parentPanel.getId(),
			"text": "Gain",
			"tooltip": "Set the channel's volume.",
			"isPluginParameter": true,
			"pluginParameterName": "Channel " + (index + 1) + " gain",
			"defaultValue": 0,
			"mode": "Decibel",
			"max": 3.0,
			"style": "Vertical",
			"showTextBox": false		
		});

		parentPanel.data.bc.gainKnobValue = Engine.createBroadcaster({id: "knbMixerGainValue" + index, args: ["component", "value"]});
		parentPanel.data.bc.gainKnobValue.attachToComponentValue(knbGain, "Value");		

		return knbGain;
	}
	
	inline function: ScriptObject createGainValueLabel(parentPanel: ScriptObject, index: number)
	{
		local lblGain = Content.addLabel("lblMixerGain" + index, 0, 0);

		Content.setPropertiesFromJSON("lblMixerGain" + index, {
			parentComponent: parentPanel.getId(),
			width: parentPanel.getWidth(),
			text: "",
			editable: false
		});

		parentPanel.data.bc.gainKnobValue.addComponentPropertyListener(lblGain, "text", "Change label text", function(index, component, value)
		{
			return Engine.doubleToString(value, 1) + " dB";
		});
		
		return lblGain;
	}
		
	inline function: ScriptObject createPurgeButton(parentPanel: ScriptObject, index: number)
	{
		local a = [parentPanel.getWidth() / 2 - 16 / 2, 0, 16, 16];

		local btnPurge = Content.addButton("btnMixerPurge" + index, 0, 0);
		
		Content.setPropertiesFromJSON("btnMixerPurge" + index, {
			"x": a[0], "y": a[1], "width": a[2], "height": a[3],
			"parentComponent": parentPanel.getId(),
			"text": "Purge/Load",
			"tooltip": "Purge or load this channel's samples.",
			"enableMidiLearn": false
		});
		
		return btnPurge;
	}
	
	inline function: Array createMuteSoloButtons(parentPanel: ScriptObject, index: number)
	{
		local a = [(parentPanel.getWidth() / 2) - (18 * 2) / 2, y, 18, 18];
		
		local buttons = [];
		
		for (i = 0; i < 2; i++)
		{
			local name = i == 0 ? "Mute" : "Solo";
			local x = a[0] + (a[2] * i) + (-2 + 4 * i);

			buttons[i] = Content.addButton("btnMixer" + name + index, 0, 0);		

			Content.setPropertiesFromJSON("btnMixer" + name + index, {
				"x": x, "y": a[1], "width": a[2], "height": a[3],
				"parentComponent": parentPanel.getId(),
				"text": i == 0 ? "M" : "S",
				"tooltip": name + " this channel.",
				"enableMidiLearn": false
			});
		}

		return buttons;
	}

	inline function: ScriptObject createOutputMenu(parentPanel: ScriptObject, index: number, options: JSON)
	{
		local a = [parentPanel.getWidth() / 2 - parentPanel.getWidth() / 2 / 2, 0, parentPanel.getWidth() / 2, 22];
		local rootChainId = Synth.getIdList("Container")[0];
		local rootMatrix = Synth.getRoutingMatrix(rootChainId);
			
		local items = [];

		for (i = 0; i < rootMatrix.getNumDestinationChannels(); i++)
		{
			items.push((i + 1) + "/" + (i + 2));
			i++;
		}
		
		local result = Content.addComboBox("cmbMixerOutput" + index, 0, 0);

		Content.setPropertiesFromJSON("cmbMixerOutput" + index, {
			"x": a[0], "y": a[1], "width": a[2], "height": a[3],
			"parentComponent": parentPanel.getId(),
			"text": "Output",
			"tooltip": "Set the channel's output.",
			"items": items.join("\n"),
			"enableMidiLearn": false
		});

		if (options.autoHide)
			result.showControl(items.length > 1);
		
		return result;
	}
	
	inline function setGainKnobAndMeterXPosition(panel: ScriptObject, gainKnob: ScriptObject, meter: ScriptObject)
	{
		local totalWidgetsWidth = gainKnob.getWidth() + meter.getWidth() + 5;
		local startX = (panel.getWidth() - totalWidgetsWidth) / 2;
	
		gainKnob.set("x", startX);
		meter.set("x", startX + gainKnob.getWidth() + 5);			
	}
	
	inline function positionComponents(panel: ScriptObject, components: Array)
	{
		local totalComponentHeight;
		
		for (x in components)
		{
			if (!x.getId().contains("btnSolo"))
				totalComponentHeight += x.getHeight();
		}
	
		local remainingSpace = panel.getHeight() - totalComponentHeight - 25;
		local margin = remainingSpace / (components.length + 1);
		
		local y = 25 + margin;
		
		for (i = 0; i < components.length; i++)
		{
			local c = components[i];
	
			c.set("y", y);
			y += c.getHeight() + margin;
		}
	}
	
	inline function addMuteSoloIsolateBroadcasters(panel: ScriptObject, muteButtons: Array, soloButtons: Array)
	{
		if (!isDefined(panel.data.bc))
			panel.data.bc = {};
	
		panel.data.bc.muteIsolate = Engine.createBroadcaster({"id": "muteIsolate", "args": ["component", "value"]});
		panel.data.bc.muteIsolate.attachToComponentValue(muteButtons, "");
		
		panel.data.bc.muteIsolate.addListener(muteButtons, "Enabled the clicked button and disable others if ctrl or cmd is down", function(component, value)
		{
			if (!Content.isCtrlDown())
				return;
	
			for (x in this)
			{
				x.setValue(x == component);
				x.changed();
			}
		});
		
		panel.data.bc.soloIsolate = Engine.createBroadcaster({"id": "soloIsolate", "args": ["component", "value"]});
		panel.data.bc.soloIsolate.attachToComponentValue(soloButtons, "");
		
		panel.data.bc.soloIsolate.addListener(soloButtons, "Enabled the clicked button and disable others if ctrl or cmd is down", function(component, value)
		{
			if (!Content.isCtrlDown())
				return;
	
			for (x in this)
			{
				x.setValue(x == component);
				x.changed();
			}			
		});
	}
}