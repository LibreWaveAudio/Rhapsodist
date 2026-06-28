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

namespace Tooltips
{
	const style = CoreLookAndFeel.style;
	const fonts = CoreLookAndFeel.fonts;
	const tooltipComponents = getComponents();
	
	//! pnlTooltip
	const pnlTooltip = Content.getComponent("pnlTooltip");
	pnlTooltip.showControl(false);
	pnlTooltip.set("enabled", false);

	pnlTooltip.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(20);
		var radius = this.get("borderRadius");

		g.drawDropShadow(a, Colours.withAlpha(Colours.black, 0.6), 20);

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);

		if (isDefined(style.useNoise) && style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});

		g.setColour(this.get("itemColour"));
		g.drawRoundedRectangle([a[0] + radius / 4, a[1] + radius / 4, a[2] - radius / 2, a[3] - radius / 2], radius, 1);

		g.setFontWithSpacing(fonts.medium, 16 + fonts.size, 0.0);
		g.setColour(this.get("textColour"));
		g.drawAlignedText(this.get("tooltip"), a, "centred");
	});
	
	//! Functions
	inline function: Array getComponents()
	{
		local result = [];
		local allComponents = Content.getAllComponents("");
		local types = ["ScriptButton", "ScriptSlider", "ScriptTable", "ScriptComboBox", "ScriptPanel"];
		
		for (x in allComponents)
		{
			if (!x.get("enabled"))
				continue;

			if (x.get("tooltip") == "")
				continue;

			if (!types.contains(x.get("type")))
				continue;

			result.push(x);			
		}
	
		return result;
	}
	
	//! Broadcaster	
	const bcTooltipPanel = Engine.createBroadcaster({"id": "tooltip", "args": ["component", "event"]});
	bcTooltipPanel.attachToComponentMouseEvents(tooltipComponents, "All Callbacks", "");

	inline function addRemoveListeners(state: number)
	{
		if (!state)
		{
			bcTooltipPanel.removeListener("Update panel position");
			bcTooltipPanel.removeListener("Show Tooltip");
			return;
		}
		
		bcTooltipPanel.addListener(pnlTooltip, "Update panel position", function(component, event)
		{
			var interfaceSize = Content.getInterfaceSize();

			this.set("tooltip", component.get("tooltip"));
			this.set("width", Engine.getStringWidth(this.get("tooltip"), fonts.medium, 16 + fonts.size, 0.0) + 75);
			this.set("x", component.getGlobalPositionX() + component.getWidth() / 2 - this.getWidth() / 2);
			this.set("y", component.getGlobalPositionY() + 10);

			if (this.get("x") + this.getWidth() > interfaceSize[0])
				this.set("x", interfaceSize[0] - this.getWidth() - 5);
			else if (this.get("x") < 0)
				this.set("x", 0);

			if (this.get("y") + this.getHeight() > interfaceSize[1])
				this.set("y", interfaceSize[1] - this.getHeight() - 5);

			this.repaint();
		
			if (!event.hover || (component.get("tooltip") == ""))
				this.showControl(false);
		});
			
		bcTooltipPanel.addDelayedListener(500, pnlTooltip, "Show Tooltip", function(component, event)
		{
			if (!event.hover || this.get("tooltip") == "")
				return;

			this.showControl(true);
		});
	}

	const bcTooltipButton = Engine.createBroadcaster({id: "valueChanged", args: ["component", "value"]});
	bcTooltipButton.attachToComponentValue("btnTooltips", "Tooltips button toggled");
	
	bcTooltipButton.addListener({}, "Enable - disable tooltips", function(component, value)
	{			
		addRemoveListeners(value);
	});
}
