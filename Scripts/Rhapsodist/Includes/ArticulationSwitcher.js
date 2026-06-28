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

namespace ArticulationSwitcher
{
	const useUacc = isDefined(Manifest.useUacc) ? Manifest.useUacc : true;

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
		local index = ArticulationDataManager.getArticulationIndexForKeyswitch(n);
	
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
}
