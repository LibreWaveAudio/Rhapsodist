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

namespace PreloadBar
{
	//! pnlPreload
	const pnlPreload = Content.getComponent("pnlPreload");
	
	pnlPreload.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(2);
		
		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, this.get("borderRadius"));
		
		g.setColour(this.get("itemColour"));
		g.fillRoundedRectangle([a[0], a[1], a[2] * this.getValue(), a[3]], this.get("borderRadius"));
	});
	
	pnlPreload.setTimerCallback(function()
	{
		this.setValue(Engine.getPreloadProgress());
		this.set("text", Engine.getPreloadMessage());
		this.repaint();
	});
	
	pnlPreload.setLoadingCallback(function(isPreloading)
	{
		if (isPreloading)
			this.startTimer(0.4);
		else
			this.stopTimer();

		this.showControl(isPreloading);
	});
}
