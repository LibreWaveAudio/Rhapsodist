/*
	Copyright 2025 David Healey

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

Content.setWidth(750);

reg low;
reg high;
reg block;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbLowVelocity
const knbLowVelocity = Content.addKnob("LowVelocity", 160, 0);
knbLowVelocity.setRange(0, 127, 1);
knbLowVelocity.set("tooltip", "Lowest velocity to affect.");
knbLowVelocity.setControlCallback(onknbLowVelocityControl);

inline function onknbLowVelocityControl(component, value)
{
	low = value;
}

//! knbHighVelocity
const knbHighVelocity = Content.addKnob("HighVelocity", 310, 0);
knbHighVelocity.setRange(0, 127, 1);
knbHighVelocity.set("tooltip", "Highest velocity to affect.");
knbHighVelocity.setControlCallback(onknbHighVelocityControl);

inline function onknbHighVelocityControl(component, value)
{
	high = value;
}

//! btnBlock
const btnBlock = Content.addButton("Block", 460, 10);
btnBlock.set("tooltip", "When enabled notes within the velocity range will be blocked. When disabled those outside the range will be blocked.");
btnBlock.setControlCallback(onbtnBlockControl);

inline function onbtnBlockControl(component, value)
{
	block = value;
}

//! btnFilterRelease
const btnFilterRelease = Content.addButton("FilterRelease", 610, 10);
btnFilterRelease.set("tooltip", "When enabled note offs will also be filtered.");
function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local v = Message.getVelocity();
	
	if (block && (v >= low && v <= high))
		return Message.ignoreEvent(true);
		
	if (!block && (v <= low || v >= high))
		return Message.ignoreEvent(true);
}
 function onNoteOff()
{
	if (btnMute.getValue() || !btnFilterRelease.getValue())
		return;
	
	local v = Message.getVelocity();

	if (block && (v >= low && v <= high))
		return Message.ignoreEvent(true);
		
	if (!block && (v <= low || v >= high))
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
 