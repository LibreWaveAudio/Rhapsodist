/*
    Copyright 2025 David Healey

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
@description: Adjusts the time stretch ratio to match the host tempo.
@usage: Place in a sampler's MIDI processor chain.
				Set the sampler's Timestretching mode to VoiceStart or TimeVariant.
				Set the BPM knob to the BPM your samples were recorded at.
@note: Samplers include a tempo sync mode, but it's weird to use so use this simple script instead.
*/

//! knbBpm
const knbBpm = Content.addKnob("bpm", 0, 0);
knbBpm.set("text", "BPM");
knbBpm.setRange(10, 200, 1);
knbBpm.set("defaultValue", 120);
knbBpm.set("tooltip", "The tempo the samples were recorded at.");

//! Sampler and transport handler
const samplerIds = Synth.getIdList("Sampler");
const sampler = Synth.getSampler(samplerIds[0]);

const th = Engine.createTransportHandler();
th.setLinkBpmToSyncMode(true);
th.setOnTempoChange(true, updateTimeStretchRatio);

//! Time stretch options
const obj = sampler.getTimestretchOptions();
obj.SkipLatency = true;
sampler.setTimestretchOptions(obj);

//! Functions
inline function updateTimeStretchRatio(newTempo)
{
	local ratio = newTempo / knbBpm.getValue();
	sampler.setTimestretchRatio(ratio);
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
 