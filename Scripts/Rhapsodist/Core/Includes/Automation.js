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

namespace Automation
{
	const fonts = CoreLookAndFeel.fonts;
	const mpeMods = [];
	const mpeTableData = [];

	reg currentMacroConnections;

	//! Macro Handler
	const mh = Engine.createMacroHandler();
	mh.setExclusiveMode(true);
	
	//! Midi Automation Handler
	const ma = Engine.createMidiAutomationHandler();
	
	//! pnlAutomation
	const pnlAutomation = SwitcherPanel.create("pnlAutomation", "pnlAutomation", "ScriptPanel", {});

	pnlAutomation.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var items = this.data.items;
		var columnWidth = a[2] / items.length;

		g.setFont(fonts.regular, 16 + fonts.size);

		for (i = 0; i < items.length; i++)
		{
			var x = columnWidth * i;

			g.setColour(Colours.withMultipliedBrightness(this.get("textColour"), this.getValue() == i ? 1.0 : 0.6 + 0.3 * (this.data.hover == i)));
			g.drawAlignedText(items[i], [x, a[1], columnWidth, 25], "centred");
		}
	});

	pnlAutomation.setMouseCallback(function(event)
	{
		if (event.y > 50)
		{
			this.data.hover = -1;
			return this.repaint();
		}

		var items = this.data.items;
		var value = Math.floor(event.x / (this.getWidth() / items.length));

		this.data.hover = event.hover ? value : -1;

		if (event.clicked && !event.rightClick)
			return this.setValue(value);

		this.repaint();
	});
	
	//! pnlMidiAutomation
	const pnlMidiAutomation = Content.getComponent("pnlMidiAutomation");
	pnlMidiAutomation.setPaintRoutine(function(g) {});
	
	//! fltMidiAutomation
	const fltMidiAutomation = Content.getComponent("fltMidiAutomation");
	fltMidiAutomation.setLocalLookAndFeel(CoreLookAndFeel.viewportTable);
	
	//! pnlMacros
	const pnlMacros = Content.getComponent("pnlMacros");
	
	//! fltMacros
	const fltMacros = Content.getComponent("fltMacros");
	fltMacros.setLocalLookAndFeel(CoreLookAndFeel.viewportTable);

	inline function drawNumberTag()	{}
	
	//! pnlMpe
	const pnlMpe = Content.getComponent("pnlMpe");
	
	//! vptMpe
	const vptMpe = Content.getComponent("vptMpe");
	vptMpe.setLocalLookAndFeel(CoreLookAndFeel.viewportTable);

	vptMpe.setTableMode({
		MultiColumnMode: false,
		HeaderHeight: 30,
		RowHeight: 30,
		ScrollOnDrag: false
	});

	vptMpe.setTableColumns([
		{ID: "Parameter", Type: "Text", MinWidth: 140},
		{ID: "Gesture", Type: "ComboBox", MinWidth: 85, items: ["Press", "Slide", "Glide", "Stroke", "Lift"], Text: "Gesture", ValueMode: "ID"},
		{ID: "Mode", Type: "ComboBox", MinWidth: 90, items: ["Polyphonic", "Legato", "Retrigger"], Text: "Polyphonic", ValueMode: "ID"},
		{ID: "Intensity", Type: "Slider", MinWidth: 75, MinValue: 0, MaxValue: 100, StepSize: 0.1},
	]);

	vptMpe.setTableCallback(onvptMpeControl);

	inline function onvptMpeControl(obj)
	{
		local parameter = mpeTableData[obj.rowIndex].Parameter;
		local mod = getMpeModFromParameterId(parameter);

		if (!isDefined(mod))
			return;

		switch (obj.Type)
		{
			case "DeleteRow":
				ma.removeMPEConnection(parameter);
				break;

			case "ComboBox":
				if (obj.columnID == "Gesture")
					mod.setAttribute(mod.GestureCC, obj.value);
				else if (obj.columnID == "Mode")
					setMpeMode(mod, obj.value);
				break;

			case "Slider":
				mod.setIntensity(obj.value / 100);
				break;	
		}
	}

	//! Functions
	inline function getMpeModFromParameterId(id: string)
	{
		for (x in mpeMods)
		{
			if (x.getId() == id)
				return x;
		}

		return undefined;
	}

	inline function populateMpeTable()
	{
		mpeTableData.clear();
	
		for (x in mpeMods)
		{
			if (x.isBypassed())
				continue;

			if (!ma.isMPEConnected(x.getId()))
				continue;

			local row = {
				Parameter: x.getId(),
				Gesture: x.getAttribute(x.GestureCC),
				Mode: getMpeMode(x),
				Intensity: x.getIntensity() * 100
			};

			mpeTableData.push(row);
		}

		vptMpe.setTableRowData(mpeTableData);
	}

	inline function getMpeModulators()
	{
		mpeMods.clear();

		local ids = [];

		for (x in Synth.getAllModulators(""))
		{
			if (x.getType() == "ModulatorChain" || x.getType() != "MPEModulator")
				continue;

			mpeMods.push(x);				
			ids.push(x.getId());
		}

		if (ids.length > 0)
		{
			pnlAutomation.data.items = ["MIDI CC", "MACROS", "MPE"];
			bcMpeBypassWatcher.attachToModuleParameter(ids, ["Enabled"], "");
		}
		else
		{
			pnlAutomation.data.items = ["MIDI CC", "MACROS"];
			bcMpeBypassWatcher.setBypassed(true, false, false);
		}		

		pnlAutomation.repaint();		
	}

	inline function: number getMpeMode(modulator: ScriptObject)
	{
		local mono = modulator.getAttribute(modulator.Monophonic);
		local retrigger = modulator.getAttribute(modulator.Retrigger);

		if (!mono)
			return 1; // Polyphonic

		if (!retrigger)
			return 2; // Legato

		return 3; // Retrigger
	}

	inline function setMpeMode(modulator: ScriptObject, mode: number)
	{
		switch (mode)
		{
			case 1: // Polyphic
				modulator.setAttribute(modulator.Monophonic, 0);
				modulator.setAttribute(modulator.Retrigger, 0);
				break;

			case 2: // Legato
				modulator.setAttribute(modulator.Monophonic, 1);
				modulator.setAttribute(modulator.Retrigger, 0);
				break;

			case 3: // Retrigger
				modulator.setAttribute(modulator.Monophonic, 1);
				modulator.setAttribute(modulator.Retrigger, 1);
				break;
		}
	}

	inline function registerMacros()
	{
		local names = [];

		for (i = 1; i < 33; i++)
			names.push("Macro " + i);

		Engine.setFrontendMacros(names);
	}
	
	//! Broadcasters
	Presets.broadcasters.preLoad.addListener({}, "Preset preload", function(isInternal)
	{
		if (isInternal)
			return;

		currentMacroConnections = mh.getMacroDataObject();
	});

	Presets.broadcasters.postLoad.addListener({}, "Preset post load", function(isInternal)
	{
		if (isInternal)
			return;

		if (isDefined(currentMacroConnections))
			mh.setMacroDataFromObject(currentMacroConnections);
	});

	// MPE Watcher	
	const var bcMpeBypassWatcher = Engine.createBroadcaster({id: "bcMpeBypassWatcher", args: ["processor", "parameter", "value"]});

	// attach first listener
	bcMpeBypassWatcher.addListener({}, "React to MPE mod bypass change", function(processor, parameter, value)
	{
		populateMpeTable();
	});
	
	//! Calls
	registerMacros();
	getMpeModulators();
}
