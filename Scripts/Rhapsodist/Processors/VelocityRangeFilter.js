/*
	Copyright 2025, 2026 David Healey

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
@description: Filters notes based on their velocity and the chosen min/max values.
@usage: Place in a sound generator or container's MIDI processor chain.
*/

Content.setWidth(750);

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbLowVelocity
const knbLowVelocity = Content.addKnob("LowVelocity", 160, 0);
knbLowVelocity.setRange(0, 127, 1);
knbLowVelocity.set("defaultValue", 0);
knbLowVelocity.set("tooltip", "Lowest velocity to affect.");

//! knbHighVelocity
const knbHighVelocity = Content.addKnob("HighVelocity", 310, 0);
knbHighVelocity.setRange(0, 127, 1);
knbHighVelocity.set("defaultValue", 127);
knbHighVelocity.set("tooltip", "Highest velocity to affect.");

//! btnBlock
const btnBlock = Content.addButton("Block", 460, 10);
btnBlock.set("tooltip", "When enabled notes within the velocity range will be blocked. When disabled those outside the range will be blocked.");

//! btnRelease
const btnRelease = Content.addButton("Release", 610, 10);
btnRelease.set("tooltip", "When enabled note offs will also be filtered.");
function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local v = Message.getVelocity();
	local block = btnBlock.getValue();
	local inRange = (v >= knbLowVelocity.getValue() && v <= knbHighVelocity.getValue());
	
	if ((inRange && block) || (!inRange && !block))
		return Message.ignoreEvent(true);
}
 function onNoteOff()
{
	if (btnMute.getValue() || !btnRelease.getValue())
		return;
	
	local v = Message.getVelocity();
	local block = btnBlock.getValue();
	local inRange = (v >= knbLowVelocity.getValue() && v <= knbHighVelocity.getValue());

	if ((inRange && block) || (!inRange && !block))
		return Message.ignoreEvent(true);
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
 