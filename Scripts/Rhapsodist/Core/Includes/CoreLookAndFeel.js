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
@description: Default look and feel functions used throughout Rhapsodist. Including default fonts and icon fonts.
							Most functions can be overriden by redeclaring them within a LookAndFeel namespace.
@note: Subject to changes and refinements.
*/

namespace CoreLookAndFeel
{
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/AtkinsonHyperlegibleMono-Regular.ttf", "monoRegular");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/AtkinsonHyperlegibleMono-Medium.ttf", "monoMedium");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/AtkinsonHyperlegibleMono-SemiBold.ttf", "monoSemiBold");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Text/AtkinsonHyperlegibleMono-Bold.ttf", "monoBold");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor.ttf", "phosphor");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor-Thin.ttf", "phosphorThin");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor-Light.ttf", "phosphorLight");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor-Bold.ttf", "phosphorBold");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/Phosphor-Fill.ttf", "phosphorFill");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/Rhapsodist/Icons/fontaudio.ttf", "fontaudio");	

	const style = {};

    // empty
	const empty = Content.createLocalLookAndFeel();	
	
	empty.registerFunction("drawRotarySlider", function(g, obj)	{});	

	const laf = Engine.createGlobalScriptLookAndFeel();

	//! Macro Tags
	laf.registerFunction("drawNumberTag", function(g, obj)
	{	
		if (isDefined(LookAndFeel.drawNumberTag))
			return LookAndFeel.drawNumberTag();
		
		if (isDefined(Automation.drawNumberTag))
			return Automation.drawNumberTag();

		drawNumberTag();
	});
	
	inline function drawNumberTag()
	{		
		local a = Rectangle(obj.area[2] - 16, obj.area[1] + 2, 16, 16);
		local bgColour = isDefined(style.macroTag.bgColour) ? style.macroTag.bgColour : 0xff15191d;
		local itemColour = isDefined(style.macroTag.itemColour) ? style.macroTag.itemColour : 0xffd7d8da;
		local textColour = isDefined(style.macroTag.textColour) ? style.macroTag.textColour : 0xffd7d8da;

		g.setColour(Colours.withAlpha(bgColour, 0.6));
		g.fillRoundedRectangle(a, 2);
		
		g.setColour(Colours.withAlpha(itemColour, 0.8));
		g.drawRoundedRectangle(a.reduced(0.5), 2, 1);
		
		g.setFont(style.fonts.bold, 14 + style.fonts.fontSize);
		g.setColour(textColour);
		g.drawAlignedText(obj.macroIndex + 1, a.translated(0, -0.3), "centred");
	}

	//! Alert window	
	laf.registerFunction("drawAlertWindow", function(g, obj)
	{
		drawAlertWindow();
	});

	inline function drawAlertWindow()
	{
		if (isDefined(LookAndFeel.drawAlertWindow))
			return LookAndFeel.drawAlertWindow();

		local a = obj.area.expanded(20);
		local titleFont = style.fonts.semibold;
		local titleFontSize = 24 + style.fonts.size;
		local font = style.fonts.regular;
		local fontSize = 20 + style.fonts.size;
		local bgColour = style.alertWindow.bgColour;
		local itemColour = style.alertWindow.itemColour;
		local itemColour2 = style.alertWindow.itemColour2;
		local itemColour3 = style.alertWindow.itemColour3;
		local textColour = style.alertWindow.textColour;
		local radius = style.alertWindow.borderRadius;
		local borderSize = style.alertWindow.borderSize;
		local labelRadius = style.alertWindow.labelRadius;
		local hasLabel = isDefined(obj.labelArea) && obj.labelArea[0] != 0;

		g.drawDropShadow(a, Colours.withAlpha(Colours.black, 0.5), 20);

		g.setColour(bgColour);
		g.fillRoundedRectangle(a, radius);

		g.setColour(itemColour);
		g.fillRoundedRectangle([a[0], a[1], a[2], 45], {CornerSize: radius, Rounded:[1, 1, 0, 0]});

		g.setColour(itemColour2);

		if (borderSize > 0)
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);

		g.setFont(titleFont, titleFontSize);
		g.setColour(textColour);
		g.drawAlignedText(obj.title, [a[0], a[1] + 10, a[2], 25], "centred");

		if (isDefined(obj.text))
		{
			g.setColour(textColour);
			g.setFont(font, fontSize);

			if (hasLabel)
				g.drawAlignedText(obj.text, [a[0], a[1], a[2], a[3] - 85], "centred");
			else
				g.drawAlignedText(obj.text, [a[0], a[1], a[2], a[3] - 30], "centred");				
		}

		g.setColour(Colours.withMultipliedBrightness(itemColour3, 0.6));

		if (hasLabel)
			g.fillRoundedRectangle(obj.labelArea, labelRadius);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	}

	laf.registerFunction("getAlertWindowMarkdownStyleData", function(obj)
	{
		return getAlertWindowMarkdownStyleData();
	});

	inline function getAlertWindowMarkdownStyleData()
	{
		if (isDefined(LookAndFeel.getAlertWindowMarkdownStyleData))
			return LookAndFeel.getAlertWindowMarkdownStyleData();

		obj.headlineFont = style.fonts.medium;
		obj.font = style.fonts.regular;
		obj.fontSize = 22 + style.fonts.size;
		obj.textColour = style.alertWindow.textColour;
		return obj;
	}
	
	laf.registerFunction("drawAlertWindowIcon", function(g, obj)
	{
		drawAlertWindowIcon();
	});
	
	inline function drawAlertWindowIcon()
	{
		if (isDefined(LookAndFeel.drawAlertWindowIcon))
			return LookAndFeel.drawAlertWindowIcon();

		local a = obj.area;
		local icons = {"Info": "\ue2ce", "Warning": "\ue4e0", "Question": "\ue3e8", "Error": "\ue7fc"};
		local textColour = style.alertWindow.textColour;

		g.setFont("phosphor", 42);
		g.setColour(Colours.withAlpha(textColour, 0.8));
		g.drawAlignedText(icons[obj.type], a, "centred");		
	}
	
	laf.registerFunction("drawDialogButton", function(g, obj)
	{
		drawDialogButton();
	});

	//! Dialog button
	inline function drawDialogButton()
	{
		if (isDefined(LookAndFeel.drawDialogButton))
			return LookAndFeel.drawDialogButton();

		local a = obj.area;
		local text = obj.text;
		local bgColour = style.alertWindow.itemColour;
		local textColour = style.alertWindow.textColour;
		local font = style.fonts.medium;
		local fontSize = 18 + style.fonts.size;
		local radius = style.alertWindow.buttonRadius;
		
		if (["Exit", "Overwrite Preset"].contains(obj.parentName))
			text = obj.text == "OK" ? "Yes" : "No";

		g.setColour(Colours.withMultipliedBrightness(bgColour, obj.over ? 2.0 - 0.5 * obj.down : 1.0));
		g.fillRoundedRectangle(a, radius);

		g.setColour(Colours.withAlpha(Colours.black, 0.7));
		g.drawRoundedRectangle([a[0] + 0.25, a[1] + 0.25, a[2] - 0.5, a[3] - 0.5], radius, 1);

		local c;

		if (style.mode == "dark")
			c = Colours.withMultipliedBrightness(textColour, obj.over ? 1.0 - 0.2 * obj.down : 0.8);
		else
			c = Colours.withMultipliedBrightness(textColour, obj.over ? 1.5 + 0.5 * obj.down : 0.8);

		g.setColour(c);		
		g.setFont(font, fontSize);
		g.drawAlignedText(text.toUpperCase(), a, "centred");
	}
	
	//! Peak Meter
	const peakMeter = Content.createLocalLookAndFeel();
	
	peakMeter.registerFunction("drawMatrixPeakMeter", function(g, obj)
	{
		drawMatrixPeakMeter();
	});

	inline function drawMatrixPeakMeter()
	{
		if (isDefined(LookAndFeel.drawMatrixPeakMeter))
			return LookAndFeel.drawMatrixPeakMeter();

		local a = obj.area;
		local radius = style.peakMeter.radius;
		local peaks = [];
		local maxPeaks = [];

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

			g.setColour(obj.itemColour2);

			if (maxPeaks[i] == 0)
				continue;

			if (obj.isVertical)
				g.drawHorizontalLine(a[3] - a[3] * maxPeaks[i], a[2] / 2 * i + (0.5 * i), (a[2] / 2 * i + (0.5 * i)) + (a[2] - 1) / 2);
			else
				g.drawVerticalLine(a[2] * maxPeaks[i],  a[3] / 2 * i + (0.5 * i), ( a[3] / 2 * i + (0.5 * i)) + (a[3] - 1) / 2);
		}
		
		if (!isDefined(style.useNoise) || style.useNoise)
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
		drawTableBackground();
	});
	
	inline function drawTableBackground()
	{
		if (isDefined(LookAndFeel.drawTableBackground))
			return LookAndFeel.drawTableBackground();

		local a = obj.area;
		local gridColour = obj.itemColour;

		g.setColour(obj.itemColour);

		g.drawRoundedRectangle(a, 1, 1);
		g.drawVerticalLine(a[2] / 2, a[1], a[3]);
		g.drawHorizontalLine(a[3] / 2, a[0], a[2]);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	}

	table.registerFunction("drawTablePath", function(g, obj)
	{
		drawTablePath();
	});

	inline function drawTablePath()
	{
		if (isDefined(LookAndFeel.drawTablePath))
			return LookAndFeel.drawTablePath();

		local a = obj.area;
		local pathColour = obj.bgColour;
		local fillColour = Colours.withMultipliedAlpha(obj.itemColour2, obj.enabled ? 0.5 : 0.1);

		g.setGradientFill([fillColour, a[2] / 2, a[1], Colours.withMultipliedAlpha(fillColour, 0.3), a[2] / 2, a[3]]);
		g.fillPath(obj.path, a);

		g.setColour(pathColour);
		g.drawPath(obj.path, [a[0] - 2, a[1], a[2] + 4, a[3] + 2], 2.0);
	}
	
	table.registerFunction("drawTablePoint", function(g, obj)
	{
		drawTablePoint();
	});
	
	inline function drawTablePoint()
	{
		if (isDefined(LookAndFeel.drawTablePoint))
			return LookAndFeel.drawTablePoint();

		local a = obj.tablePoint;
		local colour = style.table.pointColour;

		g.setColour(Colours.withMultipliedAlpha(colour, obj.hover ? 0.7 : 0.4));
		g.fillEllipse(a);

		g.setColour(Colours.withMultipliedAlpha(colour, obj.hover ? 1.0 : 0.8));
		g.fillEllipse(a.reduced(3));
	}
	
	table.registerFunction("drawTableRuler", function(g, obj)
	{
		drawTableRuler();
	});

	inline function drawTableRuler()
	{
		if (isDefined(LookAndFeel.drawTableRuler))
			return LookAndFeel.drawTableRuler();

		local x = obj.position * obj.area[2];

		g.setColour(Colours.withAlpha(style.table.rulerColour, 0.1));	       
		g.drawLine(x, x, 0, obj.area[3], 10.0);

		g.setColour(Colours.withAlpha(style.table.rulerColour, 0.8));
		g.drawLine(x, x, 0, obj.area[3], 0.6);
	}
	
	//! Viewport Table
	const viewportTable = Content.createLocalLookAndFeel();
		
	viewportTable.registerFunction("drawToggleButton", function(g, obj)
	{
		drawViewportTableToggleButton();
	});
	
	inline function drawViewportTableToggleButton()
	{
		if (isDefined(LookAndFeel.drawViewportTableToggleButton))
			return LookAndFeel.drawViewportTableToggleButton();
		
		local a = obj.area;
		local size = 12;
		local disc = Rectangle(a[2] / 2 - size / 2, a[3] / 2 - size / 2, size, size);
		
		g.setColour(Colours.withAlpha(obj.textColour, obj.value ? 1.0 : 0.8));
		g.drawEllipse(disc, 1);
		
		local alpha = (obj.value ? 0.9 : 0.2) + (0.2 * obj.over) - (0.2 * obj.down);
		g.setColour(Colours.withAlpha(obj.textColour, alpha));
		g.fillEllipse(disc.reduced(3));
	}
		
	viewportTable.registerFunction("drawTableHeaderBackground", function(g, obj)
	{
		drawViewportTableHeaderBackground();
	});
	
	inline function drawViewportTableHeaderBackground()
	{
		if (isDefined(LookAndFeel.drawViewportTableHeaderBackground))
			return LookAndFeel.drawViewportTableHeaderBackground();

		g.fillAll(obj.itemColour);
	}
	
	viewportTable.registerFunction("drawTableHeaderColumn", function(g, obj)
	{
		drawTableHeaderColumn();
	});
	
	inline function drawTableHeaderColumn()
	{
		if (isDefined(LookAndFeel.drawTableHeaderColumn))
			return LookAndFeel.drawTableHeaderColumn();

		local a = obj.area;
		local font = style.fonts.semibold;
		local fontSize = 16 + style.fonts.size;
		local text = obj.text.replace(" #").replace("Inverted", "Invert").replace("Source", "Macro");
	
		g.setColour(obj.textColour);
		g.setFont(font, fontSize);
		
		if (["Gesture", "Mode", "Intensity"].contains(text))
			g.drawAlignedText(text, a.translated(5, 0), "left");
		else
			g.drawAlignedText(text, a.translated(10, 0), "left");
	}
	
	viewportTable.registerFunction("drawTableRowBackground", function(g, obj)
	{
		drawTableRowBackground();
	});
	
	inline function drawTableRowBackground()
	{
		if (isDefined(LookAndFeel.drawTableRowBackground))
			return LookAndFeel.drawTableRowBackground();

		local a = obj.area;

		g.setColour(Colours.withAlpha(obj.itemColour2, 0.1));
		g.drawHorizontalLine(a[3] - 1, a[0], a[2]);

		if (obj.selected)
			g.fillRect(a);
	}

	viewportTable.registerFunction("drawTableCell", function(g, obj)
	{
		drawTableCell();
	});
	
	inline function drawTableCell()
	{
		if (isDefined(LookAndFeel.drawTableCell))
			return LookAndFeel.drawTableCell();
	
		local a = obj.area;
		local font = style.fonts.regular;
		local fontSize = 16 + style.fonts.size;
		local text = obj.text.replace("Macro ").replace("MPE").toLowerCase().capitalize().trim();
		
		g.setFont(font, fontSize);
		g.setColour(obj.textColour);
		g.drawAlignedText(text, a.translated(10, 0), "left");
	}
	
	viewportTable.registerFunction("drawLinearSlider", function(g, obj)
	{
		drawTableLinearSlider();
	});

	inline function drawTableLinearSlider()
	{
		if (isDefined(LookAndFeel.drawTableLinearSlider))
			return LookAndFeel.drawTableLinearSlider();
	
		local a = obj.area;
		local font = style.fonts.regular;
		local fontSize = 16 + style.fonts.size;

		g.setColour(Colours.withMultipliedBrightness(obj.itemColour1, 0.8));
		g.fillRoundedRectangle(a.reduced(2, 3), 2);

		g.setColour(Colours.withAlpha(obj.textColour, 0.5));
		g.fillRoundedRectangle(a.scaled(obj.valueNormalized, 1).reduced(2, 3), 2);

		g.setFont(font, fontSize - 2);
		g.setColour(obj.textColour);
		g.drawAlignedText(obj.valueAsText, a, "centred");
	}

	viewportTable.registerFunction("drawScrollbar", function(g, obj)
	{
		drawTableScrollbar();
	});
	
	inline function drawTableScrollbar()
	{
		if (isDefined(LookAndFeel.drawTableScrollbar))
			return LookAndFeel.drawTableScrollbar();
	
		obj.bgColour = Colours.withMultipliedBrightness(isDefined(obj.itemColour) ? obj.itemColour : obj.itemColour1, 0.5);
		obj.itemColour = obj.textColour;

		drawScrollbar();
	}
	
	viewportTable.registerFunction("drawComboBox", function(g, obj)
	{
		drawTableComboBox();
	});
	
	inline function drawTableComboBox()
	{
		if (isDefined(LookAndFeel.drawTableComboBox))
			return LookAndFeel.drawTableComboBox();
	
		local a = obj.area;
		local font = style.fonts.regular;
		local fontSize = 16 + style.fonts.size;
		local textColour = 0xffd7d8da;		
	
		if (obj.text == "Polyphonic")
			obj.text = "Poly";
		
		g.setColour(textColour);
		g.setFont(font, fontSize);
		g.drawFittedText(obj.text, a.translated(5, 0), "left", 1, 1);	
		
		g.setFont("phosphor", 16);
		g.drawAlignedText("\ue136", [a[0], a[1], a[2] - 4, a[3]], "right");
	}

	viewportTable.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		drawPopupMenuBackground(); 
	});
	
	viewportTable.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		drawPopupMenuItem(); 
	});
	
	viewportTable.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return getIdealPopupMenuItemSize(); 
	});

	//! Combo Box
	const comboBox = Content.createLocalLookAndFeel();
	
	comboBox.registerFunction("drawComboBox", function(g, obj)
	{
		drawComboBox();
	});
	
	inline function drawComboBox()
	{
		if (isDefined(LookAndFeel.drawComboBox))
			return LookAndFeel.drawComboBox();

		local a = obj.area;
		local bgColour = obj.bgColour;
		local itemColour = obj.itemColour1;
		local textColour = obj.textColour;
		local font = style.fonts.regular;
		local fontSize = 16 + style.fonts.size;
		local radius = style.inputBox.borderRadius;
		local borderSize = style.inputBox.borderSize;
	
		g.setColour(Colours.withAlpha(bgColour, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle(a, radius);
		
		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	
		if (borderSize > 0)
		{
			g.setColour(itemColour);
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);
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

	comboBox.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		drawPopupMenuBackground();
	});
	
	laf.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		drawPopupMenuBackground();
	});
	
	//! Popup Menu
	inline function drawPopupMenuBackground()
	{
		if (isDefined(LookAndFeel.drawPopupMenuBackground))
			return LookAndFeel.drawPopupMenuBackground();

		local a = obj.area;
		local bgColour = style.popupMenu.bgColour;
		local borderColour = style.popupMenu.itemColour;
		local borderSize = style.popupMenu.borderSize;
		local borderRadius = style.popupMenu.borderRadius;

		g.setColour(bgColour);
		g.fillRoundedRectangle(a, borderRadius);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});

		if (borderSize == 0)
			return;
	
		g.setColour(borderColour);
		g.drawRoundedRectangle(a.reduced(borderRadius / 4), borderRadius, borderSize);
	}

	comboBox.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		drawPopupMenuItem();
	});

	laf.registerFunction("drawPopupMenuItem", function(g, obj)
	{	
		drawPopupMenuItem();
	});

	inline function drawPopupMenuItem()
	{
		if (isDefined(LookAndFeel.drawPopupMenuItem))
			return LookAndFeel.drawPopupMenuItem();

		local a = obj.area;
		local hasIcon = obj.text.startsWith("e");
		local icon = obj.text.substring(0, obj.text.indexOf("-"));
		local text = obj.text.replace(icon + "-");	
		local itemColour2 = style.popupMenu.itemColour2;
		local textColour = style.popupMenu.textColour;
		local textOffsetY = style.popupMenu.textOffsetY;
		local font = style.fonts.regular;
		local fontSize = 18 + style.fonts.size;
		local iconFont = style.popupMenu.iconFont;
		local iconFontSize = style.popupMenu.iconFontSize;
		local subMenuIcon = style.popupMenu.subMenuIcon;
		local subMenuIconFont = style.popupMenu.subMenuIconFont;
		local subMenuIconFontSize = style.popupMenu.subMenuIconFontSize;
		local radius = style.popupMenu.itemRadius;
	
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
	
		g.setFont(font, fontSize);
		g.setColour(Colours.withMultipliedAlpha(textColour, obj.isHighlighted ? 1.0 : 0.9));
		g.drawFittedText(text, a.withTrimmedRight(10 + (30 * hasIcon)).translated(10 + (30 * hasIcon), textOffsetY), "left", 1.0, 1.0);
	
		if (hasIcon)
		{
			g.setFont(iconFont, iconFontSize);
			g.drawAlignedText(String.fromCharCode(icon), a.translated(10, 0), "left");
		}			
	
		if (obj.hasSubMenu)
		{
			g.setFont(subMenuIconFont, subMenuIconFontSize);
			g.drawAlignedText(String.fromCharCode(subMenuIcon), a.translated(-5, 0), "right");
		}			
	
		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	}

	comboBox.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return getIdealPopupMenuItemSize();
	});
	
	laf.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return getIdealPopupMenuItemSize();
	});

	inline function getIdealPopupMenuItemSize()
	{
		if (isDefined(LookAndFeel.getIdealPopupMenuItemSize))
			return LookAndFeel.getIdealPopupMenuItemSize();

		if (obj.isSeparator)
			return 10;

		local width = Math.min(400, 40 + Engine.getStringWidth(obj.text, "monoRegular", 18, 0));

		return [width, 40];
	}

	//! Viewport
	const viewport = Content.createLocalLookAndFeel();
		
	viewport.registerFunction("drawScrollbar", function(g, obj)
	{
		drawScrollbar();
	});
		
	//! Scrollbar
	inline function drawScrollbar()
	{
		if (isDefined(LookAndFeel.drawScrollbar))
			return LookAndFeel.drawScrollbar();

		local a = obj.area;
		local ha = obj.handle;
		local w = a[2] > 10 ? 10 : a[2];
		local radius = style.scrollbar.radius;
		local bgColour = isDefined(obj.bgColour) ? obj.bgColour : style.scrollbar.bgColour;
		local itemColour = isDefined(obj.itemColour) ? obj.itemColour : style.scrollbar.itemColour;

		g.setColour(bgColour);
		g.fillRoundedRectangle([a[2] - w + 2, a[1], w - 4, a[3]], radius + 1);

		g.setColour(Colours.withAlpha(itemColour, obj.over || obj.down ? 1.0 - 0.3 * obj.down : 0.5));
		g.fillRoundedRectangle([a[2] - w + 3, ha[1] + 1, w - 6, ha[3] - 2], radius);
	}
	
	//! Generic Knob
	const knob = Content.createLocalLookAndFeel();

	knob.registerFunction("drawRotarySlider", function(g, obj)
	{
		drawKnob();
	});
	
	inline function drawKnob()
	{
		if (isDefined(LookAndFeel.drawKnob))
			return LookAndFeel.drawKnob();

		if (obj.area[2] > 100)
			drawBigKnob();
		else
			drawSmallKnob();
	}

	inline function drawBigKnob()
	{
		if (isDefined(LookAndFeel.drawBigKnob))
			return LookAndFeel.drawBigKnob();

		local a = Rectangle(obj.area[0], obj.area[1], obj.area[2], obj.area[2]).reduced(14);
		local valueFont = style.fonts.regular;
		local valueFontSize = 18 + style.fonts.size;
		local labelFont = style.fonts.medium;
		local labelFontSize = 18 + style.fonts.size;
		local thickness = 4;	
		local offset = 2.4;
		local endOffset = -offset + 2 * offset * obj.valueNormalized;
		local isBidirectional = -1.0 * obj.min == obj.max;
		local strokeStyle = {EndCapStyle: "rounded", Thickness: thickness};
		local diameter = obj.area[2] - thickness;
		
		// Value arc
		local p = Content.createPath();
		p.addArc([0, 0, 1, 1], -offset, offset);

		local pathArea = p.getBounds(diameter);
		pathArea[0] += obj.area[2] / 2 - diameter / 2;
		pathArea[1] += obj.area[1] + thickness / 2;

		g.setColour(Colours.withMultipliedAlpha(obj.bgColour, obj.enabled ? 1.0 : 0.5));
		g.drawPath(p, pathArea, strokeStyle);

		p = Content.createPath();
		p.addArc([0, 0, 1, 1], (-offset * !isBidirectional), endOffset);

		pathArea = p.getBounds(diameter);
		pathArea[0] += obj.area[2] / 2 - diameter / 2;
		pathArea[1] += obj.area[1] + thickness / 2;

		local c;
		
		if (style.mode == "dark")
			c = Colours.withMultipliedBrightness(obj.itemColour2, (obj.hover || obj.clicked) ? 1.1 - 0.1 * obj.clicked : 1.0);
		else
			c = Colours.withMultipliedBrightness(obj.itemColour2, (obj.hover || obj.clicked) ? 1.3 + 0.1 * obj.clicked : 1.0);

		g.setColour(Colours.withAlpha(c, obj.enabled ? 1.0 : 0.5));
		g.drawPath(p, pathArea, strokeStyle);

		// Shadow
		local shadowPath = Content.createPath();
		shadowPath.addEllipse(a);
		g.drawDropShadowFromPath(shadowPath, a, Colours.withAlpha(Colours.black, obj.enabled ? 0.6 : style.mode == "dark" ? 0.3 : 0.1), 10, [0, 10]);

		// Body		
		if (style.mode == "dark")		
			c = Colours.withMultipliedBrightness(obj.itemColour1, (obj.hover || obj.clicked) ? 1.2 - 0.1 * obj.clicked : 1.0);
		else
			c = Colours.withMultipliedBrightness(obj.itemColour1, (obj.hover || obj.clicked) ? 1.5 - 0.2 * obj.clicked : 1.0);
			
		g.setGradientFill([c, a[2] / 2, a[1], Colours.withMultipliedBrightness(c, 0.8), a[2] / 2, a[3]]);
		g.fillEllipse(a);
		
		// Highlight
		c = Colours.withMultipliedBrightness(obj.itemColour1, 1.5);
		g.setGradientFill([c, a[0] + a[2] / 2, a[1], 0x0, a[0] + a[2] / 2, a[1] + a[3]]);

		if (obj.enabled)
			g.drawEllipse(a, 2);
		
		// Value
		g.setFont(valueFont, valueFontSize);		
		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : style.mode == "dark" ? 0.8 : 0.6));
		g.drawAlignedText(Math.round(obj.valueNormalized * 100), a, "centred");

		// Label
		g.setFont(labelFont, labelFontSize);
		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : 0.7));
		g.drawAlignedText(obj.text, obj.area.translated(0, -5), "centredBottom");

		// Value indicator
		g.rotate(endOffset, [a[0] + a[2] / 2, a[1] + a[2] / 2]);

		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle(Rectangle(a[0] + a[2] / 2 - 1.5, a[1] + 3, 3, 10), 1);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoiseFromPath(shadowPath, a, {alpha: 0.025, scaleFactor: 1.5, monochromatic: true});
	}
	
	inline function drawSmallKnob()
	{
		if (isDefined(LookAndFeel.drawSmallKnob))
			return LookAndFeel.drawSmallKnob();

		local a = Rectangle(obj.area[0], obj.area[1], obj.area[2], obj.area[2]).reduced(16);
		local arcArea = a.expanded(7);
		local labelBelow = obj.text.startsWith("[") && obj.text.endsWith("]");

		if (obj.text != "" && !labelBelow)
		{
			a.setPosition(a[0], obj.area[3] / 2 - a[3] / 2);
			arcArea.setPosition(arcArea[0], obj.area[3] / 2 - arcArea[3] / 2);			
		}
		
		local valueFont = style.fonts.regular;
		local valueFontSize = 16 + style.fonts.size;
		local labelFont = style.fonts.medium;
		local labelFontSize = 18 + style.fonts.size;
		local thickness = 3;
		local offset = 2.4;
		local endOffset = -offset + 2 * offset * obj.valueNormalized;
		local isBidirectional = -1.0 * obj.min == obj.max;
		local strokeStyle = {EndCapStyle: "rounded", Thickness: thickness};
		local diameter = arcArea[2] - thickness;

		// Value arc
		local p = Content.createPath();
		p.addArc([0, 0, 1, 1], -offset, offset);

		local pathArea = p.getBounds(diameter);
		pathArea[0] += arcArea[0] + arcArea[2] / 2 - diameter / 2;
		pathArea[1] += arcArea[1] + thickness / 2;
			
		g.setColour(obj.bgColour);
		g.drawPath(p, pathArea, strokeStyle);

		p = Content.createPath();
		p.addArc([0, 0, 1, 1], (-offset * !isBidirectional), endOffset);

		pathArea = p.getBounds(diameter);
		pathArea[0] += arcArea[0] + arcArea[2] / 2 - diameter / 2;
		pathArea[1] += arcArea[1] + thickness / 2;
		
		local c;

		if (style.mode == "dark")
			c = Colours.withMultipliedBrightness(obj.itemColour2, (obj.hover || obj.clicked) ? 1.1 - 0.1 * obj.clicked : 1.0);
		else
			c = Colours.withMultipliedBrightness(obj.itemColour2, (obj.hover || obj.clicked) ? 1.3 + 0.1 * obj.clicked : 1.0);
		
		g.setColour(Colours.withAlpha(c, obj.enabled ? 1.0 : 0.5));
		g.drawPath(p, pathArea, strokeStyle);
			
		// Shadow
		local shadowPath = Content.createPath();
		shadowPath.addEllipse(a);

		if (obj.enabled)
			g.drawDropShadowFromPath(shadowPath, a, Colours.withAlpha(Colours.black, 0.7), 8, [0, 6]);

		// Body		
		if (style.mode == "dark")		
			c = Colours.withMultipliedBrightness(obj.itemColour1, (obj.hover || obj.clicked) ? 1.2 - 0.1 * obj.clicked : 1.0);
		else
			c = Colours.withMultipliedBrightness(obj.itemColour1, (obj.hover || obj.clicked) ? 1.5 - 0.2 * obj.clicked : 1.0);
			
		g.setGradientFill([c, a[0] + a[2] / 2, a[1], Colours.withMultipliedBrightness(c, 0.8), a[0] + a[2] / 2, a[1] + a[3] / 1.2]);
		g.fillEllipse(a);
		
		// Border
		c = Colours.withMultipliedBrightness(obj.itemColour1, obj.enabled ? 1.5 : 1.0);
		g.setGradientFill([c, a[0] + a[2] / 2, a[1], 0x0, a[0] + a[2] / 2, a[1] + a[3]]);
		g.drawEllipse(a, 1);

		// Value
		g.setFont(valueFont, valueFontSize);
		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : 0.6));
		
		if (!labelBelow || (labelBelow && obj.hover))
			g.drawAlignedText(obj.valueAsText.replace(" "), obj.area, "centredBottom");
		
		// Label
		g.setFont(labelFont, labelFontSize);
		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));		
				
		if (!labelBelow)
			g.drawAlignedText(obj.text, obj.area.translated(0, -2), "centredTop");
		else if (!obj.hover)
			g.drawAlignedText(obj.text.replace("[").replace("]"), obj.area, "centredBottom");
			
		// Value indicator
		g.rotate(endOffset, [a[0] + a[2] / 2, a[1] + a[2] / 2]);

		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle(Rectangle(a[0] + a[2] / 2 - 1, a[1] + 2, 2, 6), 1);
		
		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoiseFromPath(shadowPath, a, {alpha: 0.025, scaleFactor: 1.5, monochromatic: true});
	}

	//! Slider
	const slider = Content.createLocalLookAndFeel();
	
	slider.registerFunction("drawLinearSlider", function(g, obj)
	{
		drawSlider();
	});

	inline function drawSlider()
	{
		if (isDefined(LookAndFeel.drawSlider))
			return LookAndFeel.drawSlider();

		if (obj.style == 3)
			return drawVerticalSlider();
		else if (obj.style == 2)
			return drawHorizontalSlider();
		
		return drawKnob();
	}
	
	//! Horizontal Slider
	inline function drawHorizontalSlider()
	{
		if (isDefined(LookAndFeel.drawHorizontalSlider))
			return LookAndFeel.drawHorizontalSlider();

		local a = obj.area;
		local isBidirectional = -1.0 * obj.min == obj.max;
		local thickness = 4;
		local radius = 1;
		local valueFont = style.fonts.regular;
		local valueFontSize = 16 + style.fonts.size;
		local labelFont = style.fonts.medium;
		local labelFontSize = 16 + style.fonts.size;

		local v = obj.valueNormalized;
		local x = a[0];
		local y = a[3] / 2 - thickness / 2;
		local w = a[2] * v;

		if (isBidirectional)
		{
			w = a[2] / 2 * (v >= 0.5 ? (v - 0.5) : (0.5 - v)) * 2;
			x = a[2] / 2 - (w * (v < 0.5));
		}		

		g.setColour(obj.bgColour);
		g.fillRoundedRectangle([a[0], y, a[2], thickness], radius);

		local c = Colours.withMultipliedBrightness(obj.itemColour2, obj.hover ? 1.1 - 0.1 * obj.clicked : 1.0);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle([x, y, w, thickness], 1);
				
		c = Colours.withMultipliedBrightness(obj.textColour, obj.hover ? 1.1 - 0.1 * obj.clicked : 1.0);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle([a[2] * v - 4 * v, a[3] / 2 - 12 / 2, thickness, 12], radius);
		
		// Text
		g.setColour(Colours.withAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));
		
		if (obj.text != "")
		{
			g.setFont(labelFont, labelFontSize);
			g.drawAlignedText(obj.text, a, "centredTop");
		}

		g.setFont(valueFont, valueFontSize);		
		g.drawAlignedText(obj.valueAsText, a, "centredBottom");
	}
	
	//! Vertical Slider
	inline function drawVerticalSlider()
	{
		if (isDefined(LookAndFeel.drawVerticalSlider))
			return LookAndFeel.drawVerticalSlider();

		local a = Rectangle(obj.area[2] / 2 - 4 / 2, obj.area[1], 4, obj.area[3]);
		local radius = 1;

		g.setColour(obj.bgColour);
		g.fillRoundedRectangle(a, radius);

		local v = obj.valueNormalized;
		local h = a[3] * v;
		local y = a[3] - a[3] * v;

		local c = Colours.withMultipliedBrightness(obj.itemColour2, obj.hover ? 1.1 - 0.1 * obj.clicked : 1.0);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle([a[0], y, a[2], h], radius);

		h = 4;
		y = a[3] - a[3] * v - h + h * v;
		
		local handleArea = Rectangle(obj.area[2] / 2 - 18 / 2, y, 18, h);

		g.drawDropShadow(handleArea.translated(0, 2), Colours.withAlpha(Colours.black, 0.5), 3);

		c = Colours.withMultipliedBrightness(obj.textColour, obj.hover ? 1.1 - 0.1 * obj.clicked : 1.0);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));
		g.fillRoundedRectangle(handleArea, radius);
	}
	
	// toggleSwitch
	const toggleSwitch = Content.createLocalLookAndFeel();

	toggleSwitch.registerFunction("drawToggleButton", function(g, obj)
	{
		drawToggleSwitch();
	});

	inline function drawToggleSwitch()
	{
		if (isDefined(LookAndFeel.drawToggleSwitch))
			return LookAndFeel.drawToggleSwitch();

		local a = obj.area;
		local radius = style.toggleSwitch.borderRadius;
		local borderSize = style.toggleSwitch.borderSize;
		local activeColour = style.toggleSwitch.activeColour;

		g.setColour(Colours.withMultipliedAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));		
		g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);

		local c = Colours.withMultipliedBrightness(obj.value ? activeColour : obj.itemColour2, obj.over ? 1.0 - 0.1 * obj.down : 0.8);
		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));

		local x = 2 + (obj.value ? a[2] - a[3] / 1.5 : 2) - 6 * obj.value;
		local ballArea = [x, a[3] / 2 - a[3] / 1.5 / 2, a[3] / 1.5, a[3] / 1.5];
		g.fillEllipse(ballArea);
	}

	//! iconButton
	const iconButton = Content.createLocalLookAndFeel()
	
	iconButton.registerFunction("drawToggleButton", function(g, obj)
	{	
		drawIconButton();
	});
	
	inline function drawIconButton()
	{
		if (isDefined(LookAndFeel.drawIconButton))
			return LookAndFeel.drawIconButton();

		local a = obj.area;

		g.setFont("phosphor", a[2] < 20 ? a[2] : 20);

		local c;

		if (style.mode == "dark")
			c = Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.value : 0.7);
		else
			c = Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.5 + 0.5 * obj.value : 0.7);

		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));

		g.drawAlignedText(String.fromCharCode(obj.text), a, "centred");
	}
	
	//! iconButtonToggle
	const iconButtonToggle = Content.createLocalLookAndFeel()
	
	iconButtonToggle.registerFunction("drawToggleButton", function(g, obj)
	{	
		drawIconButtonToggle();
	});

	inline function drawIconButtonToggle()
	{
		if (isDefined(LookAndFeel.drawIconToggleButton))
			return LookAndFeel.drawIconToggleButton();

		local a = obj.area;

		g.setFont("phosphor", 20);

		local c = Colours.withMultipliedBrightness(obj.textColour, (obj.value ? 0.9 : 0.6) + 0.2 * obj.over - 0.2 * obj.down);
		
		if (style.mode == "dark")
			c = Colours.withMultipliedAlpha(c, (obj.value ? 1.0 : 0.8) + 0.1 * obj.over - 0.1 * obj.down);
		else
			c = Colours.withMultipliedAlpha(c, (obj.value ? 1.0 : 0.4) + 0.1 * obj.over - 0.1 * obj.down);

		g.setColour(Colours.withMultipliedBrightness(c, obj.enabled ? 1.0 : 0.5));

		g.drawAlignedText(String.fromCharCode(obj.text), a, "centred");
	}
	
	//! textButton
	const textButton = Content.createLocalLookAndFeel()
	
	textButton.registerFunction("drawToggleButton", function(g, obj)
	{
		drawTextButton();
	});
	
	inline function drawTextButton()
	{
		if (isDefined(LookAndFeel.drawTextButton))
			return LookAndFeel.drawTextButton();
			
		drawTextButtonToggle();
	}
	
	//! textButtonToggle
	const textButtonToggle = Content.createLocalLookAndFeel()
	
	textButtonToggle.registerFunction("drawToggleButton", function(g, obj)
	{
		drawTextButtonToggle();
	});
	
	inline function drawTextButtonToggle()
	{
		if (isDefined(LookAndFeel.drawTextButtonToggle))
			return LookAndFeel.drawTextButtonToggle();

		local a = obj.area;
		local radius = style.textButton.borderRadius;
		local font = style.fonts.medium;
		local fontSize = 18 + style.fonts.size;

		local c = Colours.withMultipliedBrightness(obj.bgColour, (obj.value ? 1.0 : 0.8 + 0.1 * obj.over) - 0.1 * obj.down);

		g.setColour(c);
		g.fillRoundedRectangle(a, radius);

		c = Colours.withMultipliedBrightness(obj.textColour, (obj.value ? 0.9 : 0.6) + 0.2 * obj.over - 0.2 * obj.down);

		if (style.mode == "dark")
			c = Colours.withMultipliedAlpha(c, (obj.value ? 1.0 : 0.8) + 0.1 * obj.over - 0.1 * obj.down);
		else
			c = Colours.withMultipliedAlpha(c, (obj.value ? 1.0 : 0.4) + 0.1 * obj.over - 0.1 * obj.down);

		g.setColour(Colours.withMultipliedBrightness(c, obj.enabled ? 1.0 : 0.5));
		g.drawRoundedRectangle(a.reduced(0.5), radius, 1);

		g.setFont(font, fontSize);
		g.drawAlignedText(obj.text, a, "centred");

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	}
	
	//! Power button
	const powerButton = Content.createLocalLookAndFeel();
	
	powerButton.registerFunction("drawToggleButton", function(g, obj)
	{
		drawPowerButton();
	});

	inline function drawPowerButton()
	{
		if (isDefined(LookAndFeel.drawPowerButton))
			return LookAndFeel.drawPowerButton();

		local thickness = 2;
		local a = obj.area.reduced(thickness / 2);
		local c;
		
		g.setColour(Colours.withMultipliedAlpha(obj.textColour, obj.enabled ? 1.0 : 0.5));
		g.drawEllipse(a, thickness);
			
		c = Colours.withMultipliedBrightness(obj.itemColour2, (obj.value ? 0.9 : 0.6) + 0.2 * obj.over - 0.2 * obj.down);
		c = Colours.withMultipliedAlpha(c, (obj.value ? 1.0 : 0.3) + 0.1 * obj.over - 0.1 * obj.down);

		g.setColour(Colours.withMultipliedAlpha(c, obj.enabled ? 1.0 : 0.5));

		g.fillEllipse(a.reduced(thickness * 1.5));
	}

	//! Analyser
	inline function drawAnalyserPath()
	{
		if (isDefined(LookAndFeel.drawAnalyserPath))
			return LookAndFeel.drawAnalyserPath();
			
		local a = obj.pathArea;
		local c = Colours.withMultipliedAlpha(obj.itemColour2, obj.enabled ? 1.0 : 0.1);
		
		g.setGradientFill([c, a[2] / 2, a[1], Colours.withMultipliedAlpha(c, 0.2), a[2] / 2, a[3]]);
		g.setColour(c);
		g.fillPath(obj.path, a);

		g.setColour(obj.itemColour2);
		g.drawPath(obj.path, [a[0] - 2, a[1], a[2] + 4, a[3] + 2], 2.0);
	}
}
