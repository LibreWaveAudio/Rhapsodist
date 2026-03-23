/*
    Copyright 2024 David Healey

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

namespace ComponentPack
{
	inline function: ScriptObject create(panelId: string, switcherId: string, componentTypes: Array, numGroups: int, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		local components = [];
		local min = 99999999;
		local max = 0;
		
		for (x in options)
			panel.data[x] = options[x];

		for (x in panel.getChildComponents())
		{
			if (x.getId() == switcherId)
				continue;

			if (!isDefined(x.get("min")) || !isDefined(x.get("max")))
				continue;

			if (!componentTypes.contains(x.get("type")) || x.get("parentComponent") != panelId)
				continue;

			components.push(x);

			if (x.get("min") < min)
				min = x.get("min");

			if (x.get("max") > max)
				max = x.get("max");
		}
		
		if (!components.length)
			return panel;
		
		local sliderPack = Content.addSliderPack(panelId.replace("pnl", "slp"), 0, 0);
		sliderPack.set("parentComponent", panelId);
		sliderPack.set("saveInPreset", true);
		sliderPack.set("min", min);
		sliderPack.set("max", max);
		sliderPack.set("sliderAmount", components.length * numGroups);
		sliderPack.showControl(false);
		
		panel.data.sliderPack = sliderPack;
		panel.data.components = components;
		panel.data.switcherIndex = 0;
		
		//! Bc switcher value
		panel.data.bcSwitcherValue = Engine.createBroadcaster({"id": "switcherValue", "args": ["component", "value"]});
		panel.data.bcSwitcherValue.attachToComponentValue(switcherId, "");

		panel.data.bcSwitcherValue.addListener(panel, "Switcher listener", function(component, value)
		{
			this.data.switcherIndex = value;
			restoreComponentValuesFromSliderPack(this.data.components, this.data.sliderPack, value);
		});

		//! Bc component value
		panel.data.bcComponentValue = Engine.createBroadcaster({"id": "componentValue", "args": ["component", "value"]});
		panel.data.bcComponentValue.attachToComponentValue(components, "");

		panel.data.bcComponentValue.addListener(panel, "Component Value listener", function(component, value)
		{
			var index = this.data.components.indexOf(component);
			this.data.sliderPack.setSliderAtIndex(this.data.switcherIndex * this.data.components.length + index, value);
		});
		
		//! Bc panel mouse click
		panel.data.bcMouse = Engine.createBroadcaster({id: "clickWatcher", args: ["component", "event"]});
		panel.data.bcMouse.attachToComponentMouseEvents(panel, "Clicks Only", "");

		panel.data.bcMouse.addListener(components, "Alt click retort to default.", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;

			for (x in this)
			{
				x.setValue(x.get("defaultValue"));
				x.changed();
			}
		});

		return panel;
	}

	inline function restoreComponentValuesFromSliderPack(components: Array, sliderPack: ScriptObject, index: number)
	{
		for (i = 0; i < components.length; i++)
		{
			local value = sliderPack.getSliderValueAt(components.length * index + i);
			components[i].setValue(value);
			components[i].changed();
		}
	}
}
