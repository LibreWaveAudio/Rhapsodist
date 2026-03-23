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

namespace ArticulationList
{	
	const useUacc = isDefined(Manifest.useUacc) ? Manifest.useUacc : true;

	if (!isDefined(ListPanel.create))
		Console.print("ArticulationList.js requires ListPanel.js!");

	if (!Content.componentExists("pnlArticulationListContainer"))
		Console.print("ArticulationList.js requires component pnlArticulationListContainer!");

	//! pnlArticulationListContainer
	const pnlArticulationListContainer = ListPanel.create("pnlArticulationListContainer", [], {rowHeight: 30, margin: 5, border: 10, saveInPreset: true});

	pnlArticulationListContainer.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var radius = this.get("borderRadius");

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);
	});
	
	//! knbArticulation
	const knbArticulation = Content.getComponent("knbArticulation");
	
	//! vptArticulationList
	const vptArticulationList = pnlArticulationListContainer.data.viewport;
	vptArticulationList.set("height", pnlArticulationListContainer.getHeight() - 5);

	const lafVptArticulationList = Content.createLocalLookAndFeel();
	vptArticulationList.setLocalLookAndFeel(lafVptArticulationList);

	lafVptArticulationList.registerFunction("drawScrollbar", function(g, obj)
	{
		var options = {
			bgColour: vptArticulationList.get("bgColour"),
			itemColour: vptArticulationList.get("itemColour")
		};

		CoreLookAndFeel.drawScrollbar(options); 
	});

	//! pnlArticulationList
	const pnlArticulationList = pnlArticulationListContainer.data.listPanel;
	pnlArticulationList.setControlCallback(onpnlArticulationListControl);
	
	inline function onpnlArticulationListControl(component, value)
	{
		changeArticulation(value);
	}

	pnlArticulationList.setPaintRoutine(function(g)
	{
		var items = this.data.items;
		var radius = this.get("borderRadius");
		var textOffsetX = this.data.textOffsetX;
		var textOffsetY = this.data.textOffsetY;
		var font = this.data.font;
		var fontSize = this.data.fontSize;
		var keyswitchFont = this.data.keyswitchFont;
		var keyswitchFontSize = this.data.keyswitchFontSize;
		var keyswitchTextOffsetY = this.data.keyswitchTextOffsetY;

		if (!isDefined(items))
			return;

		for (i = 0; i < items.length; i++)
		{
			var a = [0, i * (this.data.rowHeight + this.data.margin), this.getWidth(), this.data.rowHeight];
			var hover = this.data.hover == i;
			var selected = this.getValue() == i;

			// Tooltip
			if (this.data.hover == i)
			{
				var tooltip = items[i].tooltip;				
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
				var c = Colours.withMultipliedAlpha(this.get("itemColour"), this.get("enabled") ? (hover && !selected ? 0.6 : 1.0) : 0.5);
				g.setColour(c);

				if (selected || hover)
					g.fillRoundedRectangle([a[0], a[1], a[2], a[3]], radius);

				if (selected)
				{
					g.setColour(Colours.withAlpha(this.get("itemColour2"), this.get("enabled") ? 1.0 : 0.5));
					g.fillRoundedRectangle([a[0], a[1], 5, a[3]], {CornerSize: radius, Rounded:[1, 0, 1, 0]});
				}
			}		

			g.setColour(Colours.withAlpha(this.get("textColour"), this.get("enabled") ? (this.getValue() == i ? 1.0 : 0.8) : 0.5));

			// Articulation name
			var text = isDefined(items[i].label) ? items[i].label : items[i].id;
			g.setFont(font, fontSize);
			g.drawAlignedText(text, [a[0] + textOffsetX, a[1] + textOffsetY, a[2], a[3]], "left");

			// Keyswitch
			g.setFont(keyswitchFont, keyswitchFontSize);

			var ks = isDefined(items[i].ks) ? items[i].ks : this.data.firstKs + i;

			if (isDefined(ks))
				g.drawAlignedText(Engine.getMidiNoteName(ks), [a[0], a[1] + keyswitchTextOffsetY, a[2] - 25, a[3]], "right");
		}
	});
		
	//! slpArticulationGain
	const slpArticulationGain = Content.addSliderPack("slpArticulationGain", 0, 0);
	slpArticulationGain.set("parentComponent", "pnlArticulationListContainer");
	slpArticulationGain.set("sliderAmount", 100);
	slpArticulationGain.set("min", 0.5);
	slpArticulationGain.set("processorId", "articulationGain");
	slpArticulationGain.showControl(false);

	//! Functions
	inline function addStyleToPanelData()
	{
		local defaults = {textOffsetX: 10, textOffsetY: 0, font: "regular", fontSize: 16, keyswitchFont: "regular", keyswitchFontSize: 16, keyswitchTextOffsetY: 0};
		
		for (x in defaults)
			pnlArticulationList.data[x] = defaults[x];
		
		if (!isDefined(Style.articulationList))
			return;

		for (x in Style.articulationList)
			pnlArticulationList.data[x] = Style.articulationList[x];

		if (isDefined(Style.articulationList.rowHeight) && isDefined(pnlArticulationList.data.items))
			createGainSliders(pnlArticulationList.data.items.length);
	}

	inline function changeArticulation(index: number)
	{			
		local articulation = ArticulationDataManager.getArticulation(index);
		
		if (!isDefined(articulation))
			return;

		knbArticulation.setValue(index);
		knbArticulation.changed();

		pnlArticulationList.setValue(index);
		pnlArticulationList.repaint();
	}

	inline function updateList(articulations: Array)
	{
		ListPanel.setItems(pnlArticulationList, articulations);
		createGainSliders(articulations.length);
	}

	inline function createGainSliders(count: number)
	{
		for (x in pnlArticulationList.getChildPanelList())
			x.removeFromParent();

		for (i = 0; i < count; i++)
			addGainSlider(i);
	}
	
	inline function: ScriptObject addGainSlider(index: number)
	{
		local rowHeight = pnlArticulationList.data.rowHeight;
		local margin = pnlArticulationList.data.margin;

		local cp = pnlArticulationList.addChildPanel();
		cp.set("x", pnlArticulationList.getWidth() - 15);
		cp.set("y", (index * (rowHeight + margin)) + rowHeight / 2 - (rowHeight - 8) / 2);
		cp.set("width", 10);
		cp.set("height", rowHeight - 8);
		cp.set("bgColour", pnlArticulationList.get("bgColour"));
		cp.set("itemColour", pnlArticulationList.get("itemColour2"));
		cp.set("allowCallbacks", "All Callbacks");
		cp.set("borderRadius", pnlArticulationList.get("borderRadius"));
		cp.set("tooltip", pnlArticulationList.data.list[index].id + " Volume");
		cp.data.index = index;		

		cp.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var v = slpArticulationGain.getSliderValueAt(this.data.index);
			var h = a[3] * v - 2 * v;
			var y = a[3] - a[3] * v - 1 + 2 * v;
			var radius = Math.min(5, this.get("borderRadius"));
			
			g.setColour(this.get("bgColour"));
			g.fillRoundedRectangle([a[2] / 2 - a[2] / 1.8 / 2, a[1], a[2] / 1.8, a[3]], radius);
			
			g.setColour(Colours.withMultipliedBrightness(this.get("itemColour"), 0.8 + 0.2 * this.data.hover));
			g.fillRoundedRectangle([a[2] / 2 - a[2] / 1.8 / 2 + 1, y, a[2] / 1.8 - 2, h], {CornerSize: radius / 2, Rounded:[v == 1, v == 1, 1, 1]});
		});
		
		cp.setMouseCallback(function(event)
		{
			this.data.hover = event.hover;

			if (event.clicked)
			{
				this.data.downValue = slpArticulationGain.getSliderValueAt(this.data.index);
				return;
			}
			
			if (event.doubleClick)
			{
			    slpArticulationGain.setSliderAtIndex(this.data.index, 1);
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
				
				slpArticulationGain.setSliderAtIndex(this.data.index, value);			
			}
			
			this.repaint();
		});

		return cp;
	}

	//! MIDI Callbacks
	inline function onNoteOn(noteNumber: number)
	{
		local index = ArticulationDataManager.getArticulationIndexForKeyswitch(noteNumber);

		if (index == -1)
			return;

		changeArticulation(index);
		ListPanel.updateViewportPosition(pnlArticulationList);
	}

	inline function onController(ccNumber: number, ccValue: number)
	{
		if ((ccNumber == 32 && !useUacc) && !Message.isProgramChange())
			return;

		local index = ArticulationDataManager.getArticulationIndexForProgram(ccValue);

		if (index == -1)
			return;

		changeArticulation(index);
		ListPanel.updateViewportPosition(pnlArticulationList);
	}

	//! Function Calls
	addStyleToPanelData();
	
	//! Broadcasters
	const bcPatchChanged = Engine.createBroadcaster({id: "patchChanged", args: ["component", "value"], priority: 100});
	bcPatchChanged.attachToComponentValue(["knbPatch", "Patch"], "");

	bcPatchChanged.addListener(0, "Patch change listener", function(component, value)
	{
		var patch = Manifest.patches[value];

		if (!isDefined(patch))
			return;

		var articulations = ArticulationDataManager.getAllArticulations();

		if (isDefined(articulations) && Array.isArray(articulations))
			updateList(articulations);
	});
}
