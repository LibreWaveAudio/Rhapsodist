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
@description: Controls which sampler group is active using the knob.
@usage: Place in a sampler's MIDI Processor chain.
@note: Supports up to 100 groups.
*/

const sampler = Synth.getChildSynth(Synth.getIdList("Sampler")[0]);
sampler.asSampler().enableRoundRobin(false);

// knbGroup
const knbGroup = Content.addKnob("Group", 0, 0);
knbGroup.setRange(1, 100, 1);
knbGroup.setControlCallback(onknbGroupControl);

inline function onknbGroupControl(component, value)
{
    if (value <= sampler.getAttribute(sampler.RRGroupAmount))
        sampler.asSampler().setActiveGroup(value);
}function onNoteOn()
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
 