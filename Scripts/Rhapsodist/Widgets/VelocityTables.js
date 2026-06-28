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

namespace VelocityTables
{
	const style = CoreLookAndFeel.style;
	const laf = Content.createLocalLookAndFeel();
	
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

	inline function: ScriptObject create(panelId: string, numTables: int, options: JSON)
	{
		local panel = Content.getComponent(panelId);
		
		//! pnlVelocity
		local componentExists = Content.componentExists("pnlVelocity");
		local pnlVelocity = Content.addPanel("pnlVelocity");

		if (!componentExists)
		{
			Content.setPropertiesFromJSON("pnlVelocity", {
				x: 0,
				y: 0,
				width: panel.getWidth(),
				height: panel.getHeight(),
				parentComponent: panelId,
				text: "",
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		//! tblVelocity
		local tblVelocity = createTables(pnlVelocity, numTables);
		pnlVelocity.data.tables = tblVelocity;
		
		return pnlVelocity;
	}
	
	inline function: Array createTables(parentPanel: ScriptObject, numTables: int)
	{
		local tblVelocity = Content.getAllComponents("tblVelocity\\d");

		if (!tblVelocity.length)
		{
			local parentIsVertical = parentPanel.getHeight() > parentPanel.getWidth();

			local widthHeight = parentIsVertical ? parentPanel.getWidth() - 40 : parentPanel.getHeight() - 40;
			local x = parentPanel.getWidth() / 2 - widthHeight / 2;
			local y = parentPanel.getHeight() / 2 - widthHeight / 2;

			for (i = 0; i < numTables; i++)
			{
				tblVelocity.push(Content.addTable("tblVelocity" + i));

				Content.setPropertiesFromJSON("tblVelocity" + i, {
					x: x,
					y: y,
					width: widthHeight,
					height: widthHeight,
					parentComponent: parentPanel.getId(),
					processorId: "velocityHandler",
					bgColour: 0x0,
					itemColour: 0x0ffd7d8da,
					itemColour2: 0xff8a94a7
				});
			}
		}

		for (i = 0; i < tblVelocity.length; i++)
		{
			tblVelocity[i].set("tableIndex", i);

			if (isDefined(LookAndFeel.velocityTable))
				tblVelocity[i].setLocalLookAndFeel(LookAndFeel.velocityTable);
			else
				tblVelocity[i].setLocalLookAndFeel(laf);
		}

		//! Listeners
		bctblVelocityReset.attachToComponentMouseEvents(tblVelocity, "Clicks Only", "");
		bctblVelocityReset.addListener({}, "Alt click to reset.", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick)
				return;

			component.reset();
		});
		
		bcArticulationChanged.addListener(tblVelocity, "Articulation change listener", function(component, value)
		{
			if (this.length == 1)
				return;

			for (index = 0; index < this.length; index++)
				this[index].showControl(index == value);
		});
		
		bcLinkButtonChanged.addListener(tblVelocity, "btnVelocityLink change listener", function(component, value)
		{
			if (this.length == 1)
				return;

			for (index = 0; index < this.length; index++)
			{
				this[index].set("tableIndex", value ? 0 : index);
				this[index].reset();
			}				
		});

		return tblVelocity;
	}

	//! Broadcasters
	const bctblVelocityReset = Engine.createBroadcaster({id: "tableClickWatcher", args: ["component", "event"]});
	
	const bcArticulationChanged = Engine.createBroadcaster({id: "velocityTableArticulationChanged", args: ["component", "value"]});
	bcArticulationChanged.attachToComponentValue("knbArticulation", "");
	
	const bcLinkButtonChanged = Engine.createBroadcaster({id: "velocityTableLinkButtonChanged", args: ["component", "value"]});
	bcLinkButtonChanged.attachToComponentValue("btnVelocityLink", "");
}
