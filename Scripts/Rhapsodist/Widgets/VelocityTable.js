/*
    Copyright 2025, 2026 David Healey

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
@description: Creates and styles a table that connects to a velocity scaler module.
@entry: create()
*/

namespace VelocityTable
{
	const style = CoreLookAndFeel.style;
	const laf = Content.createLocalLookAndFeel();
	
	inline function: ScriptObject create(panelId: string, processorId: string, options: JSON)
	{
		local parentPanel = Content.getComponent(panelId);
		local panel = createContainer(parentPanel, options);
		local table = createTable(panel, processorId, options);		

		return panel;
	}
	
	inline function: ScriptObject createContainer(parentPanel: ScriptObject, options: JSON)
	{
		local id = "pnlVelocity";
		local componentExists = Content.componentExists(id);
		local panel = Content.addPanel(id);
		panel.data.broadcasters = {};

		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 0,
				y: 0,
				width: parentPanel.getWidth(),
				height: parentPanel.getHeight(),
				parentComponent: parentPanel.getId(),
				text: "",
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		return panel;
	}
	
	inline function createTable(parentPanel: ScriptObject, processorId: string, options: JSON)
	{
		local id = "tblVelocity";
		local componentExists = Content.componentExists(id);
		local table = Content.addTable(id);
		local parentIsVertical = parentPanel.getHeight() > parentPanel.getWidth();
		local widthHeight = parentIsVertical ? parentPanel.getWidth() - 40 : parentPanel.getHeight() - 40;

		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: parentPanel.getWidth() / 2 - widthHeight / 2,
				y: parentPanel.getHeight() / 2 - widthHeight / 2,
				width: widthHeight,
				height: widthHeight,
				parentComponent: parentPanel.getId(),
				processorId: processorId,
				tableIndex: 0
			});
		}
		
		if (isDefined(LookAndFeel.velocityTable))
			table.setLocalLookAndFeel(LookAndFeel.velocityTable);
		else
			table.setLocalLookAndFeel(laf);
		
		//! Broadcasters
		parentPanel.data.broadcasters.tblVelocityMouse = Engine.createBroadcaster({id: "bcVelocityTableClickWatcher", args: ["component", "event"]});
		parentPanel.data.broadcasters.tblVelocityMouse.attachToComponentMouseEvents(table, "Clicks Only", "");
		parentPanel.data.broadcasters.tblVelocityMouse.addListener({}, "Alt click to reset.", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;
		
			component.reset();
		});
		
		return table;
	}
	
	//! Look and Feel
	laf.registerFunction("drawTableBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawVelocityTableBackground))
			return LookAndFeel.drawVelocityTableBackground();
	
		var a = obj.area;
		var c = Colours.withAlpha(obj.itemColour, 0.1);
	
		if (isDefined(style.velocityTable.useGradientGrid) && style.velocityTable.useGradientGrid)
			g.setGradientFill([c, a[2] / 2, a[3] / 2, 0x0, a[2], a[1], true]);
		else
			g.setColour(c);
	
		g.drawHorizontalLine(a[3] / 2, a[0], a[2]);
		g.drawHorizontalLine(a[3] / 4, a[0], a[2]);
		g.drawHorizontalLine(a[3] - a[3] / 4, a[0], a[2]);		
		g.drawVerticalLine(a[2] / 2, a[1], a[3]);
		g.drawVerticalLine(a[2] / 4, a[1], a[3]);
		g.drawVerticalLine(a[2] - a[2] / 4, a[1], a[3]);
	});
	
	laf.registerFunction("drawTablePath", function(g, obj)
	{
		CoreLookAndFeel.drawTablePath();
	});
	
	laf.registerFunction("drawTablePoint", function(g, obj)
	{
		CoreLookAndFeel.drawTablePoint();
	});
	
	laf.registerFunction("drawTableRuler", function(g, obj)
	{
		CoreLookAndFeel.drawTableRuler();
	});
}
