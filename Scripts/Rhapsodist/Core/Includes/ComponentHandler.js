/*
    Copyright 2024, 2025, 2026 David Healey

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
@description: Sets component properties when the patch or articulation changes.
*/

namespace ComponentHandler
{
	const allComponents = getAllComponentsIndexed();

	reg currentPatch;

	//! Functions
	inline function getAllComponentsIndexed()
	{
		local result = {};
	
		for (c in Content.getAllComponents(""))
			result[c.getId()] = c;

		return result;
	}

	inline function setComponentProperties(data: Array)
	{
		for (x in data)
		{
			if (!isDefined(x.properties))
				continue;

			local c = allComponents[x.id];

			if (!isDefined(c))
			{
				Console.print("Component not found: " + x.id);
				continue;
			}

			for (p in x.properties)
			{
				if (p == "value")
				{
					c.setValue(x.properties[p]);
					c.changed();
					continue;
				}

				c.set(p, x.properties[p]);
			}
		}
	}

	//! Broadcasters
	const bcPatchChanged = Engine.createBroadcaster({id: "componentHandlerPatchChanged", args: ["component", "value"]});
	bcPatchChanged.setEnableQueue(true);
	bcPatchChanged.attachToComponentValue("knbPatch", "");
	
	bcPatchChanged.addListener(0, "Patch change listener", function(component, value)
	{
		if (isDefined(Manifest.components))
			setComponentProperties(Manifest.components);

		currentPatch = Manifest.patches[value];

		if (isDefined(currentPatch.components))
			setComponentProperties(currentPatch.components);
	});

	const bcArticulationChanged = Engine.createBroadcaster({id: "componentHandlerArticulationChanged", args: ["component", "value"]});
	bcArticulationChanged.setEnableQueue(true);
	bcArticulationChanged.attachToComponentValue("knbArticulation", "");
	
	bcArticulationChanged.addListener(0, "Articulation change listener", function(component, value)
	{
		if (isDefined(currentPatch.components))
			setComponentProperties(currentPatch.components);

		var articulation = ArticulationDataManager.getArticulation(value);

		if (isDefined(articulation) && isDefined(articulation.components))
			setComponentProperties(articulation.components);
	});
}
