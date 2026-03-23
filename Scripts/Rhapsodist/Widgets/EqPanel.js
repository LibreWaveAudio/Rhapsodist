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

namespace EqPanel
{
	const filterIcons = {"LowPass": "\uf133", "HighPass": "\uf132", "LowShelf": "\uf138", "HighShelf": "\uf137", "Peak": "\uf12f"};

	//! Functions
	inline function create(panelId: string, effectId: string, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		local effect = Synth.getEffect(effectId);
		local dbs = Synth.getDisplayBufferSource(effectId);

		Engine.addModuleStateToUserPreset(effectId);
		
		for (x in options)
			panel.data[x] = options[x];

		// Tile
		local tileId = panelId.replace("pnl", "flt");
		local tile;
		
		if (!Content.componentExists(tileId))
		{
			tile = Content.addFloatingTile(panelId.replace("pnl", "flt"), 0, 0);

			tile.setContentData({
				Type: "DraggableFilterPanel",
				ProcessorId: effectId,
				ResetOnDoubleClick: true
			});			
		}
		else
		{
			tile = Content.getComponent(tileId);
		}		
		
		tile.setLocalLookAndFeel(lafEq);

		Content.setPropertiesFromJSON(tile.getId(), {
			parentComponent: panelId,
			width: panel.getWidth(),
			height: panel.getHeight()
		});
		
		// Display panel
		local displayPanel = Content.addPanel(panelId + "Display", 0, 0);
		displayPanel.data.values = [];

		displayPanel.setTimerCallback(function()
		{
			this.showControl(false);		
			this.stopTimer();
		});
		
		Content.setPropertiesFromJSON(displayPanel.getId(), {
			parentComponent: panelId,
			x: 0, y: tile.getHeight() - 30, width: tile.getWidth(), height: 15,
			enabled: false,
			visible: false
		});
				
		displayPanel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			
			g.setFont("regular", 14);					
			g.setColour(this.get("textColour"));
			g.drawAlignedText(this.get("text"), a, "centred");
		});	
		
		setEqProperties(dbs, isDefined(options.displayBufferProperties) ? displayBufferProperties : {});
		
		panel.data.bc = addBroadcasters(displayPanel, tile.getId(), effect);		
		panel.data.tile = tile;
		panel.data.effect = effect;
		panel.data.dbs = dbs;
	}
	
	//! Functions	
	inline function addBroadcasters(displayPanel, tileId, effect)
	{
		local result = {};
		
		// Broadcaster definition
		local bcEqWatcher = Engine.createBroadcaster({id: tileId.replace("flt") + "EqWatcher", args: ["eventType", "value"]});
		
		bcEqWatcher.attachToEqEvents(effect.getId(), ["BandMoved", "QChanged", "MouseOver"], "");
		bcEqWatcher.setEnableQueue(true);
		
		// attach first listener
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

		return result;
	}
	
	inline function setEqProperties(displayBufferSource, properties)
	{
		local props = {
			"BufferLength": 4096,
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

	//! lafEq
	const lafEq = Content.createLocalLookAndFeel();
	
	lafEq.registerFunction("drawFilterBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFilterBackground))
			LookAndFeel.drawFilterBackground();
	});

	lafEq.registerFunction("drawFilterDragHandle", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFilterDragHandle))
			LookAndFeel.drawFilterDragHandle();
		else
			drawFilterDragHandle();
	});

	inline function drawFilterDragHandle()
	{
		local a = obj.handle;
		local c = Colours.withAlpha(obj.itemColour2, obj.enabled ? 0.8 : 0.5);

		g.setColour(Colours.withMultipliedAlpha(c, obj.hover ? 0.7 : 0.4));
		g.fillEllipse(a);

		g.setColour(Colours.withMultipliedAlpha(c, obj.hover ? 1.0 : 0.8));
		g.fillEllipse(a.reduced(4));
	}

	lafEq.registerFunction("drawFilterPath", function(g, obj)
	{
		 if (isDefined(LookAndFeel.drawFilterPath))
		 	LookAndFeel.drawFilterPath();
		 else
		 	drawFilterPath();
	});

	inline function drawFilterPath()
	{
		local a = obj.pathArea;

		g.setColour(Colours.withMultipliedAlpha(obj.itemColour1, obj.enabled ? 1.0 : 0.5));
		g.fillPath(obj.path, a);

		g.setColour(Colours.withAlpha(obj.textColour, 1));
		g.drawPath(obj.path, a, 2);
	}
	
	lafEq.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawEqPopupMenuBackground))
			LookAndFeel.drawEqPopupMenuBackground();
		else
			g.fillAll(0xff2b2b2b);
	});
	
	lafEq.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawEqPopupMenuItem))
			LookAndFeel.drawEqPopupMenuItem();
		else
			drawPopupMenuItem();
	});
	
	inline function drawPopupMenuItem()
	{
		local a = obj.area;
		local text = obj.text;
		local icons = {"Delete Band": "\ue4a8", "Delete all bands": "\ue4a8", "Enable Band": "\ue184", "Disable Band": "\ue3de", "Enable Spectrum Analyser": "\ue802", "Disable Spectrum Analyser": "\ue800", "Cancel": "\ue4f8"};
		
		if (obj.isSeparator)
		{
			g.setColour(0xffcccccc);
			g.drawHorizontalLine(a[3] / 2, a[0] + 5, a[2] - 10);
			return;
		}		
		
		if (obj.text == "Enable Band" && obj.isTicked)
			text = "Disable Band";
			
		if (obj.text == "Enable Spectrum Analyser" && obj.isTicked)
			text = "Disable Spectrum Analyser";
		
		if (obj.isHighlighted)
			g.fillAll(Colours.withAlpha(0xffcccccc, 0.15));
		
		g.setColour(Colours.withMultipliedBrightness(0xffcccccc, obj.isHighlighted || obj.isSectionHeader ? 1.0 : 0.9));
				
		if (isDefined(filterIcons[text.replace(" ")]))
		{
			g.setFont("fontaudio", 20);
			g.drawAlignedText(filterIcons[text.replace(" ")], [a[0] + 5, a[1], 20, a[3]], "left");
		}
		else if (isDefined(icons[text]))
		{
			g.setFont("phosphor", 20);
			g.drawAlignedText(icons[text], [a[0] + 5, a[1], 20, a[3]], "left");			
		}

		if (obj.isSectionHeader)
			g.setFont("bold", 16);
		else
			g.setFont("regular", 16);

		g.drawAlignedText(text.capitalize(), [a[0] + 35, a[1], a[2], a[3]], "left");		
	}
	
	lafEq.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		if (isDefined(LookAndFeel.getIdealPopupMenuItemSize))
			return LookAndFeel.getIdealPopupMenuItemSize();
			
		var fontSize = 16;	
		return [CoreLookAndFeel.getIdealPopupMenuItemWidth() + 25, 25];
	});
	
	lafEq.registerFunction("drawAnalyserPath", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAnalyserPath))
			LookAndFeel.drawAnalyserPath();
		else
			drawAnalyserPath();
	});
	
	inline function drawAnalyserPath()
	{
		local a = obj.pathArea;

		g.setGradientFill([obj.itemColour1, 0, 0, 0x0, 0, a[3]]);
		g.fillPath(obj.path, a);
	}
	
	lafEq.registerFunction("drawAnalyserGrid", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAnalyserGrid))
			LookAndFeel.drawAnalyserGrid();
		else
			drawAnalyserGrid();
	});
	
	inline function drawAnalyserGrid() {}
	
	lafEq.registerFunction("drawAnalyserBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAnalyserBackground))
			LookAndFeel.drawAnalyserBackground();
		else
			drawAnalyserBackground();
	});
	
	inline function drawAnalyserBackground() {}
}