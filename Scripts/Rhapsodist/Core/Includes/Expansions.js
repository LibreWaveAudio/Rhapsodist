/*
    Copyright 2026 David Healey

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

namespace Expansions
{
	const eh = Engine.createExpansionHandler();

	//! btnRhapsody
	const btnRhapsody = Content.getComponent("btnRhapsody");
	btnRhapsody.setLocalLookAndFeel(CoreLookAndFeel.iconButton);
	btnRhapsody.setControlCallback(onbtnRhapsodyControl);		

	inline function onbtnRhapsodyControl(component, value)
	{
		if (value)
			return;

		Engine.showYesNoWindow("Exit", "Do you want to unload " + getCurrentExpansionName() + "?", function(response)
		{
			if (response && !Engine.isHISE())
				eh.setCurrentExpansion("");
		});
	}

	//! Functions	
	inline function getCurrentExpansionName()
	{
		local e = eh.getCurrentExpansion();
		
		if (!isDefined(e))
			return Engine.getName();

		return e.getProperties().Name;
	}	
	
	inline function getCurrentExpansion()
	{
		return eh.getCurrentExpansion();
	}

	inline function: ScriptObject getAppDataFolder()
	{
		local e = eh.getCurrentExpansion();
		
		if (isDefined(e))
			return e.getRootFolder();
		
		return FileSystem.getFolder(FileSystem.AppData);
	}

	inline function: Array getAllExpansionIcons()
	{
		local result = [];

		for (e in eh.getExpansionList())
		{
			local name = e.getProperties().Name;
			result.push([name, e.getWildcardReference("Icon.png")]);
		}
		
		return result;
	}
	
	inline function: number getNumberOfExpansions()
	{
		return eh.getExpansionList().length;
	}

	inline function getCurrentUserPresetsFolder()
	{
		if (Engine.isHISE())
			return FileSystem.getFolder(FileSystem.UserPresets);

		local e = eh.getCurrentExpansion();

		if (!isDefined(e))
			return undefined;

		local rootDir = e.getRootFolder();
	
		if (!isDefined(rootDir) || !rootDir.isDirectory())
			return undefined;

		return rootDir.getChildFile("UserPresets");
	}
}
