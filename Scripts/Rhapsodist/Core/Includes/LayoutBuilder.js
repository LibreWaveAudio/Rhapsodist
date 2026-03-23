/*
* Author: David Healey
* License: CC0
* Last updated: 08/12/2024
*/

namespace LayoutBuilder
{
	const data = [];

	inline function add(arr: Array)
	{
		data.concat(arr);
	}

	inline function process()
	{
		if (isDefined(freezeUi) && freezeUi)
			return;

		local stack = data.clone();
		
		while (stack.length > 0)
		{
			local node = stack.shift();
			
			if (!isDefined(node.type) || !isDefined(node.id))
				continue;

			addComponent(node.id, node);

			if (!isDefined(node.childComponents))
				continue;

			for (x in node.childComponents)
				x.parentComponent = node.id;

			stack.concat(node.childComponents);
		}
	}
	
	inline function: object addComponent(id: string, properties: JSON)
	{
		local c = Content.getComponent(id);
		local exists = Content.componentExists(id);

		if (!exists)
		{
			local type = properties.type.replace("Scripted").replace("Script");

			switch (type)
			{
				case "Slider": c = Content.addKnob(id, properties.x, properties.y); break;
				case "Button": c = Content.addButton(id, properties.x, properties.y); break;
				case "Table": c = Content.addTable(id, properties.x, properties.y); break;
				case "ComboBox": c = Content.addComboBox(id, properties.x, properties.y); break;
				case "Label": c = Content.addLabel(id, properties.x, properties.y); break;
				case "Image": c = Content.addImage(id, properties.x, properties.y); break;
				case "Viewport": c = Content.addViewport(id, properties.x, properties.y); break;
				case "Panel": c = Content.addPanel(id, properties.x, properties.y); break;
				case "AudioWaveform": c = Content.addAudioWaveform(id, properties.x, properties.y); break;
				case "SliderPack": c = Content.addSliderPack(id, properties.x, properties.y); break;
				case "WebView": c = Content.addWebView(id, properties.x, properties.y); break;
				case "FloatingTile": c = Content.addFloatingTile(id, properties.x, properties.y); break;
			}
		}

		local allProperties = c.getAllProperties();

		for (x in properties)
		{
			if (!allProperties.contains(x) || x == "id")
				continue;

			if (exists && (x.contains("Colour") || x.contains("Font") || x == "text"))
				continue;

			c.set(x, properties[x]);
		}

		return c;
	}
}
