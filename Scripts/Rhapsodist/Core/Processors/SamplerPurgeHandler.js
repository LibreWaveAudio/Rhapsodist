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

const samplers = getSamplers();

//! btnLazyLoad
const btnLazyLoad = Content.addButton("LazyLoad", 10, 10);
btnLazyLoad.set("text", "Lazy Load");
btnLazyLoad.setControlCallback(onbtnLazyLoadControl);

inline function onbtnLazyLoadControl(component, value)
{
	for (i = 0; i < samplers.length; i++)
		updateSamplerPurgeState(i, slpState.getSliderValueAt(i));
}

//! slpState
const slpState = Content.addSliderPack("PurgeState", 160, 10);
slpState.set("width", 414);
slpState.set("height", 78);
slpState.set("sliderAmount", 50);
slpState.set("min", 0);
slpState.set("max", 1);
slpState.set("stepSize", 1);
slpState.setControlCallback(onslpStateControl);

const sliderPackData = Engine.createAndRegisterSliderPackData(0);
slpState.referToData(sliderPackData);

inline function onslpStateControl(component, value)
{
	if (typeof value != "number")
		return;

	updateSamplerPurgeState(value, component.getSliderValueAt(value));
}

//! Functions
inline function updateSamplerPurgeState(samplerIndex, state)
{
	local s = samplers[samplerIndex];

	if (!isDefined(s))
		return;
 	
 	local value = 1 - state + state * btnLazyLoad.getValue() * 2;
	s.setAttribute(s.Purged, value);
}

inline function getSamplers()
{
	local result = [];

	for (id in Synth.getIdList("Sampler"))
		result.push(Synth.getChildSynth(id));
	
	return result;
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
 