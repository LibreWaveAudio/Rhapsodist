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

/*
@description: Stores the values of a given panel's child components in a sliderpack.
							The sliderpack can contain multiple values for each component separated into "groups".
							The types of component whose values are stored is specified by the componentTypes array. This should contain strings of script component types.
							A second "switcher" component is used to determine which "group" of stored values the component's should display.
							For example you could have 3 knobs on the UI, and depending on the selected articulation they use different values.
@note: Not currently used in my projects so might be removed in the future.
*/

namespace ComponentPack
{
	inline function: object create(panelId: string, switcherId: string, componentTypes: Array, numGroups: int, options: JSON)
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
		
		local sliderPackId = panelId.replace("pnl", "slp");
		local componentExists = Content.componentExists(sliderPackId);
		local sliderPack = Content.addSliderPack(sliderPackId);	

		if (!componentExists)
		{
			sliderPack.set("parentComponent", panelId);
			sliderPack.set("saveInPreset", true);
			sliderPack.showControl(false);

			if (!isDefined(options.sliderPack.processorId))
			{
				sliderPack.set("min", min);
				sliderPack.set("max", max);
				sliderPack.set("sliderAmount", components.length * numGroups);
			}

			if (isDefined(options.sliderPack) && typeof(options.sliderPack) == "object")
			{
				for (x in options.sliderPack)
					sliderPack.set(x, options.sliderPack[x]);
			}
		}
		
		panel.data.sliderPack = sliderPack;
		panel.data.components = components;
		panel.data.switcherIndex = 0;

		//! Bc component value
		panel.data.bcComponentValue = Engine.createBroadcaster({id: "componentValue", args: ["component", "value"]});
		panel.data.bcComponentValue.attachToComponentValue(components, "");

		panel.data.bcComponentValue.addListener(panel, "Component Value listener", function(component, value)
		{
			var index = this.data.switcherIndex * this.data.components.length + this.data.components.indexOf(component);
			this.data.sliderPack.setSliderAtIndex(index, value);
		});
		
		//! Bc switcher value
		panel.data.bcSwitcherValue = Engine.createBroadcaster({id: "switcherValue", args: ["component", "value"]});
		panel.data.bcSwitcherValue.attachToComponentValue(switcherId, "");
		
		panel.data.bcSwitcherValue.addListener(panel, "Switcher listener", function(component, value)
		{
			this.data.switcherIndex = value;

			var triggerChange = isDefined(this.data.shouldTriggerChange) ? this.data.shouldTriggerChange : true;
			restoreComponentValuesFromSliderPack(this, this.data.components, this.data.sliderPack, value, triggerChange);
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

		Presets.broadcasters.postLoad.addListener(panel, "Preset has been loaded", function(isInternal)
		{
			var index = isDefined(this.data.switcherIndex) ? this.data.switcherIndex : 0;
			restoreComponentValuesFromSliderPack(this, this.data.components, this.data.sliderPack, index, true);
		});

		return panel;
	}

	inline function restoreComponentValuesFromSliderPack(panel: ScriptObject, components: Array, sliderPack: ScriptObject, index: number, shouldTriggerChange: number)
	{
		panel.data.bcComponentValue.setBypassed(!shouldTriggerChange, false, false);

		for (i = 0; i < components.length; i++)
		{
			local value = sliderPack.getSliderValueAt(components.length * index + i);
			components[i].setValue(value);

			if (shouldTriggerChange)
				components[i].changed();
		}
		
		panel.data.bcComponentValue.setBypassed(false, false, false);
	}
}
