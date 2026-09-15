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
@description: Create a UI for displaying articulations in a list, along with keyswitches and per articulation volume control.
@entry: create().
@note: Module tree should contain ArticulationGain.js module with ID "articulationGain" - this is used by the gain sliders.
@dependencies: ListPanel.js, ArticulationSwitcher.js
*/

namespace ArticulationList
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	inline function: object create(panelId: string, options: JSON)
	{
		if (!checkRequirements())
			return {};

		local panel = Content.getComponent(panelId);		
		local componentExists = Content.componentExists("pnlArticulationListContainer");

		//! pnlArticulationListContainer
		local pnlArticulationListContainer = createListContainer(panel, options);

		//! vptArticulationList
		local vptArticulationList = pnlArticulationListContainer.data.viewport;
		vptArticulationList.setLocalLookAndFeel(laf);
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON("vptArticulationList", {
				borderSize: 0,			
				borderRadius: 2
			});
		}

		//! pnlArticulationList
		local pnlArticulationList = pnlArticulationListContainer.data.listPanel;
		pnlArticulationList.setControlCallback(onpnlArticulationListControl);
		
		pnlArticulationList.setPaintRoutine(function(g) {
			drawArticulationList();
		});

		addStyleToArticulationList(pnlArticulationList);

		if (!componentExists)
		{
			Content.setPropertiesFromJSON("pnlArticulationList", {
				borderSize: 0,			
				borderRadius: 2
			});
		}

		//! slpArticulationGain
		local slpArticulationGain = Content.addSliderPack("slpArticulationGain", 0, 0);
		slpArticulationGain.set("parentComponent", "pnlArticulationListContainer");
		slpArticulationGain.set("sliderAmount", 100);
		slpArticulationGain.set("min", 0.5);
		slpArticulationGain.set("processorId", "articulationGain");
		slpArticulationGain.showControl(false);
		
		pnlArticulationList.data.sliderPack = slpArticulationGain;
		
		//! Listeners
		bcPatchChanged.addListener(pnlArticulationList, "Patch change listener", function(component, value)
		{
			var patch = Manifest.patches[value];
		
			if (!isDefined(patch))
				return;

			var articulations = ArticulationDataManager.getAllArticulations();
		
			if (!isDefined(articulations) || !Array.isArray(articulations))
				return;

			ListPanel.setItems(this, articulations);
			createGainSliders(this);
		});
		
		bcArticulationChanged.addListener(pnlArticulationList, "Articulation change listener", function(component, value)
		{
			this.setValue(value);
			this.repaint();
			ListPanel.updateViewportPosition(this);
		});

		return pnlArticulationListContainer;
	}
	
	inline function: ScriptObject createListContainer(parentPanel: ScriptObject, options: JSON)
	{
		local panel;
		
		if (Content.componentExists("pnlArticulationListContainer"))
		{
			panel = Content.getComponent("pnlArticulationListContainer");
		}
		else
		{
			panel = Content.addPanel("pnlArticulationListContainer");
		
			Content.setPropertiesFromJSON("pnlArticulationListContainer", {
				x: 5,
				y: 5,
				width: parentPanel.getWidth() - 10,
				height: parentPanel.getHeight() - 10,
				parentComponent: parentPanel.getId(),
				text: "",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				textColour: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}

		panel.setPaintRoutine(function(g)
		{
			if (isDefined(LookAndFeel.drawArticulationListContainer))
				return LookAndFeel.drawArticulationListContainer();
		});

		ListPanel.create("pnlArticulationListContainer", [], {
			rowHeight: isDefined(options.rowHeight) ? options.rowHeight : 35, 
			margin: isDefined(options.margin) ? options.margin : 5,
			border: isDefined(options.border) ? options.border : 10,
			useCustomPaintRoutine: true,
			saveInPreset: true
		});
		
		return panel;
	}

	inline function createGainSliders(panel: ScriptObject)
	{
		for (x in panel.getChildPanelList())
			x.removeFromParent();
	
		for (i = 0; i < panel.data.items.length; i++)
			addGainSlider(panel, i);
	}
	
	inline function: ScriptObject addGainSlider(parentPanel: ScriptObject, index: number)
	{
		local rowHeight = parentPanel.data.rowHeight;
		local margin = parentPanel.data.margin;

		local cp = parentPanel.addChildPanel();
		cp.set("x", parentPanel.getWidth() - 15);
		cp.set("y", (index * (rowHeight + margin)) + rowHeight / 2 - (rowHeight - 8) / 2);
		cp.set("width", 10);
		cp.set("height", rowHeight - 8);
		cp.set("allowCallbacks", "All Callbacks");
		cp.set("borderRadius", isDefined(style.articulationList.gainSliderRadius) ? style.articulationList.gainSliderRadius : 2);
		cp.set("tooltip", parentPanel.data.list[index].id + " Volume");
		cp.data.parentPanel = parentPanel;
		cp.data.index = index;
		cp.data.sliderPack = parentPanel.data.sliderPack;	

		cp.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var parent = this.data.parentPanel;
			var v = this.data.sliderPack.getSliderValueAt(this.data.index);
			var h = a[3] * v - 2 * v;
			var y = a[3] - a[3] * v - 1 + 2 * v;
			var radius = Math.min(5, this.get("borderRadius"));
			var featureColour = (isDefined(style.featureColour) && parent.get("itemColour2") == 0x0) ? style.featureColour : parent.get("itemColour2");

			g.setColour(parent.get("bgColour"));
			g.fillRoundedRectangle([a[2] / 2 - a[2] / 1.8 / 2, a[1], a[2] / 1.8, a[3]], radius);
			
			g.setColour(Colours.withMultipliedBrightness(featureColour, 0.8 + 0.2 * this.data.hover));
			g.fillRoundedRectangle([a[2] / 2 - a[2] / 1.8 / 2 + 1, y, a[2] / 1.8 - 2, h], {CornerSize: radius / 2, Rounded:[v == 1, v == 1, 1, 1]});
		});
		
		cp.setMouseCallback(function(event)
		{
			var sliderPack = this.data.sliderPack;

			this.data.hover = event.hover;
	
			if (event.clicked)
			{
				this.data.downValue = sliderPack.getSliderValueAt(this.data.index);
				return;
			}
			
			if (event.doubleClick)
			{
			    sliderPack.setSliderAtIndex(this.data.index, 1);
			    return this.repaint();
			}
	
			if (event.drag)
			{
				// Calculate the distance using diagonal drag support
				var dragDistance = event.dragX + -1.0 * event.dragY;

				// Calculate the sensitivity value based on the value range
				var dragSensitivity = 40 / (this.get("max") - this.get("min"));				

				var normalizedDistance = dragDistance / dragSensitivity;
				
				// Calculate the new value (limit it to the given range)
				var value = Math.range(this.data.downValue + normalizedDistance, this.get("min"), this.get("max"));
				
				sliderPack.setSliderAtIndex(this.data.index, value);			
			}

			this.repaint();
		});
	
		return cp;
	}
		
	inline function addStyleToArticulationList(panel: ScriptObject)
	{
		local defaults = {
			textOffsetX: 10,
			textOffsetY: 0,
			font: fonts.regular,
			fontSize: 18 + fonts.size,
			keyswitchFont: fonts.regular,
			keyswitchFontSize: 18 + fonts.size,
			keyswitchTextOffsetY: -0.5
		};
		
		for (x in defaults)
			panel.data[x] = defaults[x];
		
		if (!isDefined(style.articulationList))
			return;

		for (x in style.articulationList)
			panel.data[x] = style.articulationList[x];
	}
		
	inline function: number checkRequirements()
	{
		local msg = "";

		if (!isDefined(ListPanel.create))
			msg = "!ArticulationList.js requires ListPanel.js!";

		if (!isDefined(ArticulationSwitcher.changeArticulation))
			msg = "!ArticulationList.js requires ArticulationSwitcher.js!";			

		if (msg != "")
			Console.print(msg);

		return msg == "";
	}

	inline function onpnlArticulationListControl(component, value)
	{
		bcArticulationChanged.setBypassed(true, false, SyncNotification);

		if (isDefined(ArticulationSwitcher.changeArticulation))
			ArticulationSwitcher.changeArticulation(value);

		bcArticulationChanged.setBypassed(false, false, SyncNotification);
	}

	inline function drawArticulationList()
	{
		if (isDefined(LookAndFeel.drawArticulationList))
			return LookAndFeel.drawArticulationList();

		local items = this.data.items;
		local radius = this.get("borderRadius");
		local textOffsetX = this.data.textOffsetX;
		local textOffsetY = this.data.textOffsetY;
		local font = this.data.font;
		local fontSize = this.data.fontSize;
		local keyswitchFont = this.data.keyswitchFont;
		local keyswitchFontSize = this.data.keyswitchFontSize;
		local keyswitchTextOffsetY = this.data.keyswitchTextOffsetY;
		local featureColour = (isDefined(style.featureColour) && this.get("itemColour2") == 0x0) ? style.featureColour : this.get("itemColour2");

		if (!isDefined(items))
			return;

		for (i = 0; i < items.length; i++)
		{
			local a = [0, i * (this.data.rowHeight + this.data.margin), this.getWidth(), this.data.rowHeight];
			local hover = this.data.hover == i;
			local selected = this.getValue() == i;
		
			// Tooltip
			if (this.data.hover == i)
			{
				local tooltip = items[i].tooltip;				
				this.set("tooltip", isDefined(tooltip) ? tooltip : "");
			}
		
			if (isDefined(LookAndFeel.drawArticulationListItem))
				return LookAndFeel.drawArticulationListItem(item[i], a, hover, selected);

			if (isDefined(LookAndFeel.drawSelectedArticulationIndicator))
			{
				LookAndFeel.drawSelectedArticulationIndicator();
			}
			else
			{
				local c = Colours.withMultipliedAlpha(this.get("itemColour"), this.get("enabled") ? (hover && !selected ? 0.6 : 1.0) : 0.5);
				g.setColour(c);
		
				if (selected || hover)
				{
					g.fillRoundedRectangle(a, radius);

					//if (!isDefined(style.useNoise) || !style.useNoise)
					//	g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
				}					

				if (selected)
				{
					g.setColour(Colours.withAlpha(featureColour, this.get("enabled") ? 1.0 : 0.5));
					g.fillRoundedRectangle([a[0], a[1], 5, a[3]], {CornerSize: radius, Rounded:[1, 0, 1, 0]});
					
					//if (!isDefined(style.useNoise) || !style.useNoise)
					//	g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: [a[0], a[1], 5, a[3]], monochromatic: true});
				}
			}		
		
			g.setColour(Colours.withAlpha(this.get("textColour"), this.get("enabled") ? (this.getValue() == i ? 1.0 : 0.8) : 0.5));
		
			// Articulation name
			local text = isDefined(items[i].label) ? items[i].label : items[i].id;
			g.setFont(font, fontSize);
			g.drawAlignedText(text, [a[0] + 2 + textOffsetX, a[1] + textOffsetY, a[2], a[3]], "left");

			// Keyswitch
			g.setFont(keyswitchFont, keyswitchFontSize);
		
			local ks = isDefined(items[i].ks) ? items[i].ks : this.data.firstKs + i;
		
			if (isDefined(ks))
				g.drawAlignedText(Engine.getMidiNoteName(ks), [a[0], a[1] + keyswitchTextOffsetY, a[2] - 25, a[3]], "right");
		}
	}

	//! Look and Feel
	const laf = Content.createLocalLookAndFeel();

	laf.registerFunction("drawScrollbar", function(g, obj)
	{
		obj.bgColour = obj.bgColour;
		obj.itemColour = obj.itemColour;

		CoreLookAndFeel.drawScrollbar(); 
	});

	//! Broadcasters
	const bcPatchChanged = Engine.createBroadcaster({id: "patchChanged", args: ["component", "value"], priority: 100});
	bcPatchChanged.attachToComponentValue(["knbPatch"], "");

	const bcArticulationChanged = Engine.createBroadcaster({id: "bcArticulationChanged", args: ["component", "value"], priority: 100});
	bcArticulationChanged.attachToComponentValue(["knbArticulation"], "");
}
