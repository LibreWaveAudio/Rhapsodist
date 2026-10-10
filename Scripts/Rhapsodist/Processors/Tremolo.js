/*
    Copyright 2026 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

reg notes = [];
const eventIds = Engine.createMidiList();

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbDynamic
const knbDynamic = Content.addKnob("Dynamic", 160, 0);
knbDynamic.setRange(1, 127, 1);
knbDynamic.set("middlePosition", 64);
knbDynamic.set("defaultValue", 64);

//! knbRate
const knbRate = Content.addKnob("Rate", 310, 0);
knbRate.set("mode", "TempoSync");
knbRate.set("defaultValue", 13);
knbRate.set("tooltip", "Note duration, synced to host tempo.");

//! knbRand
const knbRand = Content.addKnob("Rand", 460, 0);
knbRand.set("mode", "NormalizedPercentage");
knbRand.setRange(0, 0.25, 0.01);
knbRand.set("tooltip", "Randomisation amount to apply to the rate.");

//! Functions
inline function: number getTimerDuration()
{
	local result;

	local ms = Engine.getMilliSecondsForTempo(knbRate.getValue());

	result = ms * (1.0 + (Math.random() * 2.0 - 1.0) * knbRand.getValue());
	
	return result / 1000;
}

inline function playTremolo()
{
	for (i = 0; i < notes.length; i++)
	{
		local n = notes[i];
		local oldId = eventIds.getValue(n);

		if (Synth.isArtificialEventActive(oldId))
			Synth.noteOffByEventId(oldId);

		local newId = Synth.playNote(n, knbDynamic.getValue());
		eventIds.setValue(n, newId);
	}
}


function onNoteOn()
{
	if (btnMute.getValue())
		return;
		
	local n = Message.getNoteNumber();
	
	Message.setVelocity(knbDynamic.getValue());

	eventIds.setValue(n, Message.makeArtificial());

	Synth.startTimer(getTimerDuration());
	
	notes.push(n);
}
 function onNoteOff()
{
	local n = Message.getNoteNumber();

	notes.remove(n);

	if (!notes.length)
		Synth.stopTimer();
}
 function onController()
{
	
}
 function onTimer()
{
	playTremolo();
	Synth.startTimer(getTimerDuration());
}
 function onControl(number, value)
{
	
}
 