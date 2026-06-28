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

namespace SettingsPanel
{
	const style = CoreLookAndFeel.style;
	const fonts = CoreLookAndFeel.fonts;

	inline function create(panelId: string, rowHeight: number, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		panel.data.rowHeight = rowHeight;		
		
		for (x in options)
			panel.data[x] = options[x];

		panel.setPaintRoutine(function(g)
		{
			var font = fonts.medium;
			var fontSize = 16 + fonts.size;

			var count = 0;

			for (x in this.getChildComponents())
			{
				if (x.get("parentComponent") != this.getId())
					continue;

				if (!x.get("visible"))
					continue;

				var y = count * this.data.rowHeight;

				g.setFont(font, fontSize);
				g.setColour(Colours.withAlpha(this.get("textColour"), this.get("enabled") ? 1.0 : 0.5));
				g.drawAlignedText(x.get("text"), [0, y, this.get("width") / 2, this.data.rowHeight], "left");
				count++;
			}
		});

		setupChildren(panel);
		
		return panel;
	}

	inline function setupChildren(parent: ScriptObject)
	{
		local children = parent.getChildComponents();
		local rowHeight = parent.data.rowHeight;
		local count = 0;

		for (x in children)
		{
			if (x.get("parentComponent") != parent.getId())
				continue;

			if (!x.get("visible"))
				continue;

			switch (x.get("type"))
			{
				case "ScriptPanel":
					if (isValueEdit(x))
						ValueEdit.create(x.getId(), {useNoise: parent.data.useNoise});
					break;

				case "ScriptButton":
					x.set("width", 34);
					x.set("height", 20);
					x.setLocalLookAndFeel(CoreLookAndFeel.toggleSwitch);
					break;

				case "ScriptComboBox":
					x.setLocalLookAndFeel(CoreLookAndFeel.comboBox);
					break;
			}

			x.set("x", parent.getWidth() - x.getWidth() - 10);
			x.set("y", (count * rowHeight) + rowHeight / 2 - x.getHeight() / 2);
			count++;
		}

		parent.set("height", count * rowHeight);
	}
	
	inline function: number isValueEdit(component: ScriptObject)
	{
		if (component.get("type") != "ScriptPanel")
			return false;

		local children = component.getChildComponents();

		if (children.length != 1)
			return false;

		return children[0].get("type") == "ScriptSlider";
	}
}
