/*
    Copyright 2026 David Healey

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
@description: Functions for creating stack, row, and grid layouts of components within panels.
*/

namespace Container
{
	inline function: ScriptObject create(id: string, options: JSON)
	{
		local panel = getPanel(id);
		
		for (x in options)
			panel.data[x] = options[x];

		return panel;
	}

	inline function: ScriptObject createStack(id: string, padding: Array, spacing: number, options: JSON)
	{
		local panel = getPanel(id);

		local children = [];

		for (c in panel.getChildComponents())
		{
			if (c.get("visible") && c.get("parentComponent") == id)
				children.push(c);
		}

		if (!children.length)
			return panel;			
		
		local count = children.length;
		local fill = isDefined(options.fill) ? options.fill : false;
		local innerWidth  = Math.max(panel.getWidth()  - padding[3] - padding[1], 0);
		local innerHeight = Math.max(panel.getHeight() - padding[0]  - padding[2], 0);
		local justification = isDefined(options.justification) ? options.justification : "centred";

		local childHeight = 0;
		local childSpacing = spacing;

		if (fill)
		{
			if (spacing == -1)
				childSpacing = 0;

			local totalSpacing = (count > 1) ? (count - 1) * childSpacing : 0;
			childHeight = Math.max(innerHeight - totalSpacing, 0) / count;
		}
		else
		{
			local totalChildHeight = 0;

			for (c in children)
				totalChildHeight += c.getHeight();

			if (spacing == -1 && count > 1)
				childSpacing = (innerHeight - totalChildHeight) / (count - 1);
			else if (spacing == -1 && count == 1)
				childSpacing = 0;
		}

		local y = padding[0];
		
		for (i = 0; i < count; i++)
		{
			local c = children[i];
			local width  = c.getWidth();
			local height = fill ? childHeight : c.getHeight();
			local x;

			switch (justification)
			{
				case "left":
					x = padding[3];
					break;

				case "stretch":
					x = padding[3];
					width = innerWidth;
					break;

				case "right":
					x = padding[3] + (innerWidth - width);
					break;

				default:
					x = padding[3] + (innerWidth - width) * 0.5;
			}

			c.setPosition(x, y, width, height);

			y += height;

			if (i < count - 1)
				y += childSpacing;
		}

		panel.data.containerType = "stack";
		return panel;
	}
		
	inline function: ScriptObject createRow(id: string, padding: Array, spacing: number, options: JSON)
	{
	    local panel = getPanel(id);
		
	    local children = [];
	
	    for (c in panel.getChildComponents())
	    {
			if (c.get("visible") && c.get("parentComponent") == id)
	            children.push(c);
	    }
	
	    if (!children.length)
	        return panel;

	    local count = children.length;
	    local fill = isDefined(options.fill) ? options.fill : false;	
	    local innerWidth  = Math.max(panel.getWidth()  - padding[3] - padding[1], 0);
	    local innerHeight = Math.max(panel.getHeight() - padding[0]  - padding[2], 0);
	    local alignment = isDefined(options.alignment) ? options.alignment : "middle";

	    local childWidth = 0;
	    local childSpacing = spacing;
	
	    if (fill)
	    {
	        if (spacing == -1)
	            childSpacing = 0;

	        local totalSpacing = (count > 1) ? (count - 1) * childSpacing : 0;
	        childWidth = Math.max(innerWidth - totalSpacing, 0) / count;
	    }
	    else
	    {
	        local totalChildWidth = 0;
	
	        for (c in children)
	            totalChildWidth += c.getWidth();
	
	        if (spacing == -1 && count > 1)
	            childSpacing = (innerWidth - totalChildWidth) / (count - 1);
	        else if (spacing == -1 && count == 1)
	            childSpacing = 0;
	    }
	
	    local x = padding[3];
	
	    for (i = 0; i < count; i++)
	    {
	        local c = children[i];
	        local width  = fill ? childWidth : c.getWidth();
	        local height = c.getHeight();
	        local y;
	
	        switch (alignment)
	        {
	            case "top":
	                y = padding[0];
	                break;
	
	            case "stretch":
	                y = padding[0];
	                height = innerHeight;
	                break;
	
	            case "bottom":
	                y = padding[0] + (innerHeight - height);
	                break;
	
	            default:
	                y = padding[0] + (innerHeight - height) * 0.5;
	        }
	
	        c.setPosition(x, y, width, height);

	        x += width;
	
	        if (i < count - 1)
	            x += childSpacing;
	    }

		panel.data.containerType = "row";
		return panel;
	}
	
	inline function: ScriptObject createGrid(id: string, padding: Array, spacing: Array, columns: number, options: JSON)
	{
		local panel = getPanel(id);
		
		local children = [];

		for (c in panel.getChildComponents())
		{
			if (c.get("visible") && c.get("parentComponent") == id)
				children.push(c);
		}

		if (!children.length)
			return panel;

		local fillX = isDefined(options.fillX) ? options.fillX : false;
		local fillY = isDefined(options.fillY) ? options.fillY : false;
		local layout = isDefined(options.layout) ? options.layout : [];

		local count = children.length;
		local rows  = Math.ceil(count / columns);

		local spacingX = spacing[0];
		local spacingY = spacing[1];

		local innerWidth  = Math.max(panel.getWidth()  - padding[3] - padding[1], 0);
		local innerHeight = Math.max(panel.getHeight() - padding[0]  - padding[2], 0);

		local cellWidth  = 0;
		local cellHeight = 0;

		if (fillX)
		{
			if (spacingX == -1)
				spacingX = 0;

			local totalSpacing = (columns > 1) ? (columns - 1) * spacingX : 0;
			cellWidth = Math.max(innerWidth - totalSpacing, 0) / columns;
		}
		else
		{
			for (c in children)
				cellWidth = Math.max(cellWidth, c.getWidth());

			if (spacingX == -1)
			{
				spacingX = 0;
				cellWidth = innerWidth / columns;
			}
		}

		if (fillY)
		{
			if (spacingY == -1)
				spacingY = 0;

			local totalSpacing = (rows > 1) ? (rows - 1) * spacingY : 0;
			cellHeight = Math.max(innerHeight - totalSpacing, 0) / rows;
		}
		else
		{
			for (c in children)
			cellHeight = Math.max(cellHeight, c.getHeight());

			if (spacingY == -1)
			{
				spacingY = 0;
				cellHeight = innerHeight / rows;
			}
		}

		for (i = 0; i < count; i++)
		{
			local c = children[i];

			local col = i % columns;
			local row = Math.floor(i / columns);

			local spec = (i < layout.length && isDefined(layout[i])) ? layout[i] : {};
			local colSpan = isDefined(spec.colSpan) ? spec.colSpan : 1;
			local rowSpan = isDefined(spec.rowSpan) ? spec.rowSpan : 1;
			local justification = isDefined(spec.justification) ? spec.justification : "centred";
			local alignment = isDefined(spec.alignment) ? spec.alignment : "middle";

			if (col + colSpan > columns)
				colSpan = columns - col;

			local baseX = padding[3] + col * (cellWidth  + spacingX);
			local baseY = padding[0]  + row * (cellHeight + spacingY);

			local cellW = colSpan * cellWidth  + (colSpan - 1) * spacingX;
			local cellH = rowSpan * cellHeight + (rowSpan - 1) * spacingY;

			local width  = c.getWidth();
			local height = c.getHeight();

			local x = baseX;
			local y = baseY;

			switch (justification)
			{
				case "left": break;
				case "right": x += (cellW - width); break;
				case "stretch": width = cellW; break;
				default: x += (cellW - width) * 0.5;
			}

			switch (alignment)
			{
				case "top": break;
				case "bottom": y += (cellH - height); break;
				case "stretch": height = cellH; break;
				default: y += (cellH - height) * 0.5;
			}

			c.setPosition(x, y, width, height);
		}

		panel.data.containerType = "grid";
		return panel;
	}

	inline function: ScriptObject getPanel(id: string)
	{		
		if (Content.componentExists(id))
			return Content.getComponent(id);
	
		return Content.addPanel(id);
	}	
}