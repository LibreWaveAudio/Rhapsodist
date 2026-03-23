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

Content.setWidth(1920);
Content.setHeight(300);

const MAX_CHANNELS = 12;

const rootChainId = Synth.getIdList("Container")[0];
const rootMatrix = Synth.getRoutingMatrix(rootChainId);
const simpleGains = Synth.getAllEffects("mixerGain\\d");
const samplers = getAllSamplers();
const soloState = [];

//! knbGain
const knbGain = [];

for (i = 0; i < MAX_CHANNELS; i++)
{
	knbGain.push(Content.addKnob("Gain" + i, 10 + 160 * i, 0));
	knbGain[i].set("mode", "Decibel");
	knbGain[i].set("max", 12);
	knbGain[i].setControlCallback(onknbGainControl);
}

inline function onknbGainControl(component, value)
{
	local index = knbGain.indexOf(component);

	if (!isValidIndex(index))
		return;

	if (btnMute[index].getValue() && !btnSolo[index].getValue())
		return;

	if (!btnSolo[index].getValue() && soloState.contains(1))
		return;

	simpleGains[index].setAttribute(simpleGains[index].Gain, value);
}

//! knbPan
const knbPan = [];

for (i = 0; i < MAX_CHANNELS; i++)
{
	knbPan.push(Content.addKnob("Pan" + i, 10 + 160 * i, 50));
	knbPan[i].set("mode", "Pan");
	knbPan[i].setControlCallback(onknbPanControl);
}

inline function onknbPanControl(component, value)
{
	local index = knbPan.indexOf(component);
	
	if (!isValidIndex(index))
		return;

	simpleGains[index].setAttribute(simpleGains[index].Balance, value);
}

//! btnPurge
const btnPurge = [];

for (i = 0; i < MAX_CHANNELS; i++)
{
	btnPurge.push(Content.addButton("Purge" + i, 10 + 160 * i, 110));
	btnPurge[i].setControlCallback(onbtnPurgeControl);
}

inline function onbtnPurgeControl(component, value)
{
	local index = btnPurge.indexOf(component);

	if (!isValidIndex(index))
		return;

	purgeLoadChannel(index, value);
}

//! btnMute
const btnMute = [];

for (i = 0; i < MAX_CHANNELS; i++)
{
	btnMute.push(Content.addButton("Mute" + i, 10 + 160 * i, 160));
	btnMute[i].setControlCallback(onbtnMuteControl);
}

inline function onbtnMuteControl(component, value)
{
	local index = btnMute.indexOf(component);

	if (!isValidIndex(index))
		return;

	soloMuteProcess();
}

//! btnSolo
const btnSolo = [];

for (i = 0; i < MAX_CHANNELS; i++)
{
	btnSolo.push(Content.addButton("Solo" + i, 10 + 160 * i, 210));
	btnSolo[i].setControlCallback(onbtnSoloControl);
}

inline function onbtnSoloControl(component, value)
{
	local index = btnSolo.indexOf(component);
	
	if (!isValidIndex(index))
		return;
	
	soloState[index] = value;
	soloMuteProcess();
}

//! knbOutput
const knbOutput = [];

for (i = 0; i < MAX_CHANNELS; i++)
{
	knbOutput.push(Content.addKnob("Output" + i, 10 + 160 * i, 250));
	knbOutput[i].setRange(0, MAX_CHANNELS, 1);
	knbOutput[i].setControlCallback(onknbOutputControl);
}

inline function onknbOutputControl(component, value)
{
	local index = knbOutput.indexOf(component);
	updateOutputConnections(index, value);
}

//! Functions
inline function getAllSamplers()
{
	local samplerIds = Synth.getIdList("Sampler");
	local result = [];
	
	for (id in samplerIds)
	    result.push(Synth.getSampler(id));

	return result;
}

inline function isValidIndex(index)
{
	return index < simpleGains.length;
}

inline function purgeLoadChannel(index, value)
{
	for (s in samplers)
	{
		if (s.getNumMicPositions() <= 1 || index >= s.getNumMicPositions())
			continue;

		local micName = s.getMicPositionName(index);
		s.purgeMicPosition(micName, 1 - value);
	}
}

inline function soloMuteProcess()
{
	if (!simpleGains.length || !knbGain.length || !btnSolo.length || !btnMute.length)
		return;

	for (i = 0; i < simpleGains.length; i++)
	{
		if ((!btnMute[i].getValue() || btnSolo[i].getValue()) && (btnSolo[i].getValue() || !soloState.contains(1)))
			simpleGains[i].setAttribute(simpleGains[i].Gain, knbGain[i].getValue());
		else
			simpleGains[i].setAttribute(simpleGains[i].Gain, -100);
	}
}

inline function updateOutputConnections(index, value)
{
	local v = (value - 1) * 2;
	
	rootMatrix.addConnection(0 + (index * 2), v);
	
	local success = rootMatrix.addConnection(1 + (index * 2), v + 1);
	
	// Reset to Channel 1+2 in case of an error
	if (!success)
	{
		rootMatrix.addConnection(0 + (index * 2), 0);
		rootMatrix.addConnection(1 + (index * 2), 1);
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
 