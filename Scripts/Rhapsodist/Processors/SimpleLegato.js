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

reg lastNote = -1;
reg lastVelo = 0;
reg lastEventId;
reg retriggerNote = -1;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! btnRetrigger
const btnRetrigger = Content.addButton("Retrigger", 160, 10);

function onNoteOn()
{
	if (btnMute.getValue())
		return;
	
	local n = Message.getNoteNumber();
	local v = Message.getVelocity();	
	local eventId = Message.makeArtificial();

	if (lastNote != -1 && isDefined(lastEventId))
	{
		Synth.noteOffByEventId(lastEventId);
		lastEventId = undefined;
	}

	retriggerNote = lastNote;
	lastNote = n;
	lastVelo = v;
	lastEventId = eventId;
}
 function onNoteOff()
{
	local n = Message.getNoteNumber();
	
	if (n == lastNote && isDefined(lastEventId))
	{
		Synth.noteOffByEventId(lastEventId);
		lastEventId = undefined;
	}
		
	if (!btnRetrigger.getValue() || btnMute.getValue())
		return;
	
	if (n == retriggerNote)
		retriggerNote = -1;
		
	if (n != lastNote)
		return;
		
	if (retriggerNote == -1)
		return lastNote = -1;

	lastEventId = Synth.playNote(retriggerNote, lastVelo);

	lastNote = retriggerNote;
	retriggerNote = -1;
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
 