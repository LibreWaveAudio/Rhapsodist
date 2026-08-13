/*
	Copyright 2025, 2026 David Healey

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

namespace EqPanel
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	inline function create(panelId: string, effectId: string, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		
		for (x in options)
			panel.data[x] = options[x];

		local tile = createFloatingTile(panel, effectId, options);
		local displayPanel = createDisplayPanel(panel, tile, options);

		local effect = Synth.getEffect(effectId);
		local dbs = Synth.getDisplayBufferSource(effectId);
		Engine.addModuleStateToUserPreset(effectId);

		setEqProperties(dbs, isDefined(options.displayBufferProperties) ? displayBufferProperties : {});
		
		panel.data.bc = addBroadcasters(displayPanel, tile.getId(), effect);		
		panel.data.tile = tile;
		panel.data.effect = effect;
		panel.data.dbs = dbs;
	}
	
	//! Functions
	inline function: ScriptObject createFloatingTile(parentPanel: ScriptObject, effectId: string, options: JSON)
	{
		local id = parentPanel.getId().replace("pnl", "flt");
		local componentExists = Content.componentExists(id);
		local tile = Content.addFloatingTile(id);
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 0,
				y: 0,
				width: parentPanel.getWidth(),
				height: parentPanel.getHeight(),
				parentComponent: parentPanel.getId(),
				bgColour: 0x0,
				itemColour3: 0x55ffffff,
				ContentType: "DraggableFilterPanel",
				Data: "{\n  \"ProcessorId\": \"" + effectId + "\",\n  \"Index\": -1,\n  \"FollowWorkspace\": false,\n  \"AllowFilterResizing\": true,\n  \"AllowDynamicSpectrumAnalyser\": 0,\n  \"UseUndoManager\": false,\n  \"ResetOnDoubleClick\": true,\n  \"GainRange\": 24.0,\n  \"AllowContextMenu\": true\n}"
			});
		}

		tile.setLocalLookAndFeel(laf);
		return tile;
	}
	
	inline function: ScriptObject createDisplayPanel(parentPanel: ScriptObject, tile: ScriptObject, options: JSON)
	{
		local id = parentPanel.getId() + "Display";
		local componentExists = Content.componentExists(id);
		local panel = Content.addPanel(id);
		panel.data.values = [];

		Content.setPropertiesFromJSON(id, {
			parentComponent: parentPanel.getId(),
			x: 0,
			y: tile.getHeight() - 30,
			width: tile.getWidth(),
			height: 30,
			bgColour: 0x0,
			itemColour: 0x0,
			itemColour2: 0x0,
			enabled: false,
			visible: false
		});

		panel.setTimerCallback(function()
		{
			this.showControl(false);
			this.stopTimer();
		});
	
		panel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			
			g.setFont(fonts.medium, 16 + fonts.size);					
			g.setColour(this.get("textColour"));
			g.drawAlignedText(this.get("text"), a, "centred");
		});

		return panel;
	}
	
	inline function addBroadcasters(displayPanel: ScriptObject, tileId: string, effect: ScriptObject)
	{		
		local bcEqWatcher = Engine.createBroadcaster({id: tileId.replace("flt") + "EqWatcher", args: ["eventType", "value"]});
		bcEqWatcher.attachToEqEvents(effect.getId(), ["BandMoved", "QChanged", "MouseOver"], "");
		bcEqWatcher.setEnableQueue(true);

		bcEqWatcher.addListener({"effect": effect, "displayPanel": displayPanel}, "Watch for EQ panel changes", function(eventType, value)
		{
			var index = isDefined(value.Index) ? value.Index : value;

			var offsets = [];
			offsets.push(index * this.effect.BandOffset + this.effect.Gain);
			offsets.push(index * this.effect.BandOffset + this.effect.Freq);
			offsets.push(index * this.effect.BandOffset + this.effect.Q);
			
			var suffix = ["dB", "Hz", "Q"];
			var text = "";
				
			for (i = 0; i < offsets.length; i++)
			{
				var param = this.effect.getAttribute(offsets[i]);
				
				param = i < 2 ? Math.round(param) : Engine.doubleToString(param, 1);

				text += param + suffix[i];

				if (i < offsets.length - 1)
					text += " | ";
			}

			this.displayPanel.set("text", text);
			this.displayPanel.repaint();
			
			if (eventType == "MouseOver")
				this.displayPanel.showControl(value.Over);
		});

		return bcEqWatcher;
	}
	
	inline function setEqProperties(displayBufferSource, properties)
	{
		local props = {
			"BufferLength": 2048,
			"WindowType": "Blackman Harris",
			"DecibelRange": [-100.0, 0.0],
			"UsePeakDecay": false,
			"UseDecibelScale": true,
			"YGamma": 1.0,
			"Decay": 0.6,
			"UseLogarithmicFreqAxis": true
		};
		
		for (x in properties)
			props[x] = properties[x];
			
		local dp = displayBufferSource.getDisplayBuffer(0);
		dp.setRingBufferProperties(props);
	}	

	//! Look and Feel
	const laf = Content.createLocalLookAndFeel();

	laf.registerFunction("drawFilterBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFilterBackground))
			return LookAndFeel.drawFilterBackground();
	});

	laf.registerFunction("drawFilterDragHandle", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFilterDragHandle))
			return LookAndFeel.drawFilterDragHandle();

		var a = obj.handle;
		var c = Colours.withAlpha(obj.itemColour2, obj.enabled ? 0.8 : 0.5);
		
		g.setColour(Colours.withMultipliedAlpha(c, obj.hover ? 0.7 : 0.4));
		g.fillEllipse(a.reduced(2));
		
		g.setColour(Colours.withMultipliedAlpha(c, obj.hover ? 1.0 : 0.8));
		g.fillEllipse(a.reduced(6));
	});

	laf.registerFunction("drawFilterPath", function(g, obj)
	{
		 if (isDefined(LookAndFeel.drawFilterPath))
		 	return LookAndFeel.drawFilterPath();

		var a = obj.pathArea;

		if (a[3] == 0) // No filter nodes
		{
			g.setColour(obj.textColour);
			return g.drawLine(obj.area[0], obj.area[2], obj.area[3] / 2, obj.area[3] / 2, 2);
		}			
		
		if (obj.enabled)
			g.setGradientFill([Colours.withMultipliedAlpha(obj.itemColour1, 0.8), a[2] / 2, a[1], Colours.withMultipliedAlpha(obj.itemColour1, 0.1), a[2] / 2, a[3]]);
		else
			g.setColour(Colours.withMultipliedAlpha(obj.itemColour1, 0.5));
		
		g.fillPath(obj.path, a);

		g.setColour(obj.textColour);
		g.drawPath(obj.path, a, 2);
	});
	
	laf.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawEqPopupMenuBackground))
			return LookAndFeel.drawEqPopupMenuBackground();

		return CoreLookAndFeel.drawPopupMenuBackground();
	});

	laf.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawEqPopupMenuItem))
			return LookAndFeel.drawEqPopupMenuItem();

		var a = obj.area;
		var itemColour2 = style.popupMenu.itemColour2;
		var textColour = style.popupMenu.textColour;
		var textOffsetY = style.popupMenu.textOffsetY;
		var font = style.popupMenu.font;
		var fontSize = style.popupMenu.fontSize + style.fonts.size;
		var iconFont = style.popupMenu.iconFont;
		var iconFontSize = style.popupMenu.iconFontSize;
		var radius = style.popupMenu.itemRadius;	
		var text = obj.text;

		var filterIcons = {
			"Low Pass": "f133",
			"High Pass": "f132",
			"Low Shelf": "f138",
			"High Shelf": "f137",
			"Peak": "f12f"
		};
		
		var icons = {		
			"Delete Band": "e4a8",
			"Delete all bands": "e4a8",
			"Enable Band": "e184",
			"Disable Band": "e3de",
			"Disable all bands": "e3de",
			"Enable all bands": "e184",
			"Enable Spectrum Analyser": "e802",
			"Disable Spectrum Analyser": "e800",
			"Cancel": "e4f8"
		};

		if (obj.isSeparator)
		{
			g.setColour(Colours.withAlpha(textColour, 0.3));
			g.drawHorizontalLine(a[3] / 2, a[0] + 5, a[2] - 10);
			return;
		}

		if (obj.text == "Enable Band" && obj.isTicked)
			text = "Disable Band";
			
		if (obj.text == "Enable Spectrum Analyser" && obj.isTicked)
			text = "Disable Spectrum Analyser";
			
		if (obj.isHighlighted || (obj.isTicked && !text.contains("Disable")))
		{
			g.setColour(Colours.withMultipliedAlpha(itemColour2, obj.isHighlighted && !obj.isTicked ? 0.6 : 1.0));
			g.fillRoundedRectangle(a.reduced(5, 2), radius);
		}
		
		if (obj.isSectionHeader)
			g.setFont(style.fonts.bold, fontSize);
		else
			g.setFont(font, fontSize);

		g.setColour(Colours.withMultipliedAlpha(textColour, obj.isHighlighted ? 1.0 : 0.9));
		g.drawAlignedText(text.capitalize(), a.translated(40, textOffsetY), "left");

		var icon = "";

		if (isDefined(filterIcons[text]))
		{
			g.setFont("fontaudio", iconFontSize);
			icon = filterIcons[text];
		}
		else if (isDefined(icons[text]))
		{
			g.setFont("phosphor", iconFontSize);
			icon = icons[text];
		}

		g.drawAlignedText(String.fromCharCode(icon), a.translated(10, 0), "left");

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	});

	laf.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		var padding = 25;
		return CoreLookAndFeel.getIdealPopupMenuItemSize();
	});

	laf.registerFunction("drawAnalyserPath", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAnalyserPath))
			return LookAndFeel.drawAnalyserPath();

		var a = obj.area;

		g.setGradientFill([Colours.withMultipliedAlpha(obj.itemColour1, 0.8), 0, 0, 0x0, 0, a[3]]);
		g.fillPath(obj.path, obj.pathArea);
	});
	
	laf.registerFunction("drawAnalyserGrid", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAnalyserGrid))
			return LookAndFeel.drawAnalyserGrid();
	});
	
	laf.registerFunction("drawAnalyserBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAnalyserBackground))
			return LookAndFeel.drawAnalyserBackground();
	});
}
