/*
    Copyright 2020, 2026 David Healey

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
@description: Notes within the set range are allowed through or blocked. By default tranpositions are included, but can be ignored via a button.
@usage: Place in a container or sound generator's MIDI processor chain.
*/

Content.setWidth(750);
Content.setHeight(100);

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbLowNote
const knbLowNote = Content.addKnob("LowNote", 160, 0);
knbLowNote.set("text", "Low Note");
knbLowNote.setRange(0, 127, 1);

//! knbHighNote
const knbHighNote = Content.addKnob("HighNote", 310, 0);
knbHighNote.set("text", "High Note");
knbHighNote.setRange(0, 127, 1);
knbHighNote.set("defaultValue", 127);

//! btnBlock
const btnBlock = Content.addButton("Block", 10, 60);

//! btnRelease
const btnRelease = Content.addButton("Release", 160, 60);
btnRelease.set("tooltip", "When enabled note offs will also be filtered.");

//! btnTranspose
const btnTranspose = Content.addButton("IgnoreTranspose", 310, 60);
btnTranspose.set("text", "Ignore Transpose");
function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local n = Message.getNoteNumber();
	local t = btnTranspose.getValue() ? 0 : Message.getTransposeAmount();
	local block = btnBlock.getValue();
	local inRange = (n >= knbLowNote.getValue() + t && n <= knbHighNote.getValue() + t);

	if ((inRange && block) || (!inRange && !block))
		Message.ignoreEvent(true);
}
 function onNoteOff()
{
	if (btnMute.getValue() || !btnRelease.getValue())
		return;

	local n = Message.getNoteNumber();
	local t = btnTranspose.getValue() ? 0 : Message.getTransposeAmount();
	local block = btnBlock.getValue();
	local inRange = (n >= knbLowNote.getValue() + t && n <= knbHighNote.getValue() + t);

	if ((inRange && block) || (!inRange && !block))
		Message.ignoreEvent(true);
}function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 