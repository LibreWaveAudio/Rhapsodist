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

/*
@description: Creates a complete mixer UI with channel strips, pan, gain, gain meter, gain slider value, mute, solo, purge, output
@entry: create()
@dependencies: Container.js
@usage: Build out the module tree first using Mixer.js and SimpleGain effects.
*/

namespace MixerPanel
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	inline function: ScriptObject create(panelId: string, numChannels: int, processorId: string, options: JSON)
	{
		local parent = Content.getComponent(panelId);
		local componentExists = Content.componentExists("pnlMixer");
		local pnlMixer = Container.createRow("pnlMixer", [0, 10, 0, 10], -1, {});

		if (!componentExists)
		{
			clearComponentColours("pnlMixer");
			
			Content.setPropertiesFromJSON("pnlMixer", {
				width: parent.getWidth(),
				height: parent.getHeight(),
				parentComponent: panelId,
				borderSize: 0,
				borderRadius: 0,
				text: ""
			});
		}
		
		local muteButtons = [];
		local soloButtons = [];

		for (i = 0; i < numChannels; i++)
		{
			local pnlChannel = createChannelPanel(pnlMixer, numChannels, i, options);

			local knbPan = createPanKnob(pnlChannel, processorId, i, options);
			knbPan.setLocalLookAndFeel(lafMixer);

			local gainSliderWidth = isDefined(options.gainSliderWidth) ? options.gainSliderWidth : 22;
			local gainSliderHeight = isDefined(options.gainSliderHeight) ? options.gainSliderHeight : 180;

			local pnlGain = Container.createGrid("pnlMixerGain" + i, [0, 10, 0, 10], [-1, -1, -1, -1], 2, {layout: [{alignment: "top"}, {alignment: "top"}, {alignment: "bottom", colSpan: 2}]});
			clearComponentColours("pnlMixerGain" + i);
			pnlGain.set("parentComponent", pnlChannel.getId());
			pnlGain.set("width", pnlChannel.getWidth() * .75);
			pnlGain.set("height", gainSliderHeight + 30);

			local knbGain = createGainKnob(pnlGain, processorId, i, [gainSliderWidth, gainSliderHeight], options);

			local fltMeter = createMeter(pnlGain, i, numChannels, gainSliderHeight);			

			local knbGainValue = createGainValueKnob(pnlGain, i);

			local btnPurge = createPurgeButton(pnlChannel, processorId, i);
			btnPurge.setLocalLookAndFeel(lafMixer);
		
			local pnlMixerMuteSolo = createMuteSoloButtons(pnlChannel, processorId, i);
			muteButtons.push(pnlMixerMuteSolo.data.buttons[0]);
			soloButtons.push(pnlMixerMuteSolo.data.buttons[1]);

			local cmbOutput = createOutputMenu(pnlChannel, processorId, i, {});
		}

		addMuteSoloIsolateBroadcasters(pnlMixer, muteButtons, soloButtons);

		return pnlMixer;
	}

	inline function: ScriptObject createChannelPanel(parentPanel: ScriptObject, numChannels: int, index: number, options: JSON)
	{
		local id = "pnlMixerChannel" + index;
		local componentExists = Content.componentExists(id);		
		local panel = Container.createStack(id, [50, 0, 30, 0], -1, {});
		local channelName = isDefined(options.channelNames[index]) ? options.channelNames[index] : "Channel " + (index + 1);

		if (!componentExists)
		{
			clearComponentColours(id);

			Content.setPropertiesFromJSON(id, {
				y: 0,
				height: parentPanel.getHeight(),
				text: channelName,
				itemColour: parentPanel.get("itemColour"),
				textColour: parentPanel.get("textColour")
			});
		}

		panel.set("parentComponent", parentPanel.getId());
		panel.data.numChannels = numChannels;
		panel.data.index = index;
		
		panel.setPaintRoutine(function(g)
		{
			if (isDefined(LookAndFeel.drawMixerChannelBackground))
				LookAndFeel.drawMixerChannelBackground();

			var a = this.getLocalBounds(0);
			var font = fonts.medium;
			var fontSize = 16 + fonts.size;
		
			g.setColour(this.get("textColour"));
			g.setFont(font, fontSize);
			g.drawAlignedText(this.get("text"), [a[0], a[1] + 20, a[2], a[3]], "centredTop");

			if (this.data.index >= this.data.numChannels - 1)
				return;

			g.setColour(Colours.withAlpha(this.get("itemColour"), 0.5));
			g.drawVerticalLine(a[2] - 1, a[1] + a[3] * 0.14, a[3] - a[3] * 0.08);
		});

		return panel;
	}
	
	inline function: ScriptObject createPanKnob(parentPanel: ScriptObject, processorId: string, index: number, options: JSON)
	{
		local id = "knbMixerPan" + index;
		local componentExists = Content.componentExists(id);
		local knob = Content.addKnob(id);
		local channelName = isDefined(options.channelNames[index]) ? options.channelNames[index] : "Channel " + (index + 1);

		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				y: 0,
				width: 60,
				height: 70,
				text: "",
				tooltip: "Set the channel's pan.",
				pluginParameterName: channelName.toLowerCase().capitalize() + " Pan",
				processorId: processorId,
				parameterId: "Pan" + index,
				defaultValue: 0,
				showTextBox: false
			});
		}

		Content.setPropertiesFromJSON(id, {
			x: parentPanel.getWidth() / 2 - knob.getWidth() / 2,		
			parentComponent: parentPanel.getId(),
			mode: "Pan",
			style: "Knob"
		});

		return knob;
	}
		
	inline function: ScriptObject createGainKnob(parentPanel: ScriptObject, processorId: string, index: number, size: Array, options: JSON)
	{
		local id = "knbMixerGain" + index;
		local componentExists = Content.componentExists(id);
		local knob = Content.addKnob(id);
		local channelName = isDefined(options.channelNames[index]) ? options.channelNames[index] : "Channel " + (index + 1);

		if (!componentExists)
		{			
			Content.setPropertiesFromJSON(id, {
				y: 0,
				width: size[0],
				height: size[1],
				text: channelName.toLowerCase().capitalize() + " Gain",
				tooltip: "Set the channel's volume.",
				pluginParameterName: channelName.toLowerCase().capitalize() + " Gain",
				processorId: processorId,
				parameterId: "Gain" + index,
				defaultValue: 0,
				showTextBox: false,
				stepSize: 1.0
			});
		}

		Content.setPropertiesFromJSON(id, {
			parentComponent: parentPanel.getId(),
			mode: "Decibel",
			min: -100,
			max: 3.0,
			middlePosition: -18,
			style: "Vertical"
		});

		knob.setLocalLookAndFeel(lafMixer);

		return knob;
	}
	
	inline function: ScriptObject createMeter(parentPanel: ScriptObject, index: number, numChannels: int, height: number)
	{
		local id = "fltMixerMeter" + index;
		local componentExists = Content.componentExists(id);
		local floatingTile = Content.addFloatingTile(id);

		if (!componentExists)
		{
			local channelIndexes = [];

			for (i = 0; i < 2; i++)
				channelIndexes.push((index * 2) + i);
	
			clearComponentColours(id);

			Content.setPropertiesFromJSON(id, {
				y: 0,			
				width: 8,
				height: height,
				parentComponent: parentPanel.getId(),
				ContentType: "MatrixPeakMeter",
				Data: "{\n  \"ProcessorId\": \"" + "mixerGain" + index + "\",\n  \"Index\": -1,\n  \"FollowWorkspace\": false,\n  \"SegmentLedSize\": 0.0,\n  \"UpDecayTime\": 200.0,\n  \"DownDecayTime\": 500.0,\n  \"UseSourceChannels\": false,\n  \"SkewFactor\": 0.2,\n  \"PaddingSize\": 0.5,\n  \"ShowMaxPeak\": true,\n  \"ChannelIndexes\": [" + channelIndexes.join(",") + "]\n}",
				saveInPreset: false
			});
		}
		
		Content.setPropertiesFromJSON(id, {
			parentComponent: parentPanel.getId(),
			ContentType: "MatrixPeakMeter",
			saveInPreset: false
		});
		
		floatingTile.setLocalLookAndFeel(lafMixer);
		
		return floatingTile;
	}
	
	inline function: ScriptObject createGainValueKnob(parentPanel: ScriptObject, index: number)
	{
		local id = "knbMixerGainValue" + index;
		local componentExists = Content.componentExists(id);		
		local knob = Content.addKnob(id);

		if (!componentExists)
		{
			clearComponentColours(id);

			Content.setPropertiesFromJSON(id, {
				height: 28,
				defaultValue: 0,
				stepSize: 1.0
			});
		}
		
		Content.setPropertiesFromJSON(id, {
			parentComponent: parentPanel.getId(),
			linkedTo: id.replace("Value"),
			mode: "Decibel",
			max: 3.0,
			style: "Vertical"
		});

		knob.setLocalLookAndFeel(lafGainValueKnob);
		
		return knob;
	}
		
	inline function: ScriptObject createPurgeButton(parentPanel: ScriptObject, processorId: string, index: number)
	{
		local id = "btnMixerPurge" + index;
		local componentExists = Content.componentExists(id);		
		local button = Content.addButton(id);

		if (!componentExists)
		{
			clearComponentColours(id);

			Content.setPropertiesFromJSON(id, {
				width: 18,
				height: 18,
				text: "Purge/Load",
				tooltip: "Purge or load this channel's samples.",
				processorId: processorId,
				parameterId: "Purge" + index
			});
		}

		Content.setPropertiesFromJSON(id, {
			x: parentPanel.getWidth() / 2 - button.getWidth() / 2,
			parentComponent: parentPanel.getId(),
			enableMidiLearn: false
		});
		
		return button;
	}
	
	inline function: ScriptObject createMuteSoloButtons(parentPanel: ScriptObject, processorId: string, index: number)
	{
		local panelId = "pnlMixerMuteSolo" + index;
		local panel = Container.createRow(panelId, [0, 0, 0, 0], -1, {});
		local buttons = [];
		
		clearComponentColours(panelId);
		
		Content.setPropertiesFromJSON(panelId, {
			parentComponent: parentPanel.getId(),
			width: 45,
			height: 22
		});

		for (i = 0; i < 2; i++)
		{
			local name = i == 0 ? "Mute" : "Solo";
			local id = "btnMixer" + name + index;
			local x = a[0] + (a[2] * i) + (-2 + 4 * i);

			local componentExists = Content.componentExists(id);

			buttons[i] = Content.addButton(id);

			if (!componentExists)
			{
				clearComponentColours(id);

				Content.setPropertiesFromJSON(id, {
					width: 20,
					height: 20,
					text: i == 0 ? "M" : "S",
					tooltip: name + " this channel.",
					processorId: processorId,
					parameterId: i == 0 ? "Mute" + index : "Solo" + index
				});
			}

			Content.setPropertiesFromJSON(id, {
				parentComponent: panelId,
				enableMidiLearn: false
			});

			buttons[i].setLocalLookAndFeel(lafTextButton);
		}

		panel.data.buttons = buttons;

		return panel;
	}

	inline function: ScriptObject createOutputMenu(parentPanel: ScriptObject, processorId: string, index: number, options: JSON)
	{
		local rootChainId = Synth.getIdList("Container")[0];
		local rootMatrix = Synth.getRoutingMatrix(rootChainId);
		local items = [];

		for (i = 0; i < rootMatrix.getNumDestinationChannels(); i++)
		{
			items.push((i + 1) + "/" + (i + 2));
			i++;
		}

		local id = "cmbMixerOutput" + index;
		local componentExists = Content.componentExists(id);
		
		local comboBox = Content.addComboBox(id);

		if (!componentExists)
		{
			clearComponentColours(id);

			Content.setPropertiesFromJSON("cmbMixerOutput" + index, {
				width: parentPanel.getWidth() * 0.7,
				height: 28,
				text: "Output",
				tooltip: "Set the channel's output.",
				processorId: processorId,
				parameterId: "Output" + index
			});
		}

		Content.setPropertiesFromJSON("cmbMixerOutput" + index, {
			x: parentPanel.getWidth() / 2 - comboBox.getWidth() / 2,
			parentComponent: parentPanel.getId(),
			items: items.join("\n"),
			enableMidiLearn: false
		});

		comboBox.setLocalLookAndFeel(lafMixer);
		
		return comboBox;
	}
		
	inline function clearComponentColours(id: string)
	{
		Content.setPropertiesFromJSON(id, {
			bgColour: 0x0,
			itemColour: 0x0,
			itemColour2: 0x0,
			textColour: 0x0
		});
	}
		
	inline function addMuteSoloIsolateBroadcasters(panel: ScriptObject, muteButtons: Array, soloButtons: Array)
	{	
		panel.data.bcMuteIsolate = Engine.createBroadcaster({id: "muteIsolate", args: ["component", "value"]});
		panel.data.bcMuteIsolate.attachToComponentValue(muteButtons, "");

		panel.data.bcMuteIsolate.addListener(muteButtons, "Enabled the clicked button and disable others if ctrl or cmd is down", function(component, value)
		{
			if (!Content.isCtrlDown())
				return;
	
			for (x in this)
			{
				x.setValue(x == component);
				x.changed();
			}
		});

		panel.data.bcSoloIsolate = Engine.createBroadcaster({id: "soloIsolate", args: ["component", "value"]});
		panel.data.bcSoloIsolate.attachToComponentValue(soloButtons, "");

		panel.data.bcSoloIsolate.addListener(soloButtons, "Enabled the clicked button and disable others if ctrl or cmd is down", function(component, value)
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
	
	//! Look and Feel
	const lafMixer = Content.createLocalLookAndFeel();
	
	lafMixer.registerFunction("drawRotarySlider", function(g, obj)
	{
		 if (isDefined(LookAndFeel.drawMixerPanKnob))
		 	return LookAndFeel.drawMixerPanKnob();
	
		 CoreLookAndFeel.drawKnob();
	});
	
	lafMixer.registerFunction("drawLinearSlider", function(g, obj)
	{
		 if (isDefined(LookAndFeel.drawMixerGainSlider))
		 	return LookAndFeel.drawMixerGainSlider();
	
		 CoreLookAndFeel.drawSlider();
	});
	
	lafMixer.registerFunction("drawMatrixPeakMeter", function(g, obj)
	{
		 if (isDefined(LookAndFeel.drawMixerPeakMeter))
		 	return LookAndFeel.drawMixerPeakMeter();
	
		 CoreLookAndFeel.drawMatrixPeakMeter();
	});
	
	lafMixer.registerFunction("drawToggleButton", function(g, obj)
	{
		 if (isDefined(LookAndFeel.drawMixerPurgeButton))
		 	return LookAndFeel.drawMixerPurgeButton();
	
		CoreLookAndFeel.drawPowerButton();	 
	});
	
	lafMixer.registerFunction("drawComboBox", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMixerOutput))
			return LookAndFeel.drawMixerOutput();
	
		CoreLookAndFeel.drawComboBox();
	});
	
	lafMixer.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuBackground();
	});
	
	lafMixer.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuItem();
	});
	
	lafMixer.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return CoreLookAndFeel.getIdealPopupMenuItemSize();
	});
	
	// Mute/Solo Buttons
	const lafTextButton = Content.createLocalLookAndFeel();
	
	lafTextButton.registerFunction("drawToggleButton", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMixerMuteSoloButton))
			return LookAndFeel.drawMixerMuteSoloButton();

		CoreLookAndFeel.drawTextButtonToggle();
	});

	// Gain Value Knob
	const lafGainValueKnob = Content.createLocalLookAndFeel();
	
	lafGainValueKnob.registerFunction("drawLinearSlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawMixerGainValue))
			return LookAndFeel.drawMixerGainValue();

		var a = obj.area;
		var font = fonts.regular;
		var fontSize = 16 + fonts.size;
	
		g.setColour(obj.textColour);
		g.setFont(font, fontSize);
		g.drawAlignedText(obj.valueAsText.replace(" "), a, "centredBottom");
	});
	
}
