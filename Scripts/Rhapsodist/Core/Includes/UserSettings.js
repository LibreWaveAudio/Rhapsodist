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

namespace UserSettings
{
	reg settingsLoaded = false; // Flag to make sure settings are loaded before broadcaster triggers
	
	//! lafMidiSettings
	const lafMidiSettings = Content.createLocalLookAndFeel();
	
	lafMidiSettings.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;
		var size = 14;
		var font = fltMidiSources.get("Font");
		var fontSize = fltMidiSources.get("FontSize");
		var disc = Rectangle(a[0] + 1, a[3] / 2 - size / 2, size, size);

		g.setColour(Colours.withAlpha(obj.textColour, obj.value ? 1.0 : 0.8));
		g.drawEllipse(disc, 1);
		
		var alpha = (obj.value ? 0.9 : 0.2) + (0.2 * obj.over) - (0.2 * obj.down);
		g.setColour(Colours.withAlpha(obj.textColour, alpha));
		g.fillEllipse(disc.reduced(3));

		if (obj.text == "")
			return;

		g.setFont(font, fontSize);
		g.setColour(Colours.withAlpha(obj.textColour, obj.value ? 1.0 : 0.8));
		g.drawFittedText(obj.text, [a[0] + 25, a[1], a[2], a[3]], "left", 1, 1.0);
	});
	
	lafMidiSettings.registerFunction("drawScrollbar", function(g, obj)
	{
		var parent;

		if (["MidiChannelList", "MidiSources"].contains(obj.parentType))
			parent = pnlMidiSettings;

		if (!isDefined(parent))
			return CoreLookAndFeel.drawScrollbar({});

		var properties = {
			bgColour: Colours.withAlpha(parent.get("itemColour"), 0.5),
			itemColour: parent.get("textColour"),
			radius: Style.userSettings.scrollbarRadius
		};		

		CoreLookAndFeel.drawScrollbar(properties);
	});
	
	//! lafAudioSettings
	const lafAudioSettings = Content.createLocalLookAndFeel();

	lafAudioSettings.registerFunction("drawComboBox", function(g, obj)
	{
		var lafOptions = {
			bgColour: cmbStreamingMode.get("bgColour"),
			textColour: cmbStreamingMode.get("textColour")
		};

		CoreLookAndFeel.drawComboBox(lafOptions);
	});
	
	lafAudioSettings.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return CoreLookAndFeel.getIdealPopupMenuItemSize();
	});
	
	lafAudioSettings.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuBackground({});
	});
	
	lafAudioSettings.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuItem({});
	});
	
	//! All Settings Panels
	const allSettingsPanels = getAllSettingsPanels();
	
	//! btnSettings
	const btnSettings = Content.getComponent("btnSettings");
	btnSettings.setLocalLookAndFeel(CoreLookAndFeel.iconButton);
	btnSettings.setControlCallback(onbtnSettingsControl);
	
	inline function onbtnSettingsControl(component, value)
	{
		if (!value)
			show();
	}	
	
	//! pnlSettingsContainer
	const pnlSettingsContainer = Content.getComponent("pnlSettingsContainer");
	
	pnlSettingsContainer.setPaintRoutine(function(g)
	{		
		var a = [pnlSettings.get("x"), pnlSettings.get("y"), pnlSettings.getWidth(), pnlSettings.getHeight()];		
		
		g.fillAll(Colours.withAlpha(Colours.black, 0.5));
		g.drawDropShadow(a, Colours.withAlpha(Colours.black, 0.6), 20);
	});

	//! pnlSettings
	const pnlSettings = SwitcherPanel.create("pnlSettings", "pnlSettingsMenu", "ScriptPanel", {});
	
	pnlSettings.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var radius = this.get("borderRadius");
		var menuWidth = vptSettingsMenu.getWidth() + vptSettingsMenu.get("x");

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);
		
		g.setColour(this.get("itemColour2"));
		g.drawRoundedRectangle(a, radius, 1);
		
		g.setFont(Style.userSettings.titleFont, Style.userSettings.titleFontSize);
		g.setColour(this.get("textColour"));
		g.drawAlignedText(this.get("text"), [a[0], a[1] + 10, menuWidth, 25], "centred");

		g.setColour(Colours.withAlpha(this.get("textColour"), 0.2));
		g.drawVerticalLine(menuWidth, 0, a[3]);

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	});
	
	pnlSettings.setConsumedKeyPresses({"keyCode": 27});

	pnlSettings.setKeyPressCallback(function(event)
	{
		if (!event.isFocusChange)
			hide();
	});
	
	//! vptSettingsMenu
	const vptSettingsMenu = Content.getComponent("vptSettingsMenu");	
	vptSettingsMenu.setLocalLookAndFeel(CoreLookAndFeel.viewport);
	
	//! pnlSettingsMenu
	const pnlSettingsMenu = Content.getComponent("pnlSettingsMenu");
	pnlSettingsMenu.data.hover = -1;
	pnlSettingsMenu.data.rowHeight = 40;
	pnlSettingsMenu.data.icons = {"ENGINE": "\uea80", "AUDIO": "\ue2a6", "MIDI I/O": "\ue9c8", "INSTRUMENT": "\ue434", "AUTOMATION": "\ueb56", "ABOUT": "\ue2ce"};

	pnlSettingsMenu.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var items = this.get("popupMenuItems").split("\n");
		var icons = this.data.icons;
		var rowHeight = this.data.rowHeight;
		var radius = this.get("borderRadius");

		for (i = 0; i < items.length; i++)
		{
			var y = rowHeight * i;

			if (this.data.hover == i || this.getValue() == i)
			{
				g.setColour(Colours.withMultipliedAlpha(this.get("itemColour"), this.data.hover == i && !(this.getValue() == i) ? 0.6 : 1.0));
				g.fillRoundedRectangle([a[0], y, a[2], rowHeight - 10], radius);
			}

			if (this.getValue() == i)
			{
				g.setColour(this.get("textColour"));
				g.fillRoundedRectangle([a[0], y, 5, rowHeight - 10], {CornerSize: radius, Rounded:[1, 0, 1, 0]});
			}

			g.setColour(Colours.withAlpha(this.get("textColour"), 0.8 + 0.2 * (this.getValue() == i)));

			var icon = icons[items[i]];

			if (!isDefined(icon))
				icon = "\ue13a";

			g.setFont("phosphorFill", 18);
			g.drawAlignedText(icon, [a[0] + 10, y, a[2], rowHeight - 10], "left");
			
			g.setFont(Style.userSettings.menuFont, Style.userSettings.menuFontSize);
			g.drawAlignedText(items[i], [a[0] + 38, y, a[2], rowHeight - 10], "left");
		}
	});
	
	pnlSettingsMenu.setMouseCallback(function(event)
	{
		var items = this.get("popupMenuItems").split("\n");
		var value = Math.floor(event.y / this.data.rowHeight);

		this.data.hover = event.hover ? value : -1;

		if (event.clicked && !event.rightClick)
		{
			this.setValue(value);
			this.changed();
			return;
		}

		this.repaint();
	});

	//! btnSettingsClose
	const btnSettingsClose = Content.getComponent("btnSettingsClose");
	btnSettingsClose.setLocalLookAndFeel(CoreLookAndFeel.iconButton);
	btnSettingsClose.setControlCallback(onbtnSettingsCloseControl);

	inline function onbtnSettingsCloseControl(component, value)
	{
		if (!value)
			hide();
	}
		
	//! pnlEngineSettingsContainer
	const pnlEngineSettingsContainer = Content.getComponent("pnlEngineSettingsContainer");
	pnlEngineSettingsContainer.setPaintRoutine(function(g){});

	//! vptEngineSettings
	const vptEngineSettings = Content.getComponent("vptEngineSettings");
	vptEngineSettings.setLocalLookAndFeel(CoreLookAndFeel.viewport);

	//! pnlEngineSettings
	const pnlEngineSettings = SettingsPanel.create("pnlEngineSettings", 40, {font: Style.userSettings.font, fontSize: Style.userSettings.fontSize});

	//! cmbStreamingMode
	const cmbStreamingMode = Content.getComponent("cmbStreamingMode");
	cmbStreamingMode.setControlCallback(oncmbStreamingModeControl);

	inline function oncmbStreamingModeControl(component, value)
	{
		Settings.setDiskMode(value);
	}

	//! cmbMaxVoices
	const cmbMaxVoices = Content.getComponent("cmbMaxVoices");
	cmbMaxVoices.setControlCallback(oncmbMaxVoicesControl);

	inline function oncmbMaxVoicesControl(component, value)
	{
		Settings.setVoiceMultiplier(value);
	}

	//! cmbZoom
	const cmbZoom = Content.getComponent("cmbZoom");

	//! knbGlobalBpm
	const knbGlobalBpm = Content.getComponent("knbGlobalBpm");
	knbGlobalBpm.set("enabled", !Engine.isPlugin());
	knbGlobalBpm.setControlCallback(onGlobalBpmControl);

	inline function onGlobalBpmControl(component, value)
	{
		if (!Engine.isPlugin())
			Engine.setHostBpm(value);
	}
		
	//! pnlAudioSettings
	const pnlAudioSettings = Content.getComponent("pnlAudioSettings");
	
	pnlAudioSettings.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);

		if (!Engine.isPlugin())
			return;

		g.setColour(this.get("textColour"));
		g.setFont(Style.userSettings.font, Style.userSettings.fontSize);
		g.drawAlignedText("Disabled in Plugin", [a[0] - 15, a[1], a[2], a[3] - 50], "centred");
	});	

	//! fltAudioSettings
	const fltAudioSettings = Content.getComponent("fltAudioSettings");
	fltAudioSettings.setLocalLookAndFeel(lafAudioSettings);
	fltAudioSettings.showControl(!Engine.isPlugin());

	//! pnlMidiSettings
	const pnlMidiSettings = Content.getComponent("pnlMidiSettings");
	
	pnlMidiSettings.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);

		g.setFont(Style.userSettings.font, Style.userSettings.fontSize);
		g.setColour(this.get("textColour"));
		g.drawAlignedText("INPUT CHANNELS", [a[0], a[1], a[2], 25], "left");

		if (!Engine.isPlugin())
			g.drawAlignedText("INPUT DEVICES", [a[0], 116, a[2], 25], "left");
	});
	
	//! pnlMidiChannels
	const pnlMidiChannels = Content.getComponent("pnlMidiChannels");
	pnlMidiChannels.setControlCallback(onpnlMidiChannelsControl);
	pnlMidiChannels.data.numCols = 8;
	pnlMidiChannels.data.numRows = 2;

	inline function onpnlMidiChannelsControl(component, value)
	{
		if (Settings.isMidiChannelEnabled(0))
			toggleAllMidiChannels(true);
		
		Settings.toggleMidiChannel(value + 1, !Settings.isMidiChannelEnabled(value + 1));
	}	

	pnlMidiChannels.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var font = fltMidiSources.get("Font");
		var fontSize = fltMidiSources.get("FontSize");
		var size = 14;

		for (i = 0; i < 16; i++)
		{
			var text = i + 1;
			var w = a[2] / this.data.numCols;
			var h = a[3] / this.data.numRows;
			var x = 2 + (i % this.data.numCols) * w;
			var y = (Math.floor(i / this.data.numCols) * h);
			var disc = Rectangle(x, y + h / 2 - 14 / 2, size, size);
			var isEnabled = Settings.isMidiChannelEnabled(i + 1) || Settings.isMidiChannelEnabled(0);
			var over = this.data.hover == i;
			var down = this.data.down == i;

			g.setColour(Colours.withAlpha(this.get("textColour"), isEnabled ? 1.0 : 0.8));
			g.drawEllipse(disc, 1);

			var alpha = (isEnabled ? 0.9 : 0.2) + (0.2 * over) - (0.2 * down);
			g.setColour(Colours.withAlpha(this.get("textColour"), alpha));
			g.fillEllipse(disc.reduced(3));

			g.setFont(font, fontSize);
			g.setColour(Colours.withAlpha(this.get("textColour"), isEnabled ? 1.0 : 0.8));
			g.drawAlignedText(text, [x + 22, y, w, h], "left");
		}
	});
	
	pnlMidiChannels.setMouseCallback(function(event)
	{
		var col = Math.floor(event.x / this.getWidth() * this.data.numCols);
		var row = Math.floor(event.y / this.getHeight() * this.data.numRows);
		var value = 1 * row * this.data.numCols + col;

		this.data.hover = event.hover ? value : -1;
		this.data.down = event.clicked ? value : -1;
		
		if (event.doubleClick)
			toggleAllMidiChannels(!Settings.isMidiChannelEnabled(value + 1));

		if (!event.mouseUp || event.rightClick)
			return this.repaint();

		this.setValue(value);
		this.changed();
	});

	//! fltMidiSources
	const fltMidiSources = Content.getComponent("fltMidiSources");
	fltMidiSources.setLocalLookAndFeel(lafMidiSettings);
	fltMidiSources.showControl(!Engine.isPlugin());

	//! pnlInstrumentSettingsContainer
	const pnlInstrumentSettingsContainer = Content.getComponent("pnlInstrumentSettingsContainer");
	pnlInstrumentSettingsContainer.setPaintRoutine(function(g){});

	//! vptInstrumentSettings
	const vptInstrumentSettings = Content.getComponent("vptInstrumentSettings");
	vptInstrumentSettings.setLocalLookAndFeel(CoreLookAndFeel.viewport);

	//! pnlInstrumentSettings
	const pnlInstrumentSettings = SettingsPanel.create("pnlInstrumentSettings", 40, {font: Style.userSettings.font, fontSize: Style.userSettings.fontSize});

	//! pnlMidiAutomation
	const pnlMidiAutomation = Content.getComponent("pnlMidiAutomation");
	pnlMidiAutomation.setPaintRoutine(function(g){});

	//! fltMidiAutomation
	const fltMidiAutomation = Content.getComponent("fltMidiAutomation");
	const laffltMidiAutomation = Content.createLocalLookAndFeel();
	fltMidiAutomation.setLocalLookAndFeel(laffltMidiAutomation);
	
	laffltMidiAutomation.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;
		var size = 12;
		var disc = Rectangle(a[2] / 2 - size / 2, a[3] / 2 - size / 2, size, size);

		g.setColour(Colours.withAlpha(obj.textColour, obj.value ? 1.0 : 0.8));
		g.drawEllipse(disc, 1);

		var alpha = (obj.value ? 0.9 : 0.2) + (0.2 * obj.over) - (0.2 * obj.down);
		g.setColour(Colours.withAlpha(obj.textColour, alpha));
		g.fillEllipse(disc.reduced(3));
	});
	
	laffltMidiAutomation.registerFunction("drawTableCell", function(g, obj)
	{
		var a = obj.area;
		var font = isDefined(Style.userSettings.automationRowFont) ? Style.userSettings.automationRowFont : obj.font;
		var fontSize = isDefined(Style.userSettings.automationRowFontSize) ? Style.userSettings.automationRowFontSize : obj.fontSize;
		
		g.setFont(font, fontSize);
		g.setColour(obj.textColour);
		g.drawAlignedText(obj.text, a.translated(10, 0), "left");
	});

	laffltMidiAutomation.registerFunction("drawTableHeaderBackground", function(g, obj)
	{
		var a = obj.area;
		g.setColour(obj.itemColour);
		g.fillRoundedRectangle(a, {CornerSize: 5, Rounded:[1, 1, 0, 0]});
	});
	
	laffltMidiAutomation.registerFunction("drawTableHeaderColumn", function(g, obj)
	{
		var a = obj.area;

		g.setColour(obj.textColour);
		g.setFont(obj.font, obj.fontSize);
		g.drawAlignedText(obj.text, a.translated(10), "left");

	});
	
	laffltMidiAutomation.registerFunction("drawTableRowBackground", function(g, obj)
	{
		var a = obj.area;
		var c = Colours.withMultipliedBrightness(obj.itemColour2, obj.selected ? 2.0 : 1.0);

		g.setColour(Colours.withAlpha(c, obj.selected ? 1.0 : (obj.rowIndex % 2 == 0 ? 0.2 : 0.5)));
		g.fillRect(a);
	});

	laffltMidiAutomation.registerFunction("drawLinearSlider", function(g, obj)
	{
		var a = obj.area;
		var font = isDefined(Style.userSettings.automationRowFont) ? Style.userSettings.automationRowFont : obj.font;
		var fontSize = isDefined(Style.userSettings.automationRowFontSize) ? Style.userSettings.automationRowFontSize : obj.fontSize;

		g.setColour(obj.itemColour3);
		g.fillRoundedRectangle(a.reduced(2, 3), 2);

		g.setColour(Colours.withAlpha(obj.textColour, 0.5));
		g.fillRoundedRectangle(a.scaled(obj.valueNormalized, 1).reduced(2, 3), 2);
		
		g.setFont(font, fontSize - 2);
		g.setColour(obj.textColour);
		g.drawAlignedText(parseInt(obj.value), a, "centred");
	});

	laffltMidiAutomation.registerFunction("drawScrollbar", function(g, obj)
	{
		var properties = {
			bgColour: Colours.withMultipliedBrightness(obj.itemColour1, 0.5),
			itemColour: obj.textColour,
			radius: Style.presets.scrollbarRadius
		};

		CoreLookAndFeel.drawScrollbar(properties);
	});
	
	//! pnlSettingsAbout
	const pnlSettingsAbout = Content.getComponent("pnlSettingsAbout");
	
	pnlSettingsAbout.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var info = getAboutInfo();
	
		// Product/Company info
		var text = "";
		text += info.projectName + " v" + info.projectVersion + "\r\n";
		text += "Build Date: " + info.BuildDate + "\r\n";
		text += info.CompanyURL + "\r\n";		
		text += info.CompanyCopyright.replace("(c)", "\u00a9");

		g.setFont(Style.userSettings.font, Style.userSettings.fontSize);
		g.setColour(this.get("textColour"));
		g.drawMultiLineText(text, [a[0], a[1] + 20], a[2] - 50, "left", 10.0);
	});
	
	//! Functions	
	inline function: Array getAllSettingsPanels()
	{
		local result = [];
		
		for (x in Content.getAllComponents(".*pnl.*Settings.*"))
		{
			local id = x.getId();

			if (!id.contains("Menu") && !id.contains("Container"))
				result.push(x);
		}
		
		return result;
	}

	inline function toggleAllMidiChannels(state)
	{
		Settings.toggleMidiChannel(0, false);

		for (i = 0; i < 16; i++)
		{
			Settings.toggleMidiChannel(i + 1, state);
		}
	}

	inline function populateMenuItems()
	{
		local items = [];
	
		for (x in pnlSettings.getChildComponents())
		{
			if (x.get("parentComponent") != "pnlSettings")
				continue;

			if (x.get("type") != "ScriptPanel")
				continue;
				
			if (x.getId() == "pnlSettingsMenu")
				continue;

			items.push(x.get("text"));
		}

		pnlSettingsMenu.set("height", items.length * pnlSettingsMenu.data.rowHeight);		
		pnlSettingsMenu.set("popupMenuItems", items.join("\n"));
	}
	
	inline function setMenuIcon(menuItem: string, iconCodePoint: string)
	{
		pnlSettingsMenu.data.icons[menuItem] = iconCodePoint;
	}
	
	inline function: object getAboutInfo()
	{		
		local e = Expansions.getCurrentExpansion();
		local result = Engine.getProjectInfo();
		
		result.projectName = isDefined(e) ? e.getProperties().Name : Engine.getName();
		result.projectVersion = isDefined(e) ? e.getProperties().Version : Engine.getVersion();
	
		return result;
	}
		
	/**
	* Store a key value pair in the AppData/UserSettings.json file.
	* 
	* @scope	string    	The scope that the value affects. For global settings use "rhapsody".
	*					  	For project specific settings use the project's name or a unique id.
	* @key		string	  	The key that the value is associated with
	* @value	string/int	The value to store
	*/
	inline function setProperty(scope: string, key: string, value: Colour)
	{
		local obj = {};
		local f = FileSystem.getFolder(FileSystem.AppData).getChildFile("UserSettings.json");

		if (isDefined(f) && f.isFile())
			obj = f.loadAsObject();
	
		if (!isDefined(obj[scope]))
			obj[scope] = {};

		obj[scope][key] = value;

		f.writeObject(obj);
   }

	/**
	* Store a key value pair in the AppData/UserSettings.json file.
	* 
	* @scope	string    The scope that the value affects. For global settings use "rhapsody".
	*                     For project specific settings use the project's name or a unique id.
	* @key		string    The key for the value you want to retrieve.
	*
	* @return		      The value that matches the scope and key, or undefined
	*/
	inline function getProperty(scope: string, key: string)
	{
		local obj = getScopedPropertiesFromFile(scope);		
		return obj[key];
	}

	inline function: ComplexType getScopedPropertiesFromFile(scope: string)
	{
		local obj = {};
		local dir = FileSystem.getFolder(FileSystem.AppData).getParentDirectory().getParentDirectory().createDirectory("Libre Wave").createDirectory("Rhapsody");
		local f = dir.getChildFile("UserSettings.json");

		if (isDefined(f) && f.isFile())
			obj = f.loadAsObject();

		if (isDefined(obj[scope]))
			return obj[scope];

		return {};
	}

	inline function show()
	{
		pnlSettingsContainer.fadeComponent(true, 100);
	}
	
	inline function hide()
	{
		pnlSettingsContainer.fadeComponent(false, 100);
	}

	inline function restoreEngineSettings()
	{
		local obj = getScopedPropertiesFromFile("rhapsody");

		for (x in Content.getAllComponents(""))
		{
			if (x.get("parentComponent") != "pnlEngineSettings")
				continue;

			local value = obj[x.get("text")];

			if (!isDefined(value))
				continue;

			x.setValue(value);
		}

		settingsLoaded = true;
	}

	//! Tranport handler
	const transportHandler = Engine.createTransportHandler();
	
	if (Engine.isPlugin())
	{
		transportHandler.setOnTempoChange(false, function(newTempo)
		{
			knbGlobalBpm.setValue(newTempo);
		});
	}

	//! Broadcasters

	//! Engine setting changed broadcaster
	const bcEngineSettingChanged = Engine.createBroadcaster({"id": "UserSettings", "args": ["component", "value"]});	
	
	bcEngineSettingChanged.attachToComponentValue(["cmbStreamingMode", "cmbMaxVoices", "knbGlobalBpm", "btnTooltips"], "");
	bcEngineSettingChanged.addListener(0, "Engine Setting Changed", function(component, value)
	{
		if (!settingsLoaded)
			return restoreEngineSettings();

		if (component.get("parentComponent") != "pnlEngineSettings")
			return;

		setProperty("rhapsody", component.get("text"), value);
	});

	//! Function Calls
	restoreEngineSettings();
	populateMenuItems();
}
