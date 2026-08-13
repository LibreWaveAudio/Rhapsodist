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

Content.setWidth(700);
Content.setHeight(175);

//! Mods
const globalFlexAhdsr = Synth.getAllModulators("globalFlexAhdsr")[0];
const mods = Synth.getAllModulators("GainFlexAhdsr");
const attributes = getAttributeList();

//! knbAhdsr
const knbAhdsr = createKnobs();

inline function onAhdsrControl(component, value)
{
    local knobIndex = knbAhdsr.indexOf(component);
    setModuleProperty(knobIndex, value);
    setSliderPackValue(knobIndex, value);
}

//! knbArticulation
const knbArticulation = Content.addKnob("Articulation", 10, 115);
knbArticulation.setRange(0, 49, 1);
knbArticulation.set("sendValueOnDrag", false);
knbArticulation.setControlCallback(onknbArticulationControl);

inline function onknbArticulationControl(component, value)
{
	changeArticulation(value);
}

//! btnLink
const btnLink = Content.addButton("LinkArticulation", 150, 125);
btnLink.set("text", "Link Articulation");
btnLink.set("tooltip", "When enabled, changing the value of a knob will affect all articulations");

//! Sliderpack Data
const slpAhdsrData = Engine.createAndRegisterSliderPackData(0);
slpAhdsrData.setUsePreallocatedLength(400);

//! slpAhdsr
const slpAhdsr = Content.addSliderPack("Ahdsr", 0, 0);
slpAhdsr.showControl(false);
slpAhdsr.referToData(slpAhdsrData);
slpAhdsr.set("sliderAmount", 400);
slpAhdsr.set("min", -100);
slpAhdsr.set("max", 20000);
slpAhdsr.set("stepSize", 0.01);

//! Functions
inline function changeArticulation(index: number)
{
	if (!mods.length)
		return;

	knbArticulation.setValue(index);

	for (i = 0; i < attributes.length; i++)
	{
		local value = slpAhdsr.getSliderValueAt(attributes.length * index + i);	
		knbAhdsr[i].setValue(value);
		setModuleProperty(i, value);
	}
}

inline function setModuleProperty(knobIndex: number, value: number)
{
	if (!mods.length)
		return;

	for (x in mods)
		x.setAttribute(attributes[knobIndex], value);

	if (isDefined(globalFlexAhdsr) && isDefined(attributes[knobIndex]))
		globalFlexAhdsr.setAttribute(attributes[knobIndex], value);
}

inline function setSliderPackValue(knobIndex: number, value: number)
{
	if (btnLink.getValue())
	{	
		for (i = 0; i <= knbArticulation.get("max"); i++)
		{
			local index = i * attributes.length + knobIndex;
			slpAhdsr.setSliderAtIndex(index, value);
		}

		return;
	}

	local index = knbArticulation.getValue() * attributes.length + knobIndex;
	slpAhdsr.setSliderAtIndex(index, value);
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

inline function: Array getAttributeList()
{
	local result = [];

	if (!mods.length)
		return [];

	return [mods[0].Attack, mods[0].Hold, mods[0].Decay, mods[0].Sustain, mods[0].Release, mods[0].AttackLevel, mods[0].AttackCurve, mods[0].DecayCurve, mods[0].ReleaseCurve];
}

//! Global Cables
const gm = Engine.getGlobalRoutingManager();

const gcPatch = gm.getCable("patch");
gcPatch.setRange(-1, 100);

const gcArticulation = gm.getCable("articulation");
gcArticulation.setRange(-1, 100);

gcArticulation.registerCallback(changeArticulation, SyncNotification);
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
 