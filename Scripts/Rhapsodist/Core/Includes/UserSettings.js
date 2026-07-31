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
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	reg settingsLoaded = false; // Flag to make sure settings are loaded before broadcaster triggers
	
	//! Look and Feel
	const lafMidiSettings = Content.createLocalLookAndFeel();
	
	lafMidiSettings.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;
		var size = 14;
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;
		var thickness = 2;
		var disc = Rectangle(a[0] + thickness / 2, a[3] / 2 - size / 2, size, size);
	
		g.setColour(Colours.withAlpha(obj.textColour, obj.value ? 1.0 : 0.8));
		g.drawEllipse(disc, thickness);
		
		var alpha = (obj.value ? 0.9 : 0.2) + (0.2 * obj.over) - (0.2 * obj.down);
		g.setColour(Colours.withAlpha(obj.textColour, alpha));
		g.fillEllipse(disc.reduced(thickness * 1.5));
	
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
			return CoreLookAndFeel.drawScrollbar();

		obj.bgColour = Colours.withAlpha(parent.get("itemColour"), 0.5);
		obj.itemColour = parent.get("textColour");

		CoreLookAndFeel.drawScrollbar();
	});

	//! lafAudioSettings
	const lafAudioSettings = Content.createLocalLookAndFeel();

	lafAudioSettings.registerFunction("drawComboBox", function(g, obj)
	{
		obj.bgColour = cmbStreamingMode.get("bgColour");
		obj.textColour = cmbStreamingMode.get("textColour");

		CoreLookAndFeel.drawComboBox();
	});

	lafAudioSettings.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return CoreLookAndFeel.getIdealPopupMenuItemSize();
	});
	
	lafAudioSettings.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuBackground();
	});
	
	lafAudioSettings.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuItem();
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
	
	pnlSettingsContainer.setMouseCallback(function()
	{
		hide();
	});

	//! pnlSettings
	const pnlSettings = SwitcherPanel.create("pnlSettings", "pnlSettingsMenu", "ScriptPanel", {});

	pnlSettings.setPaintRoutine(function(g)
	{
		if (isDefined(LookAndFeel.drawSettingsPanel))
			return LookAndFeel.drawSettingsPanel();

		var a = this.getLocalBounds(0);
		var radius = this.get("borderRadius");
		var borderSize = this.get("borderSize");
		var menuWidth = vptSettingsMenu.getWidth() + vptSettingsMenu.get("x");
		var font = fonts.semibold;
		var fontSize = 18 + fonts.size;

		if (isDefined(LookAndFeel.drawSettingsPanelBackground))
		{
			LookAndFeel.drawSettingsPanelBackground();
		}
		else
		{
			g.setColour(this.get("bgColour"));
			g.fillRoundedRectangle(a, radius);

			g.setColour(this.get("itemColour2"));
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);
		}

		g.setFont(font, fontSize);
		g.setColour(this.get("textColour"));
		g.drawAlignedText(this.get("text"), [a[0], a[1] + 10, menuWidth, 25], "centred");

		g.setColour(Colours.withAlpha(this.get("textColour"), 0.2));
		g.drawVerticalLine(menuWidth, 0 + borderSize, a[3] - borderSize);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
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
	pnlSettingsMenu.data.icons = {"ENGINE": "\uea80", "AUDIO": "\ue2a6", "MIDI I/O": "\ue956", "INSTRUMENT": "\ue9c8", "AUTOMATION": "\ue6D4", "ABOUT": "\ue2ce"};

	pnlSettingsMenu.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var items = this.data.items;
		var icons = this.data.icons;
		var rowHeight = this.data.rowHeight;
		var radius = this.get("borderRadius");
		var font = fonts.semibold;
		var fontSize = 16 + fonts.size;
		var featureColour = (isDefined(style.featureColour) && this.get("itemColour2") == 0x0) ? style.featureColour : this.get("itemColour2");

		for (i = 0; i < items.length; i++)
		{
			var y = rowHeight * i;

			if (this.data.hover == i || this.getValue() == i)
			{
				g.setColour(Colours.withMultipliedAlpha(this.get("itemColour"), this.data.hover == i && !(this.getValue() == i) ? 0.6 : 1.0));
				g.fillRoundedRectangle([a[0], y, a[2], rowHeight - 10], radius);
				
				if (!isDefined(style.useNoise) || style.useNoise)
					g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: [a[0], y, a[2], rowHeight - 10], monochromatic: true});
			}

			if (this.getValue() == i)
			{
				g.setColour(featureColour);
				g.fillRoundedRectangle([a[0], y, 5, rowHeight - 10], {CornerSize: radius, Rounded:[1, 0, 1, 0]});
				
				if (!isDefined(style.useNoise) || style.useNoise)
					g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: [a[0], y, 5, rowHeight - 10], monochromatic: true});
			}

			g.setColour(Colours.withAlpha(this.get("textColour"), 0.8 + 0.2 * (this.getValue() == i)));

			var icon = icons[items[i]];

			if (!isDefined(icon))
				icon = "\ue13a";

			g.setFont("phosphorFill", 18);
			g.drawAlignedText(icon, [a[0] + 10, y, a[2], rowHeight - 10], "left");
			
			g.setFont(font, fontSize);
			g.drawAlignedText(items[i], [a[0] + 38, y, a[2], rowHeight - 10], "left");
		}
	});

	pnlSettingsMenu.setMouseCallback(function(event)
	{
		var items = this.data.items;
		var value = Math.floor(event.y / this.data.rowHeight);

		this.data.hover = event.hover ? value : -1;

		if (event.clicked && !event.rightClick)
			return this.setValue(value);

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
	const pnlEngineSettings = SettingsPanel.create("pnlEngineSettings", 40, {});

	//! cmbStreamingMode
	const cmbStreamingMode = Content.getComponent("cmbStreamingMode");
	cmbStreamingMode.setControlCallback(oncmbStreamingModeControl);

	inline function oncmbStreamingModeControl(component, value)
	{
		Settings.setDiskMode(value - 1);
	}

	//! cmbMaxVoices
	const cmbMaxVoices = Content.getComponent("cmbMaxVoices");
	cmbMaxVoices.setControlCallback(oncmbMaxVoicesControl);

	inline function oncmbMaxVoicesControl(component, value)
	{
		Settings.setVoiceMultiplier(value);
	}
	
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
		if (!Engine.isPlugin())
			return;

		var a = this.getLocalBounds(0);
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;

		g.setColour(this.get("textColour"));
		g.setFont(font, fontSize);
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
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;

		g.setFont(font, fontSize);
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
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;
		var size = 14;
		var thickness = 2;

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
			g.drawEllipse(disc, thickness);

			var alpha = (isEnabled ? 0.9 : 0.2) + (0.2 * over) - (0.2 * down);
			g.setColour(Colours.withAlpha(this.get("textColour"), alpha));
			g.fillEllipse(disc.reduced(thickness * 1.5));

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
	const pnlInstrumentSettings = SettingsPanel.create("pnlInstrumentSettings", 40, {});
	
	//! pnlSettingsAbout
	const pnlSettingsAbout = Content.getComponent("pnlSettingsAbout");

	pnlSettingsAbout.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var font = fonts.medium;
		var fontSize = 16 + fonts.size;
		var info = getAboutInfo();
	
		// Product/Company info
		var text = "";
		text += info.projectName + " v" + info.projectVersion + "\r\n";
		text += "Build Date: " + info.BuildDate + "\r\n";
		text += info.CompanyURL + "\r\n";		
		text += info.CompanyCopyright.replace("(c)", "\u00a9");

		g.setFont(font, fontSize);
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
		pnlSettingsMenu.data.items = items;
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
		local f = FileSystem.getFolder(FileSystem.AppData).getChildFile("UserSettings.json");

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
		local defaults = {"Max Voices": 4.0, "Disk Mode": 1.0, "BPM": 120};
		local scope = Engine.getName().replace(" ", "_").toLowerCase();
		local obj = getScopedPropertiesFromFile(scope);
			
		for (x in Content.getAllComponents(""))
		{
			local id = x.get("text");

			if (!isDefined(obj[id]) && !isDefined(defaults[id]))
				continue;

			local value = isDefined(obj[id]) ? obj[id] : defaults[id];

			if (isDefined(value))
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
	const bcEngineSettingChanged = Engine.createBroadcaster({id: "UserSettings", args: ["component", "value"]});
	
	bcEngineSettingChanged.attachToComponentValue(["cmbStreamingMode", "cmbMaxVoices", "knbGlobalBpm", "btnTooltips"], "");
	bcEngineSettingChanged.addListener(0, "Engine Setting Changed", function(component, value)
	{
		if (!settingsLoaded)
			return restoreEngineSettings();

		if (component.get("parentComponent") != "pnlEngineSettings" && component.getId() != "knbGlobalBpm")
			return;

		setProperty(Engine.getName().replace(" ", "_").toLowerCase(), component.get("text"), value);
	});

	//! Function Calls
	populateMenuItems();
}
