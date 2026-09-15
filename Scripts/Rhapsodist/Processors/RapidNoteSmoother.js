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
@description: When notes are played rapidly this script will reduce their velocity and add a short fade-in to them.
							Playing faster reduces the velocity more - to a maximum of input velocity / 2 - and increases the fade-in to a max of 100ms.
@usage: Place in a sampler's MIDI processor chain.
@note: This script was originally written to create a Bisbigliando effect for fast harp arpeggios/glissandos.
*/

reg lastTime;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);
function onNoteOn()
{	
	if (btnMute.getValue())
		return;

	if (Engine.getUptime() - lastTime < 0.025)
		return;

	local n = Message.getNoteNumber();
	local tm = Engine.getUptime() - lastTime;
	
	if (tm < 0.15)
	{
		local fadeTm = Math.min(100, Math.max(10, 10 + (0.15 - tm) / 0.10 * 75));
		local velocity = Message.getVelocity() * (1 - ((0.15 - tm) / 0.10) * 0.5);
		
		Synth.addVolumeFade(Message.getEventId(), 0, -99);
		Synth.addVolumeFade(Message.getEventId(), fadeTm, Message.getGain());
		Message.setVelocity(Message.getVelocity() / 2);
	}

	lastTime = Engine.getUptime();
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
 