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

namespace CoreLookAndFeel
{
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/Inter-Regular.ttf", "regular");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/Inter-Medium.ttf", "medium");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/Inter-SemiBold.ttf", "semibold");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/Inter-Bold.ttf", "bold");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor.ttf", "phosphor");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor-Bold.ttf", "phosphorBold");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor-Fill.ttf", "phosphorFill");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/fontaudio.ttf", "fontaudio");
		
    // empty
	const empty = Content.createLocalLookAndFeel();	
	
	empty.registerFunction("drawRotarySlider", function(g, obj)	{});	

	const laf = Engine.createGlobalScriptLookAndFeel();

	//! Alert window	
	laf.registerFunction("drawAlertWindow", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAlertWindow))
			return LookAndFeel.drawAlertWindow();

		drawAlertWindow();
	});

	inline function drawAlertWindow()
	{
		local a = obj.area.expanded(20);
		local bgColour = Style.alertWindow.bgColour;
		local itemColour = Style.alertWindow.itemColour;
		local itemColour2 = Style.alertWindow.itemColour2;
		local itemColour3 = Style.alertWindow.itemColour3;
		local textColour = Style.alertWindow.textColour;
		local hasLabel = isDefined(obj.labelArea) && obj.labelArea[0] != 0;
		local radius = Style.alertWindow.borderRadius;
		local borderSize = Style.alertWindow.borderSize;

		g.drawDropShadow(a, Colours.withAlpha(Colours.black, 0.5), 20);

		g.setColour(bgColour);
		g.fillRoundedRectangle(a, radius);

		g.setColour(itemColour);
		g.fillRoundedRectangle([a[0], a[1], a[2], 45], {CornerSize: radius, Rounded:[1, 1, 0, 0]});

		g.setColour(itemColour2);

		if (borderSize > 0)
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);

		g.setFont(Style.alertWindow.titleFont, Style.alertWindow.titleFontSize);
		g.setColour(textColour);
		g.drawAlignedText(obj.title, [a[0], a[1] + 10, a[2], 25], "centred");

		if (isDefined(obj.text))
		{
			g.setColour(textColour);
			g.setFont(Style.alertWindow.font, Style.alertWindow.fontSize);

			if (hasLabel)
				g.drawAlignedText(obj.text, [a[0], a[1], a[2], a[3] - 85], "centred");
			else
				g.drawAlignedText(obj.text, [a[0], a[1], a[2], a[3] - 30], "centred");				
		}

		g.setColour(Colours.withMultipliedBrightness(itemColour3, 0.6));

		if (hasLabel)
			g.fillRoundedRectangle(obj.labelArea, 5);
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	}

	laf.registerFunction("getAlertWindowMarkdownStyleData", function(obj)
	{
		if (isDefined(LookAndFeel.getAlertWindowMarkdownStyleData))
			return LookAndFeel.getAlertWindowMarkdownStyleData();

		return getAlertWindowMarkdownStyleData();
	});

	inline function getAlertWindowMarkdownStyleData()
	{
		obj.headlineFont = Style.alertWindow.titleFont;
		obj.font = Style.alertWindow.font;
		obj.fontSize = Style.alertWindow.fontSize;
		obj.textColour = Style.alertWindow.textColour;
		return obj;
	}
	
	laf.registerFunction("drawAlertWindowIcon", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAlertWindowIcon))
			return LookAndFeel.drawAlertWindowIcon();

		drawAlertWindowIcon();
	});
	
	inline function drawAlertWindowIcon()
	{
		local a = obj.area;
		local icons = {"Info": "\ue2ce", "Warning": "\ue4e0", "Question": "\ue3e8", "Error": "\ue7fc"};
		local textColour = Style.alertWindow.textColour;

		g.setFont("phosphor", 42);
		g.setColour(Colours.withAlpha(textColour, 0.8));
		g.drawAlignedText(icons[obj.type], a, "centred");		
	}
	
	laf.registerFunction("drawDialogButton", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawDialogButton))
			return LookAndFeel.drawDialogButton();

		drawDialogButton();
	});

	//! Dialog button
	inline function drawDialogButton()
	{
		local a = obj.area;
		local text = obj.text;
		local radius = Style.alertWindow.buttonRadius;
		local bgColour = Style.alertWindow.itemColour;
		local textColour = Style.alertWindow.textColour;

		if (["Update Available", "Exit", "Open Website", "Overwrite Preset"].contains(obj.parentName))
			text = obj.text == "OK" ? "Yes" : "No";

		g.setColour(Colours.withMultipliedBrightness(bgColour, obj.over ? 2.0 - 0.5 * obj.down : 1.0));
		g.fillRoundedRectangle(a, radius);

		g.setColour(Colours.withAlpha(Colours.black, 0.7));
		g.drawRoundedRectangle([a[0] + 0.25, a[1] + 0.25, a[2] - 0.5, a[3] - 0.5], radius, 1);

		g.setColour(Colours.withMultipliedBrightness(textColour, 1.0 + obj.over - 0.2 * obj.down));
		g.setFont(Style.alertWindow.buttonFont, Style.alertWindow.buttonFontSize);
		g.drawAlignedText(text, a, "centred");
	}
	
	//! Peak Meter
	const peakMeter = Content.createLocalLookAndFeel();
	
	peakMeter.registerFunction("drawMatrixPeakMeter", function(g, obj)
	{
		drawMatrixPeakMeter({});
	});
		
	inline function drawMatrixPeakMeter(options: JSON)
	{
		if (isDefined(LookAndFeel.drawMatrixPeakMeter))
			return LookAndFeel.drawMatrixPeakMeter(options);

		local a = obj.area;
		local radius = isDefined(options.radius) ? options.radius : 0;
		local peaks = [];
		local maxPeaks = [];

		g.setColour(obj.itemColour);
		g.fillRect([a[0], a[3] / 2 - 1, a[2], 2]);

		for (i = 0; i < obj.peaks.length; i++)
		{
			peaks[i % 2 == 1] += obj.peaks[i];
			maxPeaks[i % 2 == 1] += obj.maxPeaks[i];
		}

		for (i = 0; i < peaks.length; i++)
		{
			peaks[i] /= (obj.peaks.length / 2);
			maxPeaks[i] /= (obj.maxPeaks.length / 2);

			g.setColour(obj.bgColour);

			if (obj.isVertical)
				g.fillRoundedRectangle([a[2] / 2 * i + (0.5 * i), a[1], (a[2] - 1) / 2, a[3]], radius);
			else
				g.fillRoundedRectangle([a[0], a[3] / 2 * i + (0.5 * i), a[2], (a[3] - 1) / 2], radius);

			g.setColour(obj.textColour);

			if (obj.isVertical)
				g.fillRoundedRectangle([a[2] / 2 * i + (0.5 * i), a[3] - a[3] * peaks[i], (a[2] - 1) / 2, a[3] * peaks[i]], radius);
			else
				g.fillRoundedRectangle([a[0], a[3] / 2 * i + (0.5 * i), a[2] * peaks[i], (a[3] - 1) / 2], radius);				

			g.setColour(Colours.withMultipliedBrightness(obj.textColour, 1.2));

			if (maxPeaks[i] == 0)
				continue;

			if (obj.isVertical)
				g.drawHorizontalLine(a[3] - a[3] * maxPeaks[i], a[2] / 2 * i + (0.5 * i), (a[2] / 2 * i + (0.5 * i)) + (a[2] - 1) / 2);
			else
				g.drawVerticalLine(a[2] * maxPeaks[i],  a[3] / 2 * i + (0.5 * i), ( a[3] / 2 * i + (0.5 * i)) + (a[3] - 1) / 2);
		}
		
		if (!isDefined(Style.useNoise) || !Style.useNoise)
			return;

		for (i = 0; i < peaks.length; i++)
		{
			if (obj.isVertical)
				g.addNoise({alpha: 0.015, scaleFactor: 2.0, area: [a[2] / 2 * i + (0.5 * i), a[1], (a[2] - 1) / 2, a[3]], monochromatic: true});
			else
				g.addNoise({alpha: 0.015, scaleFactor: 2.0, area: [a[0], a[3] / 2 * i + (0.5 * i), a[2], (a[3] - 1) / 2], monochromatic: true});
		}		
	}

	//! Performance Label	
	laf.registerFunction("drawPerformanceLabel", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPerformanceLabel))
			return LookAndFeel.drawPerformanceLabel();

		var a = obj.area;
		var cpu = "CPU: " + Engine.doubleToString(obj.cpu, 1) + "%";
		var ram = "RAM: " + FileSystem.descriptionOfSizeInBytes(obj.ram).toUpperCase();
		var voices = "VOICES: " + obj.voices;

		g.setColour(obj.textColour);
		g.setFont(obj.font, obj.fontSize);

		g.drawAlignedText(cpu + " | " + ram + " | " + voices, a, "left");
	});
	
	//! Table
	const table = Content.createLocalLookAndFeel();
	
	table.registerFunction("drawTableBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawTableBackground))
			return LookAndFeel.drawTableBackground();

		drawTableBackground({});
	});
	
	inline function drawTableBackground(options: JSON)
	{
		local a = obj.area;
		local c = isDefined(options.textColour) ? options.textColour : obj.textColour;		
	
		g.setColour(Colours.withAlpha(c, 0.2));
		g.drawRoundedRectangle(a, 1, 1);
	
		g.setColour(Colours.withAlpha(c, 0.1));
		g.drawVerticalLine(a[2] / 2, a[1], a[3]);
		g.drawHorizontalLine(a[3] / 2, a[0], a[2]);
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	}
	
	table.registerFunction("drawTablePath", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawTablePath))
			return LookAndFeel.drawTablePath(options);

		drawTablePath({});
	});
	
	inline function drawTablePath(options: JSON)
	{
		local a = obj.area;
		local bgColour = isDefined(options.bgColour) ? options.bgColour : obj.bgColour;
		local itemColour2 = isDefined(options.itemColour2) ? options.itemColour2 : obj.itemColour2;
		local c = Colours.withMultipliedAlpha(bgColour, obj.enabled ? 1.0 : 0.5);
	
		g.setGradientFill([c, a[2] / 2, a[1], Colours.withMultipliedAlpha(c, 0.2), a[2] / 2, a[3]]);
		g.fillPath(obj.path, a);
	
		g.setColour(itemColour2);
		g.drawPath(obj.path, [a[0] - 2, a[1], a[2] + 4, a[3] + 2], 2.0);
	}
	
	table.registerFunction("drawTablePoint", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawTablePoint))
			return LookAndFeel.drawTablePoint(options);

		drawTablePoint({});
	});
	
	inline function drawTablePoint(options: JSON)
	{
		local a = obj.tablePoint;
		local c = isDefined(options.itemColour) ? options.itemColour : obj.itemColour;
	
		g.setColour(Colours.withMultipliedAlpha(c, obj.hover ? 0.7 : 0.4));
		g.fillEllipse(a);
	
		g.setColour(Colours.withMultipliedAlpha(c, obj.hover ? 1.0 : 0.8));
		g.fillEllipse(a.reduced(3));
	}
	
	table.registerFunction("drawTableRuler", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawTableRuler))
			return LookAndFeel.drawTableRuler(options);

		drawTableRuler({});
	});
	
	inline function drawTableRuler(options: JSON)
	{
		local x = obj.position * obj.area[2];
		local c = isDefined(options.itemColour2) ? options.itemColour2 : obj.itemColour2;

		g.setColour(Colours.withAlpha(c, 0.1));	       
		g.drawLine(x, x, 0, obj.area[3], 10.0);

		g.setColour(Colours.withAlpha(Colours.white, 0.8));
		g.drawLine(x, x, 0, obj.area[3], 0.6);
	}

	//! Combo Box
	const comboBox = Content.createLocalLookAndFeel();
	
	comboBox.registerFunction("drawComboBox", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawComboBox))
			return LookAndFeel.drawComboBox();

		drawComboBox({});
	});

	comboBox.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		drawPopupMenuBackground({});
	});
	
	laf.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		drawPopupMenuBackground({});
	});

	comboBox.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		drawPopupMenuItem({});
	});

	laf.registerFunction("drawPopupMenuItem", function(g, obj)
	{	
		drawPopupMenuItem({});
	});

	comboBox.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return getIdealPopupMenuItemSize();
	});
	
	laf.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return getIdealPopupMenuItemSize();
	});
	
	inline function drawComboBox(properties: JSON)
	{
		local a = obj.area;
		local bgColour = isDefined(properties.bgColour) ? properties.bgColour : obj.bgColour;
		local itemColour = isDefined(properties.itemColour) ? properties.itemColour : obj.itemColour1;
		local textColour = isDefined(properties.textColour) ? properties.textColour : obj.textColour;
		local font = isDefined(properties.font) ? properties.font : Style.inputBox.font;
		local fontSize = isDefined(properties.fontSize) ? properties.fontSize : Style.inputBox.fontSize;
		local radius = isDefined(properties.radius) ? properties.radius : Style.inputBox.borderRadius;
		local borderSize = isDefined(properties.borderSize) ? properties.borderSize : Style.inputBox.borderSize;

		g.setColour(Colours.withAlpha(bgColour, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle(a, radius);
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});

		if (borderSize > 0)
		{
			g.setColour(itemColour);
			g.drawRoundedRectangle(a, radius, borderSize);
		}

		local c = Colours.withMultipliedBrightness(textColour, obj.hover ? 1.0 : 0.9);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));	

		g.setFont(font, fontSize);

		if (a[2] <= 55)
		{
			g.drawFittedText(obj.text, [a[0], a[1], a[2], a[3]], "centred", 1, 1);
			return;
		}

		g.drawFittedText(obj.text, [a[0] + 10, a[1], a[2] - a[2] / 4, a[3]], "left", 1, 1);			

		c = Colours.withMultipliedBrightness(textColour, obj.hover ? 1.0 : 0.8);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));		
		
		g.setFont("phosphor", 16);
		g.drawAlignedText("\ue136", [a[0], a[1], a[2] - 4, a[3]], "right");
	}

	//! Popup Menu
	inline function drawPopupMenuBackground(properties: JSON)
	{
		if (isDefined(LookAndFeel.drawPopupMenuBackground))
			return LookAndFeel.drawPopupMenuBackground(properties);

		local a = obj.area;
		local bgColour = isDefined(properties.bgColour) ? properties.bgColour : Style.popupMenu.bgColour;
		local borderColour = isDefined(properties.itemColour) ? properties.itemColour : Style.popupMenu.itemColour;
		local borderSize = Style.popupMenu.borderSize;
		local borderRadius = Style.popupMenu.borderRadius;

		g.setColour(bgColour);
		g.fillRoundedRectangle(a, borderRadius);

		if (Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});

		if (borderSize == 0)
			return;

		g.setColour(borderColour);
		g.drawRoundedRectangle(a.reduced(borderRadius / 4), borderRadius, borderSize);
	}

	inline function drawPopupMenuItem(properties: JSON)
	{
		if (isDefined(LookAndFeel.drawPopupMenuItem))
			return LookAndFeel.drawPopupMenuItem(properties);

		local a = obj.area;
		local hasIcon = isDefined(properties.icon);
		local itemColour2 = isDefined(properties.itemColour2) ? properties.itemColour2 : Style.popupMenu.itemColour2;
		local textColour = isDefined(properties.textColour) ? properties.textColour : Style.popupMenu.textColour;
		local textOffsetY = isDefined(Style.popupMenu.textOffsetY) ? Style.popupMenu.textOffsetY : 0;
		local font = isDefined(properties.font) ? properties.font : Style.popupMenu.font;
		local fontSize = isDefined(properties.fontSize) ? properties.fontSize : Style.popupMenu.fontSize;
		local iconFont = isDefined(properties.iconFont) ? properties.iconFont : Style.popupMenu.iconFont;
		local iconFontSize = isDefined(properties.iconFontSize) ? properties.iconFontSize : Style.popupMenu.iconFontSize;
		local subMenuIcon = isDefined(Style.popupMenu.subMenuIcon) ? Style.popupMenu.subMenuIcon : "e13a";
		local subMenuIconFont = isDefined(Style.popupMenu.subMenuIconFont) ? Style.popupMenu.subMenuIconFont : "phosphor";
		local subMenuIconFontSize = isDefined(Style.popupMenu.subMenuIconFontSize) ? Style.popupMenu.subMenuIconFontSize : 16;
		local radius = Style.popupMenu.itemRadius;

		if (obj.isSeparator)
		{
			g.setColour(Colours.withAlpha(textColour, 0.3));
			g.drawHorizontalLine(a[3] / 2, a[0] + 5, a[2] - 10);
			return;
		}

		if (obj.isHighlighted || obj.isTicked)
		{
			g.setColour(Colours.withMultipliedAlpha(itemColour2, obj.isHighlighted && !obj.isTicked ? 0.6 : 1.0));
			g.fillRoundedRectangle(a.reduced(5, 2), radius);
		}
			
		if (!isDefined(font))
			font = "medium";
		
		if (!isDefined(fontSize))
			fontSize = 16;

		g.setFont(font, fontSize);
		g.setColour(Colours.withMultipliedAlpha(textColour, obj.isHighlighted ? 1.0 : 0.9));
		g.drawFittedText(obj.text, a.withTrimmedRight(10 + (30 * hasIcon)).translated(10 + (30 * hasIcon), textOffsetY), "left", 1.0, 1.0);

		if (!isDefined(iconFont))
			iconFont = "phosphorFill";
			
		if (!isDefined(iconFontSize))
			iconFontSize = 22;

		if (hasIcon)
		{
			g.setFont(iconFont, iconFontSize);
			g.drawAlignedText(icon, a.translated(10, 0), "left");
		}			

		if (obj.hasSubMenu)
		{
			g.setFont(subMenuIconFont, subMenuIconFontSize);
			g.drawAlignedText(String.fromCharCode(subMenuIcon), a.translated(-5, 0), "right");
		}			

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	}

	inline function getIdealPopupMenuItemSize()
	{
		var width;

		if (isDefined(LookAndFeel.getIdealPopupMenuItemWidth))
			width = LookAndFeel.getIdealPopupMenuItemWidth();
		else
			width = getIdealPopupMenuItemWidth();

		if (obj.isSeparator)
			return [width, 10];

		return [width, 40];
	}

	inline function getIdealPopupMenuItemWidth()
	{
		return Engine.getStringWidth(obj.text, Style.popupMenu.font, Style.popupMenu.fontSize, 0.0) + 35;
	}
	
	//! Viewport
	const viewport = Content.createLocalLookAndFeel();
		
	viewport.registerFunction("drawScrollbar", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawScrollbar))
			return LookAndFeel.drawScrollbar({});

		drawScrollbar({});
	});
		
	//! Scrollbar
	inline function drawScrollbar(properties: JSON)
	{
		local a = obj.area;
		local ha = obj.handle;
		local w = a[2] > 10 ? 10 : a[2];
		local radius = isDefined(properties.radius) ? properties.radius : 0;
		local bgColour = properties.bgColour;
		local itemColour = properties.itemColour;

		g.setColour(bgColour);
		g.fillRoundedRectangle([a[2] - w + 2, a[1], w - 4, a[3]], radius + 1);

		g.setColour(Colours.withAlpha(itemColour, obj.over || obj.down ? 1.0 - 0.3 * obj.down : 0.5));
		g.fillRoundedRectangle([a[2] - w + 3, ha[1] + 1, w - 6, ha[3] - 2], radius);
	}
	
	//! Generic Knob
	inline function drawGenericKnob()
	{
		var a = Rectangle(obj.area[0], obj.area[1], obj.area[2], obj.area[2]).reduced(5);
		var offset = 2.4;
		var endOffset = -offset + 2 * offset * obj.valueNormalized;

		g.setColour(obj.itemColour2);
		g.drawEllipse(a.reduced(3), 3);

		g.setFont("Oxygen", a[2] < 100 ? 14 : 22);
		g.setColour(obj.textColour);
		if (obj.hover || obj.clicked)
			g.drawAlignedText(obj.valueAsText, obj.area.translated(0, -5), "centredBottom");
		else
			g.drawAlignedText(obj.text, obj.area.translated(0, -5), "centredBottom");

		g.setColour(obj.itemColour2);
		g.rotate(endOffset, [obj.area[2] / 2, a[1] + a[3] / 2]);
		g.fillRoundedRectangle([a[0] + a[2] / 2 - 3 / 2, a[1] + 3, 3, 10], 2);
		g.rotate(-endOffset, [obj.area[2] / 2, a[1] + a[3] / 2]);

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	}
	
	// toggleSwitch
	const toggleSwitch = Content.createLocalLookAndFeel();
	
	toggleSwitch.registerFunction("drawToggleButton", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawToggleSwitch))
			return LookAndFeel.drawToggleSwitch();
	
		drawToggleSwitch();
	});

	inline function drawToggleSwitch()
	{
		local a = obj.area;
		local radius = 8;
	
		g.setColour(Colours.withMultipliedAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));		
		g.drawRoundedRectangle([a[0] + radius / 4, a[1] + radius / 4, a[2] - radius / 2, a[3] - radius / 2], radius, 1);
		
		local c = Colours.withMultipliedBrightness(obj.value ? obj.itemColour1 : obj.itemColour2, obj.over ? 1.0 - 0.1 * obj.down : 0.8);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));
		
		local x = 2 + (obj.value ? a[2] - a[3] / 1.5 : 2) - 6 * obj.value;
		g.fillEllipse([x, a[3] / 2 - a[3] / 1.5 / 2, a[3] / 1.5, a[3] / 1.5]);
	}
	
	//! iconButton
	const iconButton = Content.createLocalLookAndFeel()
	
	iconButton.registerFunction("drawToggleButton", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawIconButton))
			return LookAndFeel.drawIconButton();
	
		drawIconButton();
	});
	
	inline function drawIconButton()
	{
		local a = obj.area;

		g.setFont("phosphor", 20);

		local c = Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.value : 0.7);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));

		g.drawAlignedText(String.fromCharCode(obj.text), a, "centred");
	}
	
	inline function setValuePopupProperties()
	{
		var defaults = {
	        "fontName": "medium",
	        "fontSize": 18,
	        "borderSize": 2,
	        "borderRadius": 5,
	        "margin": 8,
	        "bgColour": 0x559399B1,
	        "itemColour": 0xff1a1a26,
	        "itemColour2": 0xff1a1a26,
	        "textColour": 0xffcdd6f4
		};

		if (isDefined(Style.valuePopup))
			Content.setValuePopupData(Style.valuePopup);
		else
			Content.setValuePopupData(defaults);
	}
	
	//! Function Calls
	setValuePopupProperties();
}
