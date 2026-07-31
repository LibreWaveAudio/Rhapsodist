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

namespace StyleHandler
{
	const palette = {};
	
	//! Functions
	inline function setPalette(properties: JSON)
	{
		palette.mode = isDefined(properties.mode) ? properties.mode : "dark";
		palette.surface0 = isDefined(properties.surface) ? properties.surface : 0xff202428;
		palette.surface1 = isDefined(properties.surface1) ? properties.surface1 : Colours.withMultipliedBrightness(palette.surface0, 1.3);
		palette.bg = isDefined(properties.bg) ? properties.bg : Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.7 : 0.9);
		palette.raised = isDefined(properties.raised) ? properties.raised : 0xff292c30;
		palette.text = isDefined(properties.text) ? properties.text : 0xffd7d8da;
		palette.accent = isDefined(properties.accent) ? properties.accent : 0xffdfab75;

		CoreLookAndFeel.style.palette = palette;
	}

	inline function setLookAndFeelStyle(properties: JSON)
	{
		CoreLookAndFeel.style.fonts = {
			regular: "monoRegular",
			medium: "monoMedium",
			semibold: "monoSemiBold",
			bold: "monoBold",
			title: "monoMedium",
			size: 0,
			titleSize: 22,
			titleOffset: 0
		};
		
		if (isDefined(properties.fonts))
		{
			for (x in properties.fonts)
				CoreLookAndFeel.style.fonts[x] = properties.fonts[x];
		}

		CoreLookAndFeel.style.mode = palette.mode;
		CoreLookAndFeel.style.useNoise = isDefined(properties.useNoise) ? properties.useNoise : true;

		CoreLookAndFeel.style.alertWindow = {
			bgColour: palette.surface1,
			itemColour: palette.surface0,
			itemColour2: Colours.withAlpha(palette.text, 0.3),
			itemColour3: Colours.withMultipliedBrightness(palette.raised, 0.6),
			textColour: palette.text,
			buttonRadius: isDefined(properties.alertWindow.buttonRadius) ? properties.alertWindow.buttonRadius : 1,
			borderRadius: isDefined(properties.alertWindow.borderRadius) ? properties.alertWindow.borderRadius : 2,
			borderSize: isDefined(properties.alertWindow.borderSize) ? properties.alertWindow.borderSize : 1,
			labelRadius: isDefined(properties.alertWindow.labelRadius) ? properties.alertWindow.labelRadius : 2
		};

		CoreLookAndFeel.style.inputBox = {
			bgColour: isDefined(properties.inputBox.bgColour) ? properties.inputBox.bgColour : Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.5 : 0.8),
			borderRadius: isDefined(properties.inputBox.borderRadius) ? properties.inputBox.borderRadius : 2,
			borderSize: isDefined(properties.inputBox.borderSize) ? properties.inputBox.borderSize : 0
		};

		CoreLookAndFeel.style.popupMenu = {
			bgColour: palette.surface0,
			itemColour: Colours.withAlpha(palette.text, 0.3),
			itemColour2: Colours.withAlpha(Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.5 : 0.8), 0.8),
			textColour: palette.text,
			borderSize: isDefined(properties.popupMenu.borderSize) ? properties.popupMenu.borderSize : 1,
			borderRadius: isDefined(properties.popupMenu.borderRadius) ? properties.popupMenu.borderRadius : 2,
			textOffsetY: isDefined(properties.popupMenu.textOffsetY) ? properties.popupMenu.textOffsetY : 0,
			iconFont: isDefined(properties.popupMenu.iconFont) ? properties.popupMenu.iconFont : "phosphorFill",
			iconFontSize: isDefined(properties.popupMenu.iconFontSize) ? properties.popupMenu.iconFontSize : 22,
			subMenuIcon: isDefined(properties.popupMenu.subMenuIcon) ? properties.popupMenu.subMenuIcon : "e13a",
			subMenuIconFont: isDefined(properties.popupMenu.subMenuIconFont) ? properties.popupMenu.subMenuIconFont : "phosphor",
			subMenuIconFontSize: isDefined(properties.popupMenu.subMenuIconFontSize) ? properties.popupMenu.subMenuIconFontSize : 16,
			itemRadius: isDefined(properties.popupMenu.itemRadius) ? properties.popupMenu.itemRadius : 2
		};

		CoreLookAndFeel.style.scrollbar = {
			radius: isDefined(properties.scrollbar.radius) ? properties.scrollbar.radius : 1,
			bgColour: isDefined(properties.scrollbar.bgColour) ? properties.scrollbar.bgColour : Colours.withMultipliedBrightness(palette.surface0, 0.8),
			itemColour: isDefined(obj.itemColour) ? obj.itemColour : properties.scrollbar.itemColour
		};

		CoreLookAndFeel.style.toggleSwitch = {
			borderRadius: isDefined(properties.toggleSwitch.borderRadius) ? properties.toggleSwitch.borderRadius : 10,
			borderSize: isDefined(properties.toggleSwitch.borderSize) ? properties.toggleSwitch.borderSize : 1,
			activeColour: isDefined(properties.toggleSwitch.activeColour) ? properties.toggleSwitch.activeColour : 0xff78d092
		};

		CoreLookAndFeel.style.textButton = {
			borderRadius: isDefined(properties.textButton.borderRadius) ? properties.textButton.borderRadius : 2,
			borderSize: isDefined(properties.textButton.borderSize) ? properties.textButton.borderSize : 2
		};

		CoreLookAndFeel.style.macroTag = {
			bgColour: Colours.withAlpha(Colours.withMultipliedBrightness(palette.raised, 1.2), 0.8),
			itemColour: Colours.withAlpha(palette.text, 0.3),
			textColour: palette.text,
		};

		CoreLookAndFeel.style.peakMeter = {
			radius: isDefined(properties.peakMeter.radius) ? properties.peakMeter.radius : 1
		};
		
		CoreLookAndFeel.style.table = {
			rulerColour: isDefined(properties.table.rulerColour) ? properties.table.rulerColour : Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 4.0 : 0.4),
			pointColour: isDefined(properties.table.pointColour) ? properties.table.pointColour : Colours.withMultipliedBrightness(palette.accent, 1.2)
		};

		CoreLookAndFeel.style.keyboard = {
			radius: isDefined(properties.keyboard.radius) ? properties.keyboard.radius : 2,
			useShadow: isDefined(properties.keyboard.useShadow) ? properties.keyboard.useShadow : true,
			roundEndKeys: isDefined(properties.keyboard.roundEndKeys) ? properties.keyboard.roundEndKeys : false,
			textColour: isDefined(properties.keyboard.textColour) ? properties.keyboard.textColour : Colours.black,
			colours: {
				inactive: [Colours.withMultipliedBrightness(palette.surface1, palette.mode == "dark" ? 1.2 : 0.6), Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 1.0 : 0.4)],
				keyswitch: [Colours.withMultipliedBrightness(0xff94483a, palette.mode == "dark" ? 1.0 : 1.2), Colours.withMultipliedBrightness(0x7794483a, palette.mode == "dark" ? 1.0 : 1.4)],
				playable: palette.mode == "dark" ? [0xdddcd7bc, 0xdd282924] : [0xddfefaf1, 0xdd575c66]
			}
		};
		
		if (isDefined(properties.keyboard.colours))
		{
			for (x in properties.keyboard.colours)
				CoreLookAndFeel.style.keyboard.colours[x] = properties.keyboard.colours[x];
		}
		
		Content.setValuePopupData({
			fontName: isDefined(properties.valuePopup.fontName) ? properties.valuePopup.fontName : "monoMedium",
			fontSize: isDefined(properties.valuePopup.fontSize) ? properties.valuePopup.fontSize : 20,
			borderSize: isDefined(properties.valuePopup.borderSize) ? properties.valuePopup.borderSize : 2,
			borderRadius: isDefined(properties.valuePopup.borderRadius) ? properties.valuePopup.borderRadius : 2,
			margin: isDefined(properties.valuePopup.margin) ? properties.valuePopup.margin : 10,
			bgColour: Colours.withAlpha(palette.accent, 0.5),
			itemColour: Colours.withAlpha(Colours.withMultipliedBrightness(palette.surface0, 1.5), 0.8),
			itemColour2: Colours.withAlpha(Colours.withMultipliedBrightness(palette.surface0, 1.5), 0.8),
			textColour: palette.text
		});
	}

	inline function setComponentColours(properties: JSON)
	{
		local components = Content.getAllComponents("");

		for (c in components)
		{
			local id = c.getId();
			local type = c.get("type");
			local parent = c.get("parentComponent");

			// Generic components
			switch (type)
			{
				case "ScriptSlider":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.5 : 0.8));
					c.set("itemColour", palette.raised);
					c.set("itemColour2", palette.accent);
					c.set("textColour", palette.text);
					break;

				case "ScriptButton":
					c.set("itemColour", palette.raised);
					c.set("itemColour2", palette.accent);
					c.set("textColour", palette.text);
					break;

				case "ScriptComboBox":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.6 : 0.8));
					c.set("textColour", Colours.withMultipliedBrightness(palette.text, palette.mode == "dark" ? 1.0 : 0.6));
					break;

				case "ScriptTable":
					c.set("bgColour", palette.accent);
					c.set("itemColour", palette.text);
					c.set("itemColour2", Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.5 : 0.8));
					break;

				case "ScriptFloatingTile":
					setFloatingTileColours(c, c.get("ContentType"));					
					break;

				case "ScriptPanel":
					c.set("textColour", palette.text);
					break;				
			}

			// Specific IDs
			switch (id)
			{
				case "pnlMain":
					c.set("bgColour", palette.bg);
					c.set("textColour", 0x0);
					break;
			
				case "pnlBody":
					c.set("bgColour", palette.bg);
					break;
			
				case "pnlHeader":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, 1.1));
					break;
			
				case "pnlPresetDisplay":
				case "pnlPreload":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.6 : 1.0));
					c.set("textColour", Colours.withMultipliedBrightness(palette.text, palette.mode == "dark" ? 1.0 : 0.8));
					break;
			
				case "pnlStatus":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, 1.1));
					break;
			
				case "pnlFooter":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, 0.9));
					break;
			
				case "pnlPresetBrowser":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface1, 1.1));
					c.set("itemColour", palette.accent);
					c.set("itemColour2", palette.bg);
					break;
						
				case "pnlSettings":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface1, palette.mode == "dark" ? 1.1 : 0.9));
					c.set("itemColour2", palette.bg);
					break;

				case "pnlSettingsMenu":
					c.set("itemColour", Colours.withAlpha(Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.5 : 0.8), 0.5));
					c.set("itemColour2", palette.accent);
					break;

				case "vptMpe":
					c.set("itemColour", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.9 : 0.8));
					c.set("itemColour2", Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.1 : 0.4));
					c.set("textColour", palette.text);
					break;

				case "pnlArticulationList":
					c.set("bgColour", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.5 : 0.8));
					c.set("itemColour", Colours.withAlpha(Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.5 : 0.8), 0.5));
					c.set("itemColour2", palette.accent);
					break;

				case "pnlTooltip":
					c.set("bgColour", Colours.withAlpha(Colours.withMultipliedBrightness(palette.surface0, 1.5), 0.9));
					c.set("itemColour", Colours.withAlpha(palette.accent, 0.5));
					break;
			}

			if (id.contains("pnlCard"))
			{
				c.set("bgColour", isDefined(properties.card.bgColour) ? properties.card.bgColour : palette.surface0);
				c.set("itemColour2", isDefined(properties.card.borderColour) ? properties.card.borderColour : 0x0);
				c.set("textColour", isDefined(properties.card.textColour) ? properties.card.textColour : palette.text);
			}

			if (isDefined(properties[id]))
			{
				for (x in properties[id])
				{
					c.set(x, properties[id][x]);
				}				
			}

			if (type == "ScriptPanel")
				c.repaint();
			else
				c.sendRepaintMessage();		
		}
	}

	inline function setFloatingTileColours(component: ScriptObject, contentType: string)
	{
		switch (contentType)
		{
			case "MatrixPeakMeter":
				component.set("bgColour", Colours.withMultipliedAlpha(Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.5 : 0.8), 0.99));
				component.set("itemColour2", palette.accent);
				component.set("textColour", Colours.withMultipliedBrightness(palette.text, 0.8));
				break;

			case "AHDSRGraph":
				component.set("itemColour", palette.accent);
				component.set("itemColour2", Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.5 : 0.8));
				component.set("itemColour3", Colours.withMultipliedBrightness(palette.accent, 1.2));
				break;

			case "PresetBrowser":
				component.set("bgColour", palette.surface0);
				component.set("itemColour2", Colours.withAlpha(Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.5 : 0.8), 0.5));
				component.set("itemColour3", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.6 : 0.8));
				component.set("textColour", palette.text);
				break;

			case "MidiSources":
			case "MidiLearnPanel":
			case "FrontendMacroPanel":
				component.set("itemColour", Colours.withMultipliedBrightness(palette.surface0, palette.mode == "dark" ? 0.9 : 0.8));
				component.set("itemColour2", Colours.withMultipliedBrightness(palette.raised, palette.mode == "dark" ? 1.1 : 0.4));
				component.set("textColour", palette.text);
				break;

			default: 
				component.set("textColour", palette.text);
		}
	}

	inline function: Array getStyleNames()
	{
		local result = [];

		if (!isDefined(Styles.data))
			return result;

		for (x in Styles.data)
			result.push(x.id);

		return result;
	}

	inline function setStyle(index: number)
	{
		local properties = {};

		if (isDefined(Styles.data) && isDefined(Styles.data[index]))
			properties = Styles.data[index];

		setPalette(properties);
		setLookAndFeelStyle(properties);
		setComponentColours(properties);
	}

	setStyle(0);
}
