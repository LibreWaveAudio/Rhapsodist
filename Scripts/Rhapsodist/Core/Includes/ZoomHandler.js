/*
    Copyright 2024, 2025 David Healey

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

namespace ZoomHandler
{	
	const interfaceSize = Content.getInterfaceSize();
	const screenBounds = Content.getScreenBounds(false);
	const minZoom = 0.5;
	const maxZoom = Math.floor(screenBounds[3] / interfaceSize[1] * 4) / 4;
	const zoomStep = 0.05;
	const zoomLevels = getZoomLevels();

	//! cmbZoom
	const cmbZoom = Content.getComponent("cmbZoom");
	cmbZoom.set("items", zoomLevels.join("\n"));

	//! pnlZoom
	const pnlZoom = Content.addPanel("pnlZoom", 0, 0);
	pnlZoom.set("parentComponent", "pnlMain");
	pnlZoom.set("allowCallbacks", "All Callbacks");
	pnlZoom.setMouseCursor("BottomRightCornerResizeCursor", Colours.white, [0, 0]);
	pnlZoom.setPosition(interfaceSize[0] - 12, interfaceSize[1] - 12, 12, 12);	
	pnlZoom.setControlCallback(onpnlZoomControl);	

	inline function onpnlZoomControl(component, value)
	{
		if (value <= maxZoom)
			Settings.setZoomLevel(value);
	}

	pnlZoom.setPaintRoutine(function(g)
	{
		g.setFont("phosphor", 12);
		g.setColour(this.get("textColour"));
		g.drawAlignedText("\ued3a", this.getLocalBounds(0), "centred");
	});
		
	pnlZoom.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		
		if (event.mouseUp)
			return;
		
		if (event.clicked)
			this.data.zoomStart = Settings.getZoomLevel();
	
		if (!event.drag)
			return this.repaint();
	
		var diagonal = Math.sqrt(interfaceSize[0] * interfaceSize[0] + interfaceSize[1] * interfaceSize[1]);
		var currentZoom = Settings.getZoomLevel();
		var dragPixel = 0;
		
		if (event.dragX > event.dragY)
			dragPixel = (event.dragX * currentZoom) / interfaceSize[0];
		else
			dragPixel = (event.dragY * currentZoom) / interfaceSize[1];
		
		var maxScaleFactor = screenBounds[3] / interfaceSize[1];
		var diagonalDrag = this.data.zoomStart + dragPixel;
		
		diagonalDrag += (zoomStep / 2);
		
		diagonalDrag = Math.min(diagonalDrag, maxScaleFactor);
		
		diagonalDrag -= Math.fmod(diagonalDrag, zoomStep);
		diagonalDrag = Math.range(diagonalDrag, minZoom, maxZoom);
		
		var zoomToUse = diagonalDrag;

		if (currentZoom != zoomToUse)
		{
			this.setValue(zoomToUse);
			this.changed();
		}			
	});
	
	//! Functions
	inline function: Array getZoomLevels()
	{
		local result = [];
		local level = 0.5;

		while(level <= maxZoom || level >= 4)
		{
			result.push(level);
			level += 0.25;
		}

		result.push("Custom");

		return result;
	}

	//! Broadcasters
	const bcZoomPanelValue = Engine.createBroadcaster({id: "bcZoomPanelValue", args: ["component", "value"]});
	bcZoomPanelValue.attachToComponentValue(pnlZoom, "");

	bcZoomPanelValue.addComponentValueListener(cmbZoom, "If the zoom panel is used, set the zoom combo box to custom", function(index, component, value)
	{
		if (zoomLevels.contains(value))
			return zoomLevels.indexOf(value) + 1;

		return zoomLevels.length;
	});

	//! bccmbZoomValue
	const var bccmbZoomValue = Engine.createBroadcaster({id: "bccmbZoomValue", args: ["component", "value"]});
	bccmbZoomValue.attachToComponentValue(cmbZoom, "");
	bccmbZoomValue.setBypassed(true, false, false);

	bccmbZoomValue.addComponentValueListener(pnlZoom, "pnlZoom will follow changes to cmbZoom", function(index, component, value)
	{
		return value - 1 < zoomLevels.length ? zoomLevels[value - 1] : this.getValue();
	});
	
	bccmbZoomValue.setBypassed(false, false, false); 

	//! Calls
	pnlZoom.setValue(Settings.getZoomLevel());
}
