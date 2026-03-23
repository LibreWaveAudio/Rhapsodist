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

namespace ArticulationEnvelope
{
	//! Look and Feel
	const laf = Content.createLocalLookAndFeel();
	
	laf.registerFunction("drawAhdsrBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrBackground))
			return LookAndFeel.drawAhdsrBackground();

		g.setColour(obj.bgColour);
		g.fillRoundedRectangle(obj.area, 2);
	});
	
	laf.registerFunction("drawAhdsrPath", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrPath))
			return LookAndFeel.drawAhdsrPath();

		var a = obj.area;
		var c = Colours.withMultipliedAlpha(obj.itemColour, obj.enabled ? 1.0 : 0.5);
	
		g.setGradientFill([c, a[2] / 2, a[1], Colours.withMultipliedAlpha(c, 0.2), a[2] / 2, a[3]]);
		
		g.fillPath(obj.path, a);
	
		if (obj.isActive || !obj.enabled)
			return;
	
		g.setColour(obj.itemColour2);
		g.drawPath(obj.path, a, 2.0);
	});
	
	laf.registerFunction("drawAhdsrBall", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrBall))
			return LookAndFeel.drawAhdsrBall();

		if (!obj.enabled)
			return;
	
		g.setColour(Colours.withMultipliedAlpha(obj.itemColour3, 0.5));
		g.fillEllipse([obj.position[0] - 7, obj.position[1] - 7, 14, 14]);
	
		g.setColour(obj.itemColour3);
		g.fillEllipse([obj.position[0] - 4, obj.position[1] - 4, 8, 8]);
	});
	
	laf.registerFunction("drawRotarySlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrKnob))
			return LookAndFeel.drawAhdsrKnob();

		CoreLookAndFeel.drawGenericKnob();
	});

	//! pnlEnvelope
	const pnlEnvelope = Content.getComponent("pnlEnvelope");

	//! fltEnvelope
	const fltEnvelope = Content.getAllComponents("fltEnvelope");
	
	for (x in fltEnvelope)
		x.setLocalLookAndFeel(laf);

	// !pnlEnvelopeControls
	const pnlEnvelopeControls = ComponentPack.create("pnlEnvelopeControls", "knbArticulation", ["ScriptSlider"], 16, {});
	GridPanel.create("pnlEnvelopeControls", 5, 1, {});

	//! knbAhdsr
	for (x in Content.getAllComponents("knbAhdsr\\d"))
		x.setLocalLookAndFeel(laf);

	//! slpEnvelopeControls
	const slpEnvelopeControls = Content.addSliderPack("slpEnvelopeControls", 0, 0);
	slpEnvelopeControls.set("parentComponent", "pnlEnvelopeControls");	
	slpEnvelopeControls.set("processorId", "ahdsrController");
	slpEnvelopeControls.set("SliderPackIndex", 0);
	slpEnvelopeControls.showControl(false);
}
