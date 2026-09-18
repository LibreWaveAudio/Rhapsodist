/*
    Copyright 2021, 2022, 2023, 2024, 2025, 2026 David Healey

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
@description: Controls the knobs of all flex ahdsr envelopes in the project that contain "GainFlexAhdsr" in their ID.
*/

Content.setWidth(700);
Content.setHeight(110);

//! Mods
const mods = Synth.getAllModulators("GainFlexAhdsr");

//! knbAhdsr
const knbAhdsr = createKnobs();

inline function onAhdsrControl(component, value)
{
    local knobIndex = knbAhdsr.indexOf(component);
    setModuleProperty(knobIndex, value);
}

//! Functions
inline function setModuleProperty(knobIndex: number, value: number)
{
	if (!mods.length)
		return;

	local attributes = [mods[0].Attack, mods[0].Hold, mods[0].Decay, mods[0].Sustain, mods[0].Release, mods[0].AttackLevel, mods[0].AttackCurve, mods[0].DecayCurve, mods[0].ReleaseCurve];

	for (x in mods)
		x.setAttribute(attributes[knobIndex], value);
}

inline function: Array createKnobs()
{
	local result = [];

	local knobProperties = [
		{
			text: "Attack",
			mode: "Time",
			defaultValue: 2,
		},
		{
			text: "Hold",
			mode: "Time",
			defaultValue: 10,
		},
		{
			text: "Decay",
			mode: "Time",
			defaultValue: 300,
		},
		{
			text: "Sustain",
			mode: "NormalizedPercentage",
			defaultValue: 1.0,
		},
		{
			text: "Release",
			mode: "Time",
			defaultValue: 5000,
		},
		{
			text: "AttackLevel",
			mode: "NormalizedPercentage",
			defaultValue: 1.0,
		},
		{
			text: "AttackCurve",
			mode: "NormalizedPercentage",
			defaultValue: 0.5,
		},
		{
			text: "DecayCurve",
			mode: "NormalizedPercentage",
			defaultValue: 0.5,
		},
		{
			text: "ReleaseCurve",
			mode: "NormalizedPercentage",
			defaultValue: 0.5,
		}
	];

	for (i = 0; i < knobProperties.length; i++)
	{
		local props = knobProperties[i];
		local knob = Content.addKnob(props.text);

		props.x = 10 + ((i % 5) * (knob.getWidth() + 10));
		props.y = Math.floor(i / 5) * (knob.getHeight() + 10);

		Content.setPropertiesFromJSON(props.text, props);

		knob.setControlCallback(onAhdsrControl);

		result.push(knob);
	}

	return result;
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
 