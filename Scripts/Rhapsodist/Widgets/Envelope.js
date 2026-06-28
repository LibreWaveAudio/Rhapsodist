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

namespace Envelope
{
	const style = CoreLookAndFeel.style;
	
	inline function: ScriptObject create(panelId: string, numArticulations: int, options: JSON)
	{
		if (!checkRequirements())
			return {};

		local panel = Content.getComponent(panelId);

		//! pnlEnvelope
		local pnlEnvelope = createEnvelopePanel();
		
		//! fltEnvelope
		local fltEnvelope = createEnvelopeFloatingTile();

		//! pnlEnvelopeControls
		local pnlEnvelopeControls = createEnvelopeControls(pnlEnvelope, options);

		//! slpEnvelopeControls
		local slpEnvelopeControls = createSliderPack(pnlEnvelopeControls, numArticulations);

		pnlEnvelope.data.graph = fltEnvelope;
		pnlEnvelope.data.controlPanel = pnlEnvelopeControls;
		pnlEnvelope.data.sliderPack = slpEnvelopeControls;

		bcArticulationChanged.addListener({knobs: pnlEnvelopeControls.data.knobs, sliderPack: slpEnvelopeControls}, "Articulation change listener", function(component, value)
		{
			changeArticulation(this.knobs, this.sliderPack, value);
		});

		return pnlEnvelope;
	}
	
	inline function: ScriptObject createEnvelopePanel()
	{
		local componentExists = Content.componentExists("pnlEnvelope");
		local panel = Content.addPanel("pnlEnvelope");
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON("pnlEnvelope", {
				width: panel.getWidth(),
				height: panel.getHeight(),
				parentComponent: panelId,
				text: "",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				textColour: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		return panel;
	}
	
	inline function: ScriptObject createEnvelopeFloatingTile()
	{
		local componentExists = Content.componentExists("fltEnvelope");
		local tile = Content.addFloatingTile("fltEnvelope");
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON("fltEnvelope", {
				x: 10,
				y: 10,
				width: pnlEnvelope.getWidth() - 20,
				height: (pnlEnvelope.getHeight() / 2),
				parentComponent: "pnlEnvelope",
				ContentType: "AHDSRGraph",
				Data: "{\n  \"ProcessorId\": \"globalAhdsr\",\n  \"Index\": -1,\n  \"FollowWorkspace\": false,\n}",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0xff8a94a7,
				itemColour3: 0x0,
				textColour: 0x0
			});
		}
		
		tile.setLocalLookAndFeel(laf);
		return tile;
	}

	inline function: ScriptObject createEnvelopeControls(parentPanel: ScriptObject, options: JSON)
	{
		//! pnlEnvelopeControls
		local componentExists = Content.componentExists("pnlEnvelopeControls");
		local panel = Content.addPanel("pnlEnvelopeControls");

		if (!componentExists)
		{
			Content.setPropertiesFromJSON("pnlEnvelopeControls", {
				x: 0,
				y: parentPanel.getHeight() / 2 + 10,
				width: parentPanel.getWidth(),
				height: (parentPanel.getHeight() / 2),			
				parentComponent: parentPanel.getId() - 10,
				text: "",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				textColour: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}

		//! knbAhdsr
		local knbAhdsr = Content.getAllComponents("knbAhdsr\\d");
		
		local knobProperties = [
			{
				text: "A",
				mode: "Time",
				defaultValue: 2,
				middlePosition: 1000,
				tooltip: "Envelope attack time"
			},
			{
				text: "H",
				mode: "Time",
				defaultValue: 10,
				middlePosition: 1000,
				tooltip: "Envelope hold time"
			},
			{
				text: "D",
				mode: "Time",
				defaultValue: 300,
				middlePosition: 1000,
				tooltip: "Envelope decay time"
			},
			{
				text: "S",
				mode: "Decibel",
				defaultValue: -1,
				middlePosition: -18,
				stepSize: 1.0,
				tooltip: "Envelope sustain level"
			},
			{
				text: "R",
				mode: "Time",
				defaultValue: 5000,
				middlePosition: 1000,
				tooltip: "Envelope release time"
			},
			{
				text: "Atk Level",
				mode: "Decibel",
				defaultValue: 0,
				middlePosition: -18,
				tooltip: "Envelope attack level",
				visible: false
			},
			{
				text: "Atk Curve",
				mode: "NormalizedPercentage",
				defaultValue: 0.5,
				middlePosition: 0.5,
				tooltip: "Envelope attack cruve",
				visible: false
			},
			{
				text: "Decay Curve",
				mode: "NormalizedPercentage",
				defaultValue: 1.0,
				middlePosition: 0.5,
				tooltip: "Envelope decay curve",
				visible: false
			}
		];

		if (!knbAhdsr.length)
		{
			local knobHeight = 90;

			if (isDefined(options.knobHeight) && options.knobHeight < knobHeight)
				knobHeight = options.knobHeight;
				
			if (isDefined(options.knobWidth) && options.knobWidth < knobWidth)
				knobWidth = 62;

			for (i = 0; i < knobProperties.length; i++)
			{
				knbAhdsr.push(Content.addKnob("knbAhdsr" + i));

				local props = knobProperties[i];
				props.width = knobWidth;
				props.height = knobHeight;
				props.parentComponent = "pnlEnvelopeControls";
				props.processorId = "ahdsrController";
				props.parameterId = props.text.replace(" ");
				props.pluginParameterName = props.parameterId;
				props.bgColour = 0xff11111b;
				props.itemColour = 0xff6c7086;
				props.itemColour2 = 0x0;
				props.textColour = 0xffcdd6f4;
				props.saveInPreset = true;

				Content.setPropertiesFromJSON("knbAhdsr" + i, props);				
			}
		}

		for (x in knbAhdsr)
			x.setLocalLookAndFeel(laf);

		if (!isDefined(options.defaultLayout) || options.defaultLayout)
			Container.createRow("pnlEnvelopeControls", [0, 0, 0, 0], -1, {});

		panel.data.knobs = knbAhdsr;

		bcpnlControlsMouse.attachToComponentMouseEvents(panel, "Clicks, Hover & Dragging", "");

		bcpnlControlsMouse.addListener(knbAhdsr, "Alt click retort knob defaults.", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick || event.drag)
				return;

			for (x in this)
			{
				x.setValue(x.get("defaultValue"));
				x.changed();
			}
		});		

		return panel;
	}
	
	inline function: ScriptObject createSliderPack(parentPanel: ScriptObject, numArticulations: number)
	{
		local componentExists = Content.componentExists("slpEnvelopeControls");
		local sliderPack = Content.addSliderPack("slpEnvelopeControls", 0, 0);

		if (!componentExists)
		{
			Content.setPropertiesFromJSON("slpEnvelopeControls", {
				visible: 0,
				showValueOverlay: false,
				flashActive: false,
			});
		}

		Content.setPropertiesFromJSON("slpEnvelopeControls", {
			parentComponent: parentPanel.getId(),
			processorId: "ahdsrController",
			SliderPackIndex: 0,
			min: -100,
			max: 20000,
			stepSize: 0.01,
			sliderAmount: 8 * numArticulations
		});

		return sliderPack;
	}

	inline function changeArticulation(knobs: Array, sliderPack: ScriptObject, index: number)
	{
		for (i = 0; i < knobs.length; i++)
		{
			local value = sliderPack.getSliderValueAt(knobs.length * index + i);
			knobs[i].setValue(value);
		}		
	}
	
	inline function: number checkRequirements()
	{
		local msg = "";
	
		if (!isDefined(ComponentPack.create))
			msg = "!ArticulationEnvelope.js requires ComponentPack.js";

		if (msg != "")
			Console.print(msg);

		return msg == "";
	}
	
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
		var fillColour = obj.itemColour2;
		var pathColour = (isDefined(style.featureColour) && obj.itemColour == 0x0) ? style.featureColour : obj.itemColour;
		var c = Colours.withMultipliedBrightness(fillColour, 0.5);
		c = Colours.withMultipliedAlpha(c, obj.enabled ? 0.5 : 0.1);
	
		g.setGradientFill([c, a[2] / 2, a[1], Colours.withMultipliedAlpha(c, 0.2), a[2] / 2, a[3]]);
		
		g.fillPath(obj.path, a);
	
		if (obj.isActive || !obj.enabled)
			return;
	
		g.setColour(pathColour);
		g.drawPath(obj.path, a, 2.0);
	});
	
	laf.registerFunction("drawAhdsrBall", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrBall))
			return LookAndFeel.drawAhdsrBall();
	
		if (!obj.enabled)
			return;

		var a = Rectangle(obj.position[0] - 8, obj.position[1] - 8, 16, 16);

		var colour = obj.itemColour3 == 0x0 ? obj.itemColour : obj.itemColour3;
		colour = (isDefined(style.featureColour) && colour == 0x0) ? style.featureColour : colour;

		g.setColour(Colours.withMultipliedAlpha(colour, 0.5));
		g.fillEllipse(a);
	
		g.setColour(colour);
		g.fillEllipse(a.reduced(3));
	});
	
	laf.registerFunction("drawRotarySlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrKnob))
			return LookAndFeel.drawAhdsrKnob();
	
		CoreLookAndFeel.drawKnob();
	});
	
	//! Broadcasters
	
	//! Bc panel mouse click
	const bcpnlControlsMouse = Engine.createBroadcaster({id: "clickWatcher", args: ["component", "event"]});
	
	// bcArticulationChanged
	const bcArticulationChanged = Engine.createBroadcaster({id: "envelopeArticulationChanged", args: ["component", "value"]});
	bcArticulationChanged.attachToComponentValue("knbArticulation", "");
}
