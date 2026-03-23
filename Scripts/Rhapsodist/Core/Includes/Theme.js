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

namespace Theme
{
	reg currentTheme = "dark";
	reg applyToBody = false;
	const systemStats = Engine.getSystemStats();
	const isDarkMode = systemStats.isDarkMode;

	const data = {
		dark: {
			colours: {
				neutral: 0xff2c2f3d,
				primary: 0xff2c2f3d,
				secondary: 0xffffbc2c,
				accent: 0xffffbc2c,
				text: 0xffcccccc,
				error: 0xff985959,
				success: 0xff599861,
				info: 0xff86cbf5,
				warning: 0xff599861
			},
			iconFont: "icons",
			saturation: 1.0
		},
		light: {
			colours: {
				neutral: 0xffcccccc,			
				primary: 0xffffbc2c,
				secondary: 0xffffbc2c,
				accent: 0xffffbc2c,
				text: Colours.black,
				error: 0xff985959,
				success: 0xff599861,
				info: 0xff86cbf5,
				warning: 0xff599861
			},
			iconFont: "roundedIcons"
		}
	}

	inline function getThemeData(themeName: string)
	{
		return data[themeName];
	}

	inline function setThemeData(themeName: string, themeData: JSON)
	{
		if (!isDefined(data[themeName]))
			return Console.print("setThemeData: Invalid Theme Name!");

		data[themeName] = themeData;
	}
	
	inline function setThemeProperty(themeName: string, property: string, value: JSON)
	{
		data[themeName][property] = value;
	}

	inline function: string getTheme()
	{
		return currentTheme;
	}

	inline function setTheme(themeName: string)
	{
		currentTheme = themeName;
		setAllComponentColours();
	}
	
	inline function: Colour getColour(colourId: string)
	{
		return data[currentTheme].colours[colourId];
	}
	
	inline function: Colour get(propertyId: string)
	{
		return data[currentTheme][propertyId];
	}
	
	inline function setColour(colourId: string, colour: Colour)
	{
		for (x in data)
			x[currentTheme].colours[colourId] = colour;
	}
	
	inline function setComponentColours(component: ScriptObject, themeName: string)
	{
		local theme = data[themeName].colours;
		local properties = component.getAllProperties();
		local colourProperties = ["bgColour", "itemColour", "itemColour2", "textColour"];

		for (p in colourProperties)
		{
			if (!properties.contains(p))
				continue;

			local colour;
			
			switch (p)
			{
				case "bgColour": colour = theme.primary; break;
				case "itemColour": colour = theme.secondary; break;				
				case "itemColour2":	colour = theme.accent; break;				
				case "textColour": colour = theme.text; break;
			}

			if (isDefined(theme[component.getId()][p]))
				colour = theme[component.getId()][p];

			if (isDefined(colour))
				component.set(p, colour);
		}
	}
	
	inline function clearColours(component: ScriptObject)
	{
		local properties = component.getAllProperties();
		local colourProperties = ["bgColour", "itemColour", "itemColour2", "itemColour3", "textColour"];

		for (p in colourProperties)
		{
			if (properties.contains(p))
				component.set(p, 0x0);
		}
	}

	inline function: Array getBodyComponentIds()
	{
		local result = [];
		
		for (x in Content.getAllComponents(""))
		{
			if (x.getId() == "pnlBody" || x.get("parentComponent") == "pnlBody")
				result.push(x.getId());
				
			if (result.contains(x.get("parentComponent")))
				result.push(x.getId());
		}
		
		return result;
	}

	inline function setApplyToBody(value: number)
	{
		applyToBody = value;
		setAllComponentColours();
	}

	inline function setAllComponentColours()
	{
		local bodyComponentIds = getBodyComponentIds();

		for (x in Content.getAllComponents(""))
		{
			local type = x.get("type");

			if (x.getId() == "pnlMain" || x.getId() == "pnlBody")
				continue;

			if (applyToBody == false && bodyComponentIds.contains(x.getId()) && !isDefined(data[currentTheme][x.getId()]))
				continue;

			if (type == "ScriptedViewport")
				continue;

			if (type == "ScriptFloatingTile")
			{
				if (!["PresetBrowser", "CustomSettings"].contains(x.get("ContentType")))
					continue;
			}

			//setComponentColours(x, currentTheme);

			if (type == "ScriptPanel")
				x.repaint();
			else
				x.sendRepaintMessage();
		}
	}

	inline function: Colour getShade(colourId: string, shadeIndex: number)
	{
		local baseColour = data[currentTheme].colours[colourId];
		local saturation = isDefined(data[currentTheme].saturation) ? data[currentTheme].saturation : 1.0;		

		local index;
		
		if (currentTheme == "dark")
			index = 0.5 * shadeIndex;
		else
			index = 0.5 + (shadeIndex * 0.5);		

		local c = Colours.toHsl(baseColour);
		c[0] = getShiftedHue(c[0], index, 4);
		c[1] = getShiftedSaturation(index, c[1], 0.5);
		c[2] = Math.pow(index, 1.5);

		return Colours.withMultipliedSaturation(Colours.fromHsl(c), saturation);
	}
	
	inline function: Colour getTextColour(bgColour: Colour)
	{
		local textColour = Colours.toHsl((currentTheme == "dark") ? data.dark.colours.text : data.light.colours.text);
		local bgHsl = Colours.toHsl(bgColour);
		
		if (bgHsl[2] > 0.5)
			textColour[2] = 0.1;
		else
			textColour[2] = 0.9;

		textColour[1] = Math.min(textColour[1], 0.6);	
		return Colours.fromHsl(textColour);		
	}
		
	inline function: number getShiftedHue(baseHue: number, shadeIndex: number, maxShift: number)
	{
		return baseHue + maxShift * (shadeIndex / 10) / 360;
	}
	
	inline function: number getShiftedSaturation(shadeIndex: number, maxSaturation: number, steepness: number)
	{
	    local x = shadeIndex / 10;	    
	    local a = maxSaturation * steepness;
	    local b = maxSaturation;
	    local saturation = -4 * a * Math.pow((x - 0.5), 2) + b;
	    
	    return Math.max(0.0, Math.min(1.0, saturation));
	}

	//! Broadcasters
	const bcThemeChanged = Engine.createBroadcaster({"id": "themeChangeWatcher", "args": ["component", "value"]});

	bcThemeChanged.attachToComponentValue("cmbTheme", "Theme name");
	bcThemeChanged.addListener(0, "Theme Setting Changed", function(component, value)
	{
		var themeName = component.getItemText().toLowerCase();
		
		if (themeName == "system")
			themeName = isDarkMode ? "dark" : "light";

		if (!isDefined(data[themeName]))
			return;
			
		setTheme(themeName);
	});
	
	//! Calls
	setAllComponentColours();
}