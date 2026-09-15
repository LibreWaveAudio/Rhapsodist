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
@description: Creates a grid of buttons using an existing panel.
@entry: create().
@note: Signature might change in the future as I refine it.
*/

namespace ButtonGridPanel
{
	inline function: ScriptObject create(panelId: string, numCols: int, numRows: int, labels: Array, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		panel.data.numCols = numCols;
		panel.data.numRows = numRows;
		panel.data.labels = labels;
		panel.data.hover = -1;
		panel.set("allowCallbacks", "All Callbacks");
		
		for (x in options)
			panel.data[x] = options[x];

		panel.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			var w = a[2] / this.data.numCols;
			var h = a[3] / this.data.numRows;
			var radius = this.get("borderRadius");
			
			for (i = 0; i < this.data.labels.length; i++)
			{
				var x = (i % this.data.numCols) * w;
				var y = Math.floor(i / this.data.numCols) * h;
				var active = this.getValue() == i && this.get("enabled");
	
				var c = Colours.withMultipliedBrightness(this.get("bgColour"), 1.0);
	
				if (active)
					g.setColour(c);
				else
					g.setColour(Colours.withAlpha(c, this.data.hover == i ? 1.0 : 0.6 - (0.2 * !this.get("enabled"))));
				
				g.fillRoundedRectangle([x, y, w - 5, h - 5], radius);

				g.setColour(Colours.withAlpha(this.get("itemColour2"), active ? 1.0 : 0.2));

				if (radius > 0)				
					g.fillEllipse([x + 5, y + 5, 5, 5]);
				else
					g.fillRect([x + 5, y + 5, 5, 5]);

				g.setFont(isDefined(this.data.font) ? this.data.font : "medium", isDefined(this.data.fontSize) ? this.data.fontSize : 16);
				g.setColour(Colours.withAlpha(this.get("textColour"), active ? 1.0 : 0.7));
				g.drawFittedText(this.data.labels[i], [x + 5, y + 5, w - 15, h - 15], "centred", 2, 1.0);
			}		
		});
		
		panel.setMouseCallback(function(event)
		{
			var col = Math.floor(event.x / this.getWidth() * this.data.numCols);
			var row = Math.floor(event.y / this.getHeight() * this.data.numRows);
			var value = 1 * row * this.data.numCols + col;

			this.data.hover = event.hover ? value : -1;

			if (value >= this.data.labels.length)
				return this.repaint();
	
			if (!event.clicked || event.rightClick)
				return this.repaint();
	
			this.setValue(value);
			this.changed();
		});
		
		return panel;
	}
}
