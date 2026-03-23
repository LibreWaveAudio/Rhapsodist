/*
    Copyright 2024, 2025 David Healey

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

namespace SwitcherPanel
{
	inline function: ScriptObject create(panelId: string, switcherId: string, componentType: string, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		local children = [];
		
		for (x in panel.getChildComponents())
		{
			if (x.getId() == switcherId)
				continue;

			if (x.get("parentComponent") != panelId)
				continue;
				
			if (x.get("text") == "")
				continue;

			if (componentType == "all" || componentType == x.get("type"))
				children.push(x.getId());
		}

		// Broadcaster definition
		panel.data.bc = Engine.createBroadcaster({id: panelId.replace("pnl") + "SwitcherPanel", args: ["component", "value"]});
		panel.data.bc.attachToComponentValue(switcherId, "Value");

		panel.data.bc.addComponentPropertyListener(children, "visible", "Change tab visibility", function(index, component, value)
		{
			return value == index || index == -1;
		});

		return panel;
	}
}
