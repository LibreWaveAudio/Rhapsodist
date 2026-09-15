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
@description: Provides controls for coarse and fine tuning, and octave and semi-tone transposition of MIDI message.
@note: This is not continuous tuning, it takes effect at note onset.
*/

Content.setWidth(730);
Content.setHeight(50);

const lastTranspose = Engine.createMidiList();

//! knbFine
const knbFine = Content.addKnob("FineTune", 10, 0);
knbFine.set("text", "Fine Tune");
knbFine.set("suffix", "ct");
knbFine.setRange(-100, 100, 1);
knbFine.set("middlePosition", 0);
knbFine.setControlCallback(onknbFineControl);

inline function onknbFineControl(component, value)
{
	updateTuning();
}

//! knbCoarse
const knbCoarse = Content.addKnob("CoarseTune", 160, 0);
knbCoarse.set("text", "Coarse Tune");
knbCoarse.set("suffix", "st");
knbCoarse.setRange(-12, 12, 1);
knbCoarse.set("middlePosition", 0);
knbCoarse.setControlCallback(onknbCoarseControl);

inline function onknbCoarseControl(component, value)
{
	updateTuning();
}

//! knbOctave
const knbOctave = Content.addKnob("OctaveTranspose", 310, 0);
knbOctave.set("text", "Octave Transpose");
knbOctave.setRange(-2, 2, 1);
knbOctave.set("middlePosition", 0);

//! knbSemi
const knbSemi = Content.addKnob("SemiToneTranspose", 460, 0);
knbSemi.set("text", "Semi Tone Transpose");
knbSemi.setRange(-12, 12, 1);
knbSemi.set("middlePosition", 0);

// Functions
inline function updateTuning()
{
	local fine = knbFine.getValue();
	local coarse = knbCoarse.getValue();	
	local v = coarse + fine / 100;

	Engine.setGlobalPitchFactor(v);
}
function onNoteOn()
{
	local n = Message.getNoteNumber();
	local t = -(12 * knbOctave.getValue() + knbSemi.getValue());
	
	lastTranspose.setValue(n, t);

	if (t != 0)
		Message.setTransposeAmount(t);
}
function onNoteOff()
{
	local n = Message.getNoteNumber();
	local t = -((12 * knbOctave.getValue() + knbSemi.getValue()));

	t += (lastTranspose.getValue(n) - t);

	if (t != 0)
		Message.setTransposeAmount(t);
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
 