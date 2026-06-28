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

namespace ReleaseTriggers
{
	reg currentState;

	inline function setOptions(options: JSON)
	{
		for (x in Core.samplers)
			x.asSampler().setReleaseStartOptions(options);
			
		createReleaseTriggerButton();
	}

	inline function useDefaults()
	{
		setOptions({
			ReleaseFadeTime: "8192",
			FadeGamma: 0.5,
			UseAscendingZeroCrossing: false,
			GainMatchingMode: "Volume",
			PeakSmoothing: 0.9
		});
	}

	inline function: ScriptObject createReleaseTriggerButton()
	{
		local componentExists = Content.componentExists("btnReleaseTriggers");

		local button = Content.addButton("btnReleaseTriggers");

		if (!componentExists)
		{	
			Content.setPropertiesFromJSON("btnReleaseTriggers", {
				itemColour: 0xff66ba71,
				itemColour2: 0xff7c7e82,
				textColour: 0xffd7d8da,
				text: "Release Triggers",
				tooltip: "Release triggers for articulations that use them"
			});
		}

		Content.setPropertiesFromJSON("btnReleaseTriggers", {
			width: 34,
			height: 20,
			enableMidiLearn: false,
			parentComponent: "pnlInstrumentSettings"			
		});
		
		Presets.broadcasters.preLoad.addListener(button, "Preset pre load", function(isInternal)
		{
			if (isInternal)
				return;
		
			currentState = this.getValue();
		});

		Presets.broadcasters.postLoad.addListener(button, "Preset post load", function(isInternal)
		{
			if (isInternal)
				return;	
		
			if (isDefined(currentState) && this.getValue() != currentState)
			{
				this.setValue(currentState);
				this.changed();
			}
		});
		
		return button;
	}
	
	//! Broadcasters
	const bcbtnReleaseTriggersValue = Engine.createBroadcaster({id: "bcbtnReleaseTriggersValue", args: ["component", "value"]});
	bcbtnReleaseTriggersValue.attachToComponentValue("btnReleaseTriggers", "");

	bcbtnReleaseTriggersValue.addListener(0, "Global toggle release triggers", function(component, value)
	{
		for (x in Core.samplers)
			x.asSampler().setAllowReleaseStart(-1, value);
	});
}
