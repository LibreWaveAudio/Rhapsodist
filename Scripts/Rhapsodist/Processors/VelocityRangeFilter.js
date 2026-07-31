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

//! knbMinVelocity
const knbMinVelocity = Content.addKnob("MinVelocity", 160, 0);
knbMinVelocity.setRange(0, 127, 1);
knbMinVelocity.set("defaultValue", 0);
knbMinVelocity.set("tooltip", "Lowest velocity to affect.");
knbMinVelocity.setControlCallback(onknbMinVelocityControl);

inline function onknbMinVelocityControl(component, value)
{
	low = value;
}

//! knbMaxVelocity
const knbMaxVelocity = Content.addKnob("MaxVelocity", 310, 0);
knbMaxVelocity.setRange(0, 127, 1);
knbMaxVelocity.set("defaultValue", 127);
knbMaxVelocity.set("tooltip", "Highest velocity to affect.");
knbMaxVelocity.setControlCallback(onknbMaxVelocityControl);

inline function onknbMaxVelocityControl(component, value)
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
 