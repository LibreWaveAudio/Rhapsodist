/*
		Copyright 2023, 2024, 2026 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this file. If not, see <http://www.gnu.org/licenses/>.
*/

/*
@description: A table for scaling MIDI velocity values. Unlike a modulator this will adjust the actual MIDI messages.
@usage: Place in a sound generator or container's MIDI processor chain - I always place it in the master chain.
*/

Content.setHeight(200);

const data = Engine.createAndRegisterTableData(0);

//! tblVelocity
const tblVelocity = Content.addTable("Velocity", 10, 10);
tblVelocity.set("width", 250);
tblVelocity.set("height", 180);
tblVelocity.referToData(data);

//! Functions
function onNoteOn()
{
	local input = Message.getVelocity() / 127;
	local output = 1 + Math.floor(126 * tblVelocity.getTableValue(input));

	Message.setVelocity(output);
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
 