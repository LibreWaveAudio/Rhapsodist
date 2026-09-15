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
@description: Sets a sample start offset and gain fade the values scaled based on repetition speed and MIDI velocity.
*/

Content.setWidth(750);
Content.setHeight(100);

reg lastNote;
reg lastTime;

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbAttackOffset
const knbAttackOffset = Content.addKnob("AttackOffset", 160, 0);
knbAttackOffset.set("mode", "Linear");
knbAttackOffset.setRange(-1, 20000, 1);
knbAttackOffset.set("middlePosition", 10000);
knbAttackOffset.set("defaultValue", 0);
knbAttackOffset.set("tooltip", "Maximum start offset for initial note attack.");

//! knbRepeatOffset
const knbRepeatOffset = Content.addKnob("RepeatOffset", 310, 0);
knbRepeatOffset.set("mode", "Linear");
knbRepeatOffset.setRange(-1, 20000, 1);
knbRepeatOffset.set("middlePosition", 10000);
knbRepeatOffset.set("defaultValue", 5000);
knbRepeatOffset.set("tooltip", "Maximum start offset for repeated note attacks");

//! knbAttackFade
const knbAttackFade = Content.addKnob("AttackFade", 460, 0);
knbAttackFade.set("mode", "Time");
knbAttackFade.setRange(0, 500, 1);
knbAttackFade.set("middlePosition", 250);
knbAttackFade.set("defaultValue", 0);
knbAttackFade.set("tooltip", "Maximum fade in for initial note attacks");

//! knbRepeatFade
const knbRepeatFade = Content.addKnob("RepeatFade", 610, 0);
knbRepeatFade.set("mode", "Time");
knbRepeatFade.setRange(0, 500, 1);
knbRepeatFade.set("middlePosition", 250);
knbRepeatFade.set("defaultValue", 50);
knbRepeatFade.set("tooltip", "Maximum fade in for repeated note attacks");

//! knbMinVelocity
const knbMinVelocity = Content.addKnob("MinVelocity", 10, 50);
knbMinVelocity.setRange(0, 127, 1);
knbMinVelocity.set("defaultValue", 0);

//! knbMaxVelocity
const knbMaxVelocity = Content.addKnob("MaxVelocity", 160, 50);
knbMaxVelocity.setRange(0, 127, 1);
knbMaxVelocity.set("defaultValue", 127);

//! Functions

/**
 * Maps velocity to a value.
 *
 * minOutput:    Minimum output as a fraction of maxOffset (0.5 = 50%).
**/
inline function: number getScaledValue(maxValue: number, velocity: number, minValue: number)
{
	if (maxValue == -1)
		return maxValue;

	local minVelocity = knbMinVelocity.getValue();
	local maxVelocity = knbMaxVelocity.getValue();
	local t = (velocity - minVelocity) / (maxVelocity - minVelocity);
	t = Math.max(0.0, Math.min(1.0, t));

	local scale = 1.0 - (1.0 - minValue) * t;

	return (maxValue * scale) * (0.9 + Math.random() * 0.2);
}
function onNoteOn()
{
	if (btnMute.getValue())
		return;

	local v = Message.getVelocity();
	
	if (v < knbMinVelocity.getValue() || v > knbMaxVelocity.getValue())
		return;

	local n = Message.getNoteNumber();
	local eventId = Message.getEventId();
	local gain = Message.getGain();
	local isRepetition = (n == lastNote && (Engine.getUptime() - lastTime) < 0.2);
	local maxOffset = isRepetition ? knbRepeatOffset.getValue() : knbAttackOffset.getValue();
	local maxFade = isRepetition ? knbRepeatFade.getValue() : knbAttackFade.getValue();
 	local fadeTm = getScaledValue(maxFade, v, isRepetition ? 0.5 : 0);
 	local offset = getScaledValue(maxOffset, v, isRepetition ? 0.5 : 0);

	if (offset > 0 || offset == -1)
		Message.setStartOffset(offset);

	if (fadeTm > 0)
	{
		Synth.addVolumeFade(eventId, 0, -99);
		Synth.addVolumeFade(eventId, fadeTm, gain);
	}
	
	lastNote = n;
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
 