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
@description: Handles UI articulation changes - has no direct effect on sound, this is just UI.
@note: The shell contains an invisible articulation knob (knbArticulation) which is stored in the preset
			 and used to keep track of the current articulation throughout the entire Interface script.
@usage: Call ArticulationSwitcher.onNoteOn() and ArticulationSwitcher.onController() from the corresponding callbacks.
*/

namespace ArticulationSwitcher
{
	const useUacc = isDefined(Manifest.useUacc) ? Manifest.useUacc : true;
	
	reg transposition = 0;

	//! knbArticulation
	const knbArticulation = Content.getComponent("knbArticulation");
	
	inline function changeArticulation(index: number)
	{
		local articulation = ArticulationDataManager.getArticulation(index);

		if (!isDefined(articulation))
			return;
	
		knbArticulation.setValue(index);
		knbArticulation.changed();
	}

	//! MIDI Callbacks
	inline function onNoteOn()
	{
		local n = Message.getNoteNumber();
		local index = ArticulationDataManager.getArticulationIndexForKeyswitch(n + transposition);
	
		if (index == -1)
			return;

		changeArticulation(index);
	}
	
	inline function onController()
	{
		local cc = Message.getControllerNumber();
		local cv = Message.getControllerValue();

		if ((cc == 32 && useUacc) || Message.isProgramChange())
		{
			local index = ArticulationDataManager.getArticulationIndexForProgram(cv);

			if (index != -1)
				changeArticulation(index);			
		}
	}
	
	//! Broadcasters
	const bcTranposeChanged = Engine.createBroadcaster({id: "bcTranposeChanged", args: ["component", "value"]});
	bcTranposeChanged.attachToComponentValue("knbTranspose", "");
	
	bcTranposeChanged.addListener(0, "Transposition value changed", function(component, value)
	{
		transposition = value;
	});	
}
