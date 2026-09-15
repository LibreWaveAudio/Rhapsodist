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

/*
@description: Provides microtuning functionality for 12 tones - not full Scala style microtuning.
							For example, if you shift C by 10ct, every C across the keyboard will have the same shift applied.
@usage: Place in a sampler's MIDI Processor chain.
@note: Microtuning values are stored in a sliderpack, it is expected the Interface will connect a persistent sliderpack to this.
*/

Content.setHeight(125);

const sliderPackData = Engine.createAndRegisterSliderPackData(0);

//! slpMicrotune
const slpMicrotune = Content.addSliderPack("Microtune", 0, 0);
slpMicrotune.set("defaultValue", 0.0);
slpMicrotune.set("sliderAmount", 12);
slpMicrotune.set("min", -100);
slpMicrotune.set("max", 100);
slpMicrotune.set("stepSize", 5.0);
slpMicrotune.referToData(sliderPackData);

inline function changeTune(currentCoarse, currentFine, index)
{
	local value = slpMicrotune.getSliderValueAt(index);

	if (value == 0)
		return;
	
	local newTuning = currentCoarse * 100 + currentFine + value;
	local coarse = newTuning >= 0 ? Math.floor(newTuning / 100) : Math.ceil(newTuning / 100);
	local fine = newTuning - coarse * 100;

	Message.setCoarseDetune(coarse);
	Message.setFineDetune(fine);
}
function onNoteOn()
{
	local index = Message.getNoteNumber() % 12;
	local coarse = Message.getCoarseDetune();
	local fine = Message.getFineDetune();
	
	changeTune(coarse, fine, index);
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 