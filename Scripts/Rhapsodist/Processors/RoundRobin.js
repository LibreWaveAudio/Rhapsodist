/*
    Copyright 2019, 2020, 2021, 2022, 2024 David Healey

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

Content.setHeight(250);
Content.setWidth(750);

const lastTime = Engine.createMidiList();
const lastStep = Engine.createMidiList();
const lastBorrowed = Engine.createMidiList();
const lastVelocity = Engine.createMidiList();

lastTime.fill(0);
lastStep.fill(0);

const samplerIds = Synth.getIdList("Sampler");
const sampler = Synth.getSampler(samplerIds[0]); //Get first child sampler
sampler.enableRoundRobin(false);

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! btnRelease
const btnRelease = Content.addButton("Release", 10, 60);
btnRelease.set("tooltip", "If enabled the round robin counter will move on note off.");

//! btnIgnoreLegato
const btnIgnoreLegato = Content.addButton("IgnoreLegato", 10, 110);
btnIgnoreLegato.set("text", "Ignore Legato");
btnIgnoreLegato.set("tooltip", "If enabled legato transitions won't trigger round robin action.");

//! btnPerNoteRR
const btnPerNoteRR = Content.addButton("PerNoteRR", 10, 160);
btnPerNoteRR.set("text", "Per Note RR");
btnPerNoteRR.set("tooltip", "If enabled each note will have its own RR step count.");

//! btnMode
const btnModes = [];

//! Mode
btnModes[0] = Content.addButton("Group", 160, 10);
btnModes[1] = Content.addButton("Velocity", 310, 10);
btnModes[2] = Content.addButton("Borrowed", 460, 10);

for (i = 0; i < btnModes.length; i++)
    btnModes[i].setControlCallback(onbtnModesControl);

inline function onbtnModesControl(component, value)
{
    btnRandom.showControl(btnModes[0].getValue() || btnModes[1].getValue());
    knbCount.showControl(btnModes[0].getValue() || btnModes[1].getValue());
    knbFirstGroup.showControl(btnModes[0].getValue());
    btnVelocityOffset.showControl(btnModes[1].getValue());
    btnVelocitySpread.showControl(btnModes[1].getValue());
}

//! Random
const btnRandom = Content.addButton("Random", 610, 110);

//! RR Count
const knbCount = Content.addKnob("Count", 610, 150);
knbCount.set("text", "Count");
knbCount.setRange(0, 30, 1);
knbCount.set("tooltip", "The number of variations (either group or velocity based).");

//! RR Lock
const knbLock = Content.addKnob("Lock", 610, 0);
knbLock.set("text", "Lock");
knbLock.setRange(0, 20, 1);
knbLock.set("tooltip", "Bypass the round robin script and play only the selected repetition.");

//! Reset Tm
const knbReset = Content.addKnob("ResetTm", 610, 50);
knbReset.set("text", "Reset Tm");
knbReset.set("suffix", " seconds");
knbReset.setRange(0, 5, 1);
knbReset.set("tooltip", "If greater than 0 the round robin counter will be reset after the elapsed time if no note is triggered.");

//! Velocity offset
const btnVelocityOffset = Content.addButton("VelocityOffset", 310, 60);
btnVelocityOffset.set("text", "Velocity Offset");
btnVelocityOffset.set("tooltip", "Enable this if a velocity offset has been applied by a previous script.");

//! Velocity spread
const btnVelocitySpread = Content.addButton("VelocitySpread", 310, 110);
btnVelocitySpread.set("text", "Velocity Spread");
btnVelocitySpread.set("tooltip", "Enable this is round robins are evenly spaced on the velocity dimension.");

//! knbFirstGroup
const knbFirstGroup = Content.addKnob("FirstGroup", 160, 50);
knbFirstGroup.setControlCallback(onknbFirstGroupControl);
knbFirstGroup.setRange(1, 50, 1);
knbFirstGroup.set("text", "First Group");
knbFirstGroup.set("tooltip", "Starting group for this articulation's round robins.");

inline function onknbFirstGroupControl(component, value)
{
	lastStep.fill(0);
	lastTime.fill(0);
}

inline function doRoundRobin(note, velocity)
{
	local n = note;
	local v = velocity;
	local index = btnPerNoteRR.getValue() * note;
	local s = lastStep.getValue(index);
	
	// RR Reset
	if (knbReset.getValue() > 0 && (Engine.getUptime() - lastTime.getValue(index)) >= knbReset.getValue())
		s = 0;

	// Lock to RR
	if (knbLock.getValue() > 0)
		s = knbLock.getValue() - 1;

	// Group
	if (btnModes[0].getValue())
		sampler.setActiveGroup(knbFirstGroup.getValue() + (s * (knbCount.getValue() > 1)));

	// Velocity
	if (btnModes[1].getValue() && knbCount.getValue() > 1)
	{
		if (btnVelocitySpread.getValue())
			Message.setVelocity(128 / knbCount.getValue() * s + 1);
		else
			Message.setVelocity(v * btnVelocityOffset.getValue() + s + 1);
	}
       
	// Borrowed (random non-repeating)
	if (btnModes[2].getValue())
	{
		local lb = lastBorrowed.getValue(Message.getNoteNumber());

		if (!knbLock.getValue())
			lb = (lb - 1 + Math.randInt(2, 4)) % 3;

		if (!sampler.isNoteNumberMapped(n + (lb - 1)))
			lb = 1;

		Message.setTransposeAmount(lb - 1 + Message.getTransposeAmount());
		Message.setCoarseDetune(-(lb - 1) + Message.getCoarseDetune());
		lastBorrowed.setValue(n, lb);
	}
       
	// Get next step for group and velocity based
	if (!knbLock.getValue() && knbCount.getValue() > 1 && (btnModes[0].getValue() || btnModes[1].getValue()))
	{
		if (!btnRandom.getValue())
			s = (s + 1) % knbCount.getValue();
		else
			s = (lastStep.getValue(index) - 1 + Math.randInt(2, knbCount.getValue() + 1)) % knbCount.getValue();
	}
       
	lastTime.setValue(index, Engine.getUptime());
	lastStep.setValue(index, s);
}function onNoteOn()
{
	if (btnMute.getValue())
		return;
		
	if (!btnModes[0].getValue() && !btnModes[1].getValue() && !btnModes[2].getValue())
		return;

	if (btnIgnoreLegato.getValue() && Synth.isLegatoInterval())
		return;

	local n = Message.getNoteNumber();
	local v = Message.getVelocity();

	if (!btnRelease.getValue())
		doRoundRobin(n, v);

	lastVelocity.setValue(n, v);
}function onNoteOff()
{
	if (btnMute.getValue() || !btnRelease.getValue())
		return;
		
	if (!btnModes[0].getValue() && !btnModes[1].getValue() && !btnModes[2].getValue())
		return;
		
	local n = Message.getNoteNumber();
		
	doRoundRobin(n, lastVelocity.getValue(n));
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
 