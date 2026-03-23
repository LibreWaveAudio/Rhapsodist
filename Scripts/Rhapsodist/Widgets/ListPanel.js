/*
    Copyright 2024, 2026 David Healey

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

namespace ListPanel
{
	inline function: ScriptObject create(parentPanelId: string, items: Array, options: JSON)
	{
		if (!Content.componentExists(parentPanelId))
		{
			Console.print("!List Panel - " + parentPanelId + " does not exist.");
			return {};
		}
		
		local parentPanel = Content.getComponent(parentPanelId);
		local border = isDefined(options.border) ? options.border : 0;
		local saveInPreset = isDefined(options.saveInPreset) ? options.saveInPreset : false;
		
		//! viewport
		local viewport = Content.addViewport("vpt" + parentPanelId.replace("Container").replace("pnl"), 0, 0);
		viewport.set("parentComponent", parentPanelId);
		viewport.setPosition(border / 2, border / 2, parentPanel.getWidth() - border / 2, parentPanel.getHeight() - border);
		viewport.set("scrollBarThickness", 10);
		viewport.set("saveInPreset", false);

		//! panel
		local panel = Content.addPanel(parentPanelId.replace("Container").replace("List") + "List", 0, 0);
		panel.set("parentComponent", viewport.getId());
		panel.setPosition(0, 0, viewport.getWidth() - viewport.get("scrollBarThickness"), viewport.getHeight());
		panel.set("allowCallbacks", "All Callbacks");
		panel.set("tooltip", "-");
		panel.set("saveInPreset", saveInPreset);
		panel.setConsumedKeyPresses("all");
		panel.data.viewport = viewport;
		panel.data.items = items;
		panel.data.hover = -1;
		panel.data.rowHeight = isDefined(options.rowHeight) ? options.rowHeight : 35;
		panel.data.margin = isDefined(options.margin) ? options.margin : 5;
		panel.data.icons = isDefined(options.icons) ? options.icons : [];
		panel.data.allowMultiSelect = isDefined(options.allowMultiSelect) ? options.allowMultiSelect : false;
		panel.data.allowNoSelect = isDefined(options.allowNoSelect) ? options.allowNoSelect : false;
		panel.data.selected = [0];
		panel.set("height", items.length * (panel.data.rowHeight + panel.data.margin) - panel.data.margin);		
		panel.setMouseCallback(function(event) {mouseCallback();});		
		panel.setKeyPressCallback(function(event) {keyPressCallback();});

		panel.setTimerCallback(function()
		{
			updateViewportPosition(this);
			this.stopTimer();
		});

		panel.startTimer(500);

		if (isDefined(options.useDefaultPaintRoutine) && options.useDefaultPaintRoutine)
			panel.setPaintRoutine(function(g) {paintRoutine();});

		parentPanel.data.viewport = viewport;
		parentPanel.data.listPanel = panel;		

		return parentPanel;
	}

	inline function paintRoutine()
	{
		local items = this.data.items;
		local rowHeight = this.data.rowHeight;
		local margin = this.data.margin;
		local radius = this.get("borderRadius");
		
		for (i = 0; i < items.length; i++)
		{
			local a = [0, i * (rowHeight + margin), this.getWidth(), rowHeight];
			local hasIcon = isDefined(this.data.icons[i]) && this.data.icons[i] != "" ? true : false;

			local c;

			if (this.data.hover == i || this.data.selected.contains(i))
				c = Colours.withMultipliedBrightness(this.get("itemColour"), this.data.hover == i ? 0.5 + 0.5 * this.data.selected.contains(i) : 1.0);
			else
				c = this.get("bgColour");
			
			g.setColour(Colours.withMultipliedAlpha(c, this.get("enabled") ? 1.0 : 0.5));

			g.fillRoundedRectangle(a, radius);

			if (this.data.selected.contains(i))
			{
				g.setColour(Colours.withAlpha(this.get("itemColour2"), this.get("enabled") ? 1.0 : 0.5));
				g.fillRoundedRectangle([a[0], a[1], 5, a[3]], {CornerSize: radius, Rounded:[1, 0, 1, 0]});
			}
	
			g.setColour(Colours.withAlpha(this.get("textColour"), this.get("enabled") ? (this.getValue() == i ? 1.0 : 0.8) : 0.5));
	
			if (this.data.selected.contains(i))
			{
				g.setColour(Colours.withAlpha(this.get("itemColour2"), this.data.hover == i ? 0.8 : 1.0));
				g.fillRoundedRectangle([a[0], a[1], 5, a[3]], {CornerSize: radius, Rounded:[1, 0, 1, 0]});
			}

			g.setFont(isDefined(this.data.fontName) ? this.data.fontName : "regular", isDefined(this.data.fontSize) ? this.data.fontSize : 18);
			g.setColour(this.get("textColour"));
			g.drawFittedText(items[i], [a[0] + 15 + 20 * hasIcon, a[1], a[2], a[3]], "left", 1.0, 1.0);

			if (!hasIcon)
				continue;

			g.setFont("phosphor", 18);
			g.drawAlignedText(this.data.icons[i], [a[0] + 10, a[1], a[2], a[3]], "left");
		}
	}
	
	inline function mouseCallback()
	{
		if (!isDefined(this.data.items) || this.data.items.length == 0)
			return;
		
		local index = Math.floor(event.y / this.getHeight() * this.data.items.length);
		this.data.hover = event.hover ? index : -1;

		if (!event.clicked || event.rightClick)
			return this.repaint();

		local selected = this.data.selected;

		if (!this.data.allowMultiSelect)
		{
			selected.clear();
			selected.push(index);
			this.setValue(index);
			return this.changed();
		}

		if (event.shiftDown)
		{
			local start = index < this.getValue() ? index : this.getValue();
			local end = index < this.getValue() ? this.getValue() : index;

			for (i = start; i < end + 1; i++)
			{
				selected.push(i);
			}				
		}
		else if (event.ctrlDown || event.cmdDown)
		{
			selected.contains(index) ? selected.remove(index) : selected.push(index);
		}
		else if (selected.length == 1 && selected.contains(index))
			{
				selected.remove(index);
			}
		else
		{
			selected.clear();
			selected.push(index);
		}
		
		this.setValue(index);
		this.changed();
	}
	
	inline function keyPressCallback()
	{
		if (!isDefined(event.description))
			return;

		local value = this.getValue();
		local numItems = this.data.items.length;
				
		switch (event.description)
		{
			case "ctrl + A":
			case "cmd + A":
				selectAll(this);
			break;
			
			case "escape":
				deselectAll(this);
			break;
			
			case "page up":
				value = 0;
			break;

			case "page down":
				value = numItems - 1;
			break;
			
			case "cursor up":
				value--;
				value < 0 ? value = numItems - 1 : 0;
			break;
			
			case "cursor down":
				value = (value + 1) % numItems;
			break;		
		}
		
		if (value == this.getValue())
			return;

		this.data.selected.clear();
		this.data.selected.push(value);

		this.setValue(value);
		this.changed();
		
		updateViewportPosition(this);
	}
	
	inline function setItems(panel: ScriptObject, items: Array)
	{
		panel.data.items = items;
		resize(panel);
	}
	
	inline function resize(panel: ScriptObject)
	{
		local newHeight = panel.data.items.length * (panel.data.rowHeight + panel.data.margin) - panel.data.margin;

		panel.set("height", newHeight);
		
		if (newHeight > panel.data.viewport.getHeight())			
			panel.set("width", panel.data.viewport.getWidth() - panel.data.viewport.get("scrollBarThickness"));
		else
			panel.set("width", panel.data.viewport.getWidth());

		panel.repaint();
	}

	inline function setOption(panel: ScriptObject, key: string, value: NotUndefined)
	{
		panel.data[key] = value;
		resize(panel);
	}
	
	inline function setOptionsFromJSON(panel: ScriptObject, values: JSON)
	{
		for (x in values)
			panel.data[x] = values[x];

		resize(panel);
	}

	inline function setIcons(panel: ScriptObject, icons: Array)
	{
		panel.data.icons = iconsObj;		
		panel.repaint();
	}
	
	inline function setAllowMultiSelect(panel: ScriptObject, value: number)
	{
		panel.data.allowMultiSelect = value;
	}

	inline function selectAll(panel: ScriptObject)
	{
		if (!panel.data.allowMultiSelect)
			return;

		panel.data.selected.clear();
		
		for (i = 0; i < panel.data.items.length; i++)
			panel.data.selected.push(i);

		panel.changed();
	}
	
	inline function deselectAll(panel: ScriptObject)
	{
		if (!panel.data.allowMultiSelect)
			return;

		panel.data.selected.clear();
		
		if (!panel.data.allowNoSelect)
			panel.data.selected.push(panel.getValue());
		
		panel.changed();
	}
	
	inline function updateViewportPosition(panel: ScriptObject)
	{
		if (!isDefined(panel.data.items))
			return;
	
		local y = 1 / (panel.data.items.length - 1) * panel.getValue();
		panel.data.viewport.set("viewPositionY", y);
	}	
}
