/*
    Copyright 2021, 2022, 2023, 2024, 2025 David Healey

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

const mods = Synth.getAllModulators("GainAhdsr");
const attributes = [mods[0].Attack, mods[0].Hold, mods[0].Decay, mods[0].Sustain, mods[0].Release];

const globalAhdsr = Synth.getAllModulators("globalAhdsr")[0];

//! btnMute
const btnMute = Content.addButton("Mute", 10, 10);

//! knbArticulation
const knbArticulation = Content.addKnob("Articulation", 160, 0);
knbArticulation.set("text", "Articulation");
knbArticulation.setRange(-1, 100, 1);
knbArticulation.setControlCallback(onknbArticulationControl);
knbArticulation.setTooltip("This is a tooltip");

inline function onknbArticulationControl(component, value)
{	
	if (!btnMute.getValue())
		changeArticulation(value);
}

//! knbAhdsr
const knbAhdsr = [];

//! Attack
knbAhdsr[0] = Content.addKnob("Attack", 310, 0);
knbAhdsr[0].set("mode", "Time");
knbAhdsr[0].set("defaultValue", 20);

//! Hold
knbAhdsr[1] = Content.addKnob("Hold", 460, 0);
knbAhdsr[1].set("mode", "Time");
knbAhdsr[1].set("defaultValue", 10);

//! Decay
knbAhdsr[2] = Content.addKnob("Decay", 10, 50);
knbAhdsr[2].set("mode", "Time");
knbAhdsr[2].set("defaultValue", 300);

//! Sustain
knbAhdsr[3] = Content.addKnob("Sustain", 160, 50);
knbAhdsr[3].set("mode", "Decibel");
knbAhdsr[3].set("defaultValue", 0);

//! Release
knbAhdsr[4] = Content.addKnob("Release", 310, 50);
knbAhdsr[4].set("mode", "Time");
knbAhdsr[4].set("defaultValue", 20);

for (c in knbAhdsr)
    c.setControlCallback(onAhdsrControl);

inline function onAhdsrControl(component, value)
{
	if (btnMute.getValue() || !attributes.length)
		return;

    local index = knbAhdsr.indexOf(component);

    for (x in mods)
        x.setAttribute(attributes[index], value);

	if (isDefined(globalAhdsr))
		globalAhdsr.setAttribute(attributes[index], value);
}

//! slpAhdsr
const slpAhdsr = Content.addSliderPack("Ahdsr", 10, 100);
slpAhdsr.set("min", -100);
slpAhdsr.set("max", 20000);
slpAhdsr.set("stepSize", 0.01);
slpAhdsr.set("width", 580);
slpAhdsr.set("sliderAmount", knbAhdsr.length * knbArticulation.get("max"));
slpAhdsr.showControl(false);

const slpAhdsrData = Engine.createAndRegisterSliderPackData(0);
slpAhdsr.referToData(slpAhdsrData);

//! Functions
inline function changeArticulation(index: number)
{
	if (btnMute.getValue() || !attributes.length)
		return;

	for (i = 0; i < attributes.length; i++)
	{
		local value = slpAhdsr.getSliderValueAt(attributes.length * index + i);		
		knbAhdsr[i].setValue(value);
		knbAhdsr[i].changed();
	}
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
 