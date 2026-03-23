/*
    Copyright 2024 David Healey

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

Content.setHeight(100);

//! knbArticulation
const knbArticulation = Content.addKnob("Articulation", 10, 0);
knbArticulation.set("text", "Articulation");
knbArticulation.setRange(0, 100, 1);

//! knbGain
const knbGain = Content.addKnob("Gain", 160, 0)
knbGain.set("mode", "Decibel");
knbGain.setRange(-24.0, 24.0, 1);
knbGain.set("middlePosition", 0.0);
knbGain.set("tooltip", "Starting gain that will be applied to notes before articulation gain.");

//! slpGain
const slpGain = Content.addSliderPack("slpGain", 310, 10);
const gainData = Engine.createAndRegisterSliderPackData(0);
slpGain.referToData(gainData);
slpGain.set("min", 0);
slpGain.set("max", 1);
slpGain.set("stepSize", 0.01);
slpGain.set("sliderAmount", 100);
slpGain.set("width", 275);
slpGain.set("height", 80);

//! Functions
inline function getArticulationGain(index)
{
	local v = slpGain.getSliderValueAt(index);
	return knbGain.getValue() + (v * 24 + -24);
}

//! Broadcasters
const bcArticulation = Engine.createBroadcaster({id: "bcArticulation", args: ["processor", "parameter", "value"]});
bcArticulation.attachToModuleParameter("Interface", "knbArticulation", "");

bcArticulation.addComponentValueListener("Articulation", "Listen for changes from Interface's articulation knob", function(index, processor, parameter, value)
{
	return value;
});

function onNoteOn()
{
	local gain = getArticulationGain(knbArticulation.getValue());
	Message.setGain(gain);
}
 function onNoteOff()
{
	local gain = getArticulationGain(knbArticulation.getValue());
	Message.setGain(gain);
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
 