/*
    Copyright 2018, 2019, 2020, 2022, 2026 David Healey

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

Content.setWidth(750);
Content.setHeight(175);

const CHORD_THRESHOLD = 25; // For testing if chords were played in legato mode
const eventIds = Engine.createMidiList();
const velocities = Engine.createMidiList();
const times = [];

reg legatoChord = false;
reg lastTime;
reg lastNote = 0;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);
btnMute.setControlCallback(onbtnMuteControl);

inline function onbtnMuteControl(component, value)
{
	velocities.clear();
	times.clear();
}

//! btnPassThru
const btnPassThru = Content.addButton("NoteOnPassThru", 160, 10);
btnPassThru.set("text", "Note On Pass Thru");
btnPassThru.set("tooltip", "When enabled note ons won't be blocked - useful for retrigger functionality.");

//! btnLegato
const btnLegato = Content.addButton("Legato", 310, 10);
btnLegato.set("tooltip", "When enabled release samples will only be triggered when no other keys are held.");

//! btnAttenuate
const btnAttenuate = Content.addButton("Attenuate", 460, 10);
btnAttenuate.setControlCallback(onbtnAttenuateControl);

inline function onbtnAttenuateControl(component, value)
{
	knbTime.showControl(value);
	tblTime.showControl(value);
}

//! btnIgnoreSustain
const btnIgnoreSustain = Content.addButton("IgnoreSustain", 610, 10);
btnIgnoreSustain.set("text", "Ignore Sustain");
btnIgnoreSustain.set("tooltip", "When enabled active sustain pedal (CC64) will have no effect on the release trigger behaviour.");

//! knbOffDelay
const knbOffDelay = Content.addKnob("OffDelay", 0, 50);
knbOffDelay.set("text", "Off Delay");
knbOffDelay.set("mode", "Time");
knbOffDelay.set("min", 50);
knbOffDelay.set("tooltip", "Sets how long after the release note is played a note off message will be triggered for it.");

//! knbTime
const knbTime = Content.addKnob("Time", 610, 50);
knbTime.setRange(0, 60, 0.1);

//! tblTime
const tblTime = Content.addTable("tblTime", 0, 0);
tblTime.setPosition(335, 60, 250, 100);

//! Functions
inline function playReleaseNote(noteNumber, velocity)
{
	local c = Message.getCoarseDetune();
	local f = Message.getFineDetune();

    eventIds.setValue(noteNumber, Synth.playNote(noteNumber + Message.getTransposeAmount(), velocity));
    Synth.addPitchFade(eventIds.getValue(noteNumber), 0, c, f);
    Synth.addVolumeFade(eventIds.getValue(noteNumber), 0, Message.getGain());
    
    if (btnAttenuate.getValue())
    {
        // Use delay between this note and last note to calculate the table value based on the user set time (knbTime)
        local delay = Math.min(((Engine.getUptime() - times[noteNumber]) / knbTime.getValue()), 1.0);

        // Use the normalized table value to determine the amount of attenuation
        local attenuation = tblTime.getTableValue(delay) * 30;

        // Attenuate the note
        Synth.addVolumeFade(eventIds.getValue(noteNumber), 0, -attenuation);
    }

    Synth.noteOffDelayedByEventId(eventIds.getValue(noteNumber), Engine.getSamplesForMilliSeconds(knbOffDelay.getValue()));
}
function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local n = Message.getNoteNumber();
	local v = Message.getVelocity();
	local t = Engine.getUptime();

	if (!btnPassThru.getValue())
		Message.ignoreEvent(true);

	legatoChord = btnLegato.getValue() && ((t - lastTime) * 1000 < CHORD_THRESHOLD);

	velocities.setValue(n, v);		
	times[n] = t;
	lastNote = n;
	lastTime = t;
}
function onNoteOff()
{
	local n = Message.getNoteNumber();

	if (btnMute.getValue())
		return;
		
	if (velocities.getValue(n) <= 0)
		return;
		
	if (!btnIgnoreSustain.getValue() && Synth.isSustainPedalDown())
		return;
	
	Message.ignoreEvent(true);

	// In legato mode release will only trigger if no keys are held, and previous voices are still playing
	if (btnLegato.getValue() && (Synth.getNumPressedKeys() > 0 || !Engine.getNumVoices()))
		return;

	playReleaseNote(n, velocities.getValue(n));
}

function onController()
{
	if (btnIgnoreSustain.getValue())
		return;

	if (Message.getControllerNumber() != 64)
		return;

	if (Synth.isSustainPedalDown())
		return;

	if (Synth.getNumPressedKeys() > 0)
		return;

	if (!Engine.getNumVoices())
		return;

	local v = velocities.getValue(lastNote);

	if (v <= 0 || v > 127)
		return;

	playReleaseNote(lastNote, v);
}
function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 