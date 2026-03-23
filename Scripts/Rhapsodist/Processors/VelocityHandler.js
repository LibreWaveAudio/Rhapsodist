/*
    Copyright 2023, 2024 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this file. If not, see <http://www.gnu.org/licenses/>.
*/

Content.setHeight(200);

const NUM_TABLES = 50;
const data = [];

//! tblVelocity
const tblVelocity = createVelocityTables();

//! knbArticulation
const knbArticulation = Content.addKnob("Articulation", 280, 10);
knbArticulation.setRange(0, NUM_TABLES - 1, 1);
knbArticulation.setControlCallback(onknbArticulationControl);

inline function onknbArticulationControl(component, value)
{
	for (i = 0; i < tblVelocity.length; i++)
		tblVelocity[i].showControl(i == value);
}

//! Functions
inline function createVelocityTables()
{
	local result = [];
	
	for (i = 0; i < NUM_TABLES; i++)
	{
		result.push(Content.addTable("Velocity" + i, 10, 10));
		result[i].set("width", 250);
		result[i].set("height", 180);

		data[i] = Engine.createAndRegisterTableData(i);
		result[i].referToData(data[i]);
	}

	return result;
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
	local input = Message.getVelocity() / 127;
	local output = 1 + Math.floor(126 * tblVelocity[knbArticulation.getValue()].getTableValue(input));

	Message.setVelocity(output);
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
 