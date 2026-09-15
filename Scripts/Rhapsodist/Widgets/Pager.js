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
@description: Creates a tabbed interface for the given parent panel. Child panels will be treated as pages.
			  Buttons within buttonContainer and radio group are used to switch page.
@entry: create()
@usage: Add your UI components then call Create(). This script doesn't add the components for you.
@note: See the SwitcherPanel for a more versatile alternative
*/

namespace Pager
{
	inline function: ScriptObject create(panelId: string, buttonContainerId: string, radioGroup: number, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		panel.data.broadcasters = {};
		
		local buttonContainer = Content.getComponent(buttonContainerId);
		local buttonIds = [];
		local pageIds = [];

		for (x in buttonContainer.getChildComponents())
		{
			if (x.get("parentComponent") != buttonContainerId)
				continue;

			if (x.get("type") == "ScriptButton")
				buttonIds.push(x.getId());
		}

		for (x in panel.getChildComponents())
		{
			if (x.getId() == buttonContainerId)
				continue;

			if (x.get("parentComponent") == buttonContainerId)
				continue;

			if (x.get("parentComponent") == panelId)
				pageIds.push(x.getId());
		}			

		//! Broadcaster
		panel.data.broadcasters.buttonWatcher = Engine.createBroadcaster({id: panelId.replace("pnl") + "PagerButtonWatcher", args: ["buttonIndex"]});
		panel.data.broadcasters.buttonWatcher.attachToRadioGroup(radioGroup, "");
		
		panel.data.broadcasters.buttonWatcher.addComponentValueListener(buttonIds, "Set button values", function(index, buttonIndex)
		{
			return index == buttonIndex;
		});

		panel.data.broadcasters.buttonWatcher.addComponentPropertyListener(pageIds, "visible", "Show Panels", function(index, buttonIndex)
		{
			return index == buttonIndex;
		});
		
		panel.data.buttonContainer = buttonContainer;

		return panel;	
	}
}