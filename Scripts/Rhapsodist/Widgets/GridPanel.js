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

namespace GridPanel
{
	/**
	* Positions child components within the panel in a grid layout.
	* Controls are positioned centrally within each column/row
	*
	* @panelId		string	  	Id of the panel.
	* @numCols		number		The number of columns to use
	* @numCols		numer		The number of rows to use
	* @options		JSON:
	* 	@colWidth	number		The width of each column, the panel's width will be adjusted to fit.
	*							Omit to use the panel's current width / numCols
	* 	@rowHeight	number		The height of each row, the panel's height will be adjusted to fit.
	*							Omit to use the panel's current height / numRows
	*
	* @return					Reference to the panel
	*/
	inline function: ScriptObject create(panelId: string, numCols: number, numRows: number, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		panel.data.numCols = numCols;
		panel.data.numRows = numRows;
		panel.data.colWidth = isDefined(options.colWidth) ? options.colWidth : panel.getWidth() / numCols;
		panel.data.rowHeight = isDefined(options.rowHeight) ? options.rowHeight : panel.getHeight() / numRows;
		panel.data.colAlignment = isDefined(options.colAlignment) ? options.colAlignment : "centred";
		panel.data.rowAlignment = isDefined(options.rowAlignment) ? options.rowAlignment : "middle";
		
		if (colWidth > 0)
			panel.set("width", numCols * colWidth);
			
		if (rowHeight > 0)
			panel.set("height", numRows * rowHeight);
			
		for (x in options)
			panel.data[x] = options[x];
		
		positionChildren(panel);

		return panel;
	}

	inline function positionChildren(panel: ScriptObject)
	{
		local children = getDirectChildren(panel);
		local colWidth = panel.data.colWidth;
		local rowHeight = panel.data.rowHeight + panel.data.yOffset / panel.data.numRows;
		local colAlignment = panel.data.colAlignment;
		local rowAlignment = panel.data.rowAlignment;

		for (i = 0; i < children.length; i++)
		{
			local c = children[i];
			local x = (i % panel.data.numCols) * colWidth;
			local y = Math.floor(i / panel.data.numCols) * rowHeight;
			
			switch (colAlignment)
			{
				case "centred": c.set("x", Math.max(0, x + colWidth / 2 - c.getWidth() / 2)); break;
				case "left": c.set("x", Math.max(0, x)); break;
				case "right": c.set("x", Math.max(0, x + colWidth - c.getWidth())); break;
			}

			switch (rowAlignment)
			{
				case "middle": c.set("y", Math.max(0, y + rowHeight / 2 - c.getHeight() / 2)); break;
				case "top": c.set("y", Math.max(0, y)); break;
				case "bottom": c.set("y", Math.max(0, y + rowHeight - c.getHeight())); break;
			}			
		}
	}
	
	inline function: Array getDirectChildren(panel: ScriptObject)
	{
		local result = [];
		
		for (x in panel.getChildComponents())
		{
			if (x.get("parentComponent") == panel.getId())
				result.push(x);
		}
		
		return result;
	}
}
