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


Content.setWidth(750);
Content.setHeight(150);

const legatoDurations = [];
const glideDurations = [];

reg eventId = -99;
reg interval;
reg origin;
reg target;
reg stepIndex;
reg retriggerNote = -99;
reg lastChannel = 1;
reg lastNote = -99;
reg lastVelocity;
reg lastTime;
reg duration;
reg direction;
reg gain;
reg coarseDetune;
reg fineDetune;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbLegatoPitch
const knbLegatoPitch = Content.addKnob("LegatoPitch", 310, 0);
knbLegatoPitch.setRange(0, 100, 1);
knbLegatoPitch.set("middlePosition", 50);
knbLegatoPitch.set("defaultValue", 100);
knbLegatoPitch.set("tooltip", "Fine pitch value for legato notes.");

//! knbGlidePitch
const knbGlidePitch = Content.addKnob("GlidePitch", 460, 0);
knbGlidePitch.set("mode", "Linear");
knbGlidePitch.setRange(0, 100, 1);
knbGlidePitch.set("middlePosition", 50);
knbGlidePitch.set("defaultValue", 100);
knbGlidePitch.set("tooltip", "Fine pitch value for glide notes.");

//! knbSteps
const knbStepsMax = Content.addKnob("StepsMax", 610, 0);
knbStepsMax.setRange(2, 12, 1);
knbStepsMax.set("defaultValue", 12);
knbStepsMax.set("tooltip", "Maximum number of steps (semitones) triggered during transition. 12 = no limit");
knbStepsMax.setControlCallback(onknbStepsMaxControl);

inline function onknbStepsMaxControl(component, value)
{
	knbLegatoOffset.set("enabled", value > 2);
}

//! knbLegatoTimeMin
const knbLegatoTimeMin = Content.addKnob("LegatoTimeMin", 10, 50);
knbLegatoTimeMin.set("mode", "Time");
knbLegatoTimeMin.setRange(5, 100, 1);
knbLegatoTimeMin.set("defaultValue", 10);
knbLegatoTimeMin.set("tooltip", "Maximum duration for a semi-tone transition");
knbLegatoTimeMin.setControlCallback(onknbLegatoTimeMinControl);

inline function onknbLegatoTimeMinControl(component, value)
{
	setBaseDurations(legatoDurations, value, knbLegatoTimeMax.getValue());
}

//! knbLegatoTimeMax
const knbLegatoTimeMax = Content.addKnob("LegatoTimeMax", 160, 50);
knbLegatoTimeMax.set("mode", "Time");
knbLegatoTimeMax.setRange(50, 1000, 1);
knbLegatoTimeMax.set("defaultValue", 150);
knbLegatoTimeMax.set("tooltip", "Maximum duration for an octave or more transition");
knbLegatoTimeMax.setControlCallback(onknbLegatoTimeMaxControl);

inline function onknbLegatoTimeMaxControl(component, value)
{
	setBaseDurations(legatoDurations, knbLegatoTimeMin.getValue(), value);
}

//! knbLegatoOffset
const knbLegatoOffset = Content.addKnob("LegatoOffset", 310, 50);
knbLegatoOffset.set("mode", "Linear");
knbLegatoOffset.setRange(-1, 65535, 1);
knbLegatoOffset.set("middlePosition", 5000);
knbLegatoOffset.set("defaultValue", 1000);
knbLegatoOffset.set("tooltip", "Sample start offset time for legato notes, in samples");

//! knbTargetOffset
const knbTargetOffset = Content.addKnob("TargetOffset", 460, 50);
knbTargetOffset.set("mode", "Linear");
knbTargetOffset.setRange(-1, 65535, 1);
knbTargetOffset.set("middlePosition", 5000);
knbTargetOffset.set("defaultValue", 0);
knbTargetOffset.set("tooltip", "Sample start offset time for target note, in samples");

//! btnGlide
const btnGlide = Content.addButton("Glide", 160, 10);

//! knbGlideTimeMin
const knbGlideTimeMin = Content.addKnob("GlideTimeMin", 10, 100);
knbGlideTimeMin.set("mode", "Time");
knbGlideTimeMin.setRange(200, 1000, 1);
knbGlideTimeMin.set("defaultValue", 300);
knbGlideTimeMin.setControlCallback(onknbGlideTimeMinControl);

inline function onknbGlideTimeMinControl(component, value)
{
	setBaseDurations(glideDurations, value, knbGlideTimeMax.getValue());
}

//! knbGlideTimeMax
const knbGlideTimeMax = Content.addKnob("GlideTimeMax", 160, 100);
knbGlideTimeMax.set("mode", "Time");
knbGlideTimeMax.setRange(500, 2000, 1);
knbGlideTimeMax.set("defaultValue", 750);
knbGlideTimeMax.setControlCallback(onknbGlideTimeMaxControl);

inline function onknbGlideTimeMaxControl(component, value)
{
	setBaseDurations(glideDurations, knbGlideTimeMin.getValue(), value);
}

//! knbGlideOffset
const knbGlideOffset = Content.addKnob("GlideOffset", 310, 100);
knbGlideOffset.set("mode", "Linear");
knbGlideOffset.setRange(-1, 65535, 1);
knbGlideOffset.set("middlePosition", 5000);
knbGlideOffset.set("defaultValue", -1);
knbGlideOffset.set("tooltip", "Sample start offset time for glide notes, in samples");

//! Functions
inline function playLegatoNote(velocity: number)
{	
	local numSteps = getNumSteps(interval);

	local step = getStep(numSteps);
	local note = (direction ? origin - step : origin + step);
	local stepDuration = getStepDuration(stepIndex, numSteps, duration);
	local bendAmt = getPitchBend(direction);
	local coarse = coarseDetune + parseInt((bendAmt + fineDetune) / 100);
	local fine = ((bendAmt + fineDetune) % 100);
	local startOffset = getStartOffset(note);

	if (Synth.isArtificialEventActive(eventId))
	{
		Synth.addPitchFade(eventId, stepDuration, coarse, fine);
		Synth.addVolumeFade(eventId, stepDuration, -100);
	}

	eventId = Synth.playNoteWithStartOffset(lastChannel, note, velocity, startOffset);

	if (startOffset > 0 || startOffset == -1 || btnGlide.getValue())
	{
		Synth.addPitchFade(eventId, 0, -coarse, -fine);
		Synth.addPitchFade(eventId, stepDuration, coarseDetune, fineDetune);

		Synth.addVolumeFade(eventId, 0, -99);
		Synth.addVolumeFade(eventId, stepDuration, gain);
	}

	if (note == target)
		return Synth.stopTimer();

	Synth.startTimer(stepDuration / 1000);

	stepIndex++;
}

inline function: number getPitchBend(direction: number)
{
	local result;

	if (btnGlide.getValue())
		result = direction ? -knbGlidePitch.getValue() : knbGlidePitch.getValue();
	else
		result =  direction ? -knbLegatoPitch.getValue() : knbLegatoPitch.getValue();

	result += Math.randInt(-10, 10);

	return result;
}

inline function: number getStartOffset(note: number)
{
	if (btnGlide.getValue())
		return knbGlideOffset.getValue();

	return note == target ? knbTargetOffset.getValue() : knbLegatoOffset.getValue();
}

inline function: number getNumSteps(interval: number)
{
	local result;
	
	if (btnGlide.getValue())
		result = interval;
	else
		result = knbStepsMax.getValue() < 12 ? knbStepsMax.getValue() : interval;

	return Math.min(result, interval);
}

inline function: number getStep(numSteps: number)
{
	return 1 + Math.round(stepIndex * (interval - 1) / (numSteps - 1));	
}

inline function setBaseDurations(arr: Array, min: number, max: number)
{
	arr.clear();

	local curve = 0.5;

	for (i = 0; i < 12; ++i)
	{
		local t = i / 11.0;
		local weight;

		if (curve < 0.5)
		{
			local blend = curve * 2.0;
			local concave = 1.0 - (1.0 - t) * (1.0 - t);

			weight = concave * (1.0 - blend) + t * blend;
		}
		else
		{
			local blend = (curve - 0.5) * 2.0;
			local convex = t * t;

			weight = t * (1.0 - blend) + convex * blend;
		}

        arr.push(min + (max - min) * weight);
    }
}

inline function: number getTransitionDuration(velocity: number, interval: number)
{
	local min = 4;
	local max;

	if (btnGlide.getValue())
		max = glideDurations[Math.min(interval, 11)];
	else
		max = legatoDurations[Math.min(interval, 11)];

	local velocityNorm = 1 - (velocity / 127);

	return min + velocityNorm * (max - min);
}

inline function: number getStepDuration(stepIndex: number, numSteps: number, max: number)
{
	local curve = 0.7;
	local i = stepIndex - 1;
	local t0 = (i * 1.0) / numSteps;
	local t1 = ((i + 1) * 1.0) / numSteps;
	local f0 = 2 * (1 - t0) * t0 * curve + t0 * t0;
	local f1 = 2 * (1 - t1) * t1 * curve + t1 * t1;

	return Math.max((f1 - f0) * max, 4);
}

//! Calls
Synth.stopTimer();
function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local n = Message.getNoteNumber() + Message.getTransposeAmount();
	local v = Message.getVelocity();

	gain = Message.getGain();
	coarseDetune = Message.getCoarseDetune();
	fineDetune = Message.getFineDetune();

	local isChord = ((Engine.getUptime() - lastTime) < 0.025);

	if (isChord && n != lastNote)
		return;

	if (Synth.isLegatoInterval() && lastNote != -99)
	{
		Message.ignoreEvent(true);

		origin = lastNote;
		target = n;
		interval = Math.abs(origin - target);
		direction = (origin > target);
		duration = getTransitionDuration(v, interval);
		stepIndex = 1;

		playLegatoNote(v);
	}
	else
	{
		eventId = Message.makeArtificial();
	}

	retriggerNote = lastNote;
	lastChannel = Message.getChannel();
	lastNote = n;
	lastVelocity = v;
	lastTime = Engine.getUptime();
}

function onNoteOff()
{
	if (btnMute.getValue())
	{		
		if (Synth.isArtificialEventActive(eventId))
			Synth.noteOffByEventId(eventId);
		
		Synth.stopTimer();
		eventId = -99;
		lastNote = -99;
		return;
	}	

	local n = Message.getNoteNumber() + Message.getTransposeAmount();

	if (n == retriggerNote)
		retriggerNote = -99;

	if (!Synth.isArtificialEventActive(eventId))
		return;
		
	if (n == lastNote && retriggerNote != -99)
	{
		origin = n;
		target = retriggerNote;
		interval = Math.abs(origin - target);
		direction = (origin > target);
		stepIndex = 1;

		playLegatoNote(lastVelocity);

		lastTime = Engine.getUptime();
		lastNote = retriggerNote;
		retriggerNote = -99;
		return;
	}

	if (n == lastNote)
	{
		Synth.stopTimer();
		Synth.noteOffByEventId(eventId);
		lastNote = -99;
	}
}

function onController()
{
	
}
 function onTimer()
{
	playLegatoNote(lastVelocity);
}
function onControl(number, value)
{
	
}
 