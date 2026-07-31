/*
    Copyright 2021, 2026 David Healey

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
Content.setHeight(100);

//! Modulators
const lfos = [];
const ccIntensity = [];
const ccFreq = [];
const gainMods = [];
const pitchMods = [];
const xfadeMods = [];

//! cmbMode
const cmbMode = Content.addComboBox("Mode", 10, 10);
cmbMode.set("items", ["Vibrato", "Flutter", "Growl"].join("\n"));
cmbMode.setControlCallback(oncmbModeControl);

inline function oncmbModeControl(component, value)
{
	local type = component.getItemText().toLowerCase();
	getModulators(type);
}

//! knbGain
const knbGain = Content.addKnob("Gain", 160, 0);
knbGain.setControlCallback(onknbGainControl);

inline function onknbGainControl(component, value)
{
	for (x in gainMods)
		x.setIntensity(value);
}

//! knbPitch
const knbPitch = Content.addKnob("Pitch", 310, 0);
knbPitch.setRange(-2, 2, 0.01);
knbPitch.set("middlePosition", 0);
knbPitch.setControlCallback(onknbPitchControl);

inline function onknbPitchControl(component, value)
{
	for (x in pitchMods)
		x.setIntensity(value);
}

// knbXfade
const knbXfade = Content.addKnob("Xfade", 460, 0);
knbXfade.setControlCallback(onknbXfadeControl);

inline function onknbXfadeControl(component, value)
{
	for (x in xfadeMods)
		x.setIntensity(value);
}

//! knbRate
const knbRate = Content.addKnob("Rate", 10, 50);
knbRate.set("mode", "Linear");
knbRate.setRange(0, 127, 1);
knbRate.set("middlePosition", 64);
knbRate.setControlCallback(onknbRateControl);

inline function onknbRateControl(component, value)
{
	for (x in ccFreq)
		x.setAttribute(x.DefaultValue, value);
}

//! knbDepth
const knbDepth = Content.addKnob("Depth", 160, 50);
knbDepth.set("mode", "Linear");
knbDepth.set("middlePosition", 64);
knbDepth.setRange(0, 127, 1);
knbDepth.setControlCallback(onknbDepthControl);

inline function onknbDepthControl(component, value)
{
	for (x in ccIntensity)
		x.setAttribute(x.DefaultValue, value);
}

//! Functions
inline function getModulators(type: string)
{
	lfos.clear();
	ccIntensity.clear();
	ccFreq.clear();
	gainMods.clear();
	pitchMods.clear();
	xfadeMods.clear();

	local lfoIds = Synth.getIdList("LFO Modulator");
	local ccIds = Synth.getIdList("Midi Controller");
	local modulatorIds = Synth.getIdList("Global Time Variant Modulator");

	for (x in lfoIds)
	{
		local id = x.toLowerCase();

		if (id.contains(type) && !id.contains("random"))
			lfos.push(Synth.getModulator(x));
	}

	for (x in ccIds)
	{
		local id = x.toLowerCase();

		if (!id.contains(type))
			continue;

		if (!id.contains("gain") && !id.contains("pitch") && !id.contains("xf"))
			continue;
			
		if (id.contains("intensity"))
			ccIntensity.push(Synth.getModulator(x));

		if (id.contains("frequency"))
			ccFreq.push(Synth.getModulator(x));
	}

	for (x in modulatorIds)
	{
		local id = x.toLowerCase();

		if (!id.contains(type))
			continue;

		if (id.contains("gain"))
			gainMods.push(Synth.getModulator(x));
		else if (id.contains("pitch"))
			pitchMods.push(Synth.getModulator(x));
		else if (id.contains("xf"))
			xfadeMods.push(Synth.getModulator(x));
	}	
}
function onNoteOn()
{
	
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
 