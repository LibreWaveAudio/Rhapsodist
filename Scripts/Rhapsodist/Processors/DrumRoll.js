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
@description: Creates a tempo synced drum roll with octave shifting for left/right hits
@usage: Place in a container or sound generator's MIDI processor chain.
*/

Content.setWidth(750);

const eventIds = Engine.createMidiList();
const octaves = Engine.createMidiList();
octaves.fill(0);

const heldKeys = [];

reg channel = 1;
reg messageGain;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbTempo
const knbTempo = Content.addKnob("Tempo", 160, 0);
knbTempo.set("mode", "TempoSync");

//! knbDynamic
const knbDynamic = Content.addKnob("Dynamic", 310, 0);
knbDynamic.setRange(1, 127, 1);

//! knbLowNote
const knbLowNote = Content.addKnob("LowNote", 460, 0);
knbLowNote.setRange(0, 127, 1);
knbLowNote.set("tooltip", "Lowest playable note");

//! knbOctave
const knbOctave = Content.addKnob("Octave", 610, 0);
knbOctave.setRange(0, 4, 1);
knbOctave.set("tooltip", "The octave shift for the right hand hits.");

function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local n = Message.getNoteNumber();

	channel = Message.getChannel();
	messageGain = Message.getGain();

	heldKeys.pushIfNotAlreadyThere(n);
	
	eventIds.setValue(n, Message.makeArtificial());
	Message.setVelocity(knbDynamic.getValue());

	Synth.startTimer(Engine.getMilliSecondsForTempo(knbTempo.getValue()) / 1000);
}
 function onNoteOff()
{
	local n = Message.getNoteNumber();
	
	heldKeys.remove(n);
	
	if (Synth.isArtificialEventActive(eventIds.getValue(n)))
		Synth.noteOffByEventId(eventIds.getValue(n));

	if (!heldKeys.length)
		Synth.stopTimer();

	if (btnMute.getValue())
		return;

	local eventId = Synth.playNoteWithStartOffset(channel, n, knbDynamic.getValue(), 500);

	Synth.addVolumeFade(eventId, 0, -99);
	Synth.addVolumeFade(eventId, 50, messageGain + Math.randInt(-3, 3));

	eventIds.setValue(n, eventId);
}
 function onController()
{
	
}
 function onTimer()
{
	local rightRoot = knbLowNote.getValue() + knbOctave.getValue() * 12;

	for (i = 0; i < heldKeys.length; i++)
	{
		local n = heldKeys[i];
		local octaveShift = octaves.getValue(n);

		if (n >= rightRoot)
			n = knbLowNote.getValue() + n - rightRoot;			
		
		local noteToPlay = n + (octaveShift * knbOctave.getValue() * 12);

		if (Synth.isArtificialEventActive(eventIds.getValue(noteToPlay)))
			Synth.noteOffByEventId(eventIds.getValue(noteToPlay));
		
		local eventId = Synth.playNoteWithStartOffset(channel, noteToPlay, knbDynamic.getValue(), -1);

		Synth.addVolumeFade(eventId, 0, -99);
		Synth.addVolumeFade(eventId, 50, messageGain + Math.randInt(-3, 3));
		Synth.addPitchFade(eventId, 0, 0, Math.randInt(-10, 10));

		eventIds.setValue(noteToPlay, eventId);
		octaves.setValue(heldKeys[i], 1 - octaveShift);
	}

	local t = Engine.getMilliSecondsForTempo(knbTempo.getValue()) + Math.randInt(-10, 10);
	Synth.startTimer(t / 1000);
}
 function onControl(number, value)
{
	
}
 