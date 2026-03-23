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

Content.setWidth(750);
Content.setHeight(150);

const NUM_CHANNELS = 10;

const samplerIds = Synth.getIdList("Sampler");
const samplers = [];

for (id in samplerIds)
    samplers.push(Synth.getSampler(id));

//! btnInvert
const btnInvert = Content.addButton("Invert", 10, 10);

//! btnPurge
const btnPurge = getPurgeButtonReferences();

inline function onbtnPurgeControl(component, value)
{
    local index = btnPurge.indexOf(component);
	purgeLoadChannel(index, value, btnInvert.getValue());
}

//! Functions
inline function purgeLoadChannel(index, value, invert)
{
	for (s in samplers)
	{
		if (s.getNumMicPositions() <= 1 || index >= s.getNumMicPositions())
			continue;

		local micName = s.getMicPositionName(index);
		s.purgeMicPosition(micName, invert - value);
	}
}

inline function getPurgeButtonReferences()
{
	local result = [];
	
	for (i = 0; i < NUM_CHANNELS; i++)
	{
		local x = 10 + (i % 5) * 150;
		local y = 60 + Math.floor(i / 5) * 50;

	    result[i] = Content.addButton("Purge" + i, x, y);
	    result[i].setControlCallback(onbtnPurgeControl);
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
 