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
@description: Sets the transposition of incoming notes. With individual settings (+-12 semitones) for each of the 12 notes.
							For example if you set C to a transposition of +2, every C on the keyboard will receive the same transposition.
@usage: Place in a container or sound generator's MIDI processor chain depending on the level you want the transposition applied.
@note: The transposition values are held in a sliderpack. Connect a persistent sliderpack on the Interface script to this control.
*/

Content.setHeight(125);

const sliderPackData = Engine.createAndRegisterSliderPackData(0);

//! slpTranspose
const slpTranspose = Content.addSliderPack("Transpose", 10, 10);
slpTranspose.set("defaultValue", 0.0);
slpTranspose.set("sliderAmount", 12);
slpTranspose.set("min", -12);
slpTranspose.set("max", 12);
slpTranspose.set("stepSize", 1.0);
slpTranspose.referToData(sliderPackData);

inline function transpose(index: number, currentTranspose: number)
{
	local value = slpTranspose.getSliderValueAt(index);

	if (value == 0)
		return;

	Message.setTransposeAmount(value + currentTranspose);
}
function onNoteOn()
{
	local index = Message.getNoteNumber() % 12;
	local t = Message.getTransposeAmount();
	
	transpose(index, t);	
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
 